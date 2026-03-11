'use client';

import { Shield, Zap, UserCheck, ArrowRight } from 'lucide-react';
import { Reveal } from './ui/Section';
import { Link } from 'react-router-dom';

const comparisonData = [
    {
        criteria: "Vitesse",
        traditional: {
            text: "Lente/Moyenne (Perte de clients)",
            icon: <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
        },
        athana: {
            text: "Instantanée (Fidélise les clients)",
            icon: <div className="w-2 h-2 rounded-full bg-athana-accent shadow-[0_0_8px_cyan] shrink-0" />
        }
    },
    {
        criteria: "Maintenance",
        traditional: {
            text: "Vous la faites (Risque d'erreur)",
            icon: null
        },
        athana: {
            text: "Nous la faisons (Concierge)",
            icon: null
        }
    },
    {
        criteria: "Sécurité",
        traditional: {
            text: "Vulnérable aux Plugins/Hackers",
            icon: null
        },
        athana: {
            text: "Blindée (Architecture Sécurisée)",
            icon: null
        }
    },
    {
        criteria: "SEO Google",
        traditional: {
            text: "Optimisation Basique",
            icon: null
        },
        athana: {
            text: "Natif & Prioritaire",
            icon: null,
            highlight: true
        }
    },
    {
        criteria: "Focus",
        traditional: {
            text: "Livrer le site et disparaître",
            icon: null
        },
        athana: {
            text: "Partenariat à Long Terme",
            icon: null
        }
    }
];

export const WhyChooseUs = () => {
    return (
        <section className="py-32 bg-athana-dark relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-athana-accent/5 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-athana-accent/20 blur-[100px] rounded-full"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Header */}
                <Reveal className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
                        Excellence Technique & <span className="text-athana-accent">Sérénité Absolue.</span>
                    </h2>
                    <h3 className="text-xl text-athana-muted max-w-3xl mx-auto font-light leading-relaxed">
                        Plus qu'une agence Web, votre <span className="text-white font-semibold">partenaire digital à Genève</span>.
                        Alliez la puissance du développement sur-mesure à un accompagnement de proximité.
                    </h3>
                </Reveal>

                {/* 3 Differentials Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {/* Card 1 */}
                    <Reveal delay={100} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-athana-accent/30 transition-all group">
                        <div className="w-14 h-14 bg-athana-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Zap className="text-athana-accent" size={28} />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-4">Architecture Moderne & Robuste</h4>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Nous développons des solutions pérennes avec Next.js, le standard de l'industrie pour la performance et l'évolutivité. Pas de dette technique, juste de l'excellence.
                        </p>
                        <div className="border-t border-white/5 pt-4">
                            <p className="text-athana-accent text-xs font-bold uppercase tracking-wider">
                                Le Résultat :
                            </p>
                            <p className="text-white text-sm mt-1">
                                Des sites qui chargent instantanément et dominent le SEO Google.
                            </p>
                        </div>
                    </Reveal>

                    {/* Card 2 */}
                    <Reveal delay={200} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-athana-accent/30 transition-all group">
                        <div className="w-14 h-14 bg-athana-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <UserCheck className="text-athana-accent" size={28} />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-4">Accompagnement Sur-mesure</h4>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Fini le "bricolage" interne. Notre équipe gère votre écosystème digital comme une extension de votre entreprise. Vous décidez, nous exécutons.
                        </p>
                        <div className="border-t border-white/5 pt-4">
                            <p className="text-athana-accent text-xs font-bold uppercase tracking-wider">
                                Comment ça marche :
                            </p>
                            <p className="text-white text-sm mt-1">
                                Un changement ? Envoyez-le nous. Nous l'exécutons sans compromettre le design.
                            </p>
                        </div>
                    </Reveal>

                    {/* Card 3 */}
                    <Reveal delay={300} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-athana-accent/30 transition-all group">
                        <div className="w-14 h-14 bg-athana-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Shield className="text-athana-accent" size={28} />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-4">Sécurité & Conformité Suisse</h4>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Infrastructure blindée et respect strict de la nLPD. Vos données et celles de vos clients sont hébergées et traitées avec la plus haute rigueur.
                        </p>
                        <div className="border-t border-white/5 pt-4">
                            <p className="text-athana-accent text-xs font-bold uppercase tracking-wider">
                                La Garantie :
                            </p>
                            <p className="text-white text-sm mt-1">
                                Pas de virus, pas de plugins obsolètes. Précision d'une horloge suisse 24/7.
                            </p>
                        </div>
                    </Reveal>
                </div>

                {/* Comparison Section */}
                <Reveal delay={400} className="max-w-5xl mx-auto">
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm">

                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10">
                                        <th className="p-6 text-gray-400 font-medium uppercase text-xs tracking-widest w-1/3">Critère</th>
                                        <th className="p-6 text-gray-400 font-medium uppercase text-xs tracking-widest w-1/3">Agences Traditionnelles (WP/Wix)</th>
                                        <th className="p-6 text-athana-accent font-bold uppercase text-xs tracking-widest w-1/3 bg-athana-accent/5">ATHANA (Next.js)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {comparisonData.map((item, index) => (
                                        <tr key={index}>
                                            <td className="p-6 text-white font-bold">{item.criteria}</td>
                                            <td className="p-6 text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    {item.traditional.icon}
                                                    {item.traditional.text}
                                                </div>
                                            </td>
                                            <td className={`p-6 text-white bg-athana-accent/5 ${item.athana.highlight ? 'font-bold text-athana-accent' : ''}`}>
                                                <div className="flex items-center gap-2">
                                                    {item.athana.icon}
                                                    {item.athana.text}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden">
                            {comparisonData.map((item, index) => (
                                <div key={index} className="border-b border-white/10 last:border-0 p-6 flex flex-col gap-4">
                                    <h4 className="text-white font-bold text-lg border-l-4 border-athana-accent pl-3">{item.criteria}</h4>

                                    <div className="bg-white/5 rounded-lg p-4">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Agences Traditionnelles</p>
                                        <div className="text-gray-400 flex items-center gap-2 text-sm">
                                            {item.traditional.icon}
                                            {item.traditional.text}
                                        </div>
                                    </div>

                                    <div className="bg-athana-accent/10 rounded-lg p-4 border border-athana-accent/20">
                                        <p className="text-xs text-athana-accent font-bold uppercase tracking-wider mb-2">ATHANA</p>
                                        <div className={`text-white flex items-center gap-2 text-sm ${item.athana.highlight ? 'font-bold text-athana-accent' : ''}`}>
                                            {item.athana.icon}
                                            {item.athana.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </Reveal>

                {/* CTA */}
                <Reveal delay={500} className="text-center mt-20">
                    <Link to="/demarrer" className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-athana-accent transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(197,160,89,0.5)] cursor-pointer group">
                        Discuter de votre Projet
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <p className="text-gray-500 mt-4 text-sm uppercase tracking-widest">
                        Réservez une consultation gratuite et découvrez le potentiel de votre projet.
                    </p>
                </Reveal>

            </div>
        </section>
    );
};
