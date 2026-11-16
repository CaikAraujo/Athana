import { Badge, Card, DefList, PageHeader, Stat } from '@/components/ui';
import { ActionButton } from '@/components/ui/form';
import { fullName, getEmployee, getTimesheet, listDepartments, listSchedules, vacationBalance } from '@/modules/pointage/service';
import { inviteEmployeeAction, setEmployeeActiveAction } from '@/modules/pointage/actions';
import { ROLE_LABELS } from '@/modules/pointage/labels';
import { addDays, formatDuration, localDateKey, weekStart } from '@/modules/pointage/time';
import { EditEmployeeForm } from '../../_components/client';
import { Denied, NotFound, href, orNull, pointagePage } from '../../_components/server';

export default async function EmployeePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, ctx, actor, t, timezone } = await pointagePage(params);
  if (actor.role !== 'ADMIN') return <Denied t={t} />;
  const { id } = await params;
  const employee = await orNull(getEmployee(ctx, id));
  if (!employee) return <NotFound t={t} />;
  const today = localDateKey(new Date(), timezone);
  const [departments, schedules, balance, sheet] = await Promise.all([
    listDepartments(ctx), listSchedules(ctx), vacationBalance(ctx, employee.id),
    getTimesheet(ctx, { employeeId: employee.id, from: addDays(weekStart(today), -21), to: today }),
  ]);
  const worked = sheet.weeks.reduce((s, w) => s + w.workedMinutes, 0);
  const anomalies = sheet.days.reduce((s, d) => s + d.anomalies.length, 0);
  return (
    <>
      <PageHeader
        title={fullName(employee)}
        subtitle={<>{t(ROLE_LABELS[employee.role])} {employee.active ? <Badge tone="ok">{t('Actif')}</Badge> : <Badge tone="danger">{t('Désactivé')}</Badge>}</>}
        actions={<>
          <a className="btn btn-outline btn-sm" href={href(locale, '/history', { employee: employee.id })}>{t('Historique')}</a>
          <a className="btn btn-outline btn-sm" href={href(locale, '/team', { employee: employee.id, date: today })}>{t('Journée en cours')}</a>
          <a className="btn btn-ghost btn-sm" href={href(locale, '/employees')}>{t('Retour à la liste')}</a>
        </>}
      />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label={t('4 dernières semaines')} value={formatDuration(worked)} />
        <Stat label={t('Anomalies')} value={anomalies} />
        <Stat label={t('Vacances prises')} value={t('{n} j', { n: balance.taken })} hint={t('en {year}', { year: balance.year })} />
        <Stat label={t('Solde restant')} value={t('{n} j', { n: balance.remaining })} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,360px)]">
        <Card title={t('Fiche employé')}>
          <EditEmployeeForm
            value={{ id: employee.id, firstName: employee.firstName, lastName: employee.lastName, email: employee.email, role: employee.role, departmentId: employee.departmentId, scheduleId: employee.scheduleId, vacationDays: employee.vacationDays, linked: !!employee.userId }}
            departments={departments.map((d) => ({ value: d.id, label: d.name }))} schedules={schedules.map((s) => ({ value: s.id, label: s.name }))}
          />
        </Card>
        <div className="grid content-start gap-6">
          <Card title={t('Accès à l’application')}>
            <DefList items={[[t('Compte'), employee.userId ? t('Compte lié') : t('Pas d’accès')], [t('Adresse e-mail'), employee.email]]} />
            {!employee.userId && employee.active && (
              <div className="mt-4">
                {employee.email
                  ? <ActionButton action={inviteEmployeeAction} fields={{ id: employee.id }} className="btn btn-primary btn-sm">{t('Inviter à se connecter')}</ActionButton>
                  : <p className="muted text-sm">{t('Ajoutez une adresse e-mail pour pouvoir inviter cet employé.')}</p>}
              </div>
            )}
          </Card>
          <Card title={employee.active ? t('Désactiver') : t('Réactiver')}>
            <p className="muted mb-4 text-sm">{employee.active
              ? t('L’employé ne pourra plus pointer et ne sera plus facturé. Son historique est conservé.')
              : t('L’employé pourra de nouveau pointer et comptera dans votre abonnement.')}</p>
            {employee.active
              ? <ActionButton action={setEmployeeActiveAction} fields={{ id: employee.id, active: '0' }} className="btn btn-danger btn-sm" confirm={t('Désactiver cet employé ?')}>{t('Désactiver l’employé')}</ActionButton>
              : <ActionButton action={setEmployeeActiveAction} fields={{ id: employee.id, active: '1' }} className="btn btn-primary btn-sm">{t('Réactiver l’employé')}</ActionButton>}
          </Card>
        </div>
      </div>
    </>
  );
}
