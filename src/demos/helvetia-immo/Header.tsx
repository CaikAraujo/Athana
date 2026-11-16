'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

type Item = { href: string; label: string; active: boolean };

export default function Header({ items, home }: { items: Item[]; home: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[#15171c] bg-[#fbfaf7]">
      <div className="mx-auto flex max-w-7xl items-stretch justify-between">
        <Link href={home} onClick={() => setOpen(false)} className="flex items-center gap-3 px-5 py-4 font-display text-lg font-bold uppercase tracking-[0.08em]">
          <span aria-hidden="true" className="grid size-9 place-items-center bg-[#d52b1e] text-white">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 21V10l9-7 9 7v11M9 21v-7h6v7" />
            </svg>
          </span>
          Helvetia <span className="font-normal">Immo</span>
        </Link>
        <nav aria-label="Navigation principale" className="hidden lg:flex">
          {items.slice(1).map((i, idx, arr) => (
            <Link
              key={i.href}
              href={i.href}
              aria-current={i.active ? 'page' : undefined}
              className={
                idx === arr.length - 1
                  ? 'flex items-center bg-[#15171c] px-7 font-display text-sm font-semibold uppercase tracking-[0.1em] text-white hover:bg-[#d52b1e]'
                  : 'flex items-center border-l border-[#15171c]/15 px-6 font-display text-sm font-semibold uppercase tracking-[0.1em] hover:bg-[#f3f1ec] aria-[current=page]:shadow-[inset_0_-4px_0_#d52b1e]'
              }
            >
              {i.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="grid w-16 place-items-center border-l border-[#15171c] lg:hidden"
          aria-expanded={open}
          aria-controls="hi-menu"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X aria-hidden="true" className="size-6" /> : <Menu aria-hidden="true" className="size-6" />}
        </button>
      </div>
      {open && (
        <nav id="hi-menu" aria-label="Navigation mobile" className="border-t border-[#15171c] bg-[#fbfaf7] lg:hidden">
          <ul>
            {items.map((i, idx) => (
              <li key={i.href} className="border-b border-[#15171c]/15">
                <Link
                  href={i.href}
                  aria-current={i.active ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                  className="flex items-baseline gap-4 px-5 py-4 font-display text-lg font-semibold aria-[current=page]:bg-[#15171c] aria-[current=page]:text-white"
                >
                  <span className="text-xs text-[#d52b1e]">0{idx + 1}</span>
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
