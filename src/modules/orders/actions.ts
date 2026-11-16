'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { run, formObject, type ActionState } from '@/lib/action';
import { env } from '@/lib/env';
import { AppError } from '@/lib/errors';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getMarket } from '@/lib/settings';
import { m } from '@/i18n/translate';
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from '@/i18n/config';
import { assertUser, clientIp, getUser } from '@/modules/auth/session';
import { startCheckout, processWebhook } from '@/modules/payments/service';
import { signTestPayload } from '@/modules/payments/test-provider';
import { db } from '@/lib/db';
import { cartSchema, priceCart } from './cart';
import { readCart, writeCart } from './cart-cookie';
import { cancelOrder, createOrder } from './service';

const loc = (v: unknown): Locale => (isLocale(String(v)) ? (String(v) as Locale) : DEFAULT_LOCALE);

export async function addToCartAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const f = formObject(fd, ['addonIds']);
  const locale = loc(f.locale);
  return run(async () => {
    const cart = await readCart();
    if (cart.items.length >= 10) throw new AppError(m('Votre panier est plein.'));
    // One configuration per template: adding the same template again replaces it.
    const items = cart.items.filter((i) => i.productId !== f.productId);
    const next = cartSchema.parse({ ...cart, items: [...items, { productId: f.productId, packageId: f.packageId, addonIds: f.addonIds }] });
    const market = await getMarket(locale);
    if (!market) throw new AppError(m('Marché indisponible.'));
    const priced = await priceCart(next, market);
    if (priced.removed > 0) throw new AppError(m('Ce produit n’est pas disponible dans votre pays pour le moment.'));
    await writeCart(next);
    redirect(localePath(locale, '/cart'));
  }, locale);
}

export async function removeFromCartAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const cart = await readCart();
    await writeCart({ ...cart, items: cart.items.filter((i) => i.productId !== fd.get('productId')) });
    revalidatePath('/', 'layout');
  });
}

export async function applyCouponAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const locale = loc(fd.get('locale'));
  return run(async () => {
    await enforceRateLimit(`coupon:${await clientIp()}`, 20, 3600);
    const cart = await readCart();
    const code = String(fd.get('coupon') ?? '').trim().toUpperCase();
    if (!code) { await writeCart({ ...cart, coupon: undefined }); revalidatePath('/', 'layout'); return; }
    const market = await getMarket(locale);
    const priced = await priceCart({ ...cart, coupon: code }, market!);
    if (priced.couponError) throw new AppError(priced.couponError);
    await writeCart({ ...cart, coupon: code });
    revalidatePath('/', 'layout');
  }, locale);
}

/** Creates the order from the server-priced cart, then hands over to the hosted payment page. */
export async function placeOrderAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const f = formObject(fd);
  const locale = loc(f.locale);
  return run(async () => {
    const user = await assertUser();
    await enforceRateLimit(`order:${user.id}`, 15, 3600);
    if (f.acceptTerms !== 'on') throw new AppError(m('Vous devez accepter les conditions générales de vente.'), 'invalid', { acceptTerms: m('Vous devez accepter les conditions générales de vente.') });
    const market = await getMarket(locale);
    if (!market?.enabled) throw new AppError(m('Marché indisponible.'));
    const cart = await readCart();
    const order = await createOrder(user, cart, f, market);
    const session = await startCheckout(order.id, user.id, locale,
      `${env.appUrl}${localePath(locale, `/checkout/success?order=${order.id}`)}`,
      `${env.appUrl}${localePath(locale, `/account/orders/${order.id}?cancelled=1`)}`);
    await writeCart({ items: [] });
    redirect(session.url);
  }, locale);
}

export async function retryPaymentAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const locale = loc(fd.get('locale'));
  return run(async () => {
    const user = await assertUser();
    const orderId = String(fd.get('orderId'));
    const session = await startCheckout(orderId, user.id, locale,
      `${env.appUrl}${localePath(locale, `/checkout/success?order=${orderId}`)}`,
      `${env.appUrl}${localePath(locale, `/account/orders/${orderId}?cancelled=1`)}`);
    redirect(session.url);
  }, locale);
}

export async function cancelOrderAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await assertUser();
    await cancelOrder(String(fd.get('orderId')), { id: user.id, staff: false });
    revalidatePath('/', 'layout');
  });
}

/**
 * Sandbox only (PAYMENTS_MODE=test): emits a signed test event through the real webhook pipeline.
 * The buyer must own the order / administer the subscription; no money moves.
 */
export async function sandboxPayAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const locale = loc(fd.get('locale'));
  return run(async () => {
    if (env.paymentsMode !== 'test') throw new AppError('Sandbox payments are disabled.', 'forbidden');
    const user = await getUser();
    if (!user) throw new AppError(m('Veuillez vous connecter.'), 'forbidden');
    const kind = String(fd.get('kind'));
    const ref = String(fd.get('ref'));
    const sessionId = String(fd.get('session'));
    const outcome = String(fd.get('outcome'));
    let body: string;
    let next: string;
    if (kind === 'order') {
      const order = await db.order.findFirst({ where: { id: ref, userId: user.id, providerSessionId: sessionId } });
      if (!order) throw new AppError(m('Commande introuvable.'), 'not_found');
      body = JSON.stringify(outcome === 'success'
        ? { id: `evt_${sessionId}_ok`, type: 'checkout.completed', orderId: order.id, sessionId, paymentRef: `test_pi_${sessionId}`, amount: order.total, currency: order.currency, method: 'test' }
        : { id: `evt_${sessionId}_ko`, type: 'checkout.failed', orderId: order.id, sessionId, reason: 'sandbox_declined' });
      next = outcome === 'success' ? `/checkout/success?order=${order.id}` : `/account/orders/${order.id}?failed=1`;
    } else {
      const sub = await db.subscription.findFirst({ where: { id: ref, organization: { memberships: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN'] } } } } } });
      if (!sub) throw new AppError(m('Abonnement introuvable.'), 'not_found');
      body = JSON.stringify(outcome === 'success'
        ? { id: `evt_${sessionId}_ok`, type: 'subscription.activated', subscriptionId: sub.id, providerSubId: sub.providerSubId ?? `test_sub_${sub.id}`, periodEnd: new Date(Date.now() + 30 * 86400_000).toISOString() }
        : { id: `evt_${sessionId}_ko`, type: 'ignored' });
      next = `/account/subscriptions?${outcome === 'success' ? 'activated=1' : 'failed=1'}`;
    }
    await processWebhook('test', body, signTestPayload(body));
    redirect(localePath(locale, next));
  }, locale);
}
