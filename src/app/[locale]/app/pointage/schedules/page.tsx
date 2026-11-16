import { Empty, PageHeader, Table } from '@/components/ui';
import { ActionButton } from '@/components/ui/form';
import { listSchedules } from '@/modules/pointage/service';
import { deleteScheduleAction } from '@/modules/pointage/actions';
import { WEEKDAY_LABELS } from '@/modules/pointage/labels';
import { formatDuration } from '@/modules/pointage/time';
import { ScheduleButton } from '../_components/client';
import { Denied, pointagePage } from '../_components/server';

export default async function SchedulesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { ctx, actor, t } = await pointagePage(params);
  if (actor.role !== 'ADMIN') return <Denied t={t} />;
  const schedules = await listSchedules(ctx);
  return (
    <>
      <PageHeader title={t('Horaires')} subtitle={t('Modèles hebdomadaires : ils définissent le temps prévu, le seuil des heures supplémentaires et les jours ouvrés des employés.')} actions={<ScheduleButton />} />
      {schedules.length === 0 ? <Empty title={t('Aucun horaire pour le moment.')}>{t('Sans horaire, la durée cible de l’entreprise s’applique du lundi au vendredi.')}</Empty> : (
        <Table head={[t('Nom'), t('Jours'), t('Par semaine'), t('Employés actifs'), '']}>
          {schedules.map((s) => (
            <tr key={s.id}>
              <td className="font-medium">{s.name}</td>
              <td className="text-sm">
                {s.days.map((d) => <div key={d.day} className="whitespace-nowrap">{t(WEEKDAY_LABELS[d.day]).slice(0, 3)} {d.start}–{d.end}{d.breakMinutes > 0 && <span className="muted"> · {t('pause {n} min', { n: d.breakMinutes })}</span>}</div>)}
              </td>
              <td className="whitespace-nowrap">{formatDuration(s.weeklyMinutes)}</td>
              <td>{s.employeeCount}</td>
              <td>
                <div className="flex flex-wrap justify-end gap-2">
                  <ScheduleButton value={{ id: s.id, name: s.name, days: s.days }} />
                  <ActionButton action={deleteScheduleAction} fields={{ id: s.id }} className="btn btn-danger btn-sm" confirm={t('Supprimer cet horaire ? Les employés concernés n’auront plus d’horaire attribué.')}>{t('Supprimer')}</ActionButton>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
