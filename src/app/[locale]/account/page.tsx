import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDate, formatMoney } from '@/i18n/translate';
import { requireUser } from '@/modules/auth/session';
import { projectProgress } from '@/modules/projects/service';
import { Card, Empty, PageHeader, Progress, Stat } from '@/components/ui';
import { OrderBadge, ProjectBadge } from '@/components/app/status';
import { TrackEvent } from '@/components/site/Consent';

export default async function AccountHome({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ welcome?: string }> }) {
  const locale = assertLocale((await params).locale);
  const user = await requireUser(locale);
  const t = await getT(locale);
  const p = (path: string) => localePath(locale, path);
  const [projects, orders, subs, unread] = await Promise.all([
    db.project.findMany({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' }, take: 4 }),
    db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 4 }),
    db.subscription.count({ where: { organization: { memberships: { some: { userId: user.id } } }, status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] } } }),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  const todo = projects.filter((x) => x.status === 'BRIEFING_PENDING' || x.status === 'CLIENT_REVIEW');
  return (
    <>
      <PageHeader title={t('Bonjour {name}', { name: user.name.split(' ')[0] })} subtitle={t('Voici l’état de vos projets et de vos services.')} />
      {(await searchParams).welcome && <TrackEvent event="sign_up" onceKey={`signup-${user.id}`} />}
      {(await searchParams).welcome && <p className="alert alert-ok mb-5">{t('Votre compte est créé. Bienvenue chez ATHANA !')}</p>}
      {todo.map((x) => (
        <p key={x.id} className="alert alert-warn mb-3 flex flex-wrap items-center justify-between gap-3">
          <span>{x.status === 'BRIEFING_PENDING' ? t('Le briefing du projet {ref} attend vos informations.', { ref: x.reference }) : t('Le projet {ref} attend votre validation.', { ref: x.reference })}</span>
          <a className="btn btn-primary btn-sm" href={p(x.status === 'BRIEFING_PENDING' ? `/account/projects/${x.id}/briefing` : `/account/projects/${x.id}`)}>{x.status === 'BRIEFING_PENDING' ? t('Remplir le briefing') : t('Voir le projet')}</a>
        </p>
      ))}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t('Projets')} value={projects.length ? await db.project.count({ where: { userId: user.id } }) : 0} />
        <Stat label={t('Commandes')} value={await db.order.count({ where: { userId: user.id } })} />
        <Stat label={t('Abonnements actifs')} value={subs} />
        <Stat label={t('Notifications non lues')} value={unread} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title={t('Mes projets')} actions={<a className="text-sm underline" href={p('/account/projects')}>{t('Tout voir')}</a>}>
          {projects.length === 0 ? <Empty title={t('Aucun projet pour le moment.')}><a className="btn btn-primary btn-sm" href={p('/templates')}>{t('Choisir un modèle')}</a></Empty> : (
            <ul className="space-y-4">
              {projects.map((x) => (
                <li key={x.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <a className="truncate font-medium no-underline hover:text-accent-700" href={p(`/account/projects/${x.id}`)}>{x.name}</a>
                    <ProjectBadge status={x.status} t={t} />
                  </div>
                  <Progress value={projectProgress(x.status)} label={x.name} />
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title={t('Dernières commandes')} actions={<a className="text-sm underline" href={p('/account/orders')}>{t('Tout voir')}</a>}>
          {orders.length === 0 ? <Empty title={t('Aucune commande.')} /> : (
            <ul className="divide-y divide-line">
              {orders.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <a className="font-medium no-underline hover:text-accent-700" href={p(`/account/orders/${o.id}`)}>{o.number}</a>
                  <span className="muted hidden sm:inline">{formatDate(o.createdAt, locale)}</span>
                  <span>{formatMoney(o.total, o.currency, locale)}</span>
                  <OrderBadge status={o.status} t={t} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
