import { Badge, Empty, PageHeader, Progress, Table } from '@/components/ui';
import { employeeUsage, fullName, listDepartments, listEmployees, listSchedules } from '@/modules/pointage/service';
import { ROLE_LABELS } from '@/modules/pointage/labels';
import { formatDuration } from '@/modules/pointage/time';
import { NewEmployeeButton } from '../_components/client';
import { Denied, UpgradeNotice, href, pointagePage } from '../_components/server';

export default async function EmployeesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, ctx, actor, t } = await pointagePage(params);
  if (actor.role !== 'ADMIN') return <Denied t={t} />;
  const [employees, usage, departments, schedules] = await Promise.all([listEmployees(ctx, { includeInactive: true }), employeeUsage(ctx), listDepartments(ctx), listSchedules(ctx)]);
  const full = usage.limit !== null && usage.active >= usage.limit;
  const extra = Math.max(0, usage.active - usage.includedSeats);
  return (
    <>
      <PageHeader
        title={t('Employés')}
        subtitle={usage.limit === null ? t('{n} employé(s) actif(s)', { n: usage.active }) : t('{n} employé(s) actif(s) sur {limit} autorisés par votre plan', { n: usage.active, limit: usage.limit })}
        actions={!full && <NewEmployeeButton departments={departments.map((d) => ({ value: d.id, label: d.name }))} schedules={schedules.map((s) => ({ value: s.id, label: s.name }))} />}
      />
      {usage.limit !== null && <div className="mb-4"><Progress value={(usage.active / Math.max(1, usage.limit)) * 100} label={t('Employés')} /></div>}
      <p className="muted mb-4 text-sm">
        {t('Votre plan inclut {included} employés. La facturation suit le nombre d’employés actifs.', { included: usage.includedSeats })}
        {extra > 0 && <> {t('{n} employé(s) supplémentaire(s) facturé(s) à l’unité.', { n: extra })}</>}
      </p>
      {full && <div className="mb-4"><UpgradeNotice t={t}>{t('Limite de votre plan atteinte. Passez à un plan supérieur pour ajouter des employés.')}</UpgradeNotice></div>}
      {employees.length === 0 ? <Empty title={t('Aucun employé pour le moment.')}>{t('Ajoutez vos employés, puis invitez-les pour qu’ils puissent pointer.')}</Empty> : (
        <Table head={[t('Nom'), t('Rôle'), t('Département'), t('Horaire'), t('Accès'), t('Statut')]}>
          {employees.map((e) => (
            <tr key={e.id} className={e.active ? undefined : 'opacity-60'}>
              <td><a className="row-link" href={href(locale, `/employees/${e.id}`)}>{fullName(e)}</a><div className="muted text-xs">{e.email}</div></td>
              <td>{t(ROLE_LABELS[e.role])}</td>
              <td>{e.department?.name ?? '—'}</td>
              <td className="whitespace-nowrap">{e.schedule ? <>{e.schedule.name} <span className="muted text-xs">({formatDuration(e.schedule.weeklyMinutes)})</span></> : '—'}</td>
              <td>{e.userId ? <Badge tone="ok">{t('Compte lié')}</Badge> : <Badge>{t('Pas d’accès')}</Badge>}</td>
              <td>{e.active ? <Badge tone="ok">{t('Actif')}</Badge> : <Badge tone="danger">{t('Désactivé')}</Badge>}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
