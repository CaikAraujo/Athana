import { Helmet } from 'react-helmet-async';
import { Projects } from '../../components/Projects';
import { Reveal } from '../../components/ui/Section';
import { Contact } from '../../components/Contact';

export default function ProjectsPage() {
    return (
        <div className="bg-athana-black min-h-screen text-athana-text selection:bg-athana-accent selection:text-black">
            <Helmet>
                <title>Nos Projets | ATHANA</title>
                <meta name="description" content="Découvrez nos réalisations en développement web, applications SaaS et solutions digitales sur mesure." />
            </Helmet>
            {/* Page Header */}
            <section className="pt-40 pb-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 blur-[120px] pointer-events-none"></div>
                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                    <Reveal>
                        <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6">
                            Nos <span className="text-athana-accent">Projets</span>
                        </h1>
                        <p className="text-xl text-athana-muted max-w-2xl mx-auto font-light leading-relaxed">
                            Une sélection de nos meilleures réalisations, du site vitrine à l'application SaaS complexe.
                        </p>
                    </Reveal>
                </div>
            </section>

            <main>
                <Projects />
                <Contact />
            </main>
        </div>
    );
}
