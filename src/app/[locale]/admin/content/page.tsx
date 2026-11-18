import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { requireStaff } from '@/modules/auth/session';
import { PageHeader } from '@/components/ui';

export default async function ContentHub({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'content.manage');
  const t = await getT(locale);
  const [pages, posts, faqs, banners, testimonials, overrides] = await Promise.all([db.contentPage.count(), db.blogPost.count(), db.faq.count(), db.banner.count({ where: { active: true } }), db.testimonial.count({ where: { published: true } }), db.translationOverride.count()]);
  const cards: [string, string, string, string][] = [
    ['/admin/content/pages', t('Pages légales'), t('Mentions légales, confidentialité, CGV, cookies.'), t('{n} version(s)', { n: pages })],
    ['/admin/content/blog', t('Blog'), t('Articles par langue, statut et SEO.'), t('{n} article(s)', { n: posts })],
    ['/admin/content/faq', t('FAQ'), t('Questions fréquentes affichées sur le site.'), t('{n} question(s)', { n: faqs })],
    ['/admin/content/banners', t('Bannières'), t('Bandeau promotionnel en haut du site.'), t('{n} active(s)', { n: banners })],
    ['/admin/content/testimonials', t('Témoignages'), t('Uniquement des témoignages réels de clients.'), t('{n} publié(s)', { n: testimonials })],
    ['/admin/content/translations', t('Traductions'), t('Corriger un texte de l’interface dans une langue.'), t('{n} correction(s)', { n: overrides })],
  ];
  return (
    <>
      <PageHeader title={t('Contenu')} subtitle={t('Les fiches produits et leur SEO se gèrent dans Catalogue → Produits.')} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([href, title, text, count]) => <a key={href} href={localePath(locale, href)} className="panel card-hover block p-5 no-underline"><h2 className="text-lg font-semibold">{title}</h2><p className="muted mt-1 text-sm">{text}</p><p className="mt-3 text-sm text-accent-700">{count}</p></a>)}
      </div>
    </>
  );
}
