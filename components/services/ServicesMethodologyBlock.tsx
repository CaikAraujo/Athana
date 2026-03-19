import React from 'react';
import { Reveal } from '../ui/Section';

type Pillar = { title: string; subtitle: string; copy: string };

interface ServicesMethodologyBlockProps {
  badge: string;
  title: string;
  description: string;
  pillars: Pillar[];
  postText: string;
}

export const ServicesMethodologyBlock: React.FC<ServicesMethodologyBlockProps> = ({
  badge,
  title,
  description,
  pillars,
  postText,
}) => {
  return (
    <section className="py-18 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="max-w-4xl">
            <p className="inline-flex items-center px-4 py-1.5 rounded-full border border-athana-accent/30 bg-athana-accent/5 text-athana-accent text-[11px] font-mono font-bold tracking-[0.24em] uppercase mb-6">
              {badge}
            </p>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">{title}</h2>
            <p className="text-base md:text-xl text-athana-muted leading-relaxed">{description}</p>
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mt-12">
            {pillars.map((pillar) => (
              <article key={pillar.title} className="rounded-2xl border border-white/10 bg-athana-dark/40 p-6">
                <p className="text-athana-accent text-xs uppercase tracking-[0.18em] font-bold mb-2">{pillar.title}</p>
                <h3 className="text-white text-xl font-display font-bold mb-3">{pillar.subtitle}</h3>
                <p className="text-sm text-athana-muted leading-relaxed">{pillar.copy}</p>
              </article>
            ))}
          </div>
        </Reveal>

        <Reveal delay={180}>
          <p className="mt-10 text-center text-athana-muted text-base md:text-lg">{postText}</p>
        </Reveal>
      </div>
    </section>
  );
};
