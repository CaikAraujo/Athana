import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ExternalLink, Clock, Languages, Layers } from 'lucide-react';
import { assertLocale, getT, L } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatMoney } from '@/i18n/translate';
import { getMarket } from '@/lib/settings';
import { priceFor } from '@/lib/money';
import { env } from '@/lib/env';
import { pageMeta, Breadcrumbs, JsonLd } from '@/lib/seo';
import { getProduct, listGlobalAddons } from '@/modules/catalog/service';
import { Configurator } from '@/components/site/Configurator';
import { DemoPreview } from '@/components/site/DemoPreview';
import { BrowserFrame } from '@/components/site/Showcase';
import { ProductCard } from '@/components/site/ProductCard';
import { FaqList } from '@/components/site/Section';
import { TrackEvent } from '@/components/site/Consent';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: l, slug } = await params;
  const locale = assertLocale(l);
  const product = await getProduct(slug);
  if (!product) return {};
  const t = await getT(locale);
  return pageMeta(locale, `/templates/${slug}`,
    L(product.seoTitle, locale) || t('{name} — modèle de site {category}', { name: product.name, category: L(product.category.name, locale).toLowerCase() }),
    L(product.seoDescription, locale) || L(product.tagline, locale), { image: product.coverImage ?? undefined });
}

