'use client';
import Image from 'next/image';
import { useState, type ReactNode } from 'react';

export type HeroItem = { key: string; label: string; phrase: string; src: string; alt: string };

/**
 * Home hero: the headline's last words and the screen on the right change together, one offer at a time.
 * The bar inside the active tab is the timer (it pauses on hover or focus and stops once the visitor picks a tab);
 * with reduced motion nothing advances on its own.
 */
export function HeroStage({ prefix, items, tabsLabel, children }: { prefix: string; items: HeroItem[]; tabsLabel: string; children: ReactNode }) {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  return (
    <section className="hero section-dark">
      <div className="hero-glow" aria-hidden />
      <div className="hero-grid">
        <div className="hero-copy" data-enter>
          <h1 className="h-display">
            <span className="block">{prefix}</span>
            <span className="hero-words">
              {items.map((it, i) => <span key={it.key} className="hero-word" data-on={i === active} aria-hidden={i !== active}>{it.phrase}</span>)}
            </span>
          </h1>
          {children}
        </div>
        <div className="hero-side" data-enter>
          <div className="hero-tabs" role="tablist" aria-label={tabsLabel}>
            {items.map((it, i) => (
              <button key={it.key} type="button" role="tab" aria-selected={i === active} aria-controls="hero-stage" className="hero-tab" onClick={() => { setActive(i); setAuto(false); }}>
                {it.label}
                {i === active && auto && <span key={active} className="hero-tab-bar" aria-hidden onAnimationEnd={() => setActive((a) => (a + 1) % items.length)} />}
              </button>
            ))}
          </div>
          <div id="hero-stage" role="tabpanel" className="hero-stage">
            {items.map((it, i) => (
              <div key={it.key} className="hero-shot browser" data-on={i === active} aria-hidden={i !== active}>
                <div className="browser-bar" aria-hidden><i /><i /><i /></div>
                <div className="relative" style={{ aspectRatio: '16/10' }}>
                  <Image src={it.src} alt={it.alt} fill sizes="(min-width:1024px) 62vw, 100vw" priority={i === 0} className="object-cover object-top" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
