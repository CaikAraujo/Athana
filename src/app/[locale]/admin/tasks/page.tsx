import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDate } from '@/i18n/translate';
import { requireStaff } from '@/modules/auth/session';
import { Empty, PageHeader } from '@/components/ui';
import { TaskDone } from '../AdminForms';

export default async function AdminTasks({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'dashboard.view');
  const t = await getT(locale);
  const tasks = await db.task.findMany({ where: { status: 'OPEN' }, orderBy: [{ dueAt: 'asc' }, { createdAt: 'asc' }], take: 200 });
  const now = new Date();
  return (
    <>
      <PageHeader title={t('Tâches')} subtitle={t('Créées automatiquement par les commandes, briefings, validations et demandes RGPD.')} />
      {tasks.length === 0 ? <Empty title={t('Aucune tâche ouverte.')} /> : (
        <ul className="panel divide-y divide-line">
          {tasks.map((tk) => {
            const href = tk.projectId ? `/admin/projects/${tk.projectId}` : tk.orderId ? `/admin/orders/${tk.orderId}` : tk.type === 'data_request' ? '/admin/data-requests' : null;
            return (
              <li key={tk.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  {href ? <a className="font-medium no-underline hover:text-accent-700" href={localePath(locale, href)}>{tk.title}</a> : <p className="font-medium">{tk.title}</p>}
                  {tk.dueAt && <p className={`text-xs ${tk.dueAt < now ? 'text-danger' : 'muted'}`}>{t('Échéance : {date}', { date: formatDate(tk.dueAt, locale) })}</p>}
                </div>
                <TaskDone taskId={tk.id} />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
