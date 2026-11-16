import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { AppError } from '@/lib/errors';
import { audit } from '@/lib/audit';
import { getSetting } from '@/lib/settings';
import { m } from '@/i18n/translate';
import { emit, type DomainEvent } from '@/modules/automation/events';
import { nextRef } from '@/modules/orders/service';
import { stripeProvider } from './stripe-provider';
import { testProvider } from './test-provider';
import type { PaymentEvent, PaymentProvider } from './types';

export function getProvider(id?: string): PaymentProvider {
  const mode = id ?? env.paymentsMode;
  if (mode === 'stripe') return stripeProvider;
  if (mode === 'test') {
    if (env.paymentsMode !== 'test') throw new AppError('Test payments are disabled.', 'forbidden');
    return testProvider;
  }
  throw new AppError(`Unknown payment provider ${mode}`, 'not_configured');
}

/** Starts hosted checkout for an unpaid order and remembers the provider session. */
export async function startCheckout(orderId: string, userId: string, locale: string, successUrl: string, cancelUrl: string) {
  const order = await db.order.findFirst({ where: { id: orderId, userId }, include: { items: true, user: true } });
  if (!order) throw new AppError(m('Commande introuvable.'), 'not_found');
  if (order.status !== 'PENDING_PAYMENT' && order.status !== 'PAYMENT_FAILED') throw new AppError(m('Cette commande ne peut plus être payée.'));
  const provider = getProvider();
  const session = await provider.createCheckout({ order, email: order.user.email, successUrl, cancelUrl, locale });
  await db.order.update({ where: { id: order.id }, data: { status: 'PENDING_PAYMENT', paymentProvider: provider.id, providerSessionId: session.sessionId } });
  return session;
}

type Tx = Prisma.TransactionClient;

async function createInvoiceForOrder(tx: Tx, orderId: string) {
  const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
  if (await tx.invoice.findFirst({ where: { orderId } })) return;
  const [company, invoicing] = [await getSetting('company'), await getSetting('invoicing')];
  await tx.invoice.create({
    data: {
      number: await nextRef('invoice_number_seq', `${invoicing.prefix}-F`, tx), orderId, userId: order.userId, currency: order.currency,
      subtotal: order.subtotal, discount: order.discount, tax: order.tax, total: order.total, taxRateBps: order.taxRateBps, taxLabel: order.taxLabel,
      billing: order.billing as Prisma.InputJsonValue, seller: company,
      lines: order.items.flatMap((i) => [
        { description: `${i.name} — ${i.tier}`, quantity: 1, unitAmount: i.unitAmount, total: i.unitAmount },
        ...(i.addons as { name: string; amount: number }[]).map((a) => ({ description: `+ ${a.name}`, quantity: 1, unitAmount: a.amount, total: a.amount })),
      ]),
    },
  });
}

