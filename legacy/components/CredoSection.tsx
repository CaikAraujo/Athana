'use client';

import React from 'react';
import { Reveal } from './ui/Section';
import { useTranslation } from 'react-i18next';

export const CredoSection: React.FC = () => {
  const { t, i18n } = useTranslation('home');
  const localizedItems = t('credo.items', { returnObjects: true }) as Array<{ number: string; title: string; paragraph: string }>;
  const fallbackItems = i18n.getResource('fr', 'home', 'credo.items') as typeof localizedItems;
  const credoItems = Array.isArray(localizedItems) && localizedItems.length > 0 ? localizedItems : fallbackItems;

  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] py-12 md:py-14">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-10">
        <Reveal className="mb-8 md:mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#D4AF37]/90">
            {t('credo.badge')}
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {credoItems.map((item, index) => (
            <Reveal key={item.number} delay={index * 90}>
              <article className="rounded-xl border border-[#D4AF37]/15 bg-white/[0.01] px-4 py-5 md:px-5 md:py-6">
                <p className="mb-3 font-display text-2xl font-bold leading-none text-[#D4AF37] md:text-3xl">
                  {item.number}
                </p>
                <h3 className="text-base font-display font-bold leading-snug text-white md:text-lg">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/72">
                  {item.paragraph}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
