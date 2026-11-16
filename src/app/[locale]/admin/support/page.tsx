import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDateTime } from '@/i18n/translate';
import { requireStaff } from '@/modules/auth/session';
import { Badge, Empty, PageHeader, Table } from '@/components/ui';

export default async function AdminSupport({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'support.manage');
  const t = await getT(locale);
  const tickets = await db.ticket.findMany({ include: { user: { select: { name: true, email: true } } }, orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }], take: 200 });
  const label = { OPEN: t('À traiter'), ANSWERED: t('Répondu'), CLOSED: t('Clos') };
  return (
    <>
      <PageHeader title={t('Support')} />
      {tickets.length === 0 ? <Empty title={t('Aucune demande de support.')} /> : (
        <Table head={[t('Sujet'), t('Client'), t('Mise à jour'), t('Statut')]}>
          {tickets.map((tk) => <tr key={tk.id}><td><a className="row-link" href={localePath(locale, `/admin/support/${tk.id}`)}>{tk.subject}</a></td><td>{tk.user.name}<br /><span className="muted text-xs">{tk.user.email}</span></td><td>{formatDateTime(tk.updatedAt, locale)}</td><td><Badge tone={tk.status === 'OPEN' ? 'warn' : tk.status === 'ANSWERED' ? 'ok' : 'neutral'}>{label[tk.status]}</Badge></td></tr>)}
        </Table>
      )}
    </>
  );
}