async function apply(tx: Tx, provider: string, e: PaymentEvent): Promise<DomainEvent[]> {
  switch (e.type) {
    case 'checkout.completed': {
      const order = await tx.order.findUnique({ where: { id: e.orderId }, include: { items: { include: { project: true } } } });
      if (!order) throw new Error(`Unknown order ${e.orderId}`);
      if (order.status === 'PAID') return [];
      if (e.amount !== order.total || e.currency !== order.currency) {
        throw new Error(`Amount mismatch for order ${order.number}: got ${e.amount} ${e.currency}, expected ${order.total} ${order.currency}`);
      }
      await tx.order.update({ where: { id: order.id }, data: { status: 'PAID', paidAt: new Date(), paymentProvider: provider } });
      await tx.payment.upsert({
        where: { provider_providerRef: { provider, providerRef: e.paymentRef } },
        create: { orderId: order.id, provider, providerRef: e.paymentRef, amount: e.amount, currency: e.currency, status: 'SUCCEEDED', method: e.method },
        update: { status: 'SUCCEEDED', method: e.method },
      });
      if (order.couponId) await tx.coupon.update({ where: { id: order.couponId }, data: { redeemedCount: { increment: 1 } } });
      for (const item of order.items) {
        if (!item.project) continue;
        await tx.project.update({ where: { id: item.project.id }, data: { status: 'BRIEFING_PENDING' } });
        await tx.projectEvent.createMany({ data: [
          { projectId: item.project.id, type: 'status_change', fromStatus: 'PAYMENT_PENDING', toStatus: 'PAID' },
          { projectId: item.project.id, type: 'status_change', fromStatus: 'PAID', toStatus: 'BRIEFING_PENDING' },
        ] });
        await tx.briefing.upsert({ where: { projectId: item.project.id }, create: { projectId: item.project.id }, update: {} });
      }
      await createInvoiceForOrder(tx, order.id);
      return [{ type: 'order.paid', orderId: order.id }];
    }
    case 'checkout.failed':
    case 'checkout.expired': {
      const order = await tx.order.findUnique({ where: { id: e.orderId } });
      if (!order || order.status !== 'PENDING_PAYMENT') return [];
      await tx.order.update({ where: { id: order.id }, data: { status: 'PAYMENT_FAILED' } });
      await tx.payment.upsert({
        where: { provider_providerRef: { provider, providerRef: e.sessionId } },
        create: { orderId: order.id, provider, providerRef: e.sessionId, amount: order.total, currency: order.currency, status: 'FAILED', failureReason: e.reason ?? e.type },
        update: { status: 'FAILED' },
      });
      return [{ type: 'order.payment_failed', orderId: order.id }];
    }
    case 'refund.updated': {
      const payment = await tx.payment.findUnique({ where: { provider_providerRef: { provider, providerRef: e.paymentRef } } });
      if (!payment || e.refundedAmount <= payment.refundedAmount) return [];
      const full = e.refundedAmount >= payment.amount;
      await tx.payment.update({ where: { id: payment.id }, data: { refundedAmount: e.refundedAmount, status: full ? 'REFUNDED' : 'PARTIALLY_REFUNDED' } });
      if (payment.orderId) {
        await tx.order.update({ where: { id: payment.orderId }, data: { status: full ? 'REFUNDED' : 'PARTIALLY_REFUNDED' } });
        return [{ type: 'order.refunded', orderId: payment.orderId, amount: e.refundedAmount - payment.refundedAmount }];
      }
      return [];
    }
    case 'subscription.activated': {
      const sub = await tx.subscription.findUnique({ where: { id: e.subscriptionId } });
      if (!sub) throw new Error(`Unknown subscription ${e.subscriptionId}`);
      await tx.subscription.update({
        where: { id: sub.id },
        data: { status: 'ACTIVE', provider, providerSubId: e.providerSubId, currentPeriodStart: new Date(), currentPeriodEnd: e.periodEnd, cancelAtPeriodEnd: false, canceledAt: null },
      });
      if (e.paymentRef && e.amount != null) {
        await tx.payment.upsert({
          where: { provider_providerRef: { provider, providerRef: e.paymentRef } },
          create: { subscriptionId: sub.id, provider, providerRef: e.paymentRef, amount: e.amount, currency: sub.currency, status: 'SUCCEEDED' },
          update: {},
        });
      }
      return [{ type: 'subscription.activated', subscriptionId: sub.id }];
    }
    case 'subscription.renewed': {
      const sub = await tx.subscription.findUnique({ where: { providerSubId: e.providerSubId } });
      if (!sub) return [];
      await tx.subscription.update({ where: { id: sub.id }, data: { status: 'ACTIVE', currentPeriodStart: new Date(), currentPeriodEnd: e.periodEnd, renewalNoticeAt: null } });
      await tx.payment.upsert({
        where: { provider_providerRef: { provider, providerRef: e.paymentRef } },
        create: { subscriptionId: sub.id, provider, providerRef: e.paymentRef, amount: e.amount, currency: e.currency, status: 'SUCCEEDED' },
        update: {},
      });
      return [];
    }
    case 'subscription.payment_failed': {
      const sub = await tx.subscription.findUnique({ where: { providerSubId: e.providerSubId } });
      if (!sub || sub.status === 'CANCELED') return [];
      await tx.subscription.update({ where: { id: sub.id }, data: { status: 'PAST_DUE' } });
      return [{ type: 'subscription.payment_failed', subscriptionId: sub.id }];
    }
    case 'subscription.updated': {
      const sub = await tx.subscription.findUnique({ where: { providerSubId: e.providerSubId } });
      if (!sub) return [];
      await tx.subscription.update({ where: { id: sub.id }, data: { cancelAtPeriodEnd: e.cancelAtPeriodEnd, ...(e.periodEnd ? { currentPeriodEnd: e.periodEnd } : {}) } });
      return [];
    }
    case 'subscription.canceled': {
      const sub = await tx.subscription.findUnique({ where: { providerSubId: e.providerSubId } });
      if (!sub || sub.status === 'CANCELED') return [];
      await tx.subscription.update({ where: { id: sub.id }, data: { status: 'CANCELED', canceledAt: new Date() } });
      return [{ type: 'subscription.canceled', subscriptionId: sub.id }];
    }
    case 'ignored':
      return [];
  }
}

