import { assertLocale } from '@/i18n/server';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { BannerBar } from '@/components/site/BannerBar';
import { UtmCapture } from '@/components/site/UtmCapture';

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  return (
    <div className="site">
      <UtmCapture />
      <BannerBar locale={locale} />
      <Header />
      <main id="main">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
