import { Link } from '@/i18n/client';
import { Card, PageHeader } from '@/components/ui';
import { listMembers, listTasks, type TaskFilter } from '@/modules/crm/service';
import { crmPage, one, type SearchParams } from '../_ui/page';
import { Pagination, TaskList, TaskModal } from '../_ui/parts';

const PATH = '/app/crm/tasks';
const FILTERS: TaskFilter[] = ['mine', 'all', 'overdue', 'done'];

export default async function TasksPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, ctx, t } = await crmPage(params);
  const sp = await searchParams;
  const requested = one(sp.filter) as TaskFilter | undefined;
  const filter: TaskFilter = requested && FILTERS.includes(requested) ? requested : 'mine';
  const [list, members] = await Promise.all([listTasks(ctx, { filter, page: one(sp.page) }), listMembers(ctx)]);
  const labels: Record<TaskFilter, string> = { mine: t('Mes tâches'), all: t('Toutes les tâches ouvertes'), overdue: t('En retard'), done: t('Terminées') };
  return (
    <>
      <PageHeader title={t('Tâches')} subtitle={t('Relances, rappels et actions à mener.')} actions={<><Link href="/app/crm/calendar" className="btn btn-outline btn-sm">{t('Calendrier')}</Link><TaskModal t={t} members={members} userId={ctx.userId} /></>} />
      <nav aria-label={t('Filtres')} className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => <Link key={f} href={`${PATH}?filter=${f}`} className={`btn btn-sm ${f === filter ? 'btn-secondary' : 'btn-outline'}`} aria-current={f === filter ? 'page' : undefined}>{labels[f]}</Link>)}
      </nav>
      <Card title={labels[filter]}>
        <TaskList tasks={list.items} t={t} locale={locale} showLinks />
      </Card>
      {list.total > 0 && <Pagination t={t} path={PATH} params={{ filter }} page={list.page} pages={list.pages} total={list.total} />}
    </>
  );
}
