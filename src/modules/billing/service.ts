import { db } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { audit } from '@/lib/audit';
import { priceFor } from '@/lib/money';
import { m } from '@/i18n/translate';
import { emit } from '@/modules/automation/events';
import { getProvider } from '@/modules/payments/service';
import { assertOrgRole, loadTenantCtx } from '@/modules/tenancy/context';

/** Monthly amount = base price + extra seats beyond the included ones (seat-based billing for Pointage). */
export function subscriptionAmount(plan: { prices: unknown; seatPrices: unknown; includedSeats: number }, currency: string, seats: number): number {
  const base = priceFor(plan.prices, currency);
  if (base === null) throw new AppError(m('Ce plan n’est pas disponible dans cette devise.'));
  const seat = priceFor(plan.seatPrices, currency) ?? 0;
  return base + Math.max(0, seats - plan.includedSeats) * seat;
}

/** Starts a free trial (no payment data required). One subscription per organization and product. */
export async function startTrial(userId: string, organizationId: string, planId: string, currency: string) {
  const ctx = await loadTenantCtx(userId, organizationId);
  assertOrgRole(ctx, 'ADMIN');
  const plan = await db.plan.findFirst({ where: { id: planId, active: true, saasProduct: { status: 'ACTIVE' } } });
  if (!plan) throw new AppError(m('Plan introuvable.'), 'not_found');
  if (priceFor(plan.prices, currency) === null) throw new AppError(m('Ce plan n’est pas disponible dans cette devise.'));
  const existing = await db.subscription.findUnique({ where: { organizationId_saasProductKey: { organizationId, saasProductKey: plan.saasProductKey } } });
  if (existing) throw new AppError(m('Cette entreprise a déjà un abonnement pour ce produit.'), 'conflict');
  const sub = await db.subscription.create({
    data: {
      organizationId, saasProductKey: plan.saasProductKey, planId: plan.id, currency, status: 'TRIALING',
      currentPeriodEnd: new Date(Date.now() + plan.trialDays * 86400_000),
    },
  });
  await audit({ actorId: userId, organizationId, action: 'subscription.trial_started', entity: 'Subscription', entityId: sub.id, meta: { plan: plan.key } });
  return sub;
}

/** Sends the organization to hosted checkout to activate (or re-activate) the paid subscription. */
export async function startSubscriptionCheckout(userId: string, subscriptionId: string, locale: string, successUrl: string, cancelUrl: string) {
  const sub = await db.subscription.findUnique({ where: { id: subscriptionId }, include: { plan: true, saasProduct: true } });
  if (!sub) throw new AppError(m('Abonnement introuvable.'), 'not_found');
  const ctx = await loadTenantCtx(userId, sub.organizationId);
  assertOrgRole(ctx, 'ADMIN');
  if (sub.status === 'ACTIVE' && !sub.cancelAtPeriodEnd) throw new AppError(m('Cet abonnement est déjà actif.'));
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const amount = subscriptionAmount(sub.plan, sub.currency, sub.seats);
  return getProvider().createSubscriptionCheckout({ subscription: sub, amount, productName: `${sub.saasProduct.name} ${sub.plan.name}`, email: user.email, successUrl, cancelUrl, locale });
}

export async function changePlan(userId: string, subscriptionId: string, planId: string) {
  const sub = await db.subscription.findUnique({ where: { id: subscriptionId } });
  if (!sub) throw new AppError(m('Abonnement introuvable.'), 'not_found');
  assertOrgRole(await loadTenantCtx(userId, sub.organizationId), 'ADMIN');
  const plan = await db.plan.findFirst({ where: { id: planId, active: true, saasProductKey: sub.saasProductKey } });
  if (!plan || priceFor(plan.prices, sub.currency) === null) throw new AppError(m('Plan introuvable.'), 'not_found');
  if (sub.providerSubId && sub.provider === 'stripe') {
    // Changing the price of a live Stripe subscription requires proration rules the owner must validate first.
    throw new AppError(m('Le changement de plan d’un abonnement payant actif se fait via le support pour le moment.'));
  }
  await db.subscription.update({ where: { id: sub.id }, data: { planId: plan.id } });
  await audit({ actorId: userId, organizationId: sub.organizationId, action: 'subscription.plan_changed', entity: 'Subscription', entityId: sub.id, meta: { plan: plan.key } });
}

