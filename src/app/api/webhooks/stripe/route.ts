import { NextResponse } from 'next/server';
import { AppError } from '@/lib/errors';
import { processWebhook } from '@/modules/payments/service';

export const dynamic = 'force-dynamic';

/** Stripe webhook endpoint. The raw body is required for signature verification. */
export async function POST(req: Request) {
  const raw = await req.text();
  try {
    const result = await processWebhook('stripe', raw, req.headers.get('stripe-signature'));
    return NextResponse.json({ received: true, result });
  } catch (err) {
    if (err instanceof AppError && err.code === 'forbidden') return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
    if (err instanceof AppError && err.code === 'not_configured') return NextResponse.json({ error: 'not_configured' }, { status: 503 });
    console.error('[webhook:stripe]', err);
    // 500 → Stripe retries; the idempotency ledger makes the retry safe.
    return NextResponse.json({ error: 'processing_failed' }, { status: 500 });
  }
}
