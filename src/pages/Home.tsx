import React, { Suspense } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { Hero } from '../../components/Hero';
import { CredoSection } from '../../components/CredoSection';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LOCALE, isLocale, SUPPORTED_LOCALES, withLocalePath } from '../i18n/routing';

// Lazy load components below the fold for better initial load performance
const Services = React.lazy(() => import('../../components/Services').then(mod => ({ default: mod.Services })));
const Testimonials = React.lazy(() => import('../../components/Testimonials').then(mod => ({ default: mod.Testimonials })));
const WhyChooseUs = React.lazy(() => import('../../components/WhyChooseUs').then(mod => ({ default: mod.WhyChooseUs })));
const Contact = React.lazy(() => import('../../components/Contact').then(mod => ({ default: mod.Contact })));

export default function Home() {
    const { t } = useTranslation('home');
    const { lang } = useParams();
    const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
    const baseUrl = 'https://athana.ch';
    const canonicalPath = withLocalePath(locale, '/');

    return (
        <div className="bg-athana-black min-h-screen text-athana-text selection:bg-athana-accent selection:text-black">
            <Helmet>
                <title>{t('metaTitle')}</title>
                <meta name="description" content={t('metaDescription')} />
                <link rel="canonical" href={`${baseUrl}${canonicalPath}`} />
                {SUPPORTED_LOCALES.map((supportedLocale) => (
                    <link
                        key={supportedLocale}
                        rel="alternate"
                        hrefLang={supportedLocale}
                        href={`${baseUrl}${withLocalePath(supportedLocale, '/')}`}
                    />
                ))}
                <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${withLocalePath(DEFAULT_LOCALE, '/')}`} />
            </Helmet>
            <main>
                <Hero />
                <CredoSection />
                <Suspense fallback={<div>Loading...</div>}>
                    <Services />
                    <WhyChooseUs />
                    <Testimonials />
                    <Contact />
                </Suspense>
            </main>
        </div>
    );
}
