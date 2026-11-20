import { beforeAll, describe, expect, it } from 'vitest';
import Stripe from 'stripe';
import type { Market } from '@prisma/client';
import { db, createUser, createTenant, addMember } from './helpers';
import { hashPassword, verifyPassword, sha256 } from '@/lib/crypto';
import { rateLimit } from '@/lib/rate-limit';
import { computeTax, parseAmount, priceFor } from '@/lib/money';
import { toCsv } from '@/lib/csv';
import { authenticate, createPasswordReset, registerUser, resetPassword } from '@/modules/auth/service';
import { can, ROLE_PERMISSIONS } from '@/modules/auth/rbac';
import { couponDiscount, priceCart } from '@/modules/orders/cart';
import { cancelOrder, createOrder } from '@/modules/orders/service';
import { processWebhook, refundPayment, startCheckout } from '@/modules/payments/service';
import { signTestPayload } from '@/modules/payments/test-provider';
import { mapStripeEvent } from '@/modules/payments/stripe-provider';
import { approveProject, confirmBriefing, exportProjectBrief, getProjectFor, postMessage, requestRevision, saveBriefing, setProjectStatus, submitBriefing } from '@/modules/projects/service';
import { cancelSubscription, changePlan, resumeSubscription, runDailyBilling, startSubscriptionCheckout, startTrial, subscriptionAmount } from '@/modules/billing/service';
import { loadTenantCtx, subscriptionIsUsable } from '@/modules/tenancy/context';
import { inviteMember, removeMember } from '@/modules/tenancy/members';
import { storeUpload, validateUpload } from '@/modules/storage/service';
import { localePath, internalSegment, switchLocalePath } from '@/i18n/config';
import { pick, interpolate } from '@/i18n/translate';
import { adminBaseUrl, hostPolicy } from '@/lib/admin-host';

const uid = () => Math.random().toString(36).slice(2, 10);
const BILLING = { fullName: 'Test Client', email: 'client@example.test', address: 'Rue de Test 1', postalCode: '1200', city: 'Genève', country: 'CH' };
let market: Market;
let product: { id: string; packages: { id: string; tier: string; prices: unknown }[] };
let addonId: string;

async function event(body: object) {
  const raw = JSON.stringify(body);
  return processWebhook('test', raw, signTestPayload(raw));
}

/** Creates a paid order through the real pipeline: cart → order → checkout session → signed webhook. */
async function paidOrder(userId: string, opts: { coupon?: string } = {}) {
  const pkg = product.packages.find((p) => p.tier === 'BUSINESS')!;
  const order = await createOrder({ id: userId }, { items: [{ productId: product.id, packageId: pkg.id, addonIds: [addonId] }], coupon: opts.coupon }, BILLING, market);
  const session = await startCheckout(order.id, userId, 'fr-ch', 'http://x/ok', 'http://x/ko');
  const result = await event({ id: `evt_${uid()}`, type: 'checkout.completed', orderId: order.id, sessionId: session.sessionId, paymentRef: `pi_${uid()}`, amount: order.total, currency: order.currency });
  return { order, session, result };
}

beforeAll(async () => {
  market = await db.market.upsert({ where: { code: 'fr-ch' }, update: { currency: 'CHF', taxRateBps: 810, pricesIncludeTax: false, enabled: true }, create: { code: 'fr-ch', language: 'fr', country: 'CH', currency: 'CHF', taxRateBps: 810 } });
  const cat = await db.category.upsert({ where: { slug: 'test-cat' }, update: {}, create: { slug: 'test-cat', name: { fr: 'Test' } } });
  const slug = `tpl-${uid()}`;
  product = await db.product.create({
    data: {
      slug, name: 'Modèle Test', categoryId: cat.id, tagline: { fr: 'x' }, description: { fr: 'x' }, status: 'PUBLISHED', demoSlug: 'atelier',
      packages: { create: [{ tier: 'BASIC', name: { fr: 'Basic' }, description: {}, prices: { CHF: 79000 }, deliveryDays: 8 }, { tier: 'BUSINESS', name: { fr: 'Business' }, description: {}, prices: { CHF: 149000, EUR: 149000 }, deliveryDays: 14, revisions: 2 }, { tier: 'PREMIUM', name: { fr: 'Premium' }, description: {}, prices: {}, deliveryDays: 21 }] },
    },
    include: { packages: true },
  });
  addonId = (await db.addon.create({ data: { slug: `addon-${uid()}`, name: { fr: 'Page supplémentaire', 'pt-PT': 'Página adicional' }, description: {}, prices: { CHF: 12000 } } })).id;
  for (const key of ['welcome', 'order_confirmation', 'project_status', 'password_reset', 'invitation']) {
    await db.emailTemplate.upsert({ where: { key_language: { key, language: 'fr' } }, update: {}, create: { key, language: 'fr', subject: `S {{name}}`, body: 'B {{name}}' } });
  }
});

