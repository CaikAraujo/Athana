import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { formatDate, formatMoney } from '@/i18n/translate';
import { requireStaff } from '@/modules/auth/session';
import { mrrByCurrency } from '@/modules/admin/queries';
import { subscriptionAmount } from '@/modules/billing/service';
import { Empty, PageHeader, Stat, Table } from '@/components/ui';
import { SubBadge } from '@/components/app/status';

export default async function AdminSubscriptions({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'saas.manage');
  const t = await getT(locale);
  const [subs, mrr] = await Promise.all([db.subscription.findMany({ include: { organization: true, plan: true, saasProduct: true }, orderBy: { createdAt: 'desc' }, take: 300 }), mrrByCurrency()]);
  const count = (s: string) => subs.filter((x) => x.status === s).length;
  return (
    <>
      <PageHeader title={t('Abonnements')} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t('Revenu récurrent mensuel')} value={<span className="text-xl">{Object.entries(mrr).map(([c, v]) => formatMoney(v, c, locale)).join(' · ') || '—'}</span>} />
        <Stat label={t('Actifs')} value={count('ACTIVE')} /><Stat label={t('En essai')} value={count('TRIALING')} /><Stat label={t('En retard de paiement')} value={count('PAST_DUE')} />
      </div>
      {subs.length === 0 ? <Empty title={t('Aucun abonnement.')} /> : (
        <Table head={[t('Entreprise'), t('Logiciel'), t('Plan'), t('Places'), t('Montant mensuel'), t('Fin de période'), t('Statut')]}>
          {subs.map((s) => <tr key={s.id}><td className="font-medium">{s.organization.name}</td><td>{s.saasProduct.name}</td><td>{s.plan.name}</td><td>{s.seats}</td><td>{formatMoney(subscriptionAmount(s.plan, s.currency, s.seats), s.currency, locale)}</td><td>{formatDate(s.currentPeriodEnd, locale)}{s.cancelAtPeriodEnd && <span className="muted"> ({t('résiliation programmée')})</span>}</td><td><SubBadge status={s.status} t={t} /></td></tr>)}
        </Table>
      )}
    </>
  );
}
