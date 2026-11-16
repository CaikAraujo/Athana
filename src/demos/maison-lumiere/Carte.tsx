'use client';

import { useState } from 'react';
import { Leaf } from 'lucide-react';
import { dishes, type Cat } from './data';

const tabs: ('Tout' | Cat)[] = ['Tout', 'Entrées', 'Plats', 'Desserts', 'Vins'];

export default function Carte() {
  const [tab, setTab] = useState<(typeof tabs)[number]>('Tout');
  const [veg, setVeg] = useState(false);
  const cats = (tab === 'Tout' ? tabs.slice(1) : [tab]) as Cat[];
  const visible = dishes.filter((d) => cats.includes(d.cat) && (!veg || d.veg || d.cat === 'Vins'));

  return (
    <div>
      <div className="flex flex-col items-center gap-5">
        <div role="group" aria-label="Filtrer la carte par catégorie" className="flex max-w-full flex-wrap justify-center gap-x-1 gap-y-2 border-y border-[#2a1c15]/20 py-3">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tab === t}
              onClick={() => setTab(t)}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#5b4a3c] transition hover:text-[#6e2233] aria-pressed:bg-[#6e2233] aria-pressed:text-[#f8f1e4]"
            >
              {t}
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-[#5b4a3c]">
          <input type="checkbox" checked={veg} onChange={(e) => setVeg(e.target.checked)} className="size-4 accent-[#6e2233]" />
          Afficher uniquement les plats végétariens
        </label>
      </div>

      <p className="sr-only" aria-live="polite">
        {visible.length} propositions affichées
      </p>

      <div className="mt-12 grid gap-14">
        {cats.map((c) => {
          const list = visible.filter((d) => d.cat === c);
          if (list.length === 0) return null;
          return (
            <section key={c} aria-labelledby={`cat-${c}`}>
              <h2 id={`cat-${c}`} className="text-center font-[family-name:var(--serif)] text-4xl italic text-[#6e2233]">
                {c}
              </h2>
              <div aria-hidden="true" className="mx-auto mt-3 flex w-40 items-center gap-3 text-[#8a6a2c]">
                <span className="h-px flex-1 bg-current" />
                <span className="size-1.5 rotate-45 bg-current" />
                <span className="h-px flex-1 bg-current" />
              </div>
              <ul className="mt-8 grid gap-x-14 gap-y-7 md:grid-cols-2">
                {list.map((d) => (
                  <li key={d.name}>
                    <div className="flex items-baseline gap-3">
                      <h3 className="font-[family-name:var(--serif)] text-xl text-[#2a1c15]">
                        {d.name}
                        {d.veg && d.cat !== 'Vins' && (
                          <>
                            <Leaf aria-hidden="true" className="ml-2 inline size-4 text-[#4d6b3c]" />
                            <span className="sr-only"> (végétarien)</span>
                          </>
                        )}
                      </h3>
                      <span aria-hidden="true" className="min-w-6 flex-1 border-b border-dotted border-[#2a1c15]/40" />
                      <span className="whitespace-nowrap font-[family-name:var(--serif)] text-lg text-[#6e2233]">CHF {d.price}.–</span>
                    </div>
                    <p className="mt-1 text-[0.95rem] text-[#5b4a3c]">{d.desc}</p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <p className="mt-14 flex items-center justify-center gap-2 text-center text-sm text-[#5b4a3c]">
        <Leaf aria-hidden="true" className="size-4 text-[#4d6b3c]" /> Plat végétarien · Prix en francs suisses, TVA et service compris.
      </p>
    </div>
  );
}
