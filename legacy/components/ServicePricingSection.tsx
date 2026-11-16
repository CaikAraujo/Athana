'use client';

import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Reveal } from './ui/Section';
import { useModal } from '../src/context/ModalContext';

export interface PricingTier {
    name: string;
    description: string;
    price: string;
    period?: string;
    features: string[];
    buttonText: string;
    highlight?: boolean;
}

interface ServicePricingSectionProps {
    title: string;
    subtitle: string;
    category: string;
    tiers: PricingTier[];
    colorTheme?: string; // 'blue', 'green', 'purple', 'orange', 'cyan'
    id?: string;
}

const themeStyles: Record<string, { bg: string; text: string; button: string; border: string }> = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', button: 'bg-blue-600 hover:bg-blue-500', border: 'border-blue-500/30' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', button: 'bg-green-600 hover:bg-green-500', border: 'border-green-500/30' },
    purple: { bg: 'bg-athana-accent/10', text: 'text-athana-accent', button: 'bg-athana-accent hover:bg-yellow-500', border: 'border-athana-accent/30' },
    orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', button: 'bg-orange-600 hover:bg-orange-500', border: 'border-orange-500/30' },
    cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', button: 'bg-cyan-600 hover:bg-cyan-500', border: 'border-cyan-500/30' },
    athana: { bg: 'bg-athana-accent/10', text: 'text-athana-accent', button: 'bg-athana-accent hover:bg-white hover:text-black', border: 'border-athana-accent/30' },
};

export const ServicePricingSection: React.FC<ServicePricingSectionProps> = ({ title, subtitle, category, tiers, colorTheme = 'athana', id }) => {
    const styles = themeStyles[colorTheme] || themeStyles.athana;
    const { openModal } = useModal();

    return (
        <section id={id} className="py-24 relative border-t border-white/5 scroll-mt-32">
            <div className="max-w-7xl mx-auto px-6">
                <Reveal>
                    <div className="text-center mb-16 space-y-4">
                        <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${styles.bg} ${styles.text} border ${styles.border}`}>
                            {category}
                        </span>
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-white">{title}</h2>
                        <p className="text-athana-muted text-lg max-w-2xl mx-auto font-light">{subtitle}</p>
                    </div>
                </Reveal>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {tiers.map((tier, index) => (
                        <Reveal key={index} delay={index * 100} className="h-full">
                            <div className={`h-full p-8 rounded-2xl border transition-all duration-300 flex flex-col relative overflow-hidden group 
                ${tier.highlight
                                    ? `bg-white/5 ${styles.border} shadow-[0_0_50px_-20px_rgba(0,0,0,0.5)] scale-105 z-10`
                                    : 'bg-athana-dark/50 border-white/5 hover:border-white/10 hover:bg-white/5'
                                }`}
                            >
                                {tier.highlight && (
                                    <div className={`absolute top-0 inset-x-0 h-1 ${styles.button}`}></div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                                    <p className="text-athana-muted text-sm min-h-[40px]">{tier.description}</p>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-end gap-1">
                                        <span className="text-4xl font-display font-bold text-white">{tier.price}</span>
                                        {tier.period && <span className="text-athana-muted mb-1 text-sm">{tier.period}</span>}
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                                            <Check className={`w-5 h-5 ${styles.text} shrink-0`} />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => openModal(`Plano: ${tier.name}`)}
                                    className={`w-full py-4 rounded-lg font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 group/btn cursor-pointer ${tier.highlight ? styles.button + ' text-white' : 'bg-white/5 text-white hover:bg-white/10'}`}
                                >
                                    {tier.buttonText}
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                </button>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
};