export default async function ProductPage({ params }: Props) {
  const { locale: l, slug } = await params;
  const locale = assertLocale(l);
  const product = await getProduct(slug);
  if (!product) notFound();
  const t = await getT(locale);
  const [market, globals] = await Promise.all([getMarket(locale), listGlobalAddons()]);
  const currency = market?.currency ?? 'CHF';
  const packages = product.packages.flatMap((p) => {
    const price = priceFor(p.prices, currency);
    return price === null ? [] : [{ id: p.id, tier: p.tier, name: L(p.name, locale), description: L(p.description, locale), features: (p.features as unknown[]).map((f) => L(f, locale)), price, deliveryDays: p.deliveryDays, pagesIncluded: p.pagesIncluded, revisions: p.revisions }];
  });
  const addons = [...new Map([...globals, ...product.addons].map((a) => [a.id, a])).values()].flatMap((a) => {
    const price = priceFor(a.prices, currency);
    return price === null ? [] : [{ id: a.id, name: L(a.name, locale), description: L(a.description, locale), price }];
  });
  const from = packages.length ? Math.min(...packages.map((p) => p.price)) : null;
  const demo = product.demoSlug ? `/demo/${product.demoSlug}` : product.demoUrl;
  const faq = (product.faq as { q: unknown; a: unknown }[]).map((f) => ({ q: L(f.q, locale), a: L(f.a, locale) }));
  const features = (product.features as unknown[]).map((f) => L(f, locale));
  const langNames: Record<string, string> = { fr: t('Français'), pt: t('Portugais'), en: t('Anglais'), de: t('Allemand'), it: t('Italien'), es: t('Espagnol') };

  return (
    <div className="container-page py-10">
      <Breadcrumbs locale={locale} items={[[t('Accueil'), '/'], [t('Modèles de sites'), '/templates'], [product.name, `/templates/${product.slug}`]]} />
      <TrackEvent event="view_item" params={{ item_id: product.id, item_name: product.name, currency, value: from ? from / 100 : undefined }} />
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: L(product.description, locale), category: L(product.category.name, locale),
        image: [product.coverImage, ...product.gallery].filter(Boolean).map((i) => env.appUrl + i), brand: { '@type': 'Brand', name: 'ATHANA' }, sku: product.slug,
        ...(packages.length ? { offers: { '@type': 'AggregateOffer', priceCurrency: currency, lowPrice: (Math.min(...packages.map((p) => p.price)) / 100).toFixed(2), highPrice: (Math.max(...packages.map((p) => p.price)) / 100).toFixed(2), offerCount: packages.length, availability: 'https://schema.org/InStock', url: env.appUrl + localePath(locale, `/templates/${product.slug}`) } } : {}),
      }} />

      <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-start">
        <div>
          {product.coverImage && <BrowserFrame src={product.coverImage} alt={t('Aperçu du modèle {name}', { name: product.name })} priority />}
          {product.gallery.length > 0 && (
            <ul className="mt-3 grid grid-cols-3 gap-3" aria-label={t('Galerie')}>
              {product.gallery.map((g, i) => (
                <li key={g}><a href={g} target="_blank" rel="noopener" className="card relative block aspect-[16/10] overflow-hidden"><Image src={g} alt={t('{name} — capture {n}', { name: product.name, n: i + 1 })} fill sizes="220px" className="object-cover object-top transition-transform hover:scale-105" /></a></li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <span className="badge badge-gold">{L(product.category.name, locale)}</span>
          <h1 className="mt-3 text-4xl font-semibold md:text-5xl">{product.name}</h1>
          <p className="lead mt-3">{L(product.tagline, locale)}</p>
          {from !== null && <p className="mt-5 text-fg-soft">{t('À partir de')} <strong className="font-display text-3xl text-fg">{formatMoney(from, currency, locale)}</strong></p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#configurer" className="btn btn-primary btn-lg">{t('Acheter maintenant')}</a>
            {demo && <a href={demo} target="_blank" rel="noopener" className="btn btn-outline btn-lg">{t('Démonstration en direct')} <ExternalLink size={16} aria-hidden /></a>}
          </div>
          <dl className="mt-8 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div className="panel p-4"><dt className="muted flex items-center gap-2"><Clock size={15} aria-hidden />{t('Délai estimé')}</dt><dd className="mt-1 font-medium">{t('dès {n} jours ouvrés', { n: product.deliveryDays })}</dd></div>
            <div className="panel p-4"><dt className="muted flex items-center gap-2"><Languages size={15} aria-hidden />{t('Langues')}</dt><dd className="mt-1 font-medium">{product.languages.map((x) => langNames[x] ?? x).join(', ')}</dd></div>
            <div className="panel p-4"><dt className="muted flex items-center gap-2"><Layers size={15} aria-hidden />{t('Technologies')}</dt><dd className="mt-1 font-medium">{product.technologies.join(', ')}</dd></div>
          </dl>
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.25fr_1fr]">
        <section>
          <h2 className="text-2xl font-semibold">{t('Description')}</h2>
          <p className="mt-3 text-fg-soft">{L(product.description, locale)}</p>
          <p className="muted mt-4 text-sm">{t('La démonstration utilise un contenu fictif. Votre site est réalisé avec vos textes, vos images et votre identité.')}</p>
        </section>
        <section>
          <h2 className="text-2xl font-semibold">{t('Fonctionnalités')}</h2>
          <ul className="mt-3 space-y-2 text-fg-soft">{features.map((f) => <li key={f} className="flex gap-3"><span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-600" />{f}</li>)}</ul>
        </section>
      </div>

      {demo && product.demoSlug && (
        <section className="mt-14">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold">{t('Démonstration en direct')}</h2>
            <a href={demo} target="_blank" rel="noopener" className="btn btn-outline btn-sm">{t('Ouvrir en plein écran')} <ExternalLink size={14} aria-hidden /></a>
          </div>
          <DemoPreview src={`${demo}?embed=1`} title={t('Démonstration du modèle {name}', { name: product.name })} />
        </section>
      )}

      <section className="mt-14 scroll-mt-24">
        <h2 className="mb-6 text-2xl font-semibold">{t('Configurez votre commande')}</h2>
        <Configurator productId={product.id} productName={product.name} currency={currency} packages={packages} addons={addons} />
      </section>

      {faq.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-center text-2xl font-semibold">{t('Questions fréquentes')}</h2>
          <FaqList items={faq} />
        </section>
      )}

      {product.related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold">{t('Modèles similaires')}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{product.related.map((r) => <ProductCard key={r.id} product={r} locale={locale} currency={currency} t={t} />)}</div>
        </section>
      )}
    </div>
  );
}
