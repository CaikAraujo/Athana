'use client';

import React from 'react';
import { Quote } from 'lucide-react';
import { TESTIMONIALS } from '../constants';
import { Reveal } from './ui/Section';

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-32 bg-athana-black relative overflow-hidden">
      {/* Decorative large quote mark */}
      <div className="absolute top-20 left-10 text-white/5 pointer-events-none">
        <Quote size={300} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal className="mb-20">
          <h2 className="font-display text-4xl md:text-6xl font-bold text-white text-right">
            Avis <br /> <span className="text-athana-accent">Clients.</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.id} delay={i * 100}>
              <div className="bg-athana-gray/30 p-8 rounded-sm border border-white/5 backdrop-blur-sm hover:bg-athana-gray/50 transition-colors h-full flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-athana-accent mb-6" aria-label="5 out of 5 stars">
                    {[1, 2, 3, 4, 5].map(star => (
                      <span key={star} aria-hidden="true">★</span>
                    ))}
                  </div>
                  <p className="text-lg text-gray-300 mb-8 italic leading-relaxed font-light">"{t.content}"</p>
                </div>
                <div className="flex items-center gap-4">
                  <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full border border-white/20 grayscale" />
                  <div>
                    <h4 className="font-bold text-white">{t.name}</h4>
                    <p className="text-xs text-athana-muted uppercase tracking-wider">{t.role} @ {t.company}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};