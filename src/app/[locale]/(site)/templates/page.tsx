import { assertLocale, getT, L } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { getMarket } from '@/lib/settings';
import { pageMeta, Breadcrumbs, JsonLd } from '@/lib/seo';
import { env } from '@/lib/env';
import { listCategories, listProducts } from '@/modules/catalog/service';
import { ProductCard } from '@/components/site/ProductCard';
import { PageHero, CtaBand } from '@/components/site/Section';
import { Empty } from '@/components/ui';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ category?: string; q?: string }> };

export async function generateMetadata({ params, searchParams }: Props) {
  const locale = assertLocale((await params).locale);
  const t = await getT(locale);
  const { category, q } = await searchParams;
  return pageMeta(locale, '/templates', t('Modèles de sites web professionnels à personnaliser'), t('Catalogue de modèles de sites : restaurant, clinique, immobilier, e-commerce, portfolio… Démonstration en ligne, prix clair, livraison rapide.'), { noindex: !!(category || q) });
}

export default async function TemplatesPage({ params, searchParams }: Props) {
  const locale = assertLocale((await params).locale);
  const { category, q } = await searchParams;
  const t = await getT(locale);
  const [market, categories, products] = await Promise.all([getMarket(locale), listCategories(), listProducts({ category, q })]);
  const currency = market?.currency ?? 'CHF';
  const base = localePath(locale, '/templates');
  return (
    <>
      <PageHero eyebrow="ATHANA Web" title={t('Choisissez le modèle de votre futur site')} lead={t('Chaque modèle est une base professionnelle que nous adaptons à votre marque. Testez la démonstration, choisissez votre pack, commandez en ligne.')} />
      <div className="container-page py-10">
        <Breadcrumbs locale={locale} items={[[t('Accueil'), '/'], [t('Modèles de sites'), '/templates']]} />
        <form method="get" action={base} className="mb-6 flex max-w-md gap-2" role="search">
          {category && <input type="hidden" name="category" value={category} />}
          <label className="sr-only" htmlFor="q">{t('Rechercher un modèle')}</label>
          <input id="q" name="q" defaultValue={q} placeholder={t('Rechercher un modèle')} className="input" />
          <button className="btn btn-outline" type="submit">{t('Rechercher')}</button>
        </form>
        <nav aria-label={t('Catégories')} className="mb-8 flex flex-wrap gap-2">
          <a href={base} className={`badge px-3 py-1.5 no-underline ${!category ? 'badge-gold' : ''}`} aria-current={!category ? 'page' : undefined}>{t('Tous')}</a>
          {categories.map((c) => (
            <a key={c.id} href={`${base}?category=${c.slug}`} className={`badge px-3 py-1.5 no-underline ${category === c.slug ? 'badge-gold' : ''}`} aria-current={category === c.slug ? 'page' : undefined}>{L(c.name, locale)}</a>
          ))}
        </nav>
        {products.length === 0 ? (
          <Empty title={t('Aucun modèle ne correspond à votre recherche.')}><a className="btn btn-outline btn-sm" href={base}>{t('Voir tous les modèles')}</a></Empty>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((prod, i) => <ProductCard key={prod.id} product={prod} locale={locale} currency={currency} t={t} priority={i < 3} />)}
          </div>
        )}
      </div>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: products.map((prod, i) => ({ '@type': 'ListItem', position: i + 1, url: env.appUrl + localePath(locale, `/templates/${prod.slug}`), name: prod.name })) }} />
      <CtaBand title={t('Vous ne trouvez pas le modèle idéal ?')} lead={t('Nous concevons aussi des sites et des applications entièrement sur mesure.')}>
        <a className="btn btn-primary btn-lg" href={localePath(locale, '/quote')}>{t('Demander un devis')}</a>
      </CtaBand>
    </>
  );
}
