import { Card, Empty, Stat, Table } from '@/components/ui';
import { Link } from '@/i18n/client';
import { LOCALE_META } from '@/i18n/config';
import { formatDateTime } from '@/i18n/translate';
import { getClockView, getTeamStatus, fullName } from '@/modules/pointage/service';
import { ENTRY_LABELS, SOURCE_LABELS, STATE_LABELS } from '@/modules/pointage/labels';
import { formatDuration } from '@/modules/pointage/time';
import { ClockButtons, LiveClock } from './_components/client';
import { Anomalies, BASE, StatusBadge, atLeast, fmtDay, fmtTime, href, pointagePage } from './_components/server';

export default async function PointageHome({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, ctx, actor, t, timezone } = await pointagePage(params);
  const [view, team] = await Promise.all([getClockView(ctx), atLeast(actor, 'MANAGER') ? getTeamStatus(ctx) : null]);

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      {view && (
        <section className="panel mx-auto w-full max-w-md p-5 text-center" aria-label={t('Pointer')}>
          <p className="muted text-sm">{fullName(view.employee)} · {fmtDay(view.date, locale, true)}</p>
          <div className="my-3"><LiveClock timeZone={timezone} intl={LOCALE_META[locale].intl} /></div>
          <div className="mb-4 flex items-center justify-center gap-2">
            <StatusBadge status={view.state} t={t} />
            {view.entries.length > 0 && <span className="muted text-sm">{t('depuis {time}', { time: fmtTime(view.entries[view.entries.length - 1].at, locale, timezone) })}</span>}
          </div>
          <div className="mb-5 grid grid-cols-3 gap-2 text-left">
            <div className="rounded-xl border border-line p-3"><p className="stat-label">{t('Aujourd’hui')}</p><p className="font-display text-xl font-semibold">{formatDuration(view.today?.workedMinutes ?? 0)}</p></div>
            <div className="rounded-xl border border-line p-3"><p className="stat-label">{t('Pauses')}</p><p className="font-display text-xl font-semibold">{formatDuration(view.today?.breakMinutes ?? 0)}</p></div>
            <div className="rounded-xl border border-line p-3"><p className="stat-label">{t('Semaine')}</p><p className="font-display text-xl font-semibold">{formatDuration(view.week?.workedMinutes ?? 0)}</p></div>
          </div>
          <ClockButtons actions={view.actions} />
          {view.today && view.today.anomalies.length > 0 && <div className="mt-4 flex justify-center"><Anomalies list={view.today.anomalies} t={t} /></div>}
          <div className="mt-6 text-left">
            <h2 className="mb-2 text-sm font-semibold">{t('Pointages du jour')}</h2>
            {view.entries.length === 0 ? (
              <p className="muted text-sm">{t('Aucun pointage aujourd’hui.')}</p>
            ) : (
              <ul className="divide-y divide-line rounded-xl border border-line">
                {view.entries.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                    <span>{t(ENTRY_LABELS[e.type])}{e.source === 'manual' && <span className="muted"> · {t(SOURCE_LABELS.manual)}</span>}</span>
                    <span className="font-medium tabular-nums">{fmtTime(e.at, locale, timezone)}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="muted mt-3 text-xs">{t('L’heure enregistrée est celle du serveur, dans le fuseau {timezone}.', { timezone })}</p>
          </div>
        </section>
      )}

      {team && (
        <section className="grid gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-xl font-semibold">{t('Équipe aujourd’hui')}</h1>
            <Link href={`${BASE}/team`} className="btn btn-outline btn-sm no-underline">{t('Voir l’équipe')}</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {(['IN', 'BREAK', 'OUT', 'ABSENT'] as const).map((s) => <Stat key={s} label={t(STATE_LABELS[s])} value={team.counts[s]} />)}
          </div>
          {team.members.length === 0 ? (
            <Empty title={t('Aucun employé pour le moment.')}>
              {actor.role === 'ADMIN'
                ? <Link href={`${BASE}/employees`} className="btn btn-primary btn-sm no-underline">{t('Ajouter des employés')}</Link>
                : t('Aucun employé n’est rattaché aux départements que vous gérez.')}
            </Empty>
          ) : (
            <Table head={[t('Employé'), t('Statut'), t('Dernier pointage'), t('Aujourd’hui')]}>
              {team.members.map((m) => (
                <tr key={m.employee.id}>
                  <td><a className="row-link" href={href(locale, '/team', { employee: m.employee.id, date: team.date })}>{fullName(m.employee)}</a><div className="muted text-xs">{m.employee.department?.name}</div></td>
                  <td><StatusBadge status={m.status} t={t} /></td>
                  <td className="whitespace-nowrap">{m.since ? formatDateTime(m.since, locale, timezone) : '—'}</td>
                  <td className="whitespace-nowrap">{formatDuration(m.workedMinutes)}</td>
                </tr>
              ))}
            </Table>
          )}
        </section>
      )}

      {!view && !team && <Card><p className="muted text-sm">{t('Votre compte n’est pas lié à une fiche employé.')}</p></Card>}
    </div>
  );
}
