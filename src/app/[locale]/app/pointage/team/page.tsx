import { Badge, Card, Empty, PageHeader, Stat, Table } from '@/components/ui';
import { formatDateTime } from '@/i18n/translate';
import { fullName, getDayDetail, getTeamStatus, scopeOptions } from '@/modules/pointage/service';
import { ABSENCE_LABELS, ENTRY_LABELS, SOURCE_LABELS, STATE_LABELS } from '@/modules/pointage/labels';
import { addDays, formatDuration, isDateKey, localDateKey } from '@/modules/pointage/time';
import { CorrectionForm, VoidEntryButton } from '../_components/client';
import { Anomalies, Denied, StatusBadge, atLeast, fmtDay, fmtTime, href, one, pointagePage, type Search } from '../_components/server';

export default async function TeamPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Search }) {
  const { locale, ctx, actor, t, timezone } = await pointagePage(params);
  if (!atLeast(actor, 'MANAGER')) return <Denied t={t} />;
  const sp = await searchParams;
  const today = localDateKey(new Date(), timezone);
  const employeeId = one(sp.employee);

  if (employeeId) {
    const date = isDateKey(one(sp.date)) && one(sp.date) <= today ? one(sp.date) : today;
    const detail = await getDayDetail(ctx, employeeId, date);
    const day = detail.summary;
    return (
      <>
        <PageHeader
          title={fullName(detail.employee)}
          subtitle={fmtDay(date, locale, true)}
          actions={<>
            <a className="btn btn-outline btn-sm" href={href(locale, '/team', { employee: employeeId, date: addDays(date, -1) })}>{t('Jour précédent')}</a>
            {date < today && <a className="btn btn-outline btn-sm" href={href(locale, '/team', { employee: employeeId, date: addDays(date, 1) })}>{t('Jour suivant')}</a>}
            <a className="btn btn-ghost btn-sm" href={href(locale, '/history', { employee: employeeId })}>{t('Historique')}</a>
            <a className="btn btn-ghost btn-sm" href={href(locale, '/team')}>{t('Retour à l’équipe')}</a>
          </>}
        />
        <form method="get" className="mb-4 flex flex-wrap items-end gap-2">
          <input type="hidden" name="employee" value={employeeId} />
          <label><span className="label">{t('Date')}</span><input className="input" type="date" name="date" defaultValue={date} max={today} /></label>
          <button className="btn btn-outline" type="submit">{t('Afficher')}</button>
        </form>
        <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label={t('Travaillé')} value={formatDuration(day?.workedMinutes ?? 0)} hint={day?.open ? t('en cours') : undefined} />
          <Stat label={t('Pauses')} value={formatDuration(day?.breakMinutes ?? 0)} />
          <Stat label={t('Entrée')} value={day?.firstIn ? fmtTime(day.firstIn, locale, timezone) : '—'} />
          <Stat label={t('Sortie')} value={day?.lastOut ? fmtTime(day.lastOut, locale, timezone) : '—'} />
        </div>
        {day && day.anomalies.length > 0 && <div className="mb-4"><Anomalies list={day.anomalies} t={t} /></div>}
        <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,380px)]">
          <div>
            {detail.entries.length === 0 ? <Empty title={t('Aucun pointage ce jour-là.')} /> : (
              <Table head={[t('Heure'), t('Type'), t('Origine'), '']}>
                {detail.entries.map((e) => (
                  <tr key={e.id} className={e.voidedAt ? 'opacity-60' : undefined}>
                    <td className="whitespace-nowrap font-medium tabular-nums">{fmtTime(e.at, locale, timezone)}</td>
                    <td>{t(ENTRY_LABELS[e.type])} {e.voidedAt && <Badge tone="danger">{t('Annulé')}</Badge>}</td>
                    <td>{t(SOURCE_LABELS[e.source] ?? e.source)}{e.note && <div className="muted max-w-[220px] break-words text-xs">{e.note}</div>}</td>
                    <td>{detail.canCorrect && !e.voidedAt && <VoidEntryButton entryId={e.id} label={`${t(ENTRY_LABELS[e.type])} · ${formatDateTime(e.at, locale, timezone)}`} />}</td>
                  </tr>
                ))}
              </Table>
            )}
          </div>
          <Card title={t('Corriger cette journée')}>
            {detail.canCorrect ? (
              <>
                <CorrectionForm employeeId={employeeId} date={date} />
                <p className="muted mt-3 text-xs">{t('Heures saisies dans le fuseau {timezone}. Une correction est refusée si la séquence entrée / pause / sortie de la journée devient incohérente. Pour modifier une heure : annulez le pointage puis ajoutez-en un nouveau.', { timezone })}</p>
              </>
            ) : (
              <p className="muted text-sm">{detail.correctionsDisabled ? t('Les corrections manuelles sont désactivées pour cette entreprise.') : t('Vous ne pouvez pas corriger les pointages de cet employé.')}</p>
            )}
          </Card>
        </div>
      </>
    );
  }

  const departmentId = one(sp.department);
  const [team, options] = await Promise.all([getTeamStatus(ctx, { departmentId: departmentId || null }), scopeOptions(ctx)]);
  return (
    <>
      <PageHeader title={t('Équipe')} subtitle={t('Situation en temps réel · {date}', { date: fmtDay(team.date, locale, true) })} />
      {options.departments.length > 1 && (
        <form method="get" className="mb-4 flex flex-wrap items-end gap-2">
          <label className="min-w-0 flex-1 sm:max-w-xs"><span className="label">{t('Département')}</span>
            <select name="department" defaultValue={departmentId} className="select"><option value="">{t('Tous')}</option>{options.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
          </label>
          <button className="btn btn-outline" type="submit">{t('Filtrer')}</button>
        </form>
      )}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {(['IN', 'BREAK', 'OUT', 'ABSENT'] as const).map((s) => <Stat key={s} label={t(STATE_LABELS[s])} value={team.counts[s]} />)}
      </div>
      {team.members.length === 0 ? <Empty title={t('Aucun employé à afficher.')} /> : (
        <Table head={[t('Employé'), t('Statut'), t('Dernier pointage'), t('Aujourd’hui'), t('Anomalies récentes'), '']}>
          {team.members.map((m) => (
            <tr key={m.employee.id}>
              <td><span className="font-medium">{fullName(m.employee)}</span><div className="muted text-xs">{m.employee.department?.name}</div></td>
              <td><StatusBadge status={m.status} t={t} />{m.absenceType && <div className="muted mt-1 text-xs">{t(ABSENCE_LABELS[m.absenceType])}</div>}</td>
              <td className="whitespace-nowrap">{m.since ? formatDateTime(m.since, locale, timezone) : '—'}</td>
              <td className="whitespace-nowrap">{formatDuration(m.workedMinutes)}</td>
              <td><Anomalies list={m.anomalies} t={t} /></td>
              <td><a className="btn btn-outline btn-sm" href={href(locale, '/team', { employee: m.employee.id, date: team.date })}>{t('Détail')}</a></td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
