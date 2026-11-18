import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { assertLocale, getT, lang } from '@/i18n/server';
import { LOCALES, LOCALE_META, localePath, type Locale } from '@/i18n/config';
import { formatDate } from '@/i18n/translate';
import { pageMeta, Breadcrumbs, JsonLd } from '@/lib/seo';
import { Markdown } from '@/lib/markdown';
import { CtaBand } from '@/components/site/Section';
import { blogLanguage } from '../page';

type Props = { params: Promise<{ locale: string; slug: string }> };
const find = (locale: Locale, slug: string) => db.blogPost.findFirst({ where: { slug, status: 'PUBLISHED', language: blogLanguage(lang(locale)) } });

export async function generateMetadata({ params }: Props) {
  const { locale: l, slug } = await params;
  const locale = assertLocale(l);
  const post = await find(locale, slug);
  if (!post) return {};
  // hreflang only points to locales where a translation of this article really exists.
  const alternates: Partial<Record<Locale, string>> = {};
  const siblings = post.translationKey ? await db.blogPost.findMany({ where: { translationKey: post.translationKey, status: 'PUBLISHED' } }) : [post];
  for (const loc of LOCALES) { const s = siblings.find((x) => x.language === blogLanguage(LOCALE_META[loc].language)); if (s) alternates[loc] = `/blog/${s.slug}`; }
  return pageMeta(locale, `/blog/${post.slug}`, post.seoTitle || post.title, post.seoDescription || post.excerpt, { alternates, type: 'article' });
}

export default async function BlogPostPage({ params }: Props) {
  const { locale: l, slug } = await params;
  const locale = assertLocale(l);
  const post = await find(locale, slug);
  if (!post) notFound();
  const t = await getT(locale);
  return (
    <>
      <article className="container-page max-w-3xl py-12">
        <Breadcrumbs locale={locale} items={[[t('Accueil'), '/'], ['Blog', '/blog'], [post.title, `/blog/${post.slug}`]]} />
        <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.excerpt, datePublished: post.publishedAt?.toISOString(), dateModified: post.updatedAt.toISOString(), inLanguage: LOCALE_META[locale].hreflang, author: { '@type': 'Organization', name: 'ATHANA' }, publisher: { '@type': 'Organization', name: 'ATHANA' }, mainEntityOfPage: env.appUrl + localePath(locale, `/blog/${post.slug}`) }} />
        <p className="muted text-sm">{post.publishedAt && formatDate(post.publishedAt, locale, { dateStyle: 'long' })}</p>
        <h1 className="mt-2 text-4xl font-normal md:text-5xl">{post.title}</h1>
        <p className="lead mb-8 mt-4">{post.excerpt}</p>
        <Markdown source={post.body} />
      </article>
      <CtaBand title={t('Prêt à lancer votre projet ?')}><a className="btn btn-primary btn-lg" href={localePath(locale, '/templates')}>{t('Voir les modèles')}</a><a className="btn btn-outline btn-lg" href={localePath(locale, '/quote')}>{t('Demander un devis')}</a></CtaBand>
    </>
  );
}
