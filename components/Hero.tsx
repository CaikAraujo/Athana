'use client';

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown } from 'lucide-react';
import { Reveal } from './ui/Section';
import { AthanaCanvas } from './ui/AthanaCanvas';

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-athana-black">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0">
        <AthanaCanvas />
        {/* Subtle Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-athana-black/30 via-transparent to-athana-black pointer-events-none"></div>
        <div className="absolute inset-0 bg-grid-pattern bg-[length:60px_60px] opacity-[0.03] pointer-events-none"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-athana-accent/30 bg-athana-accent/5 text-athana-accent text-xs font-mono font-bold tracking-widest uppercase mb-8 hover:bg-athana-accent/10 transition-colors cursor-default backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-athana-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-athana-accent"></span>
            </span>
            Architecture Digitale
          </div>
        </Reveal>

        <Reveal delay={200}>
          <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-9xl tracking-tighter text-white mb-8 leading-[0.9]">
            BÂTISSEZ VOTRE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-athana-accent via-white to-athana-accent animate-pulse bg-300% bg-left">
              MONUMENT DIGITAL.
            </span>
          </h1>
        </Reveal>

        <Reveal delay={400}>
          <p className="max-w-2xl mx-auto text-athana-muted text-lg md:text-xl mb-12 leading-relaxed font-light backdrop-blur-sm p-4 rounded-lg bg-black/20 border border-white/5">
            Votre <span className="text-white font-medium">agence genevoise</span> pour des solutions digitales <span className="text-white font-medium">robustes et pérennes</span>.
            Alliez performance technique et <span className="text-white font-medium">fiabilité suisse</span> pour propulser votre entreprise.
          </p>
        </Reveal>

        <Reveal delay={600}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link
              to="/demarrer"
              className="w-full md:w-auto px-8 py-4 bg-athana-accent text-black font-bold rounded hover:bg-white hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-all duration-300 transform hover:-translate-y-1 block md:inline-block cursor-pointer"
            >
              Démarrer un Projet _&gt;
            </Link>
            <Link
              to="/projets"
              className="w-full md:w-auto px-8 py-4 border border-white/10 bg-white/5 backdrop-blur-md text-white font-medium rounded hover:border-athana-accent hover:text-athana-accent transition-colors duration-300 block md:inline-block cursor-pointer"
            >
              Voir le Portfolio
            </Link>
          </div>
        </Reveal>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 animate-bounce" aria-hidden="true">
        <ArrowDown className="w-6 h-6" />
      </div>

      <style>
        {`
        .bg-300% {
            background-size: 300% auto;
            animation: gradient-move 5s ease infinite;
        }
        @keyframes gradient-move {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
      `}
      </style>
    </section>
  );
};