import { Download } from 'lucide-react';
import { Empty, PageHeader, Stat, Table } from '@/components/ui';
import { AppError } from '@/lib/errors';
import { hasFeature, scopeOptions } from '@/modules/pointage/service';
import { getMySummary, getReport, type Report } from '@/modules/pointage/reports';
import { ABSENCE_LABELS, ANOMALY_LABELS } from '@/modules/pointage/labels';
import { formatDuration, isDateKey, localDateKey } from '@/modules/pointage/time';
import { UpgradeNotice, atLeast, fmtDay, href, one, pointagePage, type Search } from '../_components/server';

export default async function ReportsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Search }) {
  const { locale, ctx, actor, t, timezone } = await pointagePage(params);
  const sp = await searchParams;
  const today = localDateKey(new Date(), timezone);
  const from = isDateKey(one(sp.from)) ? one(sp.from) : `${today.slice(0, 7)}-01`;
  const to = isDateKey(one(sp.to)) ? one(sp.to) : today;
  const manager = atLeast(actor, 'MANAGER');
  const employeeId = manager ? one(sp.employee) : '';
  const departmentId = manager ? one(sp.department) : '';
  const canReport = hasFeature(ctx, 'reports');
  const canExport = hasFeature(ctx, 'export');
  const options = manager ? await scopeOptions(ctx) : null;

  let report: Report | null = null;
  let error: string | null = null;
  try {
    if (!manager || canReport) report = await getReport(ctx, { from, to, employeeId, departmentId });
  } catch (err) {
    if (!(err instanceof AppError)) throw err;
    error = err.message;
  }
  // Without the feature, a manager/admin who is also an employee still sees their own summary.
  const mine = manager && !canReport ? await getMySummary(ctx, from, to).catch(() => null) : null;
  const rows = report?.rows ?? (mine ? [mine] : []);
  const exportHref = (format: string) => `/api/pointage/export?${new URLSearchParams({ format, from, to, ...(employeeId ? { employeeId } : {}), ...(departmentId ? { departmentId } : {}) })}`;

  return (
    <>
      <PageHeader
        title={manager ? t('Rapports') : t('Mon récapitulatif')}
        subtitle={t('Du {from} au {to}', { from: fmtDay(from, locale), to: fmtDay(to, locale) })}
        actions={canExport && rows.length > 0 && !error && (manager ? canReport : true) && <>
          <a className="btn btn-outline btn-sm" href={exportHref('csv')} download><Download size={15} aria-hidden />{t('Exporter en CSV')}</a>
          <a className="btn btn-outline btn-sm" href={exportHref('pdf')} download><Download size={15} aria-hidden />{t('Exporter en PDF')}</a>
        </>}
      />
      <form method="get" action={href(locale, '/reports')} className="mb-4 grid grid-cols-2 items-end gap-2 sm:flex sm:flex-wrap">
        <label><span className="label">{t('Du')}</span><input className="input" type="date" name="from" defaultValue={from} required /></label>
        <label><span className="label">{t('Au')}</span><input className="input" type="date" name="to" defaultValue={to} required /></label>
        {options && canReport && options.departments.length > 0 && (
          <label className="col-span-2"><span className="label">{t('Département')}</span>
            <select name="department" defaultValue={departmentId} className="select"><option value="">{t('Tous')}</option>{options.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
          </label>
        )}
        {options && canReport && (
          <label className="col-span-2"><span className="label">{t('Employé')}</span>
            <select name="employee" defaultValue={employeeId} className="select"><option value="">{t('Tous')}</option>{options.employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
          </label>
        )}
        <button className="btn btn-primary col-span-2" type="submit">{t('Afficher')}</button>
      </form>

      {manager && !canReport && <div className="mb-4"><UpgradeNotice t={t}>{t('Les rapports d’équipe ne sont pas inclus dans votre plan.')}</UpgradeNotice></div>}
      {!canExport && (!manager || canReport) && <div className="mb-4"><UpgradeNotice t={t}>{t('Les exports CSV et PDF ne sont pas inclus dans votre plan.')}</UpgradeNotice></div>}
      {error && <p role="alert" className="alert alert-danger mb-4">{t(error)}</p>}

      {report && (
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label={t('Employés')} value={report.rows.length} />
          <Stat label={t('Temps travaillé')} value={formatDuration(report.totals.workedMinutes)} />
          <Stat label={t('Heures supplémentaires')} value={formatDuration(report.totals.overtimeMinutes)} />
          <Stat label={t('Anomalies')} value={report.totals.anomalies} />
        </div>
      )}
      {!error && rows.length === 0 ? <Empty title={t('Aucune donnée sur cette période.')} /> : rows.length > 0 && (
        <Table head={[t('Employé'), t('Jours travaillés'), t('Temps travaillé'), t('Heures supplémentaires'), t('Solde'), t('Absences'), t('Anomalies')]}>
          {rows.map((r) => {
            const absences = (Object.keys(r.absences) as (keyof typeof ABSENCE_LABELS)[]).filter((k) => r.absences[k] > 0);
            const kinds = [...new Set(r.anomalies.map((a) => a.anomaly))];
            return (
              <tr key={r.employee.id}>
                <td>{manager ? <a className="row-link" href={href(locale, '/history', { employee: r.employee.id })}>{r.employee.name}</a> : <span className="font-medium">{r.employee.name}</span>}<div className="muted text-xs">{r.employee.department}</div></td>
                <td>{r.daysWorked}</td>
                <td className="whitespace-nowrap font-medium">{formatDuration(r.workedMinutes)}</td>
                <td className="whitespace-nowrap">{formatDuration(r.overtimeMinutes)}</td>
                <td className="whitespace-nowrap">{formatDuration(r.balanceMinutes)}</td>
                <td className="text-sm">{absences.length ? absences.map((k) => <div key={k} className="whitespace-nowrap">{t(ABSENCE_LABELS[k])} : {t('{n} j', { n: r.absences[k] })}</div>) : '—'}</td>
                <td className="text-sm">{kinds.length ? kinds.map((k) => <div key={k} className="whitespace-nowrap text-danger">{t(ANOMALY_LABELS[k])} × {r.anomalies.filter((a) => a.anomaly === k).length}</div>) : '—'}</td>
              </tr>
            );
          })}
        </Table>
      )}
      <p className="muted mt-4 text-xs">{t('Les heures supplémentaires sont calculées par semaine ISO au-delà de l’horaire de l’employé (ou du seuil défini dans les paramètres). Le solde compare le temps travaillé au temps prévu, hors absences approuvées.')}</p>
    </>
  );
}
