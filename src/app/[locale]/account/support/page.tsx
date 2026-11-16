import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDate } from '@/i18n/translate';
import { requireUser } from '@/modules/auth/session';
import { Badge, Card, Empty, PageHeader } from '@/components/ui';
import { TicketForm } from '../AccountForms';

export default async function SupportPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const user = await requireUser(locale);
  const t = await getT(locale);
  const tickets = await db.ticket.findMany({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' } });
  const label = { OPEN: t('En attente de réponse'), ANSWERED: t('Répondu'), CLOSED: t('Clos') };
  return (
    <>
      <PageHeader title={t('Support')} subtitle={t('Une question sur une commande, un abonnement ou votre compte ? Écrivez-nous.')} />
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <Card title={t('Mes demandes')}>
          {tickets.length === 0 ? <Empty title={t('Aucune demande de support.')} /> : (
            <ul className="divide-y divide-line">
              {tickets.map((tk) => (
                <li key={tk.id} className="flex items-center justify-between gap-3 py-3">
                  <a className="min-w-0 truncate font-medium no-underline hover:text-gold-300" href={localePath(locale, `/account/support/${tk.id}`)}>{tk.subject}</a>
                  <span className="flex shrink-0 items-center gap-3"><span className="muted hidden text-xs sm:inline">{formatDate(tk.updatedAt, locale)}</span><Badge tone={tk.status === 'ANSWERED' ? 'gold' : tk.status === 'CLOSED' ? 'neutral' : 'warn'}>{label[tk.status]}</Badge></span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title={t('Nouvelle demande')}><TicketForm /></Card>
      </div>
    </>
  );
}
