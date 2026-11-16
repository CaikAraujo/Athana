import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { formatDateTime } from '@/i18n/translate';
import { requireStaff } from '@/modules/auth/session';
import { Badge, Empty, PageHeader } from '@/components/ui';
import { DataRequestButtons } from '../AdminForms';

export default async function AdminDataRequests({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'customers.manage');
  const t = await getT(locale);
  const requests = await db.dataRequest.findMany({ include: { user: { select: { name: true, email: true } } }, orderBy: [{ status: 'asc' }, { createdAt: 'desc' }], take: 200 });
  return (
    <>
      <PageHeader title={t('Demandes RGPD')} subtitle={t('Demandes d’export et de suppression des titulaires de données. La suppression anonymise le compte et efface briefings et fichiers ; les pièces comptables sont conservées.')} />
      {requests.length === 0 ? <Empty title={t('Aucune demande.')} /> : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li key={r.id} className="panel flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{r.type === 'DELETE' ? t('Suppression') : t('Export')} — {r.user.name} <span className="muted font-normal">({r.user.email})</span></p>
                <p className="muted text-xs">{formatDateTime(r.createdAt, locale)}{r.note ? ` · ${r.note}` : ''}</p>
              </div>
              {r.status === 'PENDING' ? <DataRequestButtons requestId={r.id} type={r.type} /> : <Badge tone={r.status === 'COMPLETED' ? 'ok' : 'danger'}>{r.status === 'COMPLETED' ? t('Traitée') : t('Refusée')}</Badge>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
