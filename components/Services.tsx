'use client';

import React from 'react';
import { ArrowRight, Compass, Cpu, Rocket, Target } from 'lucide-react';
import { Reveal } from './ui/Section';
import { useTranslation } from 'react-i18next';
type ProcessVariant = 'diagnostic' | 'engineering' | 'optimization' | 'launch';

interface ProcessStep {
  number: string;
  title: string;
  heading: string;
  benefits: [string, string];
  variant: ProcessVariant;
}

const stepVariants: ProcessVariant[] = ['diagnostic', 'engineering', 'optimization', 'launch'];

const ProcessIcon: React.FC<{ variant: ProcessVariant }> = ({ variant }) => {
  const Icon = variant === 'diagnostic'
    ? Compass
    : variant === 'engineering'
      ? Cpu
      : variant === 'optimization'
        ? Target
        : Rocket;

  return (
    <div className="relative h-12 w-12 rounded-full border border-white/20 bg-white/[0.03] flex items-center justify-center transition-all duration-300 group-hover:border-athana-accent/70 group-hover:bg-athana-accent/10">
      <Icon className="h-6 w-6 text-white/85 transition-all duration-300 group-hover:text-athana-accent group-hover:[filter:drop-shadow(0_0_10px_rgba(197,160,89,0.55))]" strokeWidth={1.9} />
    </div>
  );
};

export const Services: React.FC = () => {
  const { t, i18n } = useTranslation('home');
  const translatedSteps = t('process.steps', { returnObjects: true }) as Array<Omit<ProcessStep, 'variant'> & { benefits: [string, string] }>;
  const fallbackSteps = i18n.getResource('fr', 'home', 'process.steps') as typeof translatedSteps;
  const safeSteps = Array.isArray(translatedSteps) && translatedSteps.length > 0 ? translatedSteps : fallbackSteps;
  const processSteps: ProcessStep[] = safeSteps.map((step, index) => ({
    ...step,
    variant: stepVariants[index] ?? 'launch',
  }));

  return (
    <section id="services" className="py-32 md:py-36 relative overflow-hidden" style={{ backgroundColor: '#0B132B' }}>

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_92%_88%,rgba(212,175,55,0.14),rgba(212,175,55,0.05)_24%,rgba(212,175,55,0.02)_38%,transparent_58%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_top_left,rgba(10,10,10,0.05),rgba(10,10,10,0)_35%)]"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.04]"></div>
      </div>

      <div className="max-w-[1500px] mx-auto px-6 md:px-10 relative z-10">
        <Reveal className="text-center mb-20">
          <span className="inline-flex items-center rounded-full border border-athana-accent/40 bg-athana-accent/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-athana-accent">
            {t('process.badge')}
          </span>
          <h2 className="mt-6 text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[1.08]">
            {t('process.title')}
          </h2>
          <p className="mt-5 text-base md:text-xl max-w-4xl mx-auto font-light leading-relaxed text-white/75">
            {t('process.subtitle')}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-8 mb-16">
          {processSteps.map((step, index) => (
            <Reveal key={step.number} delay={index * 90} className="h-full">
              <div
                className="group h-full flex flex-col p-7 md:p-8 rounded-2xl border border-white/10 bg-athana-dark/60 transition-all duration-300 hover:border-athana-accent/70 hover:-translate-y-1"
                style={{ boxShadow: '0 10px 28px rgba(0,0,0,0.25)' }}
              >
                <div className="flex items-start justify-between mb-6">
                  <ProcessIcon variant={step.variant} />
                  <p className="text-3xl font-display font-bold text-athana-accent">{step.number}</p>
                </div>

                <p className="text-[10px] uppercase tracking-[0.24em] text-athana-accent/80 mb-4">{step.title}</p>
                <h3 className="text-[1.9rem] md:text-[2.1rem] font-display font-bold text-white leading-tight mb-5">{step.heading}</h3>
                <p className="text-sm md:text-[15px] leading-relaxed text-white/70 mb-3">{step.benefits[0]}</p>
                <p className="text-sm leading-relaxed text-white/70">{step.benefits[1]}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="text-center pt-2">
          <a
            href={`https://wa.me/41783399895?text=${encodeURIComponent('Bonjour, je veux bâtir mon monument digital avec ATHANA.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl px-8 py-4 text-center text-base font-display font-bold transition-all duration-300 hover:brightness-110"
            style={{
              backgroundColor: '#C5A059',
              color: '#0B132B',
              boxShadow: '0 0 26px rgba(197, 160, 89, 0.3)',
            }}
          >
            {t('process.cta')}
            <ArrowRight className="ml-3 h-4 w-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
};