'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

type Item = { href: string; label: string; active: boolean };

const linkCls =
  'border-b border-transparent pb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#f1e6d2]/85 hover:border-[#d8b872] hover:text-[#f8f1e4] aria-[current=page]:border-[#d8b872] aria-[current=page]:text-[#f8f1e4]';

export default function Header({ items, home }: { items: Item[]; home: string }) {
  const [open, setOpen] = useState(false);
  const rest = items.slice(1);
  const left = rest.slice(0, 2);
  const right = rest.slice(2);
  const renderLink = (i: Item) => (
    <Link key={i.href} href={i.href} aria-current={i.active ? 'page' : undefined} className={linkCls}>
      {i.label}
    </Link>
  );
  return (
    <header className="relative z-40 bg-[#1f140f] text-[#f8f1e4]">
      <p className="border-b border-[#f1e6d2]/15 px-4 py-2 text-center text-[0.7rem] uppercase tracking-[0.22em] text-[#f1e6d2]/80">
        Du mardi au samedi · midi et soir
      </p>
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-6 px-5 py-5">
        <nav aria-label="Navigation principale" className="hidden items-center gap-8 lg:flex">
          {left.map(renderLink)}
        </nav>
        <span className="lg:hidden" />
        <Link href={home} onClick={() => setOpen(false)} className="text-center font-[family-name:var(--serif)] leading-none">
          <span className="block text-[0.65rem] uppercase tracking-[0.5em] text-[#d8b872]">Maison</span>
          <span className="mt-1 block text-3xl italic sm:text-4xl">Lumière</span>
        </Link>
        <nav aria-label="Navigation secondaire" className="hidden items-center justify-end gap-8 lg:flex">
          {right.map(renderLink)}
        </nav>
        <button
          type="button"
          className="grid size-11 place-items-center justify-self-end border border-[#f1e6d2]/40 lg:hidden"
          aria-expanded={open}
          aria-controls="ml-menu"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
        </button>
      </div>
      {open && (
        <nav id="ml-menu" aria-label="Navigation mobile" className="absolute inset-x-0 top-full border-t border-[#f1e6d2]/15 bg-[#1f140f] px-5 pb-8 pt-4 shadow-2xl lg:hidden">
          <ul className="grid text-center">
            {items.map((i) => (
              <li key={i.href} className="border-b border-[#f1e6d2]/10">
                <Link
                  href={i.href}
                  aria-current={i.active ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                  className="block py-4 font-[family-name:var(--serif)] text-2xl italic aria-[current=page]:text-[#d8b872]"
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
