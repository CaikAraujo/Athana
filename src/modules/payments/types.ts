import type { Order, OrderItem, Payment, Plan, Subscription } from '@prisma/client';

/** Provider-agnostic events. Every provider adapter maps its webhooks to these. */
export type PaymentEvent =
  | { id: string; type: 'checkout.completed'; orderId: string; sessionId: string; paymentRef: string; amount: number; currency: string; method?: string }
  | { id: string; type: 'checkout.failed' | 'checkout.expired'; orderId: string; sessionId: string; reason?: string }
  | { id: string; type: 'refund.updated'; paymentRef: string; refundedAmount: number }
  | { id: string; type: 'subscription.activated'; subscriptionId: string; providerSubId: string; periodEnd: Date; paymentRef?: string; amount?: number }
  | { id: string; type: 'subscription.renewed'; providerSubId: string; periodEnd: Date; paymentRef: string; amount: number; currency: string }
  | { id: string; type: 'subscription.payment_failed'; providerSubId: string; reason?: string }
  | { id: string; type: 'subscription.updated'; providerSubId: string; cancelAtPeriodEnd: boolean; periodEnd?: Date }
  | { id: string; type: 'subscription.canceled'; providerSubId: string }
  | { id: string; type: 'ignored' };

export type CheckoutResult = { url: string; sessionId: string };

export interface PaymentProvider {
  id: 'stripe' | 'test';
  /** One-off payment for an order. Card data never touches ATHANA servers (hosted checkout). */
  createCheckout(input: { order: Order & { items: OrderItem[] }; email: string; successUrl: string; cancelUrl: string; locale: string }): Promise<CheckoutResult>;
  createSubscriptionCheckout(input: { subscription: Subscription & { plan: Plan }; amount: number; productName: string; email: string; successUrl: string; cancelUrl: string; locale: string }): Promise<CheckoutResult>;
  refund(input: { payment: Payment; amount: number; reason?: string }): Promise<{ providerRef: string }>;
  setCancelAtPeriodEnd(providerSubId: string, cancel: boolean): Promise<void>;
  /** Verifies the signature and maps the payload. Throws on an invalid signature. */
  parseWebhook(rawBody: string, signature: string | null): Promise<PaymentEvent>;
}

/**
 * Methods surfaced by each provider. Stripe Checkout enables methods from the Stripe
 * Dashboard (cards, TWINT for CH entities, Multibanco / MB WAY, Pix where the account is
 * eligible) — no per-method code. PayPal requires its own adapter (not implemented).
 */
export const PROVIDER_NOTES = {
  stripe: ['card', 'twint', 'multibanco', 'mb_way', 'pix'],
  paypal: [],
} as const;
