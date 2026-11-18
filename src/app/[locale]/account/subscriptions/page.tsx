import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { assertLocale, getT, L } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDate, formatMoney } from '@/i18n/translate';
import { getMarket } from '@/lib/settings';
import { priceFor } from '@/lib/money';
import { requireUser } from '@/modules/auth/session';
import { subscriptionAmount } from '@/modules/billing/service';
import { Card, Empty, PageHeader } from '@/components/ui';
import { SubBadge } from '@/components/app/status';
import { TrackEvent } from '@/components/site/Consent';
import { SubscriptionActions, TrialButton } from '../AccountForms';

export default async function SubscriptionsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ product?: string; activated?: string; failed?: string }> }) {
  const locale = assertLocale((await params).locale);
  const user = await requireUser(locale, '/account/subscriptions');
  const t = await getT(locale);
  const sp = await searchParams;
  const market = await getMarket(locale);
  const currency = market?.currency ?? 'EUR';
  const [memberships, products] = await Promise.all([
    db.membership.findMany({ where: { userId: user.id, organization: { deletedAt: null } }, include: { organization: { include: { subscriptions: { include: { plan: true, saasProduct: true }, orderBy: { createdAt: 'asc' } } } } }, orderBy: { createdAt: 'asc' } }),
    db.saasProduct.findMany({ where: { status: 'ACTIVE' }, orderBy: { sortOrder: 'asc' }, include: { plans: { where: { active: true }, orderBy: { sortOrder: 'asc' } } } }),
  ]);
  const adminOrgs = memberships.filter((mb) => mb.role === 'OWNER' || mb.role === 'ADMIN').map((mb) => mb.organization);
  const subs = memberships.flatMap((mb) => mb.organization.subscriptions.map((s) => ({ s, org: mb.organization, canManage: mb.role === 'OWNER' || mb.role === 'ADMIN' })));
  return (
    <>
      <PageHeader title={t('Abonnements')} subtitle={t('Vos logiciels ATHANA, par entreprise. La résiliation prend effet à la fin de la période payée.')} />
      {sp.activated && <><TrackEvent event="subscribe" params={{ step: 'activated' }} onceKey="sub-activated" /><p className="alert alert-ok mb-4">{t('Votre abonnement est activé. Merci !')}</p></>}
      {sp.failed && <p className="alert alert-danger mb-4">{t('Le paiement n’a pas abouti. Aucun montant n’a été débité.')}</p>}
      {env.paymentsMode === 'test' && <p className="alert alert-warn mb-4">{t('Mode test : les paiements d’abonnement sont simulés, aucun débit réel.')}</p>}

      <div className="space-y-4">
        {subs.length === 0 && <Empty title={t('Aucun abonnement pour le moment.')} />}
        {subs.map(({ s, org, canManage }) => (
          <Card key={s.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{s.saasProduct.name} <span className="muted font-sans text-base font-normal">· {s.plan.name}</span></h2>
                <p className="muted text-sm">{org.name} · {formatMoney(subscriptionAmount(s.plan, s.currency, s.seats), s.currency, locale)} {t('/ mois')}</p>
                <p className="mt-2 text-sm text-fg-soft">
                  {s.status === 'TRIALING' && t('Essai gratuit jusqu’au {date}', { date: formatDate(s.currentPeriodEnd, locale) })}
                  {s.status === 'ACTIVE' && (s.cancelAtPeriodEnd ? t('Résiliation programmée : accès jusqu’au {date}', { date: formatDate(s.currentPeriodEnd, locale) }) : t('Prochain renouvellement le {date}', { date: formatDate(s.currentPeriodEnd, locale) }))}
                  {s.status === 'PAST_DUE' && t('Le dernier paiement a échoué. Régularisez pour éviter l’interruption du service.')}
                  {s.status === 'CANCELED' && t('Résilié le {date}', { date: formatDate(s.canceledAt ?? s.updatedAt, locale) })}
                </p>
              </div>
              <SubBadge status={s.status} t={t} />
            </div>
            <div className="mt-4 flex flex-wrap items-start gap-2">
              {s.status !== 'CANCELED' && <a className="btn btn-secondary btn-sm" href={localePath(locale, `/app/${s.saasProductKey}`)}>{t('Ouvrir {name}', { name: s.saasProduct.name })}</a>}
              {canManage && <SubscriptionActions sub={{ id: s.id, status: s.status, cancelAtPeriodEnd: s.cancelAtPeriodEnd, planId: s.planId, hasProvider: !!s.providerSubId }}
                plans={(products.find((pr) => pr.key === s.saasProductKey)?.plans ?? []).filter((pl) => priceFor(pl.prices, s.currency) !== null).map((pl) => ({ value: pl.id, label: `${pl.name} — ${formatMoney(priceFor(pl.prices, s.currency)!, s.currency, locale)}` }))} />}
            </div>
          </Card>
        ))}
      </div>

      <h2 className="mb-4 mt-10 text-xl font-semibold">{t('Démarrer un nouveau logiciel')}</h2>
      {adminOrgs.length === 0 ? (
        <p className="alert alert-info">{t('Créez d’abord une entreprise pour démarrer un essai.')} <a className="underline" href={localePath(locale, '/account/companies')}>{t('Créer une entreprise')}</a></p>
      ) : products.map((pr) => {
        const free = adminOrgs.filter((o) => !o.subscriptions.some((s) => s.saasProductKey === pr.key));
        return (
          <section key={pr.key} id={pr.key} className={`panel mb-5 p-5 ${sp.product === pr.key ? 'border-accent-500!' : ''}`}>
            <h3 className="text-lg font-semibold">{pr.name}</h3>
            <p className="muted mb-4 text-sm">{L(pr.tagline, locale)}</p>
            {free.length === 0 ? <p className="muted text-sm">{t('Toutes vos entreprises utilisent déjà ce logiciel.')}</p> : (
              <div className="grid gap-4 md:grid-cols-3">
                {pr.plans.map((pl) => {
                  const price = priceFor(pl.prices, currency);
                  if (price === null) return null;
                  return (
                    <div key={pl.id} className="rounded-xl border border-line p-4">
                      <p className="font-display text-lg font-semibold">{pl.name}</p>
                      <p className="mt-1"><span className="font-display text-2xl font-semibold">{formatMoney(price, currency, locale)}</span> <span className="muted text-sm">{t('/ mois')}</span></p>
                      <ul className="muted my-3 space-y-1 text-sm">{(pl.highlights as unknown[]).map((h) => <li key={L(h, locale)}>· {L(h, locale)}</li>)}</ul>
                      <div className="space-y-2">
                        {free.map((o) => <TrialButton key={o.id} organizationId={o.id} planId={pl.id} label={free.length > 1 ? t('Essai gratuit — {org}', { org: o.name }) : t('Essai gratuit de {n} jours', { n: pl.trialDays })} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
