import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { requireStaff } from '@/modules/auth/session';
import { Card, PageHeader } from '@/components/ui';
import { Thread } from '@/components/app/ProjectParts';
import { TicketReplyForm } from '../../AdminForms';

export default async function AdminTicket({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: l, id } = await params;
  const locale = assertLocale(l);
  await requireStaff(locale, 'support.manage');
  const ticket = await db.ticket.findUnique({ where: { id }, include: { user: true, messages: { orderBy: { createdAt: 'asc' } } } });
  if (!ticket) notFound();
  const t = await getT(locale);
  return (
    <>
      <PageHeader title={ticket.subject} subtitle={<a className="underline" href={localePath(locale, `/admin/customers/${ticket.userId}`)}>{ticket.user.name} · {ticket.user.email}</a>} />
      <Card><Thread messages={ticket.messages} viewerIsStaff locale={locale} t={t} /><div className="divider my-4" /><TicketReplyForm ticketId={ticket.id} /></Card>
    </>
  );
}