/** Cancellation takes effect at the end of the paid period; trials end immediately. */
export async function cancelSubscription(userId: string, subscriptionId: string) {
  const sub = await db.subscription.findUnique({ where: { id: subscriptionId } });
  if (!sub) throw new AppError(m('Abonnement introuvable.'), 'not_found');
  assertOrgRole(await loadTenantCtx(userId, sub.organizationId), 'ADMIN');
  if (sub.status === 'CANCELED') throw new AppError(m('Cet abonnement est déjà résilié.'));
  if (sub.status === 'TRIALING' || sub.status === 'INCOMPLETE' || !sub.providerSubId) {
    await db.subscription.update({ where: { id: sub.id }, data: { status: 'CANCELED', canceledAt: new Date(), cancelAtPeriodEnd: false } });
    await audit({ actorId: userId, organizationId: sub.organizationId, action: 'subscription.canceled', entity: 'Subscription', entityId: sub.id });
    await emit({ type: 'subscription.canceled', subscriptionId: sub.id });
    return;
  }
  await getProvider(sub.provider ?? undefined).setCancelAtPeriodEnd(sub.providerSubId, true);
  await db.subscription.update({ where: { id: sub.id }, data: { cancelAtPeriodEnd: true } });
  await audit({ actorId: userId, organizationId: sub.organizationId, action: 'subscription.cancel_scheduled', entity: 'Subscription', entityId: sub.id });
  await emit({ type: 'subscription.cancel_scheduled', subscriptionId: sub.id });
}

export async function resumeSubscription(userId: string, subscriptionId: string) {
  const sub = await db.subscription.findUnique({ where: { id: subscriptionId } });
  if (!sub) throw new AppError(m('Abonnement introuvable.'), 'not_found');
  assertOrgRole(await loadTenantCtx(userId, sub.organizationId), 'ADMIN');
  if (!sub.cancelAtPeriodEnd || sub.status === 'CANCELED' || !sub.providerSubId) throw new AppError(m('Cet abonnement ne peut pas être réactivé ici.'));
  await getProvider(sub.provider ?? undefined).setCancelAtPeriodEnd(sub.providerSubId, false);
  await db.subscription.update({ where: { id: sub.id }, data: { cancelAtPeriodEnd: false } });
  await audit({ actorId: userId, organizationId: sub.organizationId, action: 'subscription.resumed', entity: 'Subscription', entityId: sub.id });
}

/**
 * Daily maintenance (called by /api/cron/daily):
 *  - renewal notices 7 days before the period ends,
 *  - expired trials and periods that were scheduled for cancellation are closed,
 *  - expired sessions, reset tokens and rate-limit windows are purged.
 */
export async function runDailyBilling(now = new Date()) {
  const soon = new Date(now.getTime() + 7 * 86400_000);
  const renewing = await db.subscription.findMany({
    where: { status: 'ACTIVE', cancelAtPeriodEnd: false, currentPeriodEnd: { gt: now, lte: soon }, renewalNoticeAt: null },
  });
  for (const s of renewing) {
    await db.subscription.update({ where: { id: s.id }, data: { renewalNoticeAt: now } });
    await emit({ type: 'subscription.renewal_notice', subscriptionId: s.id });
  }
  const ended = await db.subscription.findMany({
    where: { currentPeriodEnd: { lt: now }, OR: [{ status: 'TRIALING' }, { status: 'ACTIVE', cancelAtPeriodEnd: true }] },
  });
  for (const s of ended) {
    await db.subscription.update({ where: { id: s.id }, data: { status: 'CANCELED', canceledAt: now } });
    await emit({ type: 'subscription.canceled', subscriptionId: s.id });
  }
  const [sessions, tokens, limits] = await db.$transaction([
    db.session.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.passwordResetToken.deleteMany({ where: { expiresAt: { lt: new Date(now.getTime() - 86400_000) } } }),
    db.rateLimit.deleteMany({ where: { resetAt: { lt: now } } }),
  ]);
  return { renewalNotices: renewing.length, closed: ended.length, purged: { sessions: sessions.count, tokens: tokens.count, rateLimits: limits.count } };
}
