import { CheckSquare, Users } from 'lucide-react';
import { Link } from '@/i18n/client';
import { LOCALE_META } from '@/i18n/config';
import { formatDate } from '@/i18n/translate';
import { Card, Empty, PageHeader } from '@/components/ui';
import { calendarMonth, listMembers } from '@/modules/crm/service';
import { dayKey } from '@/modules/crm/dates';
import { crmPage, one, type SearchParams } from '../_ui/page';
import { TaskModal } from '../_ui/parts';

const PATH = '/app/crm/calendar';
const ym = (y: number, m: number) => `${y}-${String(m).padStart(2, '0')}`;

export default async function CalendarPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, ctx, t, tz } = await crmPage(params);
  const today = dayKey(new Date(), tz);
  const requested = /^(\d{4})-(\d{2})$/.exec(one((await searchParams).month) ?? '');
  let year = requested ? Number(requested[1]) : Number(today.slice(0, 4));
  let month = requested ? Number(requested[2]) : Number(today.slice(5, 7));
  if (year < 2000 || year > 2100 || month < 1 || month > 12) { year = Number(today.slice(0, 4)); month = Number(today.slice(5, 7)); }
  const [cal, members] = await Promise.all([calendarMonth(ctx, year, month, tz), listMembers(ctx)]);

  const prev = month === 1 ? ym(year - 1, 12) : ym(year, month - 1);
  const next = month === 12 ? ym(year + 1, 1) : ym(year, month + 1);
  const title = formatDate(new Date(Date.UTC(year, month - 1, 15)), locale, { dateStyle: undefined, month: 'long', year: 'numeric', timeZone: 'UTC' });
  const weekdays = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(LOCALE_META[locale].intl, { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, 0, 1 + i)))); // 1 Jan 2024 = Monday
  const cells: (number | null)[] = [...Array.from({ length: cal.firstWeekday }, () => null), ...Array.from({ length: cal.daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const keyOf = (d: number) => `${ym(year, month)}-${String(d).padStart(2, '0')}`;
  const time = (d: Date) => new Intl.DateTimeFormat(LOCALE_META[locale].intl, { timeStyle: 'short', timeZone: tz }).format(d);
  const busyDays = Object.keys(cal.days).sort();

  return (
    <>
      <PageHeader title={t('Calendrier')} subtitle={t('Échéances des tâches et rendez-vous du mois.')} actions={<TaskModal t={t} members={members} userId={ctx.userId} />} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold capitalize">{title}</h2>
        <nav aria-label={t('Navigation par mois')} className="flex flex-wrap gap-2">
          <Link href={`${PATH}?month=${prev}`} className="btn btn-outline btn-sm" rel="prev">← {t('Mois précédent')}</Link>
          <Link href={PATH} className="btn btn-ghost btn-sm">{t('Aujourd’hui')}</Link>
          <Link href={`${PATH}?month=${next}`} className="btn btn-outline btn-sm" rel="next">{t('Mois suivant')} →</Link>
        </nav>
      </div>

      <div className="panel overflow-hidden">
        <div className="grid grid-cols-7 border-b border-line text-center text-[0.7rem] font-medium uppercase tracking-wide text-fg-muted">
          {weekdays.map((w) => <div key={w} className="px-0.5 py-2">{w}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d, i) => {
            const entries = d ? cal.days[keyOf(d)] ?? [] : [];
            const isToday = d !== null && keyOf(d) === today;
            return (
              <div key={i} className={`min-h-14 border-b border-r border-line p-1 md:min-h-28 md:p-1.5 ${i % 7 === 6 ? 'border-r-0' : ''} ${d ? '' : 'bg-ink-900/60'}`}>
                {d && (
                  <>
                    <a href={entries.length ? `#d-${keyOf(d)}` : undefined} className={`inline-grid h-6 min-w-6 place-items-center rounded-full px-1 text-xs no-underline ${isToday ? 'bg-gold-500 font-bold text-black' : 'text-fg-soft'}`} aria-current={isToday ? 'date' : undefined}>{d}</a>
                    {entries.length > 0 && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-gold-400 align-middle md:hidden" aria-label={t('{count} élément(s)', { count: entries.length })} />}
                    <ul className="mt-1 hidden space-y-1 md:block">
                      {entries.slice(0, 3).map((e) => (
                        <li key={e.kind + e.id}>
                          <Link href={e.href} className={`block truncate rounded px-1.5 py-0.5 text-xs no-underline ${e.kind === 'meeting' ? 'bg-sky-300/10 text-info' : 'bg-white/5 text-fg-soft'} ${e.kind === 'task' && e.done ? 'line-through opacity-60' : ''}`}>{e.title}</Link>
                        </li>
                      ))}
                      {entries.length > 3 && <li className="muted px-1 text-xs">{t('+ {count} autre(s)', { count: entries.length - 3 })}</li>}
                    </ul>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <Card title={t('Agenda du mois')}>
          {busyDays.length === 0 ? <Empty title={t('Rien de prévu ce mois-ci.')} /> : (
            <ul className="space-y-4">
              {busyDays.map((key) => (
                <li key={key} id={`d-${key}`} className="scroll-mt-20">
                  <h3 className="mb-1.5 text-sm font-semibold">{formatDate(new Date(`${key}T12:00:00Z`), locale, { dateStyle: 'full', timeZone: 'UTC' })}</h3>
                  <ul className="space-y-1.5">
                    {cal.days[key].map((e) => (
                      <li key={e.kind + e.id} className="flex items-start gap-2 text-sm">
                        {e.kind === 'meeting' ? <Users size={16} className="mt-0.5 flex-none text-info" aria-hidden /> : <CheckSquare size={16} className="mt-0.5 flex-none text-gold-300" aria-hidden />}
                        <Link href={e.href} className={`min-w-0 break-words underline-offset-2 hover:underline ${e.kind === 'task' && e.done ? 'muted line-through' : ''}`}>
                          {e.kind === 'meeting' ? `${time(e.at)} · ${t('Rendez-vous')} — ${e.title}` : `${t('Tâche')} — ${e.title}`}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
