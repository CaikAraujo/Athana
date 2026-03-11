'use client';

import React, { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Reveal } from './ui/Section';
import { useModal } from '../src/context/ModalContext';
import { Link } from 'react-router-dom';

const CAPABILITIES = [
  {
    id: 'backend',
    title: 'Ingénierie & Systèmes',
    subtitle: '(APIs)',
    description: "Développement de solutions backend robustes et d'APIs sécurisées. L'infrastructure invisible et infaillible qui propulse vos opérations.",
    price: 'Sur devis personnalisé',
    features: [
      'Architecture Microservices',
      'APIs REST & GraphQL',
      'Sécurité & Cryptographie',
      'Bases de données Haute Dispo',
    ],
    highlight: false,
    buttonText: "Planifier une architecture",
    link: null
  },
  {
    id: 'web',
    title: 'Plateformes Web',
    subtitle: '& E-commerce',
    description: "Conception de sites vitrines et d'écosystèmes e-commerce haut de gamme. Un design d'excellence allié à une performance technique irréprochable.",
    price: 'À partir de CHF 1.900',
    features: [
      'Sites Vitrines Premium',
      'E-commerce Headless',
      'Web Apps Progressives (PWA)',
      'Design System Sur Mesure',
    ],
    highlight: true,
    buttonText: "Créer un projet web",
    link: '/services#web'
  },
  {
    id: 'growth',
    title: 'Acquisition & Performance',
    subtitle: '(SEO/Ads)',
    description: "Stratégies d'acquisition data-driven. Nous optimisons votre visibilité et pilotons vos campagnes publicitaires pour un ROI maximal.",
    price: 'À partir de CHF 450 / mois',
    features: [
      'Audit SEO Technique',
      'Campagnes Google Ads',
      'Tracking & Analytics',
      'Optimisation de Conversion',
    ],
    highlight: false,
    buttonText: "Booster la visibilité",
    link: '/services#seo'
  }
];

export const Services: React.FC = () => {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);
  const { openModal } = useModal();

  return (
    <section id="services" className="py-32 relative overflow-hidden" style={{ backgroundColor: '#0B132B' }}>

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-20" style={{ backgroundColor: '#C5A059' }}></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-10" style={{ backgroundColor: '#141E38' }}></div>
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Header */}
        <Reveal className="text-center mb-20">
          <div className="inline-block mb-4">
            <span className="text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-2" style={{ color: '#C5A059' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#C5A059' }}></span>
              CAPABILITÉS
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-display text-white">
            Nos Domaines d'Expertise.
          </h2>
          <p className="text-lg max-w-3xl mx-auto font-light leading-relaxed" style={{ color: '#94A3B8' }}>
            L'intelligence technique derrière vos ambitions. Découvrez nos solutions de développement pour structurer, automatiser et garantir à votre entreprise une présence digitale inébranlable.
          </p>
        </Reveal>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {CAPABILITIES.map((service, index) => (
            <Reveal key={service.id} delay={index * 150} className={`h-full ${service.highlight ? 'lg:-mt-6 lg:-mb-6 z-20' : 'z-10'}`}>
              <div
                onMouseEnter={() => setHoveredPlan(service.id)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`
                  h-full flex flex-col p-8 md:p-10 rounded-2xl transition-all duration-500 relative group
                  ${service.highlight ? 'lg:scale-105 shadow-2xl' : 'hover:translate-y-[-5px]'}
                `}
                style={{
                  backgroundColor: '#141E38',
                  border: service.highlight ? '1px solid #C5A059' : '1px solid rgba(255,255,255,0.05)',
                  boxShadow: service.highlight
                    ? '0 0 40px rgba(197, 160, 89, 0.15)'
                    : (hoveredPlan === service.id ? '0 0 20px rgba(197, 160, 89, 0.05)' : '0 10px 30px rgba(0,0,0,0.2)')
                }}
              >
                {/* Highlight Checkmark Badge */}
                {service.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg" style={{ backgroundColor: '#C5A059', color: '#0B132B' }}>
                    <Sparkles size={12} fill="currentColor" />
                    RECOMMANDÉ
                  </div>
                )}

                {/* Card Content */}
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-white mb-1 font-display">{service.title}</h3>
                  <p className="text-sm font-bold uppercase tracking-wider mb-6 opacity-90" style={{ color: '#C5A059' }}>{service.subtitle}</p>

                  <p className="text-sm leading-relaxed mb-8" style={{ color: '#94A3B8' }}>
                    {service.description}
                  </p>

                  <div className="mb-8 py-4 border-y border-white/5">
                    <p className="text-white/50 text-[10px] uppercase tracking-widest mb-2">Investissement</p>
                    <p className="text-lg font-medium whitespace-nowrap" style={{ color: service.highlight ? '#C5A059' : '#F8FAFC' }}>
                      {service.price}
                    </p>
                  </div>

                  {/* <ul className="space-y-4 mb-10">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="mt-1 flex-shrink-0">
                          <Check size={16} style={{ color: '#C5A059' }} strokeWidth={2.5} />
                        </div>
                        <span className="text-sm leading-relaxed" style={{ color: '#F8FAFC' }}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul> */}
                </div>

                {/* CTA Button or Link */}
                {service.link ? (
                  <Link
                    to={service.link}
                    className="w-full py-4 rounded-lg font-bold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                    style={{
                      backgroundColor: service.highlight ? '#C5A059' : 'transparent',
                      color: service.highlight ? '#0B132B' : '#F8FAFC',
                      border: service.highlight ? 'none' : '1px solid #C5A059'
                    }}
                    onMouseEnter={(e) => {
                      if (!service.highlight) {
                        e.currentTarget.style.backgroundColor = 'rgba(197, 160, 89, 0.1)';
                      } else {
                        e.currentTarget.style.backgroundColor = '#D4AF37';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!service.highlight) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      } else {
                        e.currentTarget.style.backgroundColor = '#C5A059';
                      }
                    }}
                  >
                    {service.buttonText}
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </Link>
                ) : (
                  <button
                    onClick={() => openModal(`Projet: ${service.title}`)}
                    className="w-full py-4 rounded-lg font-bold text-xs tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 group/btn cursor-pointer"
                    style={{
                      backgroundColor: service.highlight ? '#C5A059' : 'transparent',
                      color: service.highlight ? '#0B132B' : '#F8FAFC',
                      border: service.highlight ? 'none' : '1px solid #C5A059'
                    }}
                    onMouseEnter={(e) => {
                      if (!service.highlight) {
                        e.currentTarget.style.backgroundColor = 'rgba(197, 160, 89, 0.1)';
                      } else {
                        e.currentTarget.style.backgroundColor = '#D4AF37';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!service.highlight) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      } else {
                        e.currentTarget.style.backgroundColor = '#C5A059';
                      }
                    }}
                  >
                    {service.buttonText}
                    <ArrowRight size={14} className="transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </button>
                )}
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  );
};