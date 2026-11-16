import type { ProjectStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDate } from '@/i18n/translate';
import { can } from '@/modules/auth/rbac';
import { requireStaff } from '@/modules/auth/session';
import { PROJECT_FLOW } from '@/modules/projects/service';
import { PROJECT_STATUS_LABEL } from '@/modules/automation/events';
import { Empty, PageHeader, Table } from '@/components/ui';
import { ProjectBadge } from '@/components/app/status';

export default async function AdminProjects({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ status?: string; mine?: string }> }) {
  const locale = assertLocale((await params).locale);
  const staff = await requireStaff(locale, 'projects.view');
  const t = await getT(locale);
  const sp = await searchParams;
  const st = PROJECT_FLOW.includes(sp.status as ProjectStatus) ? (sp.status as ProjectStatus) : undefined;
  // Developers only see the projects assigned to them.
  const onlyMine = sp.mine === '1' || !can(staff.platformRole, 'orders.view');
  const projects = await db.project.findMany({
    where: { ...(st ? { status: st } : { status: { not: 'PAYMENT_PENDING' } }), ...(onlyMine ? { assigneeId: staff.id } : {}) },
    include: { user: { select: { name: true } }, assignee: { select: { name: true } } }, orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }], take: 200,
  });
  const base = localePath(locale, '/admin/projects');
  const now = new Date();
  return (
    <>
      <PageHeader title={t('Projets')} />
      <form method="get" action={base} className="mb-4 flex flex-wrap items-center gap-3">
        <select name="status" defaultValue={st ?? ''} className="select max-w-[240px]" aria-label={t('Statut')}>
          <option value="">{t('Tous les projets payés')}</option>
          {PROJECT_FLOW.map((s) => <option key={s} value={s}>{t(PROJECT_STATUS_LABEL[s])}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="mine" value="1" defaultChecked={onlyMine} className="check" />{t('Mes projets')}</label>
        <button className="btn btn-outline" type="submit">{t('Filtrer')}</button>
      </form>
      {projects.length === 0 ? <Empty title={t('Aucun projet.')} /> : (
        <Table head={[t('Référence'), t('Projet'), t('Client'), t('Responsable'), t('Échéance'), t('Statut')]}>
          {projects.map((x) => (
            <tr key={x.id}>
              <td><a className="row-link" href={localePath(locale, `/admin/projects/${x.id}`)}>{x.reference}</a></td>
              <td>{x.name}</td><td>{x.user.name}</td><td>{x.assignee?.name ?? <span className="muted">{t('Non attribué')}</span>}</td>
              <td className={x.dueAt && x.dueAt < now && !['COMPLETED', 'MAINTENANCE'].includes(x.status) ? 'text-danger' : ''}>{x.dueAt ? formatDate(x.dueAt, locale) : '—'}</td>
              <td><ProjectBadge status={x.status} t={t} /></td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
