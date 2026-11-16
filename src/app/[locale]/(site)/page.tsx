import { assertLocale, getT } from '@/i18n/server';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const t = await getT(locale);
  return <div className="container-page py-24"><h1 className="h-display">{t('Votre entreprise mérite de meilleures solutions digitales.')}</h1></div>;
}
