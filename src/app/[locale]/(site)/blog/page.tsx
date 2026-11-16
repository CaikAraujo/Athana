import { db } from '@/lib/db';
import { assertLocale, getT, lang } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDate } from '@/i18n/translate';
import { pageMeta, Breadcrumbs } from '@/lib/seo';
import { PageHero } from '@/components/site/Section';
import { Empty } from '@/components/ui';

/** fr-ch and fr-fr share French articles; each Portuguese variant has its own. */
export const blogLanguage = (l: ReturnType<typeof lang>) => (l === 'fr-FR' ? 'fr' : l);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const t = await getT(locale);
  return pageMeta(locale, '/blog', t('Blog — conseils web, e-commerce et logiciels'), t('Conseils pratiques pour créer un site internet, vendre en ligne et choisir vos logiciels de gestion.'));
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const t = await getT(locale);
  const posts = await db.blogPost.findMany({ where: { status: 'PUBLISHED', language: blogLanguage(lang(locale)) }, orderBy: { publishedAt: 'desc' } });
  return (
    <>
      <PageHero eyebrow="Blog" title={t('Conseils pour votre présence en ligne')} />
      <div className="container-page py-10">
        <Breadcrumbs locale={locale} items={[[t('Accueil'), '/'], ['Blog', '/blog']]} />
        {posts.length === 0 ? <Empty title={t('Les premiers articles arrivent bientôt.')} /> : (
          <div className="grid gap-5 md:grid-cols-2">
            {posts.map((p) => (
              <article key={p.id} className="card card-hover card-pad">
                <p className="muted text-xs">{p.publishedAt && formatDate(p.publishedAt, locale, { dateStyle: 'long' })}</p>
                <h2 className="mt-2 text-xl font-semibold"><a className="no-underline hover:text-gold-300" href={localePath(locale, `/blog/${p.slug}`)}>{p.title}</a></h2>
                <p className="muted mt-2 text-sm">{p.excerpt}</p>
                <a className="mt-4 inline-block text-sm font-semibold text-gold-300 hover:underline" href={localePath(locale, `/blog/${p.slug}`)}>{t('Lire l’article')} →</a>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
