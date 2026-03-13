

import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Contact } from '../../components/Contact';
import { ServicePricingSection, PricingTier } from '../../components/ServicePricingSection';
import { Reveal } from '../../components/ui/Section';

const webDevTiers: PricingTier[] = [
    {
        name: 'Présence Premium',
        description: 'Parfait pour présenter votre activité en ligne.',
        price: 'Dès CHF 1.900',
        features: ['Design réactif sur mesure', 'Jusqu\'à 5 pages', 'Optimisation SEO de base', 'Formulaire de contact', 'Hébergement 1 an inclus', 'Support 3 mois'],
        buttonText: 'Demander un Audit',
    },
    {
        name: 'Écosystème Croissance',
        description: 'Solution complète pour développer votre entreprise.',
        price: 'Dès CHF 2.900',
        features: ['Design premium personnalisé', 'Jusqu\'à 10 pages', 'SEO avancé + Blog', 'Système de réservation', 'Intégrations (CRM, Email)', 'Analyses avancées', 'Support 6 mois'],
        buttonText: 'Demander un Audit',
        highlight: true,
    },
    {
        name: 'E-commerce',
        description: 'Boutique en ligne complète avec ventes intégrées.',
        price: 'Dès CHF 4.500',
        features: ['Design e-commerce exclusif', 'Config. initiale jusqu\'à 50 produits', 'Paiement sécurisé (Stripe/TWINT)', 'Gestion des stocks', 'Panneau d\'administration', 'SEO pour e-commerce', 'Support 12 mois'],
        buttonText: 'Demander un Audit',
    },
];

const seoTiers: PricingTier[] = [
    {
        name: 'SEO Essentiel',
        description: 'Idéal pour commencer votre référencement.',
        price: 'CHF 600',
        period: '/mois',
        features: ['Audit SEO initial', 'Optimisation technique de base', '5 mots-clés cibles', 'Rapport mensuel', 'Support par email'],
        buttonText: 'Demander un Audit',
    },
    {
        name: 'SEO Avancé',
        description: 'Stratégie complète de croissance organique.',
        price: 'CHF 1.050',
        period: '/mois',
        features: ['Audit SEO complet', 'Optimisation technique avancée', '15 mots-clés cibles', 'Création de contenu (2 articles/mois)', 'Netlinking de base', 'Rapport détaillé'],
        buttonText: 'Demander un Audit',
        highlight: true,
    },
    {
        name: 'SEO Premium',
        description: 'Pour les entreprises aux grandes ambitions.',
        price: 'CHF 1.850',
        period: '/mois',
        features: ['Stratégie SEO 360º', 'Mots-clés illimités', 'Contenu premium (4 articles/mois)', 'Netlinking avancé', 'Analyse des concurrents', 'Consultant dédié', 'Support prioritaire'],
        buttonText: 'Demander un Audit',
    },
];

const adsTiers: PricingTier[] = [
    {
        name: 'Google Ads Essentiel',
        description: 'Idéal pour débuter avec le trafic payant.',
        price: 'CHF 450',
        period: '/mois',
        features: ['Configuration du compte', 'Campagne Search (3 groupes)', 'Géolocalisation précise', 'Rapport mensuel', 'Support par email'],
        buttonText: 'Demander un Audit',
    },
    {
        name: 'Google Ads Avancé',
        description: 'Stratégie complète de croissance.',
        price: 'CHF 900',
        period: '/mois',
        features: ['Gestion complète des campagnes', 'Search + Display', 'Remarketing dynamique', 'Optimisation hebdomadaire', 'Rapport bimensuel', 'Consultant dédié'],
        buttonText: 'Demander un Audit',
        highlight: true,
    },
    {
        name: 'Google Ads Premium',
        description: 'Solution d\'entreprise pour grande échelle.',
        price: 'CHF 1.650',
        period: '/mois',
        features: ['Stratégie multi-canal', 'Shopping + Vidéo (YouTube)', 'Optimisation IA', 'Tests A/B continus', 'Tableau de bord personnalisé', 'Support 24/7'],
        buttonText: 'Demander un Audit',
    },
];

const performanceTiers: PricingTier[] = [
    {
        name: 'Optimisation de Base',
        description: 'Améliorez la vitesse essentielle du site.',
        price: 'CHF 600',
        features: ['Audit de performance', 'Optimisation des images', 'Cache navigateur', 'Minification CSS/JS', 'Rapport avant/après'],
        buttonText: 'Demander un Audit',
    },
    {
        name: 'Optimisation Avancée',
        description: 'Performance maximale (Core Web Vitals).',
        price: 'CHF 1.100',
        features: ['Audit complet', 'Optimisation des images (WebP)', 'Cache avancé (Redis/Varnish)', 'Configuration CDN', 'Lazy loading intelligent', 'Garantie de score vert'],
        buttonText: 'Demander un Audit',
        highlight: true,
    },
    {
        name: 'Optimisation Premium',
        description: 'Solution définitive de vitesse.',
        price: 'CHF 1.850',
        features: ['Analyse d\'architecture', 'Refactorisation de code critique', 'CDN Enterprise', 'Monitoring RUM', 'Conseil technique', 'Formation équipe'],
        buttonText: 'Demander un Audit',
    },
];

