import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { audit } from '@/lib/audit';
import { rateLimit } from '@/lib/rate-limit';
import { getUser } from '@/modules/auth/session';

export const dynamic = 'force-dynamic';

/** Self-service export of the signed-in user's personal data (RGPD art. 15/20, nLPD art. 25/28). */
export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!(await rateLimit(`export:${user.id}`, 5, 3600))) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const [orders, projects, memberships, tickets, consents, notifications, dataRequests] = await Promise.all([
    db.order.findMany({ where: { userId: user.id }, include: { items: true, payments: { select: { amount: true, currency: true, status: true, method: true, createdAt: true } }, invoices: { select: { number: true, total: true, currency: true, issuedAt: true } } } }),
    db.project.findMany({ where: { userId: user.id }, include: { briefing: { select: { data: true, status: true, aiConsent: true, submittedAt: true } }, messages: { where: { internal: false }, select: { body: true, fromStaff: true, createdAt: true } }, revisions: true, files: { select: { originalName: true, mime: true, size: true, createdAt: true } } } }),
    db.membership.findMany({ where: { userId: user.id }, include: { organization: { select: { name: true, country: true } } } }),
    db.ticket.findMany({ where: { userId: user.id }, include: { messages: { where: { internal: false }, select: { body: true, fromStaff: true, createdAt: true } } } }),
    db.consent.findMany({ where: { userId: user.id }, select: { categories: true, policyVersion: true, createdAt: true } }),
    db.notification.findMany({ where: { userId: user.id }, select: { title: true, createdAt: true } }),
    db.dataRequest.findMany({ where: { userId: user.id } }),
  ]);
  await audit({ actorId: user.id, action: 'user.data_export', entity: 'User', entityId: user.id });
  const body = JSON.stringify({
    exportedAt: new Date().toISOString(),
    account: { name: user.name, email: user.email, phone: user.phone, locale: user.locale, country: user.country, createdAt: user.createdAt },
    organizations: memberships.map((mb) => ({ role: mb.role, ...mb.organization })),
    orders, projects, tickets, consents, notifications, dataRequests,
  }, null, 2);
  return new NextResponse(body, { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': 'attachment; filename="athana-mes-donnees.json"', 'Cache-Control': 'private, no-store' } });
}