describe('helpers', () => {
  it('money: price maps, tax and amount parsing', () => {
    expect(priceFor({ CHF: 100 }, 'CHF')).toBe(100);
    expect(priceFor({ CHF: 100 }, 'EUR')).toBeNull();
    expect(priceFor({ CHF: -1 }, 'CHF')).toBeNull();
    expect(computeTax(100000, 810, false)).toEqual({ tax: 8100, total: 108100 });
    expect(computeTax(108100, 810, true)).toEqual({ tax: 8100, total: 108100 });
    expect(computeTax(5000, 0, false)).toEqual({ tax: 0, total: 5000 });
    expect(parseAmount("1'490,50")).toBe(149050);
    expect(() => parseAmount('-3')).toThrow();
  });
  it('i18n: localized paths round-trip and content fallback', () => {
    expect(localePath('fr-ch', '/templates/atelier')).toBe('/fr-ch/modeles/atelier');
    expect(localePath('de-ch', '/contact?x=1')).toBe('/de-ch/kontakt?x=1');
    expect(internalSegment('pt-ch', 'modelos')).toBe('templates');
    expect(switchLocalePath('/fr-ch/modeles/atelier', 'en-ch')).toBe('/en-ch/templates/atelier');
    expect(switchLocalePath('/pt-ch/registo', 'de-ch')).toBe('/de-ch/registrieren');
    expect(pick({ fr: 'A', 'pt-PT': 'B' }, 'pt-BR')).toBe('B');
    expect(pick({ fr: 'A' }, 'pt-PT')).toBe('A');
    expect(interpolate('Bonjour {name} {x}', { name: 'Z' })).toBe('Bonjour Z {x}');
  });
  it('admin host: the back office is isolated on its own host when ADMIN_HOST is set', () => {
    const H = 'admin.athana.ch';
    // Not configured → single host, everything allowed.
    expect(hostPolicy('athana.ch', ['admin', 'orders'], null)).toBe('allow');
    // Public host never serves /admin; admin host serves only /admin and sign-in.
    expect(hostPolicy('athana.ch', ['admin'], H)).toBe('not_found');
    expect(hostPolicy('athana.ch', ['modeles'], H)).toBe('allow');
    expect(hostPolicy('ADMIN.athana.ch', ['admin', 'orders'], H)).toBe('allow');
    expect(hostPolicy(H, ['connexion'], H)).toBe('allow');
    expect(hostPolicy(H, ['nova-senha'], H)).toBe('allow');
    expect(hostPolicy(H, [], H)).toBe('to_admin_home');
    expect(hostPolicy(H, ['compte'], H)).toBe('to_public_site');
    expect(hostPolicy(H, ['app', 'crm'], H)).toBe('to_public_site');
    expect(hostPolicy('evil.example', ['admin'], H)).toBe('not_found');
    process.env.ADMIN_HOST = H;
    expect(adminBaseUrl('https://athana.ch')).toBe('https://admin.athana.ch');
    delete process.env.ADMIN_HOST;
    expect(adminBaseUrl('https://athana.ch')).toBe('https://athana.ch');
  });
  it('csv: escaping and formula injection', () => {
    const csv = toCsv([['=SUM(A1)', 'a;b', 'q"q', 5]]);
    expect(csv).toContain("'=SUM(A1)");
    expect(csv).toContain('"a;b"');
    expect(csv).toContain('"q""q"');
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });
  it('rate limit: blocks after the maximum within the window', async () => {
    const key = `t:${uid()}`;
    expect(await rateLimit(key, 2, 60)).toBe(true);
    expect(await rateLimit(key, 2, 60)).toBe(true);
    expect(await rateLimit(key, 2, 60)).toBe(false);
  });
});

describe('authentication', () => {
  it('hashes passwords with scrypt and verifies them', async () => {
    const h = await hashPassword('correct horse battery');
    expect(h.startsWith('scrypt$')).toBe(true);
    expect(await verifyPassword('correct horse battery', h)).toBe(true);
    expect(await verifyPassword('wrong', h)).toBe(false);
    expect(await verifyPassword('x', 'garbage')).toBe(false);
  });
  it('registers, rejects duplicates and weak passwords, authenticates', async () => {
    const email = `u-${uid()}@example.test`;
    const user = await registerUser({ name: 'Ana', email: email.toUpperCase(), password: 'un-mot-de-passe-long', acceptTerms: true });
    expect(user.email).toBe(email);
    expect(user.passwordHash).not.toContain('un-mot-de-passe');
    await expect(registerUser({ name: 'Ana', email, password: 'un-mot-de-passe-long', acceptTerms: true })).rejects.toThrow(/existe déjà/);
    await expect(registerUser({ name: 'Ana', email: `b-${email}`, password: 'court', acceptTerms: true })).rejects.toThrow();
    await expect(registerUser({ name: 'Ana', email: `c-${email}`, password: 'un-mot-de-passe-long', acceptTerms: false as never })).rejects.toThrow();
    expect((await authenticate(email, 'un-mot-de-passe-long')).id).toBe(user.id);
    await expect(authenticate(email, 'mauvais')).rejects.toThrow(/incorrect/);
    await expect(authenticate('nobody@example.test', 'x')).rejects.toThrow(/incorrect/);
    await db.user.update({ where: { id: user.id }, data: { disabledAt: new Date() } });
    await expect(authenticate(email, 'un-mot-de-passe-long')).rejects.toThrow(/incorrect/);
  });
  it('password recovery: single-use token, expiry, sessions revoked, no account enumeration', async () => {
    const email = `r-${uid()}@example.test`;
    const user = await registerUser({ name: 'Rui', email, password: 'ancien-mot-de-passe', acceptTerms: true });
    await db.session.create({ data: { userId: user.id, tokenHash: sha256(uid()), expiresAt: new Date(Date.now() + 1e6) } });
    expect(await createPasswordReset('unknown@example.test')).toBeNull();
    const res = (await createPasswordReset(email))!;
    expect((await db.passwordResetToken.findFirst({ where: { userId: user.id } }))!.tokenHash).not.toBe(res.token); // only the hash is stored
    await expect(resetPassword(res.token, 'court')).rejects.toThrow();
    await resetPassword(res.token, 'nouveau-mot-de-passe');
    expect(await db.session.count({ where: { userId: user.id } })).toBe(0);
    await expect(authenticate(email, 'ancien-mot-de-passe')).rejects.toThrow();
    expect((await authenticate(email, 'nouveau-mot-de-passe')).id).toBe(user.id);
    await expect(resetPassword(res.token, 'encore-un-autre-mdp')).rejects.toThrow(/invalide ou a expiré/);
    const expired = (await createPasswordReset(email))!;
    await db.passwordResetToken.updateMany({ where: { tokenHash: sha256(expired.token) }, data: { expiresAt: new Date(Date.now() - 1000) } });
    await expect(resetPassword(expired.token, 'encore-un-autre-mdp')).rejects.toThrow(/invalide ou a expiré/);
  });
});

