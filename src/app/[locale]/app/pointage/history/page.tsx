import { Badge, Card, Empty, PageHeader, Stat, Table } from '@/components/ui';
import { formatDateTime } from '@/i18n/translate';
import { fullName, getTimesheet, listEntries, scopeOptions } from '@/modules/pointage/service';
import { ENTRY_LABELS, SOURCE_LABELS } from '@/modules/pointage/labels';
import { addDays, formatDuration, isDateKey, localDateKey, weekStart, ENTRY_TYPES, type EntryType } from '@/modules/pointage/time';
import { Anomalies, Pagination, atLeast, fmtDay, fmtTime, href, one, pointagePage, type Search } from '../_components/server';

const WEEKS = 4;

export default async function HistoryPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Search }) {
  const { locale, ctx, actor, t, timezone } = await pointagePage(params);
  const sp = await searchParams;
  const manager = atLeast(actor, 'MANAGER');
  const employeeId = manager ? one(sp.employee) || actor.employee?.id || '' : actor.employee?.id ?? '';
  const options = manager ? await scopeOptions(ctx) : null;
  if (!employeeId) {
    return (
      <>
        <PageHeader title={t('Historique')} />
        <Empty title={t('Choisissez un employé pour afficher son historique.')}>
          {options && options.employees.length > 0 && (
            <form method="get" className="mx-auto flex max-w-sm flex-wrap items-end justify-center gap-2">
              <select name="employee" className="select" aria-label={t('Employé')}>{options.employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
              <button className="btn btn-primary" type="submit">{t('Afficher')}</button>
            </form>
          )}
        </Empty>
      </>
    );
  }
  const today = localDateKey(new Date(), timezone);
  const offset = Math.max(0, Math.min(520, Number.parseInt(one(sp.w), 10) || 0));
  const to = addDays(weekStart(today), 6 - offset * 7 * WEEKS);
  const from = addDays(to, -(7 * WEEKS - 1));
  const type = (ENTRY_TYPES as string[]).includes(one(sp.type)) ? (one(sp.type) as EntryType) : undefined;
  const voided = one(sp.voided) === '1';
  const listFrom = isDateKey(one(sp.from)) ? one(sp.from) : undefined;
  const listTo = isDateKey(one(sp.to)) ? one(sp.to) : undefined;
  const [sheet, entries] = await Promise.all([
    getTimesheet(ctx, { employeeId, from, to }),
    listEntries(ctx, { employeeId, type, includeVoided: voided, from: listFrom, to: listTo, page: one(sp.page) || 1, pageSize: 25 }),
  ]);
  const own = employeeId === actor.employee?.id;
  const q = { employee: own ? undefined : employeeId, type, voided: voided ? 1 : undefined, from: listFrom, to: listTo };
  const weeks = [...sheet.weeks].reverse();
  const total = sheet.weeks.reduce((s, w) => s + w.workedMinutes, 0);
  const overtime = sheet.weeks.reduce((s, w) => s + w.overtimeMinutes, 0);
  const balance = sheet.weeks.reduce((s, w) => s + w.balanceMinutes, 0);

  return (
    <>
      <PageHeader
        title={own ? t('Mon historique') : t('Historique de {name}', { name: fullName(sheet.employee) })}
        subtitle={t('Du {from} au {to}', { from: fmtDay(from, locale), to: fmtDay(to, locale) })}
        actions={<>
          <a className="btn btn-outline btn-sm" href={href(locale, '/history', { ...q, w: offset + 1 })}>{t('Semaines précédentes')}</a>
          {offset > 0 && <a className="btn btn-outline btn-sm" href={href(locale, '/history', { ...q, w: offset - 1 })}>{t('Semaines suivantes')}</a>}
        </>}
      />
      {options && options.employees.length > 0 && (
        <form method="get" className="mb-4 flex flex-wrap items-end gap-2">
          <label className="min-w-0 flex-1 sm:max-w-xs"><span className="label">{t('Employé')}</span>
            <select name="employee" defaultValue={employeeId} className="select">{options.employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}</select>
          </label>
          <button className="btn btn-outline" type="submit">{t('Afficher')}</button>
        </form>
      )}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label={t('Temps travaillé')} value={formatDuration(total)} hint={t('{n} semaines', { n: WEEKS })} />
        <Stat label={t('Heures supplémentaires')} value={formatDuration(overtime)} />
        <Stat label={t('Solde')} value={formatDuration(balance)} hint={t('Temps travaillé moins temps prévu')} />
      </div>

      <div className="grid gap-4">
        {weeks.map((w) => (
          <Card key={w.start} title={t('Semaine du {date}', { date: fmtDay(w.start, locale) })} actions={<span className="flex flex-wrap items-center justify-end gap-2 text-sm"><span className="font-semibold">{formatDuration(w.workedMinutes)}</span>{w.overtimeMinutes > 0 && <Badge tone="gold">{t('+ {duration} suppl.', { duration: formatDuration(w.overtimeMinutes) })}</Badge>}</span>}>
            {w.days.length === 0 ? <p className="muted text-sm">{t('Aucun pointage cette semaine.')}</p> : (
              <Table head={[t('Jour'), t('Entrée'), t('Sortie'), t('Pause'), t('Travaillé'), '']}>
                {w.days.map((d) => (
                  <tr key={d.date}>
                    <td className="whitespace-nowrap">{manager && !own ? <a className="row-link" href={href(locale, '/team', { employee: employeeId, date: d.date })}>{fmtDay(d.date, locale)}</a> : fmtDay(d.date, locale)}</td>
                    <td>{d.firstIn ? fmtTime(d.firstIn, locale, timezone) : '—'}</td>
                    <td>{d.lastOut ? fmtTime(d.lastOut, locale, timezone) : d.open ? <Badge tone="ok">{t('en cours')}</Badge> : '—'}</td>
                    <td className="whitespace-nowrap">{formatDuration(d.breakMinutes)}</td>
                    <td className="whitespace-nowrap font-medium">{formatDuration(d.workedMinutes)}</td>
                    <td><Anomalies list={d.anomalies} t={t} /></td>
                  </tr>
                ))}
              </Table>
            )}
            <p className="muted mt-3 text-xs">{t('Prévu : {scheduled} · Solde : {balance}', { scheduled: formatDuration(w.scheduledMinutes), balance: formatDuration(w.balanceMinutes) })}</p>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">{t('Tous les pointages')}</h2>
      <form method="get" className="mb-4 grid grid-cols-2 items-end gap-2 sm:flex sm:flex-wrap">
        {!own && <input type="hidden" name="employee" value={employeeId} />}
        <label><span className="label">{t('Du')}</span><input className="input" type="date" name="from" defaultValue={listFrom} /></label>
        <label><span className="label">{t('Au')}</span><input className="input" type="date" name="to" defaultValue={listTo} /></label>
        <label><span className="label">{t('Type')}</span>
          <select name="type" defaultValue={type ?? ''} className="select"><option value="">{t('Tous')}</option>{ENTRY_TYPES.map((k) => <option key={k} value={k}>{t(ENTRY_LABELS[k])}</option>)}</select>
        </label>
        <label className="flex min-h-[44px] items-center gap-2 text-sm"><input type="checkbox" className="check" name="voided" value="1" defaultChecked={voided} />{t('Inclure les annulés')}</label>
        <button className="btn btn-outline col-span-2" type="submit">{t('Filtrer')}</button>
      </form>
      {entries.items.length === 0 ? <Empty title={t('Aucun pointage ne correspond à ces critères.')} /> : (
        <Table head={[t('Date et heure'), t('Type'), t('Origine'), t('Remarque')]}>
          {entries.items.map((e) => (
            <tr key={e.id} className={e.voidedAt ? 'opacity-60' : undefined}>
              <td className="whitespace-nowrap">{formatDateTime(e.at, locale, timezone)}</td>
              <td>{t(ENTRY_LABELS[e.type])} {e.voidedAt && <Badge tone="danger">{t('Annulé')}</Badge>}</td>
              <td>{t(SOURCE_LABELS[e.source] ?? e.source)}</td>
              <td className="max-w-[240px] break-words text-sm">{e.note ?? ''}</td>
            </tr>
          ))}
        </Table>
      )}
      <Pagination page={entries.page} pages={entries.pages} t={t} to={(page) => href(locale, '/history', { ...q, w: offset || undefined, page })} />
    </>
  );
}
