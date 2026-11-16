import { assertLocale, getT } from '@/i18n/server';
import { pageMeta } from '@/lib/seo';
import { serviceContent } from '@/modules/content/services';
import { ServicePage } from '@/components/site/ServicePage';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const c = serviceContent('automation', await getT(locale));
  return pageMeta(locale, c.path, c.metaTitle, c.metaDescription);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const t = await getT(locale);
  return <ServicePage c={serviceContent('automation', t)} locale={locale} t={t} />;
}
