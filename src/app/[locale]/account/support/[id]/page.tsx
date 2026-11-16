import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { requireUser } from '@/modules/auth/session';
import { Card, PageHeader } from '@/components/ui';
import { Thread } from '@/components/app/ProjectParts';
import { TicketReply } from '../../AccountForms';

export default async function TicketPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: l, id } = await params;
  const locale = assertLocale(l);
  const user = await requireUser(locale);
  const ticket = await db.ticket.findFirst({ where: { id, userId: user.id }, include: { messages: { where: { internal: false }, orderBy: { createdAt: 'asc' } } } });
  if (!ticket) notFound();
  const t = await getT(locale);
  return (
    <>
      <PageHeader title={ticket.subject} actions={<a className="btn btn-ghost btn-sm" href={localePath(locale, '/account/support')}>{t('Retour')}</a>} />
      <Card>
        <Thread messages={ticket.messages} viewerIsStaff={false} locale={locale} t={t} />
        {ticket.status !== 'CLOSED' ? <><div className="divider my-4" /><TicketReply ticketId={ticket.id} /></> : <p className="muted mt-4 text-sm">{t('Cette demande est close.')}</p>}
      </Card>
    </>
  );
}
