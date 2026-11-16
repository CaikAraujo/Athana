'use client';

import { Shield, Zap, UserCheck, ArrowRight } from 'lucide-react';
import { Reveal } from './ui/Section';
import { Link, useParams } from 'react-router-dom';
import { DEFAULT_LOCALE, isLocale, withLocalePath } from '../src/i18n/routing';
import { useTranslation } from 'react-i18next';

export const WhyChooseUs = () => {
    const { lang } = useParams();
    const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
    const { t, i18n } = useTranslation('home');
    const localizedCopy = t('whyChooseUs', { returnObjects: true }) as {
        title: string;
        titleAccent: string;
        subtitleBefore: string;
        subtitleAccent: string;
        subtitleAfter: string;
        cards: Array<{ title: string; description: string; label: string; value: string }>;
        table: { criteria: string; traditional: string; athana: string };
        cta: string;
        ctaNote: string;
        comparisonData: Array<{
            criteria: string;
            traditional: { text: string };
            athana: { text: string; highlight?: boolean };
        }>;
    };
    const fallbackCopy = i18n.getResource('fr', 'home', 'whyChooseUs') as typeof localizedCopy;
    const copy = localizedCopy && Object.keys(localizedCopy).length > 0 ? localizedCopy : fallbackCopy;
    const comparisonData = copy.comparisonData || [];

    return (
        <section className="py-32 bg-athana-dark relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_88%,rgba(197,160,89,0.10),rgba(197,160,89,0.04)_26%,rgba(197,160,89,0.015)_40%,transparent_60%)]"></div>
                <div className="absolute inset-0 bg-[linear-gradient(to_top_left,rgba(10,10,10,0.06),rgba(10,10,10,0)_36%)]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* Header */}
                <Reveal className="text-center mb-20">
                    <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
                        {copy.title} <span className="text-athana-accent">{copy.titleAccent}</span>
                    </h2>
                    <h3 className="text-xl text-athana-muted max-w-3xl mx-auto font-light leading-relaxed">
                        {copy.subtitleBefore} <span className="text-white font-semibold">{copy.subtitleAccent}</span>.{' '}
                        {copy.subtitleAfter}
                    </h3>
                </Reveal>

                {/* 3 Differentials Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {/* Card 1 */}
                    <Reveal delay={100} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-athana-accent/30 transition-all group">
                        <div className="w-14 h-14 bg-athana-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Zap className="text-athana-accent" size={28} />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-4">{copy.cards[0].title}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            {copy.cards[0].description}
                        </p>
                        <div className="border-t border-white/5 pt-4">
                            <p className="text-athana-accent text-xs font-bold uppercase tracking-wider">
                                {copy.cards[0].label}
                            </p>
                            <p className="text-white text-sm mt-1">
                                {copy.cards[0].value}
                            </p>
                        </div>
                    </Reveal>

                    {/* Card 2 */}
                    <Reveal delay={200} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-athana-accent/30 transition-all group">
                        <div className="w-14 h-14 bg-athana-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <UserCheck className="text-athana-accent" size={28} />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-4">{copy.cards[1].title}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            {copy.cards[1].description}
                        </p>
                        <div className="border-t border-white/5 pt-4">
                            <p className="text-athana-accent text-xs font-bold uppercase tracking-wider">
                                {copy.cards[1].label}
                            </p>
                            <p className="text-white text-sm mt-1">
                                {copy.cards[1].value}
                            </p>
                        </div>
                    </Reveal>

                    {/* Card 3 */}
                    <Reveal delay={300} className="bg-white/5 border border-white/10 p-8 rounded-2xl hover:border-athana-accent/30 transition-all group">
                        <div className="w-14 h-14 bg-athana-accent/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Shield className="text-athana-accent" size={28} />
                        </div>
                        <h4 className="text-xl font-bold text-white mb-4">{copy.cards[2].title}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            {copy.cards[2].description}
                        </p>
                        <div className="border-t border-white/5 pt-4">
                            <p className="text-athana-accent text-xs font-bold uppercase tracking-wider">
                                {copy.cards[2].label}
                            </p>
                            <p className="text-white text-sm mt-1">
                                {copy.cards[2].value}
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
                                        <th className="p-6 text-gray-400 font-medium uppercase text-xs tracking-widest w-1/3">{copy.table.criteria}</th>
                                        <th className="p-6 text-gray-400 font-medium uppercase text-xs tracking-widest w-1/3">{copy.table.traditional}</th>
                                        <th className="p-6 text-athana-accent font-bold uppercase text-xs tracking-widest w-1/3 bg-athana-accent/5">{copy.table.athana}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {comparisonData.map((item, index) => (
                                        <tr key={index}>
                                            <td className="p-6 text-white font-bold">{item.criteria}</td>
                                            <td className="p-6 text-gray-400">
                                                <div className="flex items-center gap-2">
                                                    {index === 0 && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                                                    {item.traditional.text}
                                                </div>
                                            </td>
                                            <td className={`p-6 text-white bg-athana-accent/5 ${item.athana.highlight ? 'font-bold text-athana-accent' : ''}`}>
                                                <div className="flex items-center gap-2">
                                                    {index === 0 && <span className="w-2 h-2 rounded-full bg-athana-accent shadow-[0_0_8px_cyan] shrink-0" />}
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
                                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{copy.table.traditional}</p>
                                        <div className="text-gray-400 flex items-center gap-2 text-sm">
                                            {index === 0 && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                                            {item.traditional.text}
                                        </div>
                                    </div>

                                    <div className="bg-athana-accent/10 rounded-lg p-4 border border-athana-accent/20">
                                        <p className="text-xs text-athana-accent font-bold uppercase tracking-wider mb-2">{copy.table.athana}</p>
                                        <div className={`text-white flex items-center gap-2 text-sm ${item.athana.highlight ? 'font-bold text-athana-accent' : ''}`}>
                                            {index === 0 && <span className="w-2 h-2 rounded-full bg-athana-accent shadow-[0_0_8px_cyan] shrink-0" />}
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
                    <Link to={withLocalePath(locale, '/demarrer')} className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-athana-accent transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(197,160,89,0.5)] cursor-pointer group">
                        {copy.cta}
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <p className="text-gray-500 mt-4 text-sm uppercase tracking-widest">
                        {copy.ctaNote}
                    </p>
                </Reveal>

            </div>
        </section>
    );
};
