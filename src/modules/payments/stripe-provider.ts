import Stripe from 'stripe';
import { env } from '@/lib/env';
import { AppError } from '@/lib/errors';
import type { PaymentEvent, PaymentProvider } from './types';

let client: Stripe | null = null;
function stripe(): Stripe {
  if (!env.stripeSecretKey) throw new AppError('Stripe is not configured (STRIPE_SECRET_KEY).', 'not_configured');
  return (client ??= new Stripe(env.stripeSecretKey));
}

const STRIPE_LOCALES: Record<string, Stripe.Checkout.SessionCreateParams.Locale> = { 'fr-ch': 'fr', 'fr-fr': 'fr', 'pt-pt': 'pt', 'pt-br': 'pt-BR' };

/* eslint-disable @typescript-eslint/no-explicit-any -- Stripe moved some fields between API versions; both shapes are read defensively. */
function subscriptionPeriodEnd(sub: any): Date {
  const ts = sub?.current_period_end ?? sub?.items?.data?.[0]?.current_period_end;
  return new Date((ts ?? Math.floor(Date.now() / 1000) + 30 * 86400) * 1000);
}
function invoiceSubscriptionId(inv: any): string | null {
  const s = inv?.subscription ?? inv?.parent?.subscription_details?.subscription;
  return typeof s === 'string' ? s : s?.id ?? null;
}

export function mapStripeEvent(event: Stripe.Event, fetchSubscription: (id: string) => Promise<any>): Promise<PaymentEvent> | PaymentEvent {
  const obj: any = event.data.object;
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      if (obj.mode === 'subscription') {
        if (!obj.metadata?.subscriptionId || !obj.subscription) return { id: event.id, type: 'ignored' };
        return fetchSubscription(String(obj.subscription)).then((sub) => ({
          id: event.id, type: 'subscription.activated' as const, subscriptionId: obj.metadata.subscriptionId,
          providerSubId: String(obj.subscription), periodEnd: subscriptionPeriodEnd(sub),
          paymentRef: obj.invoice ? `inv_first_${obj.invoice}` : undefined, amount: obj.amount_total ?? undefined,
        }));
      }
      if (!obj.metadata?.orderId) return { id: event.id, type: 'ignored' };
      // Delayed methods (e.g. Multibanco) complete the session unpaid; fulfilment waits for async_payment_succeeded.
      if (obj.payment_status !== 'paid') return { id: event.id, type: 'ignored' };
      return {
        id: event.id, type: 'checkout.completed', orderId: obj.metadata.orderId, sessionId: obj.id,
        paymentRef: String(obj.payment_intent ?? obj.id), amount: obj.amount_total, currency: String(obj.currency).toUpperCase(),
        method: obj.payment_method_types?.[0],
      };
    }
    case 'checkout.session.async_payment_failed':
    case 'checkout.session.expired':
      if (!obj.metadata?.orderId) return { id: event.id, type: 'ignored' };
      return { id: event.id, type: event.type === 'checkout.session.expired' ? 'checkout.expired' : 'checkout.failed', orderId: obj.metadata.orderId, sessionId: obj.id };
    case 'charge.refunded':
      return { id: event.id, type: 'refund.updated', paymentRef: String(obj.payment_intent ?? obj.id), refundedAmount: obj.amount_refunded };
    case 'invoice.paid': {
      const subId = invoiceSubscriptionId(obj);
      if (!subId || obj.billing_reason === 'subscription_create') return { id: event.id, type: 'ignored' };
      return fetchSubscription(subId).then((sub) => ({
        id: event.id, type: 'subscription.renewed' as const, providerSubId: subId, periodEnd: subscriptionPeriodEnd(sub),
        paymentRef: String(obj.id), amount: obj.amount_paid, currency: String(obj.currency).toUpperCase(),
      }));
    }
    case 'invoice.payment_failed': {
      const subId = invoiceSubscriptionId(obj);
      return subId ? { id: event.id, type: 'subscription.payment_failed', providerSubId: subId, reason: obj.last_finalization_error?.message } : { id: event.id, type: 'ignored' };
    }
    case 'customer.subscription.updated':
      return { id: event.id, type: 'subscription.updated', providerSubId: obj.id, cancelAtPeriodEnd: !!obj.cancel_at_period_end, periodEnd: subscriptionPeriodEnd(obj) };
    case 'customer.subscription.deleted':
      return { id: event.id, type: 'subscription.canceled', providerSubId: obj.id };
    default:
      return { id: event.id, type: 'ignored' };
  }
}

export const stripeProvider: PaymentProvider = {
  id: 'stripe',
  async createCheckout({ order, email, successUrl, cancelUrl, locale }) {
    // A single line with the server-computed order total keeps Stripe and the order ledger strictly identical
    // (discounts and taxes are computed by ATHANA from admin-managed settings).
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      client_reference_id: order.id,
      metadata: { orderId: order.id, orderNumber: order.number },
      payment_intent_data: { metadata: { orderId: order.id, orderNumber: order.number } },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: order.currency.toLowerCase(), unit_amount: order.total,
          product_data: { name: `ATHANA — ${order.number}`, description: order.items.map((i) => `${i.name} (${i.tier})`).join(', ').slice(0, 500) },
        },
      }],
      locale: STRIPE_LOCALES[locale] ?? 'auto',
      success_url: successUrl, cancel_url: cancelUrl,
    });
    if (!session.url) throw new AppError('Stripe did not return a checkout URL.', 'not_configured');
    return { url: session.url, sessionId: session.id };
  },
  async createSubscriptionCheckout({ subscription, amount, productName, email, successUrl, cancelUrl, locale }) {
    const session = await stripe().checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      client_reference_id: subscription.id,
      metadata: { subscriptionId: subscription.id },
      subscription_data: { metadata: { subscriptionId: subscription.id } },
      line_items: [{
        quantity: 1,
        price_data: { currency: subscription.currency.toLowerCase(), unit_amount: amount, recurring: { interval: 'month' }, product_data: { name: productName } },
      }],
      locale: STRIPE_LOCALES[locale] ?? 'auto',
      success_url: successUrl, cancel_url: cancelUrl,
    });
    if (!session.url) throw new AppError('Stripe did not return a checkout URL.', 'not_configured');
    return { url: session.url, sessionId: session.id };
  },
  async refund({ payment, amount, reason }) {
    const refund = await stripe().refunds.create(
      { payment_intent: payment.providerRef, amount, metadata: { reason: reason?.slice(0, 200) ?? '' } },
      { idempotencyKey: `refund-${payment.id}-${payment.refundedAmount}-${amount}` },
    );
    return { providerRef: refund.id };
  },
  async setCancelAtPeriodEnd(providerSubId, cancel) {
    await stripe().subscriptions.update(providerSubId, { cancel_at_period_end: cancel });
  },
  async parseWebhook(rawBody, signature) {
    if (!env.stripeWebhookSecret) throw new AppError('STRIPE_WEBHOOK_SECRET is not configured.', 'not_configured');
    let event: Stripe.Event;
    try {
      event = stripe().webhooks.constructEvent(rawBody, signature ?? '', env.stripeWebhookSecret);
    } catch {
      throw new AppError('Invalid signature', 'forbidden');
    }
    return mapStripeEvent(event, (id) => stripe().subscriptions.retrieve(id));
  },
};
