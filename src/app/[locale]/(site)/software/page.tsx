import { db } from '@/lib/db';
import { assertLocale, getT, L } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatMoney } from '@/i18n/translate';
import { getMarket } from '@/lib/settings';
import { priceFor } from '@/lib/money';
import { pageMeta, Breadcrumbs } from '@/lib/seo';
import { PageHero, CtaBand } from '@/components/site/Section';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const t = await getT(locale);
  return pageMeta(locale, '/software', t('Logiciels de gestion pour PME : CRM et pointage'), t('ATHANA Software : un CRM simple et un logiciel de pointage en abonnement mensuel, avec essai gratuit. Hébergés, sécurisés, sans installation.'));
}

export default async function SoftwarePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const t = await getT(locale);
  const currency = (await getMarket(locale))?.currency ?? 'EUR';
  const products = await db.saasProduct.findMany({ where: { status: { not: 'HIDDEN' } }, orderBy: { sortOrder: 'asc' }, include: { plans: { where: { active: true }, orderBy: { sortOrder: 'asc' } } } });
  const active = products.filter((x) => x.status === 'ACTIVE');
  const soon = products.filter((x) => x.status === 'COMING_SOON');
  return (
    <>
      <PageHero eyebrow="ATHANA Software" title={t('Des logiciels de gestion simples, en abonnement')} lead={t('Un seul compte, une facturation claire, vos données séparées de celles des autres entreprises. Essayez gratuitement, résiliez quand vous voulez.')} />
      <div className="container-page py-10">
        <Breadcrumbs locale={locale} items={[[t('Accueil'), '/'], [t('Logiciels'), '/software']]} />
        <div className="grid gap-6 lg:grid-cols-2">
          {active.map((s) => {
            const from = s.plans.map((pl) => priceFor(pl.prices, currency)).filter((x): x is number => x !== null);
            return (
              <article key={s.key} className="card card-pad flex flex-col">
                <h2 className="text-2xl font-medium">{s.name}</h2>
                <p className="lead mt-2">{L(s.tagline, locale)}</p>
                <p className="muted mt-3 flex-1">{L(s.description, locale)}</p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  {from.length > 0 && <p className="text-fg-soft">{t('dès')} <strong className="font-display text-2xl text-fg">{formatMoney(Math.min(...from), currency, locale)}</strong> {t('/ mois')}</p>}
                  <a className="btn btn-primary" href={localePath(locale, `/software/${s.key}`)}>{t('Découvrir et essayer')}</a>
                </div>
              </article>
            );
          })}
        </div>
        {soon.length > 0 && (
          <section className="mt-14">
            <p className="text-sm text-fg-muted">{t('Prochainement')} : {soon.map((x) => x.name).join(' · ')}. <a className="link text-fg" href={localePath(locale, '/contact')}>{t('Être prévenu du lancement')}</a></p>
          </section>
        )}
      </div>
      <CtaBand title={t('Besoin d’un logiciel qui n’existe pas encore ?')} lead={t('Nous développons aussi des applications sur mesure pour vos processus.')}><a className="btn btn-primary btn-lg" href={localePath(locale, '/custom')}>{t('Développement sur mesure')}</a></CtaBand>
    </>
  );
}
