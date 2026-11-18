import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import { db } from '@/lib/db';
import { assertLocale, getT, L } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatMoney } from '@/i18n/translate';
import { getMarket } from '@/lib/settings';
import { priceFor } from '@/lib/money';
import { env } from '@/lib/env';
import { pageMeta, Breadcrumbs, JsonLd } from '@/lib/seo';
import { saasCopy } from '@/modules/content/saas-copy';
import { PageHero, Section, FaqList, CtaBand } from '@/components/site/Section';
import { BrowserFrame, PhoneFrame } from '@/components/site/Showcase';

type Props = { params: Promise<{ locale: string; key: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: l, key } = await params;
  const locale = assertLocale(l);
  const copy = saasCopy(key, await getT(locale));
  return copy ? pageMeta(locale, `/software/${key}`, copy.metaTitle, copy.metaDescription) : {};
}

export default async function SaasProductPage({ params }: Props) {
  const { locale: l, key } = await params;
  const locale = assertLocale(l);
  const t = await getT(locale);
  const copy = saasCopy(key, t);
  const product = await db.saasProduct.findFirst({ where: { key, status: 'ACTIVE' }, include: { plans: { where: { active: true }, orderBy: { sortOrder: 'asc' } } } });
  if (!product || !copy) notFound();
  const currency = (await getMarket(locale))?.currency ?? 'EUR';
  const plans = product.plans.flatMap((pl) => { const price = priceFor(pl.prices, currency); return price === null ? [] : [{ ...pl, price, seat: priceFor(pl.seatPrices, currency) }]; });
  const faqs = await db.faq.findMany({ where: { scope: key, published: true }, orderBy: { sortOrder: 'asc' } });
  const shots: [string, string][] = key === 'crm'
    ? [['crm-pipeline', t('Pipeline de vente par étape')], ['crm-contacts', t('Contacts, avec recherche et filtres')]]
    : [['pointage-team', t('Statut de l’équipe en temps réel')], ['pointage-reports', t('Historique et heures par semaine')]];
  const start = localePath(locale, `/account/subscriptions?product=${key}`);
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: product.name, applicationCategory: 'BusinessApplication', operatingSystem: 'Web', description: L(product.description, locale), url: env.appUrl + localePath(locale, `/software/${key}`), ...(plans.length ? { offers: { '@type': 'AggregateOffer', priceCurrency: currency, lowPrice: (Math.min(...plans.map((x) => x.price)) / 100).toFixed(2), highPrice: (Math.max(...plans.map((x) => x.price)) / 100).toFixed(2), offerCount: plans.length } } : {}) }} />
      <PageHero eyebrow="ATHANA Software" title={product.name} lead={L(product.tagline, locale)}>
        <a className="btn btn-primary btn-lg" href={start}>{t('Commencer l’essai gratuit')}</a>
        <a className="btn btn-outline btn-lg" href="#tarifs">{t('Voir les tarifs')}</a>
      </PageHero>
      <div className="container-page pt-8">
        <Breadcrumbs locale={locale} items={[[t('Accueil'), '/'], [t('Logiciels'), '/software'], [product.name, `/software/${key}`]]} />
        <figure>
          {key === 'pointage' ? (
            <div className="relative flex items-end justify-center">
              <BrowserFrame src="/images/software/pointage-team.png" alt={t('Écran de {name}', { name: product.name })} priority ratio="16/10" sizes="(min-width:1024px) 1100px, 100vw" className="w-full" />
              <PhoneFrame src="/images/software/pointage-mobile.png" alt={t('{name} sur mobile', { name: product.name })} className="-ml-40 mb-[-24px] hidden md:block" />
            </div>
          ) : <BrowserFrame src={`/images/software/${key}-dashboard.png`} alt={t('Écran de {name}', { name: product.name })} priority ratio="16/10" sizes="(min-width:1024px) 1100px, 100vw" />}
        </figure>
      </div>
      <Section title={t('Fonctionnalités')} lead={L(product.description, locale)}>
        <div className="grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">{copy.features.map(([title, text], i) => <div key={title} className=""><span className="num text-sm">{String(i + 1).padStart(2, '0')}</span><h3 className="mt-2 text-xl font-medium">{title}</h3><p className="muted mt-2 text-[0.98rem]">{text}</p></div>)}</div>
        {'note' in copy && copy.note && <p className="alert alert-info mt-6 text-sm">{copy.note}</p>}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {shots.map(([file, caption]) => (
            <figure key={file}><BrowserFrame src={`/images/software/${file}.png`} alt={caption} sizes="(min-width:768px) 560px, 100vw" /></figure>
          ))}
        </div>
      </Section>
      <Section id="tarifs" title={t('Tarifs')} lead={t('Sans engagement. Résiliable à tout moment depuis votre espace client.')} className="bg-ink-900">
        {plans.length === 0 ? <p className="alert alert-warn max-w-xl">{t('Ce logiciel n’est pas encore proposé dans votre devise.')}</p> : (
          <div className="grid gap-5 lg:grid-cols-3">
            {plans.map((pl, i) => (
              <article key={pl.id} className={`card card-pad flex flex-col ${i === 1 ? 'ring-2 ring-accent-600' : ''}`}>
                {i === 1 && <span className="badge badge-gold mb-3 self-start">{t('Le plus choisi')}</span>}
                <h3 className="text-xl font-medium">{pl.name}</h3>
                <p className="mt-3"><span className="font-display text-4xl font-normal">{formatMoney(pl.price, currency, locale)}</span> <span className="muted">{t('/ mois')}</span></p>
                {pl.seat !== null && pl.seat > 0 && <p className="muted mt-1 text-sm">{t('+ {price} par employé supplémentaire', { price: formatMoney(pl.seat, currency, locale) })}</p>}
                <ul className="my-6 flex-1 space-y-2 text-sm text-fg-soft">{(pl.highlights as unknown[]).map((h) => <li key={L(h, locale)} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-accent-600" aria-hidden />{L(h, locale)}</li>)}</ul>
                <a className={`btn ${i === 1 ? 'btn-primary' : 'btn-outline'} btn-block`} href={start}>{pl.trialDays > 0 ? t('Essai gratuit de {n} jours', { n: pl.trialDays }) : t('Commencer')}</a>
              </article>
            ))}
          </div>
        )}
        <p className="muted mt-6 text-sm">{t('Prix hors taxes éventuelles, affichées avant le paiement.')}</p>
      </Section>
      {faqs.length > 0 && <Section title={t('Questions fréquentes')}><FaqList items={faqs.map((f) => ({ q: L(f.question, locale), a: L(f.answer, locale) }))} /></Section>}
      <CtaBand title={t('Essayez {name} gratuitement', { name: product.name })} lead={t('Créez votre compte, ajoutez votre entreprise et commencez en quelques minutes. Aucune carte bancaire requise pour l’essai.')}><a className="btn btn-primary btn-lg" href={start}>{t('Commencer l’essai gratuit')}</a><a className="btn btn-outline btn-lg" href={localePath(locale, '/contact')}>{t('Poser une question')}</a></CtaBand>
    </>
  );
}
