import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { audit } from '@/lib/audit';
import { toCsv } from '@/lib/csv';
import { can } from '@/modules/auth/rbac';
import { getUser } from '@/modules/auth/session';

export const dynamic = 'force-dynamic';

/** Finance exports (CSV) for accounting. Requires finance.view. */
export async function GET(req: Request) {
  const user = await getUser();
  if (!user || !can(user.platformRole, 'finance.view')) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const url = new URL(req.url);
  const type = url.searchParams.get('type') === 'orders' ? 'orders' : 'payments';
  const year = Number(url.searchParams.get('year')) || new Date().getFullYear();
  const range = { gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)) };
  const m = (n: number) => (n / 100).toFixed(2);
  let rows: (string | number | null)[][];
  if (type === 'orders') {
    const orders = await db.order.findMany({ where: { createdAt: range }, include: { user: true, invoices: true }, orderBy: { createdAt: 'asc' } });
    rows = [['number', 'date', 'status', 'customer', 'email', 'country', 'currency', 'subtotal', 'discount', 'tax', 'tax_rate_percent', 'total', 'invoice'],
      ...orders.map((o) => [o.number, o.createdAt.toISOString(), o.status, o.user.name, o.user.email, (o.billing as Record<string, string>).country ?? '', o.currency, m(o.subtotal), m(o.discount), m(o.tax), (o.taxRateBps / 100).toString(), m(o.total), o.invoices[0]?.number ?? ''])];
  } else {
    const payments = await db.payment.findMany({ where: { createdAt: range }, include: { order: true, subscription: { include: { organization: true, saasProduct: true } } }, orderBy: { createdAt: 'asc' } });
    rows = [['date', 'provider', 'reference', 'status', 'object', 'currency', 'amount', 'refunded', 'net'],
      ...payments.map((p) => [p.createdAt.toISOString(), p.provider, p.providerRef, p.status, p.order?.number ?? (p.subscription ? `${p.subscription.saasProduct.name} / ${p.subscription.organization.name}` : ''), p.currency, m(p.amount), m(p.refundedAmount), m(p.status === 'FAILED' || p.status === 'PENDING' ? 0 : p.amount - p.refundedAmount)])];
  }
  await audit({ actorId: user.id, action: 'finance.export', meta: { type, year } });
  return new NextResponse(toCsv(rows), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="athana-${type}-${year}.csv"`, 'Cache-Control': 'private, no-store' } });
}
