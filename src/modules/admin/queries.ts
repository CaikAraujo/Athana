import { cache } from 'react';
import { db } from '@/lib/db';

/** Currencies of the enabled markets (drives price inputs in the admin). */
export const marketCurrencies = cache(async () => [...new Set((await db.market.findMany({ orderBy: { sortOrder: 'asc' } })).map((mk) => mk.currency))]);

export const staffOptions = cache(async () => db.user.findMany({ where: { platformRole: { not: null }, disabledAt: null, deletedAt: null }, select: { id: true, name: true, platformRole: true }, orderBy: { name: 'asc' } }));

/** Monthly recurring revenue per currency from active subscriptions (base + extra seats). */
export async function mrrByCurrency() {
  const subs = await db.subscription.findMany({ where: { status: { in: ['ACTIVE', 'PAST_DUE'] } }, include: { plan: true } });
  const out: Record<string, number> = {};
  for (const s of subs) {
    const base = (s.plan.prices as Record<string, number>)[s.currency] ?? 0;
    const seat = (s.plan.seatPrices as Record<string, number>)[s.currency] ?? 0;
    out[s.currency] = (out[s.currency] ?? 0) + base + Math.max(0, s.seats - s.plan.includedSeats) * seat;
  }
  return out;
}

export async function revenueByCurrency(since?: Date) {
  const rows = await db.payment.groupBy({ by: ['currency'], where: { status: { in: ['SUCCEEDED', 'PARTIALLY_REFUNDED', 'REFUNDED'] }, ...(since ? { createdAt: { gte: since } } : {}) }, _sum: { amount: true, refundedAmount: true } });
  return Object.fromEntries(rows.map((r) => [r.currency, (r._sum.amount ?? 0) - (r._sum.refundedAmount ?? 0)]));
}
