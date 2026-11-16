'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

type Item = { href: string; label: string; active: boolean };

export default function Nav({ items, home }: { items: Item[]; home: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#0d0f1a] bg-[#f4f3ee]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link href={home} className="flex items-center gap-2 font-display text-xl font-bold tracking-tight" onClick={() => setOpen(false)}>
          <span aria-hidden="true" className="grid size-8 place-items-center rounded-lg bg-[#2b3bff] text-[#d9ff5b]">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 19 12 5l7 14M8.5 14h7" />
            </svg>
          </span>
          Atelier
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
          {items.slice(1, -1).map((i) => (
            <Link
              key={i.href}
              href={i.href}
              aria-current={i.active ? 'page' : undefined}
              className="rounded-full px-4 py-2 text-sm font-medium hover:bg-[#0d0f1a]/8 aria-[current=page]:bg-[#0d0f1a] aria-[current=page]:text-white"
            >
              {i.label}
            </Link>
          ))}
          <Link
            href={items[items.length - 1].href}
            className="ml-2 rounded-full bg-[#2b3bff] px-5 py-2.5 text-sm font-semibold text-white shadow-[3px_3px_0_#0d0f1a] transition hover:translate-x-px hover:translate-y-px hover:shadow-[2px_2px_0_#0d0f1a]"
          >
            Demander une démo
          </Link>
        </nav>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-xl border-2 border-[#0d0f1a] bg-white md:hidden"
          aria-expanded={open}
          aria-controls="atelier-menu"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
        </button>
      </div>
      {open && (
        <nav id="atelier-menu" aria-label="Navigation mobile" className="border-t-2 border-[#0d0f1a] bg-[#f4f3ee] px-5 py-4 md:hidden">
          <ul className="grid gap-1">
            {items.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  aria-current={i.active ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 font-display text-lg font-semibold aria-[current=page]:bg-[#0d0f1a] aria-[current=page]:text-white"
                >
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
