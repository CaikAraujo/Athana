import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { safeEqual } from '@/lib/crypto';
import { getSetting } from '@/lib/settings';
import { runDailyBilling } from '@/modules/billing/service';
import { runPointageRetention } from '@/modules/pointage/retention';

export const dynamic = 'force-dynamic';

/**
 * Daily maintenance, to be called by a scheduler with "Authorization: Bearer <CRON_SECRET>".
 * Renewal notices, expired trials, session purge, Pointage data retention, lead retention.
 */
export async function GET(req: Request) {
  const auth = req.headers.get('authorization') ?? '';
  if (!env.cronSecret || !safeEqual(auth, `Bearer ${env.cronSecret}`)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const billing = await runDailyBilling();
  const pointage = await runPointageRetention();
  const { retentionMonthsLeads } = await getSetting('privacy');
  const cutoff = new Date(); cutoff.setMonth(cutoff.getMonth() - retentionMonthsLeads);
  const leads = await db.lead.deleteMany({ where: { createdAt: { lt: cutoff }, status: { in: ['NEW', 'CLOSED'] } } });
  return NextResponse.json({ ok: true, billing, pointage, purgedLeads: leads.count });
}
