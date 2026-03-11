'use client';

import React from 'react';
import { Check, Sparkles, Zap } from 'lucide-react';
import { Reveal } from './ui/Section';
import { useModal } from '../src/context/ModalContext';


const PRICING_HOME = [
  {
    id: 'vitrine',
    name: 'Site Vitrine',
    price: 'CHF 1.900',
    description: 'Parfait pour présenter votre activité en ligne.',
    highlight: false,
    features: [
      { text: 'Design réactif sur mesure', included: true },
      { text: "Jusqu'à 5 pages", included: true },
      { text: 'Optimisation SEO de base', included: true },
      { text: 'Formulaire de contact', included: true },
      { text: 'Hébergement 1 an inclus', included: true },
      { text: 'Support 3 mois', included: true },
    ],
  },
  {
    id: 'business',
    name: 'Site Business',
    price: 'CHF 2.900',
    description: 'Solution complète pour développer votre entreprise.',
    highlight: true,
    features: [
      { text: 'Design premium personnalisé', included: true },
      { text: "Jusqu'à 10 pages", included: true },
      { text: 'SEO avancé + Blog', included: true },
      { text: 'Système de réservation', included: true },
      { text: 'Intégrations (CRM, Email)', included: true },
      { text: 'Analyses avancées', included: true },
      { text: 'Support 6 mois', included: true },
    ],
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    price: 'CHF 4.500',
    description: 'Boutique en ligne complète avec ventes intégrées.',
    highlight: false,
    features: [
      { text: 'Design e-commerce exclusif', included: true },
      { text: "Config. initiale jusqu'à 50 produits", included: true },
      { text: 'Paiement sécurisé (Stripe)', included: true },
      { text: 'Gestion des stocks', included: true },
      { text: "Panneau d'administration", included: true },
      { text: 'SEO pour e-commerce', included: true },
      { text: 'Support 12 mois', included: true },
    ],
  },
];

export const Pricing: React.FC = () => {

  const { openModal } = useModal();

  return (
    <section id="pricing" className="py-32 bg-athana-black border-y border-white/5 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[500px] bg-athana-accent/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal className="text-center mb-24">
          <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
            Investissement <span className="text-athana-accent">.</span>
          </h2>
          <p className="text-athana-muted text-lg max-w-2xl mx-auto font-light">
            Transparence totale. Choisissez l'architecture idéale pour le stade actuel de votre entreprise.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {PRICING_HOME.map((tier, index) => {
            // O plano do meio (Scale) é o destaque por padrão se nenhum estiver hovered, ou se hover lógico customizado fosse necessário.
            // Aqui usamos a prop 'highlight' do objeto.
            const isHighlighted = tier.highlight;

            return (
              <Reveal key={tier.id} delay={index * 150} className={`h-full ${isHighlighted ? 'lg:-mt-4 lg:-mb-4 z-20' : 'z-10'}`}>
                <div
                  className={`
                    h-full relative p-8 md:p-10 flex flex-col transition-all duration-500 ease-out
                    ${isHighlighted
                      ? 'bg-athana-dark/80 border-athana-accent shadow-[0_0_50px_-10px_rgba(0,240,255,0.15)] rounded-2xl border'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10 rounded-xl border'
                    }
                    backdrop-blur-xl
                  `}
                >
                  {/* Recommended Badge */}
                  {isHighlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-athana-accent text-black px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                      <Sparkles className="w-3 h-3 fill-current" />
                      Recommandé
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-8 border-b border-white/5 pb-8">
                    <h3 className={`font-display text-xl font-bold mb-4 flex items-center gap-2 ${isHighlighted ? 'text-athana-accent' : 'text-white'}`}>
                      {tier.name}
                      {isHighlighted && <span className="w-2 h-2 rounded-full bg-athana-accent animate-pulse"></span>}
                    </h3>

                    <div className="flex items-baseline gap-1">
                      <span className="text-athana-muted text-lg font-light">CHF</span>
                      <span className={`text-5xl md:text-6xl font-bold font-display tracking-tight ${isHighlighted ? 'text-white' : 'text-white/80'}`}>
                        {tier.price.replace('CHF ', '')}
                      </span>
                    </div>
                    <p className="text-athana-muted text-sm mt-4 leading-relaxed">{tier.description}</p>
                  </div>

                  {/* Features */}
                  <div className="flex-grow space-y-5 mb-10">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 group/item">
                        <div className={`
                            mt-1 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                            ${feature.included
                            ? (isHighlighted ? 'bg-athana-accent text-black' : 'bg-white/10 text-white')
                            : 'bg-transparent border border-white/5 text-white/20'
                          }
                        `}>
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </div>
                        <span className={`text-sm transition-colors ${feature.included ? 'text-gray-300 group-hover/item:text-white' : 'text-gray-600 line-through'}`}>
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => openModal(`Plano: ${tier.name}`)}
                    aria-label={`Select ${tier.name} Plan`}
                    className={`
                      w-full py-5 rounded-lg font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer
                      ${isHighlighted
                        ? 'bg-athana-accent text-black hover:bg-white hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                        : 'bg-white/5 text-white hover:bg-white hover:text-black border border-white/5 hover:border-white'
                      }
                    `}
                  >
                    Choisir ce Plan
                    <span className="group-hover:translate-x-1 transition-transform">_&gt;</span>
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={400} className="mt-20 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-athana-accent" />
            <p className="text-athana-muted text-sm">
              Entreprise ? <a href="#contact" className="text-white font-bold hover:text-athana-accent transition-colors border-b border-transparent hover:border-athana-accent ml-1">Contactez nos ingénieurs</a> pour une solution personnalisée.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};