import { assertLocale } from '@/i18n/server';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { BannerBar } from '@/components/site/BannerBar';
import { UtmCapture } from '@/components/site/UtmCapture';

/** Design language of the public site: carbon (default) | geist | material — see globals.css. */
const SITE_STYLE = ['carbon', 'geist', 'material'].includes(process.env.NEXT_PUBLIC_SITE_STYLE ?? '') ? process.env.NEXT_PUBLIC_SITE_STYLE : 'carbon';

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  return (
    <div className="site" data-style={SITE_STYLE}>
      <UtmCapture />
      <BannerBar locale={locale} />
      <Header />
      <main id="main">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
