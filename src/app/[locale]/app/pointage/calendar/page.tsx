import { Badge, Empty, PageHeader } from '@/components/ui';
import { getCalendar, scopeOptions } from '@/modules/pointage/service';
import { ABSENCE_LABELS, ABSENCE_STATUS_LABELS, WEEKDAY_LABELS } from '@/modules/pointage/labels';
import { formatDuration, isoWeekday } from '@/modules/pointage/time';
import { Denied, atLeast, fmtDay, fmtMonth, href, one, pointagePage, type Search } from '../_components/server';

export default async function CalendarPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Search }) {
  const { locale, ctx, actor, t } = await pointagePage(params);
  if (!atLeast(actor, 'MANAGER')) return <Denied t={t} />;
  const sp = await searchParams;
  const employeeId = one(sp.employee);
  const departmentId = one(sp.department);
  const [cal, options] = await Promise.all([getCalendar(ctx, { month: one(sp.month), employeeId: employeeId || null, departmentId: departmentId || null }), scopeOptions(ctx)]);
  const q = { employee: employeeId, department: departmentId };
  const lead = isoWeekday(cal.from) - 1;
  const absences = cal.days.flatMap((d) => d.absences.map((a) => ({ ...a, date: d.date })));
  // One line per absence (first day shown) for the list under the grid.
  const list = absences.filter((a, i) => absences.findIndex((x) => x.id === a.id) === i);
  return (
    <>
      <PageHeader
        title={t('Calendrier')}
        subtitle={<span className="capitalize">{fmtMonth(cal.month, locale)}</span>}
        actions={<>
          <a className="btn btn-outline btn-sm" href={href(locale, '/calendar', { ...q, month: cal.previous })}>{t('Mois précédent')}</a>
          <a className="btn btn-outline btn-sm" href={href(locale, '/calendar', { ...q, month: cal.next })}>{t('Mois suivant')}</a>
        </>}
      />
      <form method="get" className="mb-4 grid grid-cols-1 items-end gap-2 sm:flex sm:flex-wrap">
        <input type="hidden" name="month" value={cal.month} />
        {options.departments.length > 0 && (
          <label><span className="label">{t('Département')}</span>
            <select name="department" defaultValue={departmentId} className="select"><option value="">{t('Tous')}</option>{options.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
          </label>
        )}
        <label><span className="label">{t('Employé')}</span>
          <select name="employee" defaultValue={employeeId} className="select"><option value="">{t('Tous')}</option>{options.employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
        </label>
        <button className="btn btn-outline" type="submit">{t('Filtrer')}</button>
      </form>

      <div className="panel p-2 sm:p-3">
        <div className="grid grid-cols-7 gap-1 text-center text-[0.65rem] font-medium uppercase tracking-wide text-fg-muted sm:text-xs">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => <div key={d} className="py-1">{t(WEEKDAY_LABELS[d]).slice(0, 3)}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: lead }, (_, i) => <div key={`pad-${i}`} />)}
          {cal.days.map((d) => (
            <div key={d.date} className={`min-h-[64px] rounded-lg border p-1 text-left sm:min-h-[88px] sm:p-2 ${d.date === cal.today ? 'border-gold-500' : 'border-line'} ${isoWeekday(d.date) > 5 ? 'bg-ink-900' : 'bg-ink-800'}`}>
              <div className="text-xs font-semibold">{Number(d.date.slice(8))}</div>
              {d.workedMinutes > 0 && <div className="mt-0.5 text-[0.65rem] leading-tight text-ok sm:text-xs" title={t('Temps travaillé')}>{formatDuration(d.workedMinutes)}</div>}
              {d.absences.length > 0 && (
                <div className="mt-0.5 text-[0.65rem] leading-tight text-info sm:text-xs" title={d.absences.map((a) => a.name).join(', ')}>
                  <span className="sm:hidden">{t('{n} abs.', { n: d.absences.length })}</span>
                  <span className="hidden sm:inline">{d.absences.length === 1 ? d.absences[0].name : t('{n} absents', { n: d.absences.length })}</span>
                </div>
              )}
              {d.anomalies > 0 && <div className="mt-0.5 text-[0.65rem] leading-tight text-danger sm:text-xs">{t('{n} anom.', { n: d.anomalies })}</div>}
            </div>
          ))}
        </div>
        <p className="muted mt-3 flex flex-wrap gap-x-4 gap-y-1 px-1 text-xs">
          <span><span className="text-ok">●</span> {t('Temps travaillé (total des employés affichés)')}</span>
          <span><span className="text-info">●</span> {t('Absences approuvées ou en attente')}</span>
          <span><span className="text-danger">●</span> {t('Anomalies')}</span>
        </p>
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">{t('Absences du mois')}</h2>
      {list.length === 0 ? <Empty title={t('Aucune absence ce mois-ci.')} /> : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-ink-850">
          {list.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <span><span className="font-medium">{a.name}</span> · {t(ABSENCE_LABELS[a.type])} · {t('à partir du {date}', { date: fmtDay(a.date, locale) })}</span>
              <Badge tone={a.status === 'APPROVED' ? 'ok' : 'warn'}>{t(ABSENCE_STATUS_LABELS[a.status])}</Badge>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
