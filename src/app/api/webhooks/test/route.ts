import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { AppError } from '@/lib/errors';
import { processWebhook } from '@/modules/payments/service';

export const dynamic = 'force-dynamic';

/** Sandbox webhook endpoint (PAYMENTS_MODE=test only). Same pipeline and signature rules as production providers. */
export async function POST(req: Request) {
  if (env.paymentsMode !== 'test') return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const raw = await req.text();
  try {
    const result = await processWebhook('test', raw, req.headers.get('x-athana-signature'));
    return NextResponse.json({ received: true, result });
  } catch (err) {
    if (err instanceof AppError && err.code === 'forbidden') return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
    console.error('[webhook:test]', err);
    return NextResponse.json({ error: 'processing_failed' }, { status: 500 });
  }
}
