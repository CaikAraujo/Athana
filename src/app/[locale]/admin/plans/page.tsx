import { db } from '@/lib/db';
import { assertLocale, getT, L } from '@/i18n/server';
import { requireStaff } from '@/modules/auth/session';
import { marketCurrencies } from '@/modules/admin/queries';
import { Badge, Card, PageHeader } from '@/components/ui';
import { PlanForm } from '../CatalogForms';

export default async function AdminPlans({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'saas.manage');
  const t = await getT(locale);
  const [products, currencies] = await Promise.all([db.saasProduct.findMany({ orderBy: { sortOrder: 'asc' }, include: { plans: { orderBy: { sortOrder: 'asc' } }, _count: { select: { subscriptions: true } } } }), marketCurrencies()]);
  return (
    <>
      <PageHeader title={t('Logiciels & plans')} subtitle={t('Prix, limites et période d’essai de chaque plan. Les modifications s’appliquent aux nouveaux abonnements et aux renouvellements en mode test.')} />
      {products.map((pr) => (
        <section key={pr.key} className="mb-8">
          <h2 className="mb-1 flex items-center gap-3 text-xl font-semibold">{pr.name} {pr.status === 'ACTIVE' ? <Badge tone="ok">{t('Disponible')}</Badge> : <Badge>{t('Bientôt')}</Badge>}</h2>
          <p className="muted mb-4 text-sm">{L(pr.tagline, locale)} · {t('{n} abonnement(s)', { n: pr._count.subscriptions })}</p>
          {pr.plans.length === 0 ? <p className="muted text-sm">{t('Aucun plan : ce logiciel n’est pas encore commercialisé.')}</p> : (
            <div className="grid gap-5 xl:grid-cols-3">{pr.plans.map((pl) => <Card key={pl.id} title={pl.key}><PlanForm plan={JSON.parse(JSON.stringify(pl))} currencies={currencies} /></Card>)}</div>
          )}
        </section>
      ))}
    </>
  );
}
