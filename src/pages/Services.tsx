

import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Contact } from '../../components/Contact';
import { ServicePricingSection } from '../../components/ServicePricingSection';
import type { PricingTier } from '../../components/ServicePricingSection';
import { Reveal } from '../../components/ui/Section';
import { ServicesMethodologyBlock } from '../../components/services/ServicesMethodologyBlock';
import { ServicesPerformanceAudit } from '../../components/services/ServicesPerformanceAudit';
import { ServicesResourcesGrid } from '../../components/services/ServicesResourcesGrid';
import { DEFAULT_LOCALE, isLocale, SUPPORTED_LOCALES, withLocalePath } from '../i18n/routing';

interface Pillar {
    title: string;
    subtitle: string;
    copy: string;
}

interface PerformanceCopy {
    badge: string;
    title: string;
    subtitle: string;
    leftTitle: string;
    leftCopy: string;
    bullets: string[];
    websiteLabel: string;
    websitePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    info: string;
    submitIdle: string;
    submitLoading: string;
    validationWebsite: string;
    validationEmail: string;
    validationUrl: string;
    success: string;
    error: string;
    contactMessage: string;
}

interface ServicesCopy {
    methodologyBadge: string;
    methodologyTitle: string;
    methodologyDescription: string;
    postMethodology: string;
    ecosystemPillars: Pillar[];
    webSection: { category: string; title: string; subtitle: string; tiers: PricingTier[] };
    localOfferBeforeLink: string;
    localOfferLink: string;
    localWhatsappMessage: string;
    adsSection: { category: string; title: string; subtitle: string; tiers: PricingTier[] };
    maintenanceSection: { category: string; title: string; subtitle: string; tiers: PricingTier[] };
    performance: PerformanceCopy;
    resources: {
        title: string;
        accent: string;
        subtitle: string;
        cards: Array<{ title: string; description: string }>;
    };
}

