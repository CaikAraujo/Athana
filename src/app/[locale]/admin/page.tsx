import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDate, formatMoney } from '@/i18n/translate';
import { can } from '@/modules/auth/rbac';
import { requireStaff } from '@/modules/auth/session';
import { mrrByCurrency, revenueByCurrency } from '@/modules/admin/queries';
import { Card, Empty, PageHeader, Stat } from '@/components/ui';
import { OrderBadge, ProjectBadge } from '@/components/app/status';

export default async function AdminHome({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ denied?: string }> }) {
  const locale = assertLocale((await params).locale);
  const user = await requireStaff(locale, 'dashboard.view');
  const t = await getT(locale);
  const p = (path: string) => localePath(locale, path);
  const finance = can(user.platformRole, 'finance.view');
  const month = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const now = new Date();
  const activeStatuses = ['BRIEFING_SUBMITTED', 'PROJECT_QUEUED', 'IN_DEVELOPMENT', 'INTERNAL_REVIEW', 'CLIENT_REVIEW', 'REVISION_REQUESTED', 'APPROVED', 'DEPLOYMENT_PENDING'] as const;
  const [paidOrders, customers, activeSubs, activeProjects, late, revenueMonth, revenueAll, mrr, recent, top, lateList] = await Promise.all([
    db.order.count({ where: { status: 'PAID' } }),
    db.user.count({ where: { platformRole: null, deletedAt: null } }),
    db.subscription.count({ where: { status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] } } }),
    db.project.count({ where: { status: { in: [...activeStatuses] } } }),
    db.project.count({ where: { status: { in: [...activeStatuses] }, dueAt: { lt: now } } }),
    finance ? revenueByCurrency(month) : {}, finance ? revenueByCurrency() : {}, finance ? mrrByCurrency() : {},
    db.order.findMany({ orderBy: { createdAt: 'desc' }, take: 6, include: { user: { select: { name: true } } } }),
    db.orderItem.groupBy({ by: ['name'], where: { order: { status: { in: ['PAID', 'PARTIALLY_REFUNDED'] } } }, _count: { _all: true }, orderBy: { _count: { name: 'desc' } }, take: 5 }),
    db.project.findMany({ where: { status: { in: [...activeStatuses] }, dueAt: { lt: now } }, orderBy: { dueAt: 'asc' }, take: 5 }),
  ]);
  const money = (map: Record<string, number>) => Object.entries(map).map(([c, v]) => formatMoney(v, c, locale)).join(' · ') || '—';
  return (
    <>
      <PageHeader title={t('Tableau de bord')} subtitle={t('Vue d’ensemble de l’activité ATHANA.')} />
      {(await searchParams).denied && <p className="alert alert-danger mb-5">{t('Vous n’avez pas la permission d’accéder à cette page.')}</p>}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t('Commandes payées')} value={paidOrders} />
        <Stat label={t('Clients')} value={customers} />
        <Stat label={t('Projets actifs')} value={activeProjects} hint={late > 0 ? <span className="text-danger">{t('{n} en retard', { n: late })}</span> : t('Aucun retard')} />
        <Stat label={t('Abonnements actifs')} value={activeSubs} />
        {finance && <>
          <Stat label={t('Ventes du mois')} value={<span className="text-xl">{money(revenueMonth)}</span>} />
          <Stat label={t('Facturation totale')} value={<span className="text-xl">{money(revenueAll)}</span>} />
          <Stat label={t('Revenu récurrent mensuel')} value={<span className="text-xl">{money(mrr)}</span>} />
        </>}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title={t('Dernières commandes')} actions={can(user.platformRole, 'orders.view') ? <a className="text-sm underline" href={p('/admin/orders')}>{t('Tout voir')}</a> : undefined}>
          {recent.length === 0 ? <Empty title={t('Aucune commande.')} /> : (
            <ul className="divide-y divide-line text-sm">
              {recent.map((o) => <li key={o.id} className="flex items-center justify-between gap-3 py-2.5"><a className="font-medium no-underline hover:text-gold-300" href={p(`/admin/orders/${o.id}`)}>{o.number}</a><span className="muted min-w-0 flex-1 truncate">{o.user.name}</span><span>{formatMoney(o.total, o.currency, locale)}</span><OrderBadge status={o.status} t={t} /></li>)}
            </ul>
          )}
        </Card>
        <Card title={t('Produits les plus vendus')}>
          {top.length === 0 ? <Empty title={t('Aucune vente pour le moment.')} /> : <ol className="space-y-2 text-sm">{top.map((x, i) => <li key={x.name} className="flex justify-between gap-3"><span>{i + 1}. {x.name}</span><span className="muted">{t('{n} vente(s)', { n: x._count._all })}</span></li>)}</ol>}
        </Card>
        <Card title={t('Projets en retard')} className="lg:col-span-2">
          {lateList.length === 0 ? <p className="muted text-sm">{t('Aucun projet en retard.')}</p> : (
            <ul className="divide-y divide-line text-sm">{lateList.map((x) => <li key={x.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5"><a className="font-medium no-underline hover:text-gold-300" href={p(`/admin/projects/${x.id}`)}>{x.reference} — {x.name}</a><span className="text-danger">{t('Échéance : {date}', { date: formatDate(x.dueAt!, locale) })}</span><ProjectBadge status={x.status} t={t} /></li>)}</ul>
          )}
        </Card>
      </div>
    </>
  );
}
