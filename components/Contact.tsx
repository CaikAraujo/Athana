'use client';

import React from 'react';
import { Mail, MapPin, Phone, Terminal } from 'lucide-react';
import { Reveal } from './ui/Section';
import { ContactForm } from './ContactForm';
import { useTranslation } from 'react-i18next';

export const Contact: React.FC = () => {
  const { t } = useTranslation('home');

  return (
    <section id="contact" className="py-32 bg-athana-dark relative border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          <div className="space-y-12">
            <Reveal>
              <h2 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight">
                {t('contact.titleLine1')} <br />
                <span className="text-athana-accent">{t('contact.titleLine2')}</span>
              </h2>
            </Reveal>

            <Reveal delay={200}>
              <p className="text-xl text-athana-muted font-light">
                {t('contact.subtitle')}
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-gray-300 group cursor-pointer">
                  <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center text-athana-accent group-hover:bg-athana-accent group-hover:text-black transition-colors">
                    <Mail size={20} />
                  </div>
                  <span className="group-hover:text-athana-accent transition-colors">contact@athana.ch</span>
                </div>
                <div className="flex items-center gap-4 text-gray-300 group cursor-pointer">
                  <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center text-athana-accent group-hover:bg-athana-accent group-hover:text-black transition-colors">
                    <Phone size={20} />
                  </div>
                  <span className="group-hover:text-athana-accent transition-colors">+41 78 339 98 95</span>
                </div>
                <div className="flex items-center gap-4 text-gray-300 group cursor-pointer">
                  <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center text-athana-accent group-hover:bg-athana-accent group-hover:text-black transition-colors">
                    <MapPin size={20} />
                  </div>
                  <span className="group-hover:text-athana-accent transition-colors">Route de Challex 6, 1283 La Plaine</span>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={400} className="bg-athana-black p-8 md:p-12 rounded-sm border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Terminal size={120} />
            </div>
            <ContactForm />
          </Reveal>

        </div>
      </div>


    </section>
  );
};