export default function ServicesPage() {
    const { t, i18n } = useTranslation('servicesPage');
    const { lang } = useParams();
    const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
    const toLocalePath = (path: string) => withLocalePath(locale, path);
    const baseUrl = 'https://athana.ch';
    const canonicalPath = withLocalePath(locale, '/services');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [auditEmail, setAuditEmail] = useState('');
    const [isSubmittingAudit, setIsSubmittingAudit] = useState(false);
    const [auditFeedback, setAuditFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const localizedContent = t('content', { returnObjects: true }) as ServicesCopy;
    const fallbackContent = i18n.getResource('fr', 'servicesPage', 'content') as ServicesCopy;
    const copy = localizedContent && Object.keys(localizedContent).length > 0 ? localizedContent : fallbackContent;

    const handleAuditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setAuditFeedback(null);

        const normalizedUrl = websiteUrl.trim().startsWith('http')
            ? websiteUrl.trim()
            : `https://${websiteUrl.trim()}`;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!websiteUrl.trim()) {
            setAuditFeedback({ type: 'error', message: copy.performance.validationWebsite });
            return;
        }
        if (!emailRegex.test(auditEmail.trim())) {
            setAuditFeedback({ type: 'error', message: copy.performance.validationEmail });
            return;
        }

        let hostname = 'Site non renseigné';
        try {
            hostname = new URL(normalizedUrl).hostname.replace(/^www\./, '');
        } catch (_error) {
            setAuditFeedback({ type: 'error', message: copy.performance.validationUrl });
            return;
        }

        setIsSubmittingAudit(true);
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Audit Performance',
                    company: hostname || 'Entreprise non renseignée',
                    source: 'services-performance-audit',
                    email: auditEmail.trim(),
                    phone: 'N/A',
                    message: copy.performance.contactMessage.replace('{{url}}', normalizedUrl),
                    website: '',
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur API');
            }

            setAuditFeedback({
                type: 'success',
                message: copy.performance.success,
            });
            setWebsiteUrl('');
            setAuditEmail('');
        } catch (_error) {
            setAuditFeedback({
                type: 'error',
                message: copy.performance.error,
            });
        } finally {
            setIsSubmittingAudit(false);
        }
    };

    return (
        <div className="bg-athana-black min-h-screen">
            <Helmet>
                <title>{t('metaTitle')}</title>
                <meta name="description" content={t('metaDescription')} />
                <link rel="canonical" href={`${baseUrl}${canonicalPath}`} />
                {SUPPORTED_LOCALES.map((supportedLocale) => (
                    <link
                        key={supportedLocale}
                        rel="alternate"
                        hrefLang={supportedLocale}
                        href={`${baseUrl}${withLocalePath(supportedLocale, '/services')}`}
                    />
                ))}
                <link rel="alternate" hrefLang="x-default" href={`${baseUrl}${withLocalePath(DEFAULT_LOCALE, '/services')}`} />
            </Helmet>
            {/* Page Header */}
            <section className="pt-40 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-athana-accent/5 blur-[120px] pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <Reveal>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-athana-accent/30 bg-athana-accent/5 text-athana-accent text-xs font-mono font-bold tracking-widest uppercase mb-8 hover:bg-athana-accent/10 transition-colors cursor-default backdrop-blur-sm mx-auto">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-athana-accent opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-athana-accent"></span>
                            </span>
                            {t('headerBadge')}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6">
                            {t('headerTitleBefore')} <span className="text-athana-accent">{t('headerTitleAccent')}</span>
                        </h1>
                        <p className="text-xl text-athana-muted max-w-3xl mx-auto font-light leading-relaxed">
                            {t('headerSubtitle')}
                        </p>
                    </Reveal>
                </div>
            </section>

            <ServicesMethodologyBlock
                badge={copy.methodologyBadge}
                title={copy.methodologyTitle}
                description={copy.methodologyDescription}
                pillars={copy.ecosystemPillars}
                postText={copy.postMethodology}
            />

            <ServicePricingSection
                id="web"
                category={copy.webSection.category}
                title={copy.webSection.title}
                subtitle={copy.webSection.subtitle}
                tiers={copy.webSection.tiers}
                colorTheme="athana"
            />

            <section className="pb-14 -mt-10 relative z-30 pointer-events-auto">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center">
                        <p className="text-sm md:text-base text-athana-muted/90">
                            {copy.localOfferBeforeLink}
                            {' '}
                            <a
                                href={`https://wa.me/41783399895?text=${encodeURIComponent(copy.localWhatsappMessage)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative z-40 inline underline underline-offset-4 text-athana-accent hover:text-white transition-colors pointer-events-auto"
                            >
                                {copy.localOfferLink}
                            </a>
                        </p>
                    </div>
                </div>
            </section>

            <ServicePricingSection
                id="ads"
                category={copy.adsSection.category}
                title={copy.adsSection.title}
                subtitle={copy.adsSection.subtitle}
                tiers={copy.adsSection.tiers}
                colorTheme="orange"
            />

            <ServicePricingSection
                category={copy.maintenanceSection.category}
                title={copy.maintenanceSection.title}
                subtitle={copy.maintenanceSection.subtitle}
                tiers={copy.maintenanceSection.tiers}
                colorTheme="purple"
            />

            <ServicesPerformanceAudit
                copy={copy.performance}
                websiteUrl={websiteUrl}
                setWebsiteUrl={setWebsiteUrl}
                auditEmail={auditEmail}
                setAuditEmail={setAuditEmail}
                isSubmittingAudit={isSubmittingAudit}
                auditFeedback={auditFeedback}
                onSubmit={handleAuditSubmit}
            />

            <ServicesResourcesGrid
                title={copy.resources.title}
                accent={copy.resources.accent}
                subtitle={copy.resources.subtitle}
                cards={copy.resources.cards}
                toLocalePath={toLocalePath}
            />

            <Contact />
        </div>
    );
}