describe('RBAC', () => {
  it('each role only holds its permissions', () => {
    expect(can('SUPER_ADMIN', 'users.manage')).toBe(true);
    expect(can('ADMIN', 'users.manage')).toBe(false);
    expect(can('FINANCE', 'finance.manage')).toBe(true);
    expect(can('FINANCE', 'catalog.manage')).toBe(false);
    expect(can('MARKETING', 'finance.view')).toBe(false);
    expect(can('DEVELOPER', 'orders.view')).toBe(false);
    expect(can('SUPPORT', 'finance.manage')).toBe(false);
    expect(can(null, 'dashboard.view')).toBe(false);
    for (const perms of Object.values(ROLE_PERMISSIONS)) expect(perms).toContain('dashboard.view');
  });
});

describe('cart and coupons', () => {
  it('prices only from the database and drops unavailable items', async () => {
    const [basic, business, premium] = ['BASIC', 'BUSINESS', 'PREMIUM'].map((t) => product.packages.find((p) => p.tier === t)!);
    const priced = await priceCart({ items: [{ productId: product.id, packageId: business.id, addonIds: [addonId, addonId, 'nope'] }] }, market);
    expect(priced.subtotal).toBe(149000 + 12000);
    expect(priced.tax).toBe(Math.round((161000 * 810) / 10000));
    expect(priced.total).toBe(priced.subtotal + priced.tax);
    // No price in this currency → not purchasable; foreign package id → dropped.
    expect((await priceCart({ items: [{ productId: product.id, packageId: premium.id, addonIds: [] }] }, market)).removed).toBe(1);
    expect((await priceCart({ items: [{ productId: 'other', packageId: basic.id, addonIds: [] }] }, market)).removed).toBe(1);
    const eur = { ...market, currency: 'EUR', taxRateBps: 0 };
    const pe = await priceCart({ items: [{ productId: product.id, packageId: business.id, addonIds: [addonId] }] }, eur);
    expect(pe.lines[0].addons).toHaveLength(0); // add-on has no EUR price
    expect(pe.total).toBe(149000);
  });
  it('validates coupons: dates, limits, minimum, currency', async () => {
    const base = { id: 'c', code: 'X', type: 'PERCENT' as const, value: 10, currency: null, campaign: null, maxRedemptions: null, redeemedCount: 0, minSubtotal: null, startsAt: null, endsAt: null, active: true, createdAt: new Date() };
    expect(couponDiscount(base, 100000, 'CHF')).toBe(10000);
    expect(couponDiscount({ ...base, type: 'FIXED', value: 500000, currency: 'CHF' }, 100000, 'CHF')).toBe(100000); // capped at subtotal
    expect(() => couponDiscount({ ...base, type: 'FIXED', value: 500, currency: 'EUR' }, 100000, 'CHF')).toThrow(/devise/);
    expect(() => couponDiscount({ ...base, active: false }, 1, 'CHF')).toThrow();
    expect(() => couponDiscount({ ...base, endsAt: new Date(Date.now() - 1000) }, 1, 'CHF')).toThrow(/expiré/);
    expect(() => couponDiscount({ ...base, startsAt: new Date(Date.now() + 100000) }, 1, 'CHF')).toThrow();
    expect(() => couponDiscount({ ...base, maxRedemptions: 1, redeemedCount: 1 }, 1, 'CHF')).toThrow(/limite/);
    expect(() => couponDiscount({ ...base, minSubtotal: 200000 }, 100000, 'CHF')).toThrow(/minimum/);
  });
});

