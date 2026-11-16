'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, Phone, X } from 'lucide-react';

type Item = { href: string; label: string; active: boolean };

export default function Header({ items, home, bookHref }: { items: Item[]; home: string; bookHref: string }) {
  const [open, setOpen] = useState(false);
  const links = items.filter((i) => i.href !== bookHref);
  return (
    <header className="sticky top-0 z-40 border-b border-[#d5e6ec] bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
        <Link href={home} onClick={() => setOpen(false)} className="flex items-center gap-2.5 text-lg font-semibold text-[#12344d]">
          <svg viewBox="0 0 40 40" aria-hidden="true" className="size-10">
            <rect width="40" height="40" rx="12" fill="#0c7c78" />
            <path d="M8 26c5-12 19-12 24 0" fill="none" stroke="#bfe9e4" strokeWidth="3" strokeLinecap="round" />
            <circle cx="20" cy="15" r="5" fill="#fff" />
          </svg>
          <span>
            Clinique <span className="text-[#0c7c78]">Alba</span>
          </span>
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 lg:flex">
          {links.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              aria-current={i.active ? 'page' : undefined}
              className="rounded-lg px-3.5 py-2 text-[0.95rem] font-medium text-[#33526a] hover:bg-[#eef6f8] hover:text-[#12344d] aria-[current=page]:bg-[#e2f4f2] aria-[current=page]:text-[#07504d]"
            >
              {i.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href={bookHref} className="hidden rounded-lg bg-[#0c7c78] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#096360] sm:inline-flex">
            Prendre rendez-vous
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-lg border border-[#b9d3dc] text-[#12344d] lg:hidden"
            aria-expanded={open}
            aria-controls="alba-menu"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X aria-hidden="true" className="size-5" /> : <Menu aria-hidden="true" className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="alba-menu" aria-label="Navigation mobile" className="border-t border-[#d5e6ec] bg-white px-5 py-4 lg:hidden">
          <ul className="grid gap-1">
            {items.map((i) => (
              <li key={i.href}>
                <Link
                  href={i.href}
                  aria-current={i.active ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-4 py-3 font-medium text-[#12344d] aria-[current=page]:bg-[#e2f4f2] aria-[current=page]:text-[#07504d]"
                >
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex items-center gap-2 border-t border-[#d5e6ec] px-4 pt-4 text-sm text-[#33526a]">
            <Phone aria-hidden="true" className="size-4 text-[#0c7c78]" /> +41 00 000 00 00
          </p>
        </nav>
      )}
    </header>
  );
}
