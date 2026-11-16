import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { LOCALES, LOCALE_META, localePath } from '@/i18n/config';

export const dynamic = 'force-dynamic';

const STATIC = ['/', '/templates', '/websites', '/ecommerce', '/software', '/software/crm', '/software/pointage', '/automation', '/custom', '/work', '/contact', '/quote', '/blog', '/legal/mentions-legales', '/legal/confidentialite', '/legal/cgv', '/legal/cookies'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([
    db.product.findMany({ where: { status: 'PUBLISHED', deletedAt: null }, select: { slug: true, updatedAt: true } }),
    db.blogPost.findMany({ where: { status: 'PUBLISHED' }, select: { slug: true, language: true, updatedAt: true } }),
  ]).catch(() => [[], []] as const);
  const abs = (l: (typeof LOCALES)[number], p: string) => env.appUrl + localePath(l, p);
  const entry = (path: string, lastModified?: Date, priority = 0.7) => LOCALES.map((l) => ({
    url: abs(l, path), lastModified, priority,
    alternates: { languages: Object.fromEntries(LOCALES.map((x) => [LOCALE_META[x].hreflang, abs(x, path)])) },
  }));
  return [
    ...STATIC.flatMap((p) => entry(p, undefined, p === '/' ? 1 : 0.8)),
    ...products.flatMap((p) => entry(`/templates/${p.slug}`, p.updatedAt, 0.9)),
    ...posts.flatMap((p) => LOCALES.filter((l) => { const lg = LOCALE_META[l].language; return (lg === 'fr-FR' ? 'fr' : lg) === p.language; }).map((l) => ({ url: abs(l, `/blog/${p.slug}`), lastModified: p.updatedAt, priority: 0.6 }))),
  ];
}
