import { Badge, Card, Empty, PageHeader, Stat, Table } from '@/components/ui';
import { ActionButton } from '@/components/ui/form';
import { Link } from '@/i18n/client';
import { listMyAbsences } from '@/modules/pointage/service';
import { cancelAbsenceAction } from '@/modules/pointage/actions';
import { ABSENCE_LABELS, ABSENCE_STATUS_LABELS } from '@/modules/pointage/labels';
import { AbsenceForm } from '../_components/client';
import { BASE, atLeast, fmtDay, pointagePage } from '../_components/server';

const TONE = { PENDING: 'warn', APPROVED: 'ok', REJECTED: 'danger' } as const;

export default async function MyAbsencesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, ctx, actor, t } = await pointagePage(params);
  const data = await listMyAbsences(ctx);
  if (!data) {
    return (
      <>
        <PageHeader title={t('Mes absences')} />
        <Empty title={t('Votre compte n’est pas lié à une fiche employé.')}>
          {atLeast(actor, 'MANAGER') && <Link href={`${BASE}/approvals`} className="btn btn-outline btn-sm no-underline">{t('Absences à valider')}</Link>}
        </Empty>
      </>
    );
  }
  const { balance } = data;
  return (
    <>
      <PageHeader title={t('Mes absences')} subtitle={t('Solde de vacances {year}', { year: balance.year })} />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label={t('Droit annuel')} value={t('{n} j', { n: balance.entitled })} />
        <Stat label={t('Pris (approuvés)')} value={t('{n} j', { n: balance.taken })} />
        <Stat label={t('En attente')} value={t('{n} j', { n: balance.pending })} />
        <Stat label={t('Solde restant')} value={t('{n} j', { n: balance.remaining })} hint={t('Jours ouvrés, selon votre horaire')} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Card title={t('Nouvelle demande')}><AbsenceForm today={data.today} /></Card>
        <div>
          {data.absences.length === 0 ? <Empty title={t('Aucune demande d’absence pour le moment.')} /> : (
            <Table head={[t('Période'), t('Type'), t('Jours'), t('Statut'), '']}>
              {data.absences.map((a) => (
                <tr key={a.id}>
                  <td className="whitespace-nowrap">{fmtDay(a.start, locale)}{a.end !== a.start && <> → {fmtDay(a.end, locale)}</>}{a.note && <div className="muted max-w-[220px] whitespace-normal break-words text-xs">{a.note}</div>}</td>
                  <td>{t(ABSENCE_LABELS[a.type])}</td>
                  <td>{a.workingDays}</td>
                  <td><Badge tone={TONE[a.status]}>{t(ABSENCE_STATUS_LABELS[a.status])}</Badge></td>
                  <td>{a.status === 'PENDING' && <ActionButton action={cancelAbsenceAction} fields={{ id: a.id }} confirm={t('Retirer cette demande ?')}>{t('Retirer')}</ActionButton>}</td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </div>
    </>
  );
}
