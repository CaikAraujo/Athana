import type { Metadata } from 'next';
import { env } from './env';
import { LOCALES, LOCALE_META, DEFAULT_LOCALE, localePath, type Locale } from '@/i18n/config';

/**
 * Metadata for a localised page: canonical, hreflang alternates for every market, Open Graph and Twitter.
 * `locales` restricts alternates when a page only exists in some languages (e.g. blog articles).
 */
export function pageMeta(locale: Locale, path: string, title: string, description: string, opts: { image?: string; noindex?: boolean; alternates?: Partial<Record<Locale, string>>; type?: 'website' | 'article' } = {}): Metadata {
  const url = env.appUrl + localePath(locale, path);
  const languages: Record<string, string> = {};
  if (opts.alternates) {
    for (const [l, p] of Object.entries(opts.alternates)) languages[LOCALE_META[l as Locale].hreflang] = env.appUrl + localePath(l as Locale, p!);
  } else {
    for (const l of LOCALES) languages[LOCALE_META[l].hreflang] = env.appUrl + localePath(l, path);
    languages['x-default'] = env.appUrl + localePath(DEFAULT_LOCALE, path);
  }
  const image = opts.image ? (opts.image.startsWith('http') ? opts.image : env.appUrl + opts.image) : `${env.appUrl}/images/og-default.png`;
  return {
    title, description,
    alternates: { canonical: url, languages },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
    openGraph: { title, description, url, type: opts.type ?? 'website', images: [{ url: image }], siteName: 'ATHANA', locale: LOCALE_META[locale].intl.replace('-', '_') },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

/** JSON-LD script tag. Content is serialised with "<" escaped so it cannot break out of the script element. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}

export function breadcrumbLd(locale: Locale, items: [string, string][]) {
  return {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: env.appUrl + localePath(locale, path) })),
  };
}

export function Breadcrumbs({ locale, items }: { locale: Locale; items: [string, string][] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="muted mb-6 text-sm">
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map(([name, path], i) => (
            <li key={path} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>/</span>}
              {i < items.length - 1 ? <a className="no-underline hover:text-gold-300" href={localePath(locale, path)}>{name}</a> : <span aria-current="page" className="text-fg-soft">{name}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(locale, items)} />
    </>
  );
}
