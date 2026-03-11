

import { Helmet } from 'react-helmet-async';
import { Contact } from '../../components/Contact';
import { TemplateGallery, TemplateProduct } from '../../components/TemplateGallery';
import { Reveal } from '../../components/ui/Section';

const MOCK_TEMPLATES: TemplateProduct[] = [
    {
        id: 'aether',
        name: 'Aether',
        category: 'Portfolio',
        price: 'CHF 990',
        description: 'Un portfolio numérique premium pour agences et créatifs. Mettez en valeur vos projets avec élégance et technologie.',
        imageGradient: 'bg-gradient-to-br from-purple-600 to-blue-900',
        image: '/images/templates/aether.png',
        demoUrl: 'https://aether-beryl.vercel.app/',
        features: ['Next.js 14 + Tailwind', 'Animations Fluides', 'Galerie de Projets', 'Blog Intégré', 'SEO Optimisé']
    },
    {
        id: 'nexus',
        name: 'Nexus',
        category: 'Landing Page',
        price: 'CHF 1.450',
        description: 'Landing page à haute conversion pour startups et produits numériques. Design moderne axé sur la capture de leads.',
        imageGradient: 'bg-gradient-to-br from-cyan-500 to-emerald-900',
        image: '/images/templates/nexus.png',
        demoUrl: 'https://nexus-six-pi.vercel.app/',
        features: ['Design System Moderne', 'Sections Optimisées', 'Composants Modulaires', 'Performance Maximale', 'Support Multi-langue']
    },
    {
        id: 'meridian',
        name: 'Meridian',
        category: 'Institutionnel',
        price: 'CHF 1.900',
        description: 'Solution d\'entreprise robuste pour entreprises et institutions financières. Transmettez confiance et autorité.',
        imageGradient: 'bg-gradient-to-br from-neutral-800 to-black',
        image: '/images/templates/meridian.png',
        demoUrl: 'https://meridian-gold.vercel.app/',
        features: ['Mise en page Exécutive', 'Présentation des Services', 'Pages Corporatives', 'Mobile First', 'Panneau Administratif']
    }
];



export default function TemplatesPage() {
    return (
        <div className="bg-athana-black min-h-screen">
            <Helmet>
                <title>Templates Premium | ATHANA</title>
                <meta name="description" content="Accélérez votre lancement avec nos templates Next.js haute performance. Design suisse, code propre et optimisation SEO native." />
                <meta property="og:title" content="Templates Premium Next.js | ATHANA" />
                <meta property="og:description" content="Boutique de code pour startups et entreprises exigeantes." />
            </Helmet>
            {/* Hero Section */}
            <section className="pt-40 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-athana-accent/5 blur-[120px] pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <Reveal>
                        <span className="inline-block px-4 py-1.5 rounded-full border border-athana-accent/30 bg-athana-accent/10 text-athana-accent text-xs font-bold uppercase tracking-widest mb-6">
                            Fondations Digitales
                        </span>
                        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6">
                            Solutions <span className="text-athana-accent">Pré-Architecturées</span>
                        </h1>
                        <p className="text-xl text-athana-muted max-w-2xl mx-auto font-light leading-relaxed">
                            Des bases de code haute performance, prêtes à être déployées et personnalisées pour votre marque.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* Gallery Section */}
            <section className="py-12 bg-athana-black relative">
                <div className="max-w-7xl mx-auto px-6">
                    <TemplateGallery templates={MOCK_TEMPLATES} />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 bg-athana-black relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <Reveal>
                        <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
                            Besoin de quelque chose <span className="text-athana-accent">d'Exclusif ?</span>
                        </h2>
                        <p className="text-athana-muted text-lg mb-8 max-w-2xl mx-auto">
                            Si les modèles ne correspondent pas à 100% à votre vision, notre équipe peut créer un design sur mesure pour votre marque.
                        </p>
                        <a href="/contact" className="inline-flex h-12 items-center justify-center rounded-sm bg-white px-8 text-sm font-medium text-black transition-colors hover:bg-athana-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                            Parler à des Experts
                        </a>
                    </Reveal>
                </div>
            </section>

            <Contact />
        </div>
    );
}