const maintenanceTiers: PricingTier[] = [
    {
        name: 'Basique',
        description: 'Maintenance essentielle pour la sécurité.',
        price: 'CHF 120',
        period: '/mois',
        features: ['Mises à jour plugins/core', 'Sauvegarde hebdomadaire', 'Monitoring 24/7', 'Support par email'],
        buttonText: 'Demander un Audit',
    },
    {
        name: 'Pro',
        description: 'Sécurité et performance garanties.',
        price: 'CHF 290',
        period: '/mois',
        features: ['Mises à jour prioritaires', 'Sauvegarde quotidienne', 'Monitoring avancé', 'Heures de développement (2h)', 'Optimisation de performance', 'Support prioritaire'],
        buttonText: 'Demander un Audit',
        highlight: true,
    },
    {
        name: 'Enterprise',
        description: 'Gestion complète de votre environnement numérique.',
        price: 'Sur Devis',
        period: '/mois',
        features: ['Mises à jour en temps réel', 'Sauvegardes multi-sites', 'Monitoring de sécurité proactif', 'Développement continu', 'SLA Garanti', 'Gestionnaire de compte'],
        buttonText: 'Demander un Audit',
    },
];



export default function ServicesPage() {
    return (
        <div className="bg-athana-black min-h-screen">
            <Helmet>
                <title>Services & Tarifs | ATHANA</title>
                <meta name="description" content="Solutions complètes de développement web : Sites vitrines, E-commerce, SEO et Google Ads. Transparence totale et prix clairs pour le marché Suisse." />
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
                            CAPABILITÉS
                        </div>
                        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6">
                            Nos Domaines <span className="text-athana-accent">d'Expertise.</span>
                        </h1>
                        <p className="text-xl text-athana-muted max-w-3xl mx-auto font-light leading-relaxed">
                            L'intelligence technique derrière vos ambitions. Découvrez nos solutions de développement pour structurer, automatiser et garantir à votre entreprise une présence digitale inébranlable.
                        </p>
                    </Reveal>
                </div>
            </section>

            <ServicePricingSection
                id="web"
                category="Développement"
                title="Création de Sites & Apps"
                subtitle="Choisissez la solution qui correspond à vos besoins et à votre budget."
                tiers={webDevTiers}
                colorTheme="athana"
            />

            <ServicePricingSection
                id="seo"
                category="Visibilité"
                title="Optimisation SEO"
                subtitle="Augmentez votre visibilité sur Google avec nos stratégies de recherche."
                tiers={seoTiers}
                colorTheme="green"
            />

            <ServicePricingSection
                id="ads"
                category="Trafic Payant"
                title="Google Ads & Performance"
                subtitle="Générez plus de leads et de ventes avec des campagnes optimisées. (Budget publicitaire non inclus)"
                tiers={adsTiers}
                colorTheme="orange"
            />

            <ServicePricingSection
                id="performance"
                category="Vitesse"
                title="Optimisation de Performance"
                subtitle="Accélérez votre site pour une meilleure expérience utilisateur et un meilleur SEO."
                tiers={performanceTiers}
                colorTheme="blue"
            />

            <ServicePricingSection
                category="Support"
                title="Maintenance & Sécurité"
                subtitle="Gardez votre site toujours à jour, sécurisé et rapide."
                tiers={maintenanceTiers}
                colorTheme="purple"
            />

            <section className="py-20 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <Reveal>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                                Ressources Locales <span className="text-athana-accent">Genève</span>
                            </h2>
                            <p className="text-athana-muted max-w-2xl mx-auto">
                                Guides et pages dédiées pour les entreprises genevoises qui recherchent une solution technique concrète.
                            </p>
                        </div>
                    </Reveal>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link to="/services/developpement-web-sur-mesure-geneve" className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                            <h3 className="text-white font-bold mb-2">Développement Web sur Mesure à Genève</h3>
                            <p className="text-sm text-athana-muted">Landing dédiée pour les entreprises qui veulent un site ou une plateforme sur mesure.</p>
                        </Link>
                        <Link to="/services/integration-odoo-erp-geneve" className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                            <h3 className="text-white font-bold mb-2">Intégration Odoo & ERP à Genève</h3>
                            <p className="text-sm text-athana-muted">Page orientée intégration de systèmes pour fluidifier vos opérations.</p>
                        </Link>
                        <Link to="/services/application-web-securisee-suisse" className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                            <h3 className="text-white font-bold mb-2">Application Web Sécurisée en Suisse</h3>
                            <p className="text-sm text-athana-muted">Focus sécurité applicative et conformité nFADP pour équipes B2B.</p>
                        </Link>
                    </div>
                </div>
            </section>

            <Contact />
        </div>
    );
}