/**
 * Single entry point for every provider webhook.
 * 1. The signature is verified by the provider adapter (invalid → throws, nothing is written).
 * 2. The event id is inserted in the idempotency ledger inside the same transaction as its
 *    effects: a replay hits the unique constraint and is acknowledged without side effects;
 *    a failure rolls everything back so the provider can retry.
 */
export async function processWebhook(providerId: 'stripe' | 'test', rawBody: string, signature: string | null): Promise<'processed' | 'duplicate' | 'ignored'> {
  const provider = getProvider(providerId);
  const event = await provider.parseWebhook(rawBody, signature);
  if (event.type === 'ignored') return 'ignored';
  let followUps: DomainEvent[];
  try {
    followUps = await db.$transaction(async (tx) => {
      await tx.webhookEvent.create({ data: { provider: provider.id, eventId: event.id, type: event.type, processedAt: new Date() } });
      return apply(tx, provider.id, event);
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002' && String(err.meta?.target).includes('eventId')) return 'duplicate';
    throw err;
  }
  for (const f of followUps) await emit(f);
  return 'processed';
}

/** Administrative refund (full or partial). Money moves through the provider; the ledger follows. */
export async function refundPayment(paymentId: string, amount: number, actorId: string, reason?: string) {
  const payment = await db.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.status === 'PENDING' || payment.status === 'FAILED') throw new AppError(m('Paiement non remboursable.'));
  if (!Number.isInteger(amount) || amount <= 0 || amount > payment.amount - payment.refundedAmount) throw new AppError(m('Montant de remboursement invalide.'));
  if (payment.subscriptionId && payment.provider === 'stripe') {
    // Subscription payments are stored by invoice reference: refund them from the Stripe dashboard (the charge.refunded webhook is not linked to them yet).
    throw new AppError(m('Les paiements d’abonnement se remboursent depuis le tableau de bord du prestataire de paiement.'));
  }
  const provider = getProvider(payment.provider);
  const { providerRef } = await provider.refund({ payment, amount, reason });
  const refunded = payment.refundedAmount + amount;
  const full = refunded >= payment.amount;
  await db.$transaction([
    db.refund.create({ data: { paymentId, amount, reason, providerRef, createdById: actorId } }),
    db.payment.update({ where: { id: paymentId }, data: { refundedAmount: refunded, status: full ? 'REFUNDED' : 'PARTIALLY_REFUNDED' } }),
    ...(payment.orderId ? [db.order.update({ where: { id: payment.orderId }, data: { status: full ? 'REFUNDED' : 'PARTIALLY_REFUNDED' } })] : []),
  ]);
  await audit({ actorId, action: 'payment.refund', entity: 'Payment', entityId: paymentId, meta: { amount, reason } });
  if (payment.orderId) await emit({ type: 'order.refunded', orderId: payment.orderId, amount });
}
