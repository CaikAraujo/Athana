'use client';

import Link from 'next/link';
import { useState } from 'react';

type Item = { href: string; label: string; active: boolean };

export default function Header({ items, home, bookHref }: { items: Item[]; home: string; bookHref: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="relative z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-6">
        <Link href={home} onClick={() => setOpen(false)} className="font-[family-name:var(--serif)] text-2xl leading-none">
          Studio <em className="text-[#a4533c]">Éclat</em>
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-8 md:flex">
          {items
            .filter((i) => i.href !== bookHref && i.href !== home)
            .map((i) => (
              <Link
                key={i.href}
                href={i.href}
                aria-current={i.active ? 'page' : undefined}
                className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#3d2330] decoration-[#a4533c] decoration-2 underline-offset-8 hover:underline aria-[current=page]:underline"
              >
                {i.label}
              </Link>
            ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href={bookHref} className="hidden rounded-full border border-[#3d2330] px-6 py-3 text-[0.7rem] font-semibold uppercase tracking-[0.24em] transition hover:bg-[#3d2330] hover:text-[#fbeee8] sm:inline-flex">
            Réserver
          </Link>
          <button
            type="button"
            className="flex h-11 items-center gap-3 rounded-full border border-[#3d2330] px-4 text-[0.7rem] font-semibold uppercase tracking-[0.24em] md:hidden"
            aria-expanded={open}
            aria-controls="eclat-menu"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 'Fermer' : 'Menu'}
            <span aria-hidden="true" className="grid gap-1">
              <span className={`block h-px w-4 bg-current transition ${open ? 'translate-y-[2.5px] rotate-45' : ''}`} />
              <span className={`block h-px w-4 bg-current transition ${open ? '-translate-y-[2.5px] -rotate-45' : ''}`} />
            </span>
          </button>
        </div>
      </div>
      {open && (
        <nav id="eclat-menu" aria-label="Navigation mobile" className="absolute inset-x-3 top-full rounded-[2rem] bg-[#3d2330] p-8 text-[#fbeee8] shadow-2xl md:hidden [&_:focus-visible]:outline-[#f0b9a3]!">
          <ul className="grid gap-4">
            {items.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  aria-current={i.active ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                  className="block font-[family-name:var(--serif)] text-4xl italic aria-[current=page]:text-[#f0b9a3]"
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
