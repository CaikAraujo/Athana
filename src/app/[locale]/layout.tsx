import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { I18nProvider } from '@/i18n/client';
import { LOCALES, LOCALE_META } from '@/i18n/config';
import { assertLocale, getClientDictionary, getT } from '@/i18n/server';
import { env } from '@/lib/env';
import { getSetting } from '@/lib/settings';
import { ConsentManager } from '@/components/site/Consent';

export const viewport: Viewport = { themeColor: '#050505', width: 'device-width', initialScale: 1 };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = assertLocale((await params).locale);
  const t = await getT(locale);
  return {
    metadataBase: new URL(env.appUrl),
    title: { default: t('ATHANA — Sites web, e-commerce et logiciels professionnels'), template: '%s · ATHANA' },
    description: t('Sites web, boutiques en ligne, logiciels et applications professionnelles. Choisissez votre solution et démarrez votre projet avec Athana.'),
    applicationName: 'ATHANA',
    openGraph: { siteName: 'ATHANA', type: 'website', locale: LOCALE_META[locale].intl.replace('-', '_') },
    twitter: { card: 'summary_large_image' },
    icons: { icon: '/favicon.svg' },
  };
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const [dict, privacy, t] = await Promise.all([getClientDictionary(locale), getSetting('privacy'), getT(locale)]);
  return (
    <html lang={LOCALE_META[locale].hreflang}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 btn btn-secondary btn-sm">{t('Aller au contenu')}</a>
        <I18nProvider locale={locale} dict={dict}>
          {children}
          <ConsentManager ids={env.analytics} policyVersion={privacy.policyVersion} />
        </I18nProvider>
      </body>
    </html>
  );
}
