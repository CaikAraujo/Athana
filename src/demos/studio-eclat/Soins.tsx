'use client';

import Link from 'next/link';
import { useState } from 'react';
import { categories, duree, soins } from './data';

export default function Soins({ bookHref }: { bookHref: string }) {
  const [cat, setCat] = useState<string>(categories[0]);
  const list = soins.filter((s) => s.cat === cat);
  return (
    <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
      <div role="tablist" aria-label="Catégories de soins" aria-orientation="vertical" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-0 lg:overflow-visible lg:pb-0">
        {categories.map((c, i) => (
          <button
            key={c}
            type="button"
            role="tab"
            id={`tab-${i}`}
            aria-selected={cat === c}
            aria-controls="soins-panel"
            onClick={() => setCat(c)}
            className="group flex shrink-0 items-baseline gap-3 rounded-full border border-[#3d2330]/25 px-5 py-2.5 text-left transition aria-selected:border-[#3d2330] aria-selected:bg-[#3d2330] aria-selected:text-[#fbeee8] lg:rounded-none lg:border-0 lg:border-b lg:px-0 lg:py-5 lg:aria-selected:bg-transparent lg:aria-selected:text-[#a4533c]"
          >
            <span className="hidden text-xs tracking-[0.2em] opacity-60 lg:inline">0{i + 1}</span>
            <span className="font-[family-name:var(--serif)] text-xl italic lg:text-3xl">{c}</span>
          </button>
        ))}
      </div>
      <div role="tabpanel" id="soins-panel" aria-labelledby={`tab-${categories.indexOf(cat as (typeof categories)[number])}`} tabIndex={0}>
        <ul className="grid gap-4">
          {list.map((s) => (
            <li key={s.name} className="grid gap-x-6 gap-y-2 rounded-[1.75rem] bg-[#fffaf7] p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
              <div>
                <h3 className="font-[family-name:var(--serif)] text-2xl">{s.name}</h3>
                <p className="mt-1 max-w-xl text-[#6b4a57]">{s.desc}</p>
              </div>
              <div className="flex items-center gap-5 sm:flex-col sm:items-end sm:gap-1">
                <p className="font-[family-name:var(--serif)] text-2xl italic text-[#a4533c]">CHF {s.price}.–</p>
                <p className="text-xs uppercase tracking-[0.2em] text-[#6b4a57]">{duree(s.min)}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link href={bookHref} className="mt-8 inline-flex rounded-full bg-[#3d2330] px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#fbeee8] transition hover:bg-[#a4533c]">
          Réserver un soin {cat.toLowerCase()}
        </Link>
      </div>
    </div>
  );
}
