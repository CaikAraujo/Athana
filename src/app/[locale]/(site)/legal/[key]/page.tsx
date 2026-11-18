import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { assertLocale, getT, lang } from '@/i18n/server';
import { formatDate } from '@/i18n/translate';
import { getSetting } from '@/lib/settings';
import { pageMeta, Breadcrumbs } from '@/lib/seo';
import { Markdown } from '@/lib/markdown';

type Props = { params: Promise<{ locale: string; key: string }> };
async function load(locale: Parameters<typeof lang>[0], key: string) {
  const l = lang(locale);
  const pages = await db.contentPage.findMany({ where: { key, language: { in: [l, l === 'fr-FR' ? 'fr' : l, 'fr'] } } });
  return pages.find((p) => p.language === l) ?? pages.find((p) => p.language !== 'fr') ?? pages[0] ?? null;
}

export async function generateMetadata({ params }: Props) {
  const { locale: l, key } = await params;
  const locale = assertLocale(l);
  const page = await load(locale, key);
  return page ? pageMeta(locale, `/legal/${key}`, page.title, page.title) : {};
}

export default async function LegalPage({ params }: Props) {
  const { locale: l, key } = await params;
  const locale = assertLocale(l);
  const page = await load(locale, key);
  if (!page) notFound();
  const t = await getT(locale);
  const [company, privacy] = await Promise.all([getSetting('company'), getSetting('privacy')]);
  return (
    <div className="container-page max-w-3xl py-12">
      <Breadcrumbs locale={locale} items={[[t('Accueil'), '/'], [page.title, `/legal/${key}`]]} />
      <h1 className="mb-2 text-4xl font-normal">{page.title}</h1>
      <p className="muted mb-8 text-sm">{t('Dernière mise à jour : {date}', { date: formatDate(page.updatedAt, locale, { dateStyle: 'long' }) })}</p>
      <Markdown source={page.body} vars={{ ...company, retentionMonthsLeads: privacy.retentionMonthsLeads }} />
    </div>
  );
}
