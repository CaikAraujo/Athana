import { Badge, Card, Empty, PageHeader, Table } from '@/components/ui';
import { ActionButton } from '@/components/ui/form';
import { fullName, listTeamAbsences, scopeOptions } from '@/modules/pointage/service';
import { decideAbsenceAction } from '@/modules/pointage/actions';
import { ABSENCE_LABELS, ABSENCE_STATUS_LABELS } from '@/modules/pointage/labels';
import { localDateKey } from '@/modules/pointage/time';
import { AbsenceForm } from '../_components/client';
import { Denied, atLeast, fmtDay, pointagePage } from '../_components/server';

export default async function ApprovalsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, ctx, actor, t, timezone } = await pointagePage(params);
  if (!atLeast(actor, 'MANAGER')) return <Denied t={t} />;
  const [{ pending, decided }, options] = await Promise.all([listTeamAbsences(ctx), scopeOptions(ctx)]);
  // A manager records absences for their team, not for themselves (that goes through "Mes absences").
  const recordable = options.employees.filter((e) => actor.role === 'ADMIN' || e.id !== actor.employee?.id);
  const period = (a: { start: string; end: string }) => <>{fmtDay(a.start, locale)}{a.end !== a.start && <> → {fmtDay(a.end, locale)}</>}</>;
  return (
    <>
      <PageHeader title={t('Absences à valider')} subtitle={t('{n} demande(s) en attente', { n: pending.length })} />
      {pending.length === 0 ? <Empty title={t('Aucune demande en attente.')} /> : (
        <Table head={[t('Employé'), t('Période'), t('Type'), t('Jours'), t('Décision')]}>
          {pending.map((a) => (
            <tr key={a.id}>
              <td><span className="font-medium">{fullName(a.employee)}</span><div className="muted text-xs">{a.employee.department?.name}</div></td>
              <td className="whitespace-nowrap">{period(a)}{a.note && <div className="muted max-w-[220px] whitespace-normal break-words text-xs">{a.note}</div>}</td>
              <td>{t(ABSENCE_LABELS[a.type])}</td>
              <td>{a.workingDays}</td>
              <td>
                {a.canDecide ? (
                  <div className="flex flex-wrap gap-2">
                    <ActionButton action={decideAbsenceAction} fields={{ id: a.id, decision: 'APPROVED' }} className="btn btn-primary btn-sm">{t('Approuver')}</ActionButton>
                    <ActionButton action={decideAbsenceAction} fields={{ id: a.id, decision: 'REJECTED' }} className="btn btn-danger btn-sm" confirm={t('Refuser cette demande ?')}>{t('Refuser')}</ActionButton>
                  </div>
                ) : <span className="muted text-xs">{t('À valider par un administrateur')}</span>}
              </td>
            </tr>
          ))}
        </Table>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        {recordable.length > 0 && (
          <Card title={t('Enregistrer une absence pour un employé')}>
            <AbsenceForm today={localDateKey(new Date(), timezone)} employees={recordable.map((e) => ({ value: e.id, label: e.name }))} />
            <p className="muted mt-3 text-xs">{t('L’absence est créée en attente : approuvez-la ensuite dans la liste.')}</p>
          </Card>
        )}
        <div>
          <h2 className="mb-3 text-lg font-semibold">{t('Dernières décisions')}</h2>
          {decided.length === 0 ? <Empty title={t('Aucune décision pour le moment.')} /> : (
            <Table head={[t('Employé'), t('Période'), t('Type'), t('Statut')]}>
              {decided.map((a) => (
                <tr key={a.id}>
                  <td>{fullName(a.employee)}</td>
                  <td className="whitespace-nowrap">{period(a)}</td>
                  <td>{t(ABSENCE_LABELS[a.type])}</td>
                  <td><Badge tone={a.status === 'APPROVED' ? 'ok' : 'danger'}>{t(ABSENCE_STATUS_LABELS[a.status])}</Badge></td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </div>
    </>
  );
}