describe('checkout, webhooks and order lifecycle', () => {
  it('rejects empty carts, invalid billing and unknown coupons', async () => {
    const user = await createUser();
    const pkg = product.packages.find((p) => p.tier === 'BUSINESS')!;
    await expect(createOrder(user, { items: [] }, BILLING, market)).rejects.toThrow(/vide/);
    await expect(createOrder(user, { items: [{ productId: product.id, packageId: pkg.id, addonIds: [] }] }, { ...BILLING, email: 'nope' }, market)).rejects.toThrow();
    await expect(createOrder(user, { items: [{ productId: product.id, packageId: pkg.id, addonIds: [] }], coupon: 'NOPE' }, BILLING, market)).rejects.toThrow(/inconnu/);
  });

  it('a verified payment event fulfils the order exactly once', async () => {
    const user = await createUser();
    const code = `C${uid().toUpperCase()}`;
    await db.coupon.create({ data: { code, type: 'PERCENT', value: 10 } });
    const pkg = product.packages.find((p) => p.tier === 'BUSINESS')!;
    const order = await createOrder(user, { items: [{ productId: product.id, packageId: pkg.id, addonIds: [addonId] }], coupon: code }, BILLING, market);
    expect(order.status).toBe('PENDING_PAYMENT');
    expect(order.discount).toBe(16100);
    expect(order.total).toBe(144900 + Math.round((144900 * 810) / 10000));
    expect(order.number).toMatch(/^ATH-\d{4}-\d{5}$/);
    const project = await db.project.findFirstOrThrow({ where: { orderItem: { orderId: order.id } } });
    expect(project.status).toBe('PAYMENT_PENDING');
    // Nothing is fulfilled before the webhook.
    await expect(saveBriefing(user.id, project.id, {})).rejects.toThrow();

    const session = await startCheckout(order.id, user.id, 'fr-ch', 'http://x/ok', 'http://x/ko');
    expect(session.url).toContain('sandbox-payment');
    const evt = { id: `evt_${uid()}`, type: 'checkout.completed', orderId: order.id, sessionId: session.sessionId, paymentRef: `pi_${uid()}`, amount: order.total, currency: 'CHF' };
    expect(await event(evt)).toBe('processed');
    // Replayed webhook (same event id) and a second event for the same order change nothing.
    expect(await event(evt)).toBe('duplicate');
    expect(await event({ ...evt, id: `evt_${uid()}` })).toBe('processed');

    const paid = await db.order.findUniqueOrThrow({ where: { id: order.id }, include: { payments: true, invoices: true } });
    expect(paid.status).toBe('PAID');
    expect(paid.payments).toHaveLength(1);
    expect(paid.payments[0].status).toBe('SUCCEEDED');
    expect(paid.invoices).toHaveLength(1);
    expect(paid.invoices[0].total).toBe(order.total);
    expect((await db.coupon.findUniqueOrThrow({ where: { code } })).redeemedCount).toBe(1);
    expect((await db.project.findUniqueOrThrow({ where: { id: project.id } })).status).toBe('BRIEFING_PENDING');
    expect(await db.briefing.count({ where: { projectId: project.id } })).toBe(1);
    // Automations: confirmation e-mail logged (not sent), admin task and customer notification created.
    expect(await db.emailLog.count({ where: { to: user.email, templateKey: 'order_confirmation' } })).toBe(1);
    expect(await db.task.count({ where: { orderId: order.id, type: 'order_review' } })).toBe(1);
    expect(await db.notification.count({ where: { userId: user.id, type: 'order' } })).toBe(1);
    await expect(startCheckout(order.id, user.id, 'fr-ch', 'http://x', 'http://x')).rejects.toThrow(/ne peut plus être payée/);
    await expect(cancelOrder(order.id, { id: user.id, staff: false })).rejects.toThrow();
  });

  it('rejects forged, expired and tampered webhooks and amount mismatches', async () => {
    const user = await createUser();
    const pkg = product.packages.find((p) => p.tier === 'BASIC')!;
    const order = await createOrder(user, { items: [{ productId: product.id, packageId: pkg.id, addonIds: [] }] }, BILLING, market);
    const session = await startCheckout(order.id, user.id, 'fr-ch', 'http://x', 'http://x');
    const body = JSON.stringify({ id: `evt_${uid()}`, type: 'checkout.completed', orderId: order.id, sessionId: session.sessionId, paymentRef: 'pi_x', amount: order.total, currency: 'CHF' });
    await expect(processWebhook('test', body, null)).rejects.toThrow(/signature/i);
    await expect(processWebhook('test', body, 't=1,v1=' + 'a'.repeat(64))).rejects.toThrow(/signature/i);
    await expect(processWebhook('test', body, signTestPayload(body, Math.floor(Date.now() / 1000) - 3600))).rejects.toThrow(/expired/i);
    await expect(processWebhook('test', body.replace(order.id, 'other'), signTestPayload(body))).rejects.toThrow(/signature/i);
    const low = JSON.stringify({ ...JSON.parse(body), amount: 100 });
    await expect(processWebhook('test', low, signTestPayload(low))).rejects.toThrow(/mismatch/i);
    // The failed event was rolled back: the order is untouched and the event can be retried.
    expect((await db.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('PENDING_PAYMENT');
    expect(await db.webhookEvent.count({ where: { eventId: JSON.parse(low).id } })).toBe(0);
  });

  it('failed payment → retry → success; unpaid orders can be cancelled by their owner only', async () => {
    const user = await createUser();
    const other = await createUser();
    const pkg = product.packages.find((p) => p.tier === 'BASIC')!;
    const order = await createOrder(user, { items: [{ productId: product.id, packageId: pkg.id, addonIds: [] }] }, BILLING, market);
    const s1 = await startCheckout(order.id, user.id, 'fr-ch', 'http://x', 'http://x');
    expect(await event({ id: `evt_${uid()}`, type: 'checkout.failed', orderId: order.id, sessionId: s1.sessionId, reason: 'declined' })).toBe('processed');
    expect((await db.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('PAYMENT_FAILED');
    expect(await db.payment.count({ where: { orderId: order.id, status: 'FAILED' } })).toBe(1);
    await expect(startCheckout(order.id, other.id, 'fr-ch', 'http://x', 'http://x')).rejects.toThrow(/introuvable/);
    await expect(cancelOrder(order.id, { id: other.id, staff: false })).rejects.toThrow(/introuvable/);
    const s2 = await startCheckout(order.id, user.id, 'fr-ch', 'http://x', 'http://x');
    await event({ id: `evt_${uid()}`, type: 'checkout.completed', orderId: order.id, sessionId: s2.sessionId, paymentRef: `pi_${uid()}`, amount: order.total, currency: 'CHF' });
    expect((await db.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('PAID');

    const o2 = await createOrder(user, { items: [{ productId: product.id, packageId: pkg.id, addonIds: [] }] }, BILLING, market);
    expect((await cancelOrder(o2.id, { id: user.id, staff: false })).status).toBe('CANCELLED');
  });

  it('administrative refunds: partial then full, never above the paid amount', async () => {
    const user = await createUser();
    const admin = await createUser({ role: 'FINANCE' });
    const { order } = await paidOrder(user.id);
    const payment = await db.payment.findFirstOrThrow({ where: { orderId: order.id } });
    await expect(refundPayment(payment.id, order.total + 1, admin.id)).rejects.toThrow(/invalide/);
    await expect(refundPayment(payment.id, 0, admin.id)).rejects.toThrow();
    await refundPayment(payment.id, 10000, admin.id, 'geste commercial');
    expect((await db.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('PARTIALLY_REFUNDED');
    await refundPayment(payment.id, order.total - 10000, admin.id);
    expect((await db.order.findUniqueOrThrow({ where: { id: order.id } })).status).toBe('REFUNDED');
    await expect(refundPayment(payment.id, 1, admin.id)).rejects.toThrow();
    expect(await db.refund.count({ where: { paymentId: payment.id } })).toBe(2);
    expect(await db.auditLog.count({ where: { action: 'payment.refund', entityId: payment.id } })).toBe(2);
  });

  it('Stripe adapter: verifies signatures and maps events', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
    const stripe = new Stripe('sk_test_dummy');
    const payload = JSON.stringify({ id: 'evt_1', object: 'event', type: 'checkout.session.completed', data: { object: { id: 'cs_1', mode: 'payment', payment_status: 'paid', metadata: { orderId: 'ord_1' }, payment_intent: 'pi_1', amount_total: 5000, currency: 'chf', payment_method_types: ['card'] } } });
    const header = stripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_test' });
    const evt = stripe.webhooks.constructEvent(payload, header, 'whsec_test');
    expect(await mapStripeEvent(evt, async () => ({}))).toMatchObject({ type: 'checkout.completed', orderId: 'ord_1', paymentRef: 'pi_1', amount: 5000, currency: 'CHF' });
    expect(() => stripe.webhooks.constructEvent(payload, header, 'whsec_other')).toThrow();
    const unpaid = { ...evt, data: { object: { ...(evt.data.object as object), payment_status: 'unpaid' } } } as Stripe.Event;
    expect(await mapStripeEvent(unpaid, async () => ({}))).toMatchObject({ type: 'ignored' }); // delayed methods wait for async_payment_succeeded
    const renewal = { id: 'evt_2', type: 'invoice.paid', data: { object: { id: 'in_1', billing_reason: 'subscription_cycle', parent: { subscription_details: { subscription: 'sub_1' } }, amount_paid: 4900, currency: 'eur' } } } as unknown as Stripe.Event;
    expect(await mapStripeEvent(renewal, async () => ({ items: { data: [{ current_period_end: 2000000000 }] } }))).toMatchObject({ type: 'subscription.renewed', providerSubId: 'sub_1', amount: 4900, currency: 'EUR' });
    expect(await mapStripeEvent({ id: 'e', type: 'customer.created', data: { object: {} } } as unknown as Stripe.Event, async () => ({}))).toMatchObject({ type: 'ignored' });
  });
});

describe('briefing and project workflow (mandatory scenario)', () => {
  it('purchase → briefing → admin status changes → client review → approval → completion', async () => {
    const customer = await createUser();
    const stranger = await createUser();
    const manager = await createUser({ role: 'PROJECT_MANAGER' });
    const developer = await createUser({ role: 'DEVELOPER' });
    const finance = await createUser({ role: 'FINANCE' });
    const { order } = await paidOrder(customer.id);
    const project = await db.project.findFirstOrThrow({ where: { orderItem: { orderId: order.id } } });

    // Briefing: draft → edit → submit (required fields) → still editable → confirm → locked.
    await saveBriefing(customer.id, project.id, { companyName: 'Boulangerie Test' });
    await expect(submitBriefing(customer.id, project.id, { companyName: 'Boulangerie Test' }, false)).rejects.toThrow(/obligatoires/);
    await expect(saveBriefing(stranger.id, project.id, { companyName: 'Hack' })).rejects.toThrow(/introuvable/);
    const full = { companyName: 'Boulangerie Test', contactName: 'Marie Test', email: 'marie@example.test', goal: 'Présenter la boulangerie', ownWords: 'Je veux un site simple avec la carte et les horaires.' };
    await submitBriefing(customer.id, project.id, full, false);
    expect((await db.project.findUniqueOrThrow({ where: { id: project.id } })).status).toBe('BRIEFING_SUBMITTED');
    expect(await db.task.count({ where: { projectId: project.id, type: 'production' } })).toBe(1);
    await submitBriefing(customer.id, project.id, { ...full, colors: 'bleu' }, false); // editing after submission
    expect(await db.task.count({ where: { projectId: project.id, type: 'production' } })).toBe(1);
    await confirmBriefing(customer.id, project.id);
    expect((await db.project.findUniqueOrThrow({ where: { id: project.id } })).status).toBe('PROJECT_QUEUED');
    await expect(saveBriefing(customer.id, project.id, full)).rejects.toThrow(/confirmé/);

    // Export for the production workflow: personal data is redacted without AI consent.
    const brief = await exportProjectBrief(manager, project.id);
    expect(brief.aiProcessingConsent).toBe(false);
    expect(brief.briefing.contact.email).toMatch(/redacted/);
    expect(brief.briefing.project.goal).toBe('Présenter la boulangerie');
    expect(brief.briefing.content.inTheirOwnWords).toMatch(/redacted/);
    await expect(exportProjectBrief(customer, project.id)).rejects.toThrow();

    // Access control: other customers see nothing; staff need the right permission.
    await expect(getProjectFor(stranger, project.id)).rejects.toThrow(/introuvable/);
    await expect(getProjectFor(finance, project.id)).rejects.toThrow(/introuvable/);
    expect((await getProjectFor(manager, project.id)).id).toBe(project.id);
    await expect(setProjectStatus(customer, project.id, 'COMPLETED')).rejects.toThrow();
    await expect(setProjectStatus(finance, project.id, 'IN_DEVELOPMENT')).rejects.toThrow();
    await expect(setProjectStatus(developer, project.id, 'IN_DEVELOPMENT')).rejects.toThrow(); // not assigned to this developer
    await expect(setProjectStatus(manager, project.id, 'PAID')).rejects.toThrow(/paiement/);

    await db.project.update({ where: { id: project.id }, data: { assigneeId: developer.id } });
    await setProjectStatus(developer, project.id, 'IN_DEVELOPMENT');
    await setProjectStatus(manager, project.id, 'CLIENT_REVIEW', 'Aperçu disponible');
    expect(await db.notification.count({ where: { userId: customer.id, type: 'project' } })).toBeGreaterThanOrEqual(2);
    expect(await db.emailLog.count({ where: { to: customer.email, templateKey: 'project_status' } })).toBeGreaterThanOrEqual(2);

    // Messages: internal notes never reach the customer.
    await postMessage(manager, project.id, 'Note interne', true);
    await postMessage(manager, project.id, 'Votre aperçu est prêt.');
    await expect(postMessage(customer, project.id, 'x', true)).rejects.toThrow();
    await expect(postMessage(stranger, project.id, 'coucou')).rejects.toThrow();
    expect(await db.message.count({ where: { projectId: project.id, internal: false } })).toBe(1);

    // Revision round, then approval.
    await expect(requestRevision(stranger.id, project.id, 'Changer la couleur du bandeau')).rejects.toThrow();
    await requestRevision(customer.id, project.id, 'Changer la couleur du bandeau');
    expect((await db.project.findUniqueOrThrow({ where: { id: project.id } })).status).toBe('REVISION_REQUESTED');
    await expect(approveProject(customer.id, project.id)).rejects.toThrow();
    await setProjectStatus(manager, project.id, 'CLIENT_REVIEW');
    // The BUSINESS package includes 2 revision cycles: a third request is refused.
    await requestRevision(customer.id, project.id, 'Deuxième série de modifications');
    await setProjectStatus(manager, project.id, 'CLIENT_REVIEW');
    await expect(requestRevision(customer.id, project.id, 'Troisième série de modifications')).rejects.toThrow(/épuisés/);
    expect((await db.project.findUniqueOrThrow({ where: { id: project.id } })).dueAt).not.toBeNull(); // set when the briefing was confirmed
    await approveProject(customer.id, project.id);
    expect(await db.task.count({ where: { projectId: project.id, type: { in: ['delivery', 'maintenance_offer'] } } })).toBe(2);
    await setProjectStatus(manager, project.id, 'COMPLETED');
    expect((await db.project.findUniqueOrThrow({ where: { id: project.id } })).status).toBe('COMPLETED');
    const events = await db.projectEvent.findMany({ where: { projectId: project.id }, orderBy: { createdAt: 'asc' } });
    expect(events.map((e) => e.toStatus)).toEqual(['PAID', 'BRIEFING_PENDING', 'BRIEFING_SUBMITTED', 'PROJECT_QUEUED', 'IN_DEVELOPMENT', 'CLIENT_REVIEW', 'REVISION_REQUESTED', 'CLIENT_REVIEW', 'REVISION_REQUESTED', 'CLIENT_REVIEW', 'APPROVED', 'COMPLETED']);
  });

  it('includes personal data in the export only with explicit AI consent', async () => {
    const customer = await createUser();
    const manager = await createUser({ role: 'ADMIN' });
    const { order } = await paidOrder(customer.id);
    const project = await db.project.findFirstOrThrow({ where: { orderItem: { orderId: order.id } } });
    await submitBriefing(customer.id, project.id, { companyName: 'X', contactName: 'Jo', email: 'jo@example.test', goal: 'g', ownWords: 'o' }, true);
    const brief = await exportProjectBrief(manager, project.id);
    expect(brief.aiProcessingConsent).toBe(true);
    expect(brief.briefing.contact.email).toBe('jo@example.test');
  });
});

describe('uploads', () => {
  const png = Buffer.concat([Buffer.from('89504e470d0a1a0a', 'hex'), Buffer.alloc(64)]);
  it('accepts allowed files and stores them under a random private key', async () => {
    const stored = await storeUpload('projects', new File([png], '../../logo final.png', { type: 'image/png' }));
    expect(stored.storageKey).toMatch(/^projects\/[a-f0-9]{32}\.png$/);
    expect(stored.originalName).toBe('logo final.png');
  });
  it('rejects disallowed types, spoofed content, scripts in SVG, empty and oversized files', async () => {
    const v = (name: string, type: string, data: Buffer) => validateUpload({ name, type, size: data.length }, data);
    await expect(v('a.exe', 'application/x-msdownload', png)).rejects.toThrow(/non autorisé/);
    await expect(v('a.html', 'text/html', Buffer.from('<html>'))).rejects.toThrow(/non autorisé/);
    await expect(v('fake.png', 'image/png', Buffer.from('MZ this is not a png'))).rejects.toThrow(/ne correspond pas/);
    await expect(v('fake.pdf', 'application/pdf', png)).rejects.toThrow(/ne correspond pas/);
    await expect(v('x.svg', 'image/svg+xml', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'))).rejects.toThrow();
    await expect(v('x.svg', 'image/svg+xml', Buffer.from('<svg onload="x()"></svg>'))).rejects.toThrow();
    await expect(v('e.png', 'image/png', Buffer.alloc(0))).rejects.toThrow(/vide/);
    await expect(v('big.png', 'image/png', Buffer.concat([png, Buffer.alloc(16 * 1024 * 1024)]))).rejects.toThrow(/volumineux/);
    expect((await v('ok.svg', 'image/svg+xml', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect/></svg>'))).ext).toBe('svg');
  });
});

describe('SaaS subscriptions', () => {
  it('trial → activation → renewal → failed payment → cancellation at period end → resume', async () => {
    const { user, org } = await createTenant();
    const outsider = await createUser();
    const plan = await db.plan.findUniqueOrThrow({ where: { saasProductKey_key: { saasProductKey: 'crm', key: 'STARTER' } } });
    const business = await db.plan.findUniqueOrThrow({ where: { saasProductKey_key: { saasProductKey: 'crm', key: 'BUSINESS' } } });
    await expect(startTrial(outsider.id, org.id, plan.id, 'EUR')).rejects.toThrow();
    await expect(startTrial(user.id, org.id, plan.id, 'JPY')).rejects.toThrow(/devise/);
    const sub = await startTrial(user.id, org.id, plan.id, 'EUR');
    expect(sub.status).toBe('TRIALING');
    await expect(startTrial(user.id, org.id, plan.id, 'EUR')).rejects.toThrow(/déjà/);
    expect(subscriptionIsUsable((await loadTenantCtx(user.id, org.id, 'crm')).subscription)).toBe(true);
    await changePlan(user.id, sub.id, business.id);
    await expect(changePlan(outsider.id, sub.id, plan.id)).rejects.toThrow();

    const session = await startSubscriptionCheckout(user.id, sub.id, 'fr-ch', 'http://x', 'http://x');
    expect(session.url).toContain('kind=subscription');
    const end = new Date(Date.now() + 30 * 86400_000);
    await event({ id: `evt_${uid()}`, type: 'subscription.activated', subscriptionId: sub.id, providerSubId: `sub_${sub.id}`, periodEnd: end.toISOString(), paymentRef: `inv_${uid()}`, amount: 4900 });
    let cur = await db.subscription.findUniqueOrThrow({ where: { id: sub.id } });
    expect(cur.status).toBe('ACTIVE');
    expect(await db.payment.count({ where: { subscriptionId: sub.id } })).toBe(1);
    await expect(startSubscriptionCheckout(user.id, sub.id, 'fr-ch', 'http://x', 'http://x')).rejects.toThrow(/déjà actif/);

    const renewal = { id: `evt_${uid()}`, type: 'subscription.renewed', providerSubId: `sub_${sub.id}`, periodEnd: new Date(Date.now() + 60 * 86400_000).toISOString(), paymentRef: `inv_${uid()}`, amount: 4900, currency: 'EUR' };
    await event(renewal);
    expect(await event(renewal)).toBe('duplicate');
    expect(await db.payment.count({ where: { subscriptionId: sub.id } })).toBe(2);

    await event({ id: `evt_${uid()}`, type: 'subscription.payment_failed', providerSubId: `sub_${sub.id}` });
    cur = await db.subscription.findUniqueOrThrow({ where: { id: sub.id } });
    expect(cur.status).toBe('PAST_DUE');
    expect(subscriptionIsUsable({ ...cur, plan: business })).toBe(true); // grace: access kept while the payment is being fixed
    await event({ ...renewal, id: `evt_${uid()}`, paymentRef: `inv_${uid()}` });

    await expect(cancelSubscription(outsider.id, sub.id)).rejects.toThrow();
    await cancelSubscription(user.id, sub.id);
    cur = await db.subscription.findUniqueOrThrow({ where: { id: sub.id } });
    expect(cur.status).toBe('ACTIVE');
    expect(cur.cancelAtPeriodEnd).toBe(true); // access until the end of the paid period
    await resumeSubscription(user.id, sub.id);
    expect((await db.subscription.findUniqueOrThrow({ where: { id: sub.id } })).cancelAtPeriodEnd).toBe(false);
    await cancelSubscription(user.id, sub.id);
    await db.subscription.update({ where: { id: sub.id }, data: { currentPeriodEnd: new Date(Date.now() - 1000) } });
    await runDailyBilling();
    cur = await db.subscription.findUniqueOrThrow({ where: { id: sub.id } });
    expect(cur.status).toBe('CANCELED');
    expect(subscriptionIsUsable({ ...cur, plan: business })).toBe(false);
    await expect(cancelSubscription(user.id, sub.id)).rejects.toThrow(/déjà résilié/);
  });

  it('cancelling a trial is immediate; expired trials are closed; renewal notices are sent once', async () => {
    const a = await createTenant();
    const b = await createTenant();
    const c = await createTenant();
    const plan = await db.plan.findUniqueOrThrow({ where: { saasProductKey_key: { saasProductKey: 'pointage', key: 'STARTER' } } });
    const s1 = await startTrial(a.user.id, a.org.id, plan.id, 'EUR');
    await cancelSubscription(a.user.id, s1.id);
    expect((await db.subscription.findUniqueOrThrow({ where: { id: s1.id } })).status).toBe('CANCELED');
    const s2 = await startTrial(b.user.id, b.org.id, plan.id, 'EUR');
    await db.subscription.update({ where: { id: s2.id }, data: { currentPeriodEnd: new Date(Date.now() - 1000) } });
    const s3 = await startTrial(c.user.id, c.org.id, plan.id, 'EUR');
    await db.subscription.update({ where: { id: s3.id }, data: { status: 'ACTIVE', currentPeriodEnd: new Date(Date.now() + 3 * 86400_000) } });
    await runDailyBilling();
    await runDailyBilling();
    expect((await db.subscription.findUniqueOrThrow({ where: { id: s2.id } })).status).toBe('CANCELED');
    expect((await db.subscription.findUniqueOrThrow({ where: { id: s3.id } })).renewalNoticeAt).not.toBeNull();
    expect(await db.notification.count({ where: { userId: c.user.id, type: 'subscription' } })).toBe(1);
  });

  it('seat-based pricing adds extra seats beyond the included ones', () => {
    const plan = { prices: { EUR: 2900 }, seatPrices: { EUR: 300 }, includedSeats: 10 };
    expect(subscriptionAmount(plan, 'EUR', 8)).toBe(2900);
    expect(subscriptionAmount(plan, 'EUR', 14)).toBe(2900 + 4 * 300);
    expect(() => subscriptionAmount(plan, 'BRL', 1)).toThrow();
  });
});

describe('tenancy', () => {
  it('membership is required and invitations respect roles', async () => {
    const a = await createTenant('crm');
    const b = await createTenant('crm');
    await expect(loadTenantCtx(a.user.id, b.org.id, 'crm')).rejects.toThrow();
    const member = await addMember(a.org.id, 'MEMBER', 'crm');
    await expect(inviteMember(member.ctx, { email: `x-${uid()}@example.test`, name: 'X' })).rejects.toThrow();
    await expect(inviteMember(a.ctx, { email: 'pas-un-email', name: 'X' })).rejects.toThrow(/invalide/);
    await expect(inviteMember(a.ctx, { email: `x-${uid()}@example.test`, name: 'X', role: 'OWNER' })).rejects.toThrow();
    const email = `inv-${uid()}@example.test`;
    const inv = await inviteMember(a.ctx, { email, name: 'Invité' });
    expect(inv.created).toBe(true);
    expect(await db.emailLog.count({ where: { to: email, templateKey: 'invitation' } })).toBe(1);
    expect(await db.passwordResetToken.count({ where: { userId: inv.user.id } })).toBe(1);
    await expect(removeMember(a.ctx, a.user.id)).rejects.toThrow(/propriétaire/);
    await removeMember(a.ctx, inv.user.id);
    await expect(loadTenantCtx(inv.user.id, a.org.id)).rejects.toThrow();
  });
});
