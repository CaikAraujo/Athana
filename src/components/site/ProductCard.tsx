import Image from 'next/image';
import type { Category, Product } from '@prisma/client';
import { localePath, type Locale } from '@/i18n/config';
import { L } from '@/i18n/server';
import { formatMoney, type TFn } from '@/i18n/translate';
import { priceFor } from '@/lib/money';

export function ProductCard({ product, locale, currency, t, priority }: { product: Product & { category: Category }; locale: Locale; currency: string; t: TFn; priority?: boolean }) {
  const price = priceFor(product.startingPrices, currency);
  // Tall capture of the demo (scrolls on hover) when the cover comes from the generated catalogue images.
  const preview = product.coverImage?.startsWith('/images/catalog/') ? product.coverImage.replace(/cover\.jpg$/, 'full.jpg') : product.coverImage;
  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      <a href={localePath(locale, `/templates/${product.slug}`)} className="scroll-preview relative block aspect-[4/3] overflow-hidden border-b border-line bg-ink-800" aria-label={product.name}>
        {preview && <Image src={preview} alt={t('Aperçu du modèle {name}', { name: product.name })} fill sizes="(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw" className="object-cover" priority={priority} />}
      </a>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="badge">{L(product.category.name, locale)}</span>
          {price !== null && <span className="text-sm text-fg-soft">{t('dès')} <strong className="text-fg">{formatMoney(price, currency, locale)}</strong></span>}
        </div>
        <h3 className="mt-3 text-xl font-semibold"><a className="no-underline hover:text-accent-700" href={localePath(locale, `/templates/${product.slug}`)}>{product.name}</a></h3>
        <p className="muted mt-1.5 flex-1 text-sm">{L(product.tagline, locale)}</p>
        <div className="mt-5 flex gap-2">
          <a className="btn btn-primary btn-sm flex-1" href={localePath(locale, `/templates/${product.slug}`)}>{t('Voir le modèle')}</a>
          {product.demoSlug && <a className="btn btn-outline btn-sm" href={`/demo/${product.demoSlug}`} target="_blank" rel="noopener">{t('Démo')}</a>}
        </div>
      </div>
    </article>
  );
}
