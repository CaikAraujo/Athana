import { env } from '@/lib/env';
import { hmac, randomToken, safeEqual } from '@/lib/crypto';
import { AppError } from '@/lib/errors';
import type { PaymentEvent, PaymentProvider } from './types';

/**
 * Sandbox provider used when no payment credentials are configured.
 * It never moves money and is clearly labelled in the UI. Its events travel through the
 * exact same signed-webhook pipeline as Stripe events, so order fulfilment is exercised for real.
 */
const secret = () => hmac(env.sessionSecret, 'athana-test-payments');

export function signTestPayload(rawBody: string, timestamp = Math.floor(Date.now() / 1000)) {
  return `t=${timestamp},v1=${hmac(secret(), `${timestamp}.${rawBody}`)}`;
}

export const testProvider: PaymentProvider = {
  id: 'test',
  async createCheckout({ order, locale }) {
    const sessionId = `test_cs_${randomToken(12)}`;
    return { sessionId, url: `${env.appUrl}/${locale}/sandbox-payment?kind=order&ref=${order.id}&session=${sessionId}` };
  },
  async createSubscriptionCheckout({ subscription, locale }) {
    const sessionId = `test_sub_${randomToken(12)}`;
    return { sessionId, url: `${env.appUrl}/${locale}/sandbox-payment?kind=subscription&ref=${subscription.id}&session=${sessionId}` };
  },
  async refund() {
    return { providerRef: `test_re_${randomToken(8)}` };
  },
  async setCancelAtPeriodEnd() {},
  async parseWebhook(rawBody, signature) {
    const m = /^t=(\d+),v1=([a-f0-9]{64})$/.exec(signature ?? '');
    if (!m) throw new AppError('Invalid signature', 'forbidden');
    if (Math.abs(Date.now() / 1000 - Number(m[1])) > 300) throw new AppError('Signature expired', 'forbidden');
    if (!safeEqual(hmac(secret(), `${m[1]}.${rawBody}`), m[2])) throw new AppError('Invalid signature', 'forbidden');
    const evt = JSON.parse(rawBody) as PaymentEvent & { periodEnd?: string };
    if ('periodEnd' in evt && evt.periodEnd) (evt as { periodEnd: Date }).periodEnd = new Date(evt.periodEnd);
    return evt;
  },
};
