import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDate, formatDateTime, formatMoney } from '@/i18n/translate';
import { can } from '@/modules/auth/rbac';
import { requireStaff } from '@/modules/auth/session';
import { Card, DefList, PageHeader } from '@/components/ui';
import { OrderBadge, ProjectBadge, SubBadge } from '@/components/app/status';
import { CustomerState } from '../../AdminForms';

export default async function AdminCustomer({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: l, id } = await params;
  const locale = assertLocale(l);
  const staff = await requireStaff(locale, 'customers.view');
  const user = await db.user.findFirst({
    where: { id, platformRole: null },
    include: { orders: { orderBy: { createdAt: 'desc' } }, projects: { orderBy: { createdAt: 'desc' } }, memberships: { include: { organization: { include: { subscriptions: { include: { saasProduct: true, plan: true } }, _count: { select: { memberships: true } } } } } } },
  });
  if (!user) notFound();
  const t = await getT(locale);
  const logs = await db.auditLog.findMany({ where: { actorId: user.id }, orderBy: { createdAt: 'desc' }, take: 15 });
  const p = (path: string) => localePath(locale, path);
  return (
    <>
      <PageHeader title={user.name} subtitle={user.email} actions={can(staff.platformRole, 'customers.manage') && !user.deletedAt ? <CustomerState userId={user.id} disabled={!!user.disabledAt} /> : undefined} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title={t('Compte')}><DefList items={[[t('Téléphone'), user.phone], [t('Pays'), user.country], [t('Marché'), user.locale], [t('Inscription'), formatDate(user.createdAt, locale)], [t('État'), user.deletedAt ? t('Supprimé') : user.disabledAt ? t('Désactivé') : t('Actif')]]} /></Card>
        <Card title={t('Entreprises et abonnements')}>
          {user.memberships.length === 0 ? <p className="muted text-sm">{t('Aucune entreprise.')}</p> : <ul className="space-y-3 text-sm">{user.memberships.map((mb) => (
            <li key={mb.id}><p className="font-medium">{mb.organization.name} <span className="muted">· {mb.role} · {t('{n} utilisateur(s)', { n: mb.organization._count.memberships })}</span></p>
              {mb.organization.subscriptions.map((s) => <p key={s.id} className="mt-1 flex items-center gap-2">{s.saasProduct.name} {s.plan.name} <SubBadge status={s.status} t={t} /></p>)}</li>
          ))}</ul>}
        </Card>
        <Card title={t('Commandes')}>
          {user.orders.length === 0 ? <p className="muted text-sm">{t('Aucune commande.')}</p> : <ul className="divide-y divide-line text-sm">{user.orders.map((o) => <li key={o.id} className="flex items-center justify-between gap-3 py-2"><a className="underline" href={p(`/admin/orders/${o.id}`)}>{o.number}</a><span>{formatMoney(o.total, o.currency, locale)}</span><OrderBadge status={o.status} t={t} /></li>)}</ul>}
        </Card>
        <Card title={t('Projets')}>
          {user.projects.length === 0 ? <p className="muted text-sm">{t('Aucun projet.')}</p> : <ul className="divide-y divide-line text-sm">{user.projects.map((x) => <li key={x.id} className="flex items-center justify-between gap-3 py-2"><a className="underline" href={p(`/admin/projects/${x.id}`)}>{x.reference}</a><span className="muted min-w-0 flex-1 truncate">{x.name}</span><ProjectBadge status={x.status} t={t} /></li>)}</ul>}
        </Card>
        <Card title={t('Historique')} className="lg:col-span-2">
          {logs.length === 0 ? <p className="muted text-sm">{t('Aucune activité enregistrée.')}</p> : <ul className="space-y-1 text-sm">{logs.map((lg) => <li key={lg.id}><span className="muted">{formatDateTime(lg.createdAt, locale)}</span> · {lg.action}</li>)}</ul>}
        </Card>
      </div>
    </>
  );
}
