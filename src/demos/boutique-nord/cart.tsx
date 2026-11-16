'use client';

import Link from 'next/link';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Menu, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { chf, findProduct, href, ProductArt, type Product, type Variant } from './data';

type Item = { id: string; variant: string; qty: number };
export type Line = Item & { product: Product; v: Variant; total: number };

type Cart = {
  lines: Line[];
  count: number;
  subtotal: number;
  ready: boolean;
  open: boolean;
  setOpen: (o: boolean) => void;
  add: (id: string, variant: string, qty?: number) => void;
  setQty: (id: string, variant: string, qty: number) => void;
  remove: (id: string, variant: string) => void;
  clear: () => void;
};

const Ctx = createContext<Cart | null>(null);
const KEY = 'boutique-nord-cart';

export function useCart(): Cart {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart must be used inside CartProvider');
  return c;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) {
        setItems(parsed.filter((i): i is Item => !!i && typeof i.id === 'string' && typeof i.variant === 'string' && Number.isInteger(i.qty) && i.qty > 0 && !!findProduct(i.id)));
      }
    } catch {
      /* storage unavailable: the cart simply lives in memory */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, ready]);

  const add = useCallback((id: string, variant: string, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === id && i.variant === variant);
      if (found) return prev.map((i) => (i === found ? { ...i, qty: Math.min(99, i.qty + qty) } : i));
      return [...prev, { id, variant, qty }];
    });
    setOpen(true);
  }, []);
  const setQty = useCallback((id: string, variant: string, qty: number) => {
    setItems((prev) => (qty <= 0 ? prev.filter((i) => !(i.id === id && i.variant === variant)) : prev.map((i) => (i.id === id && i.variant === variant ? { ...i, qty: Math.min(99, qty) } : i))));
  }, []);
  const remove = useCallback((id: string, variant: string) => setItems((prev) => prev.filter((i) => !(i.id === id && i.variant === variant))), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<Cart>(() => {
    const lines = items.flatMap((i): Line[] => {
      const product = findProduct(i.id);
      if (!product) return [];
      const v = product.variants.find((x) => x.name === i.variant) ?? product.variants[0];
      return [{ ...i, product, v, total: product.price * i.qty }];
    });
    return { lines, count: lines.reduce((n, l) => n + l.qty, 0), subtotal: lines.reduce((n, l) => n + l.total, 0), ready, open, setOpen, add, setQty, remove, clear };
  }, [items, ready, open, add, setQty, remove, clear]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <CartDrawer />
    </Ctx.Provider>
  );
}

export function QtyControl({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  const b = 'grid h-10 w-10 place-items-center text-[#20201d] hover:bg-[#20201d] hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#20201d]';
  return (
    <div className="inline-flex items-center border border-[#20201d]/30" role="group" aria-label={`Quantité : ${label}`}>
      <button type="button" className={b} aria-label="Diminuer la quantité" disabled={value <= 1} onClick={() => onChange(value - 1)}><Minus className="h-4 w-4" aria-hidden="true" /></button>
      <output className="w-9 text-center text-sm font-medium" aria-live="polite">{value}</output>
      <button type="button" className={b} aria-label="Augmenter la quantité" disabled={value >= 99} onClick={() => onChange(value + 1)}><Plus className="h-4 w-4" aria-hidden="true" /></button>
    </div>
  );
}

export function LineRow({ line, compact }: { line: Line; compact?: boolean }) {
  const { setQty, remove } = useCart();
  return (
    <li className="flex gap-4 py-4">
      <ProductArt product={line.product} color={line.v.hex} className={compact ? 'h-20 w-20 shrink-0' : 'h-24 w-24 shrink-0 sm:h-32 sm:w-32'} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium">{line.product.name} <span className="font-normal text-[#5d5c56]">— {line.product.kind}</span></p>
            <p className="text-sm text-[#5d5c56]">{line.v.name}</p>
          </div>
          <p className="shrink-0 font-medium tabular-nums">{chf(line.total)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3">
          <QtyControl value={line.qty} label={line.product.name} onChange={(n) => setQty(line.id, line.variant, n)} />
          <button type="button" onClick={() => remove(line.id, line.variant)} className="inline-flex items-center gap-1.5 p-2 text-sm text-[#5d5c56] underline-offset-4 hover:text-[#a23b22] hover:underline" aria-label={`Retirer ${line.product.name} (${line.v.name}) du panier`}>
            <Trash2 className="h-4 w-4" aria-hidden="true" /> <span className="hidden sm:inline">Retirer</span>
          </button>
        </div>
      </div>
    </li>
  );
}

function CartDrawer() {
  const { open, setOpen, lines, subtotal, count } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, setOpen]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" className="absolute inset-0 h-full w-full cursor-default bg-[#20201d]/50" aria-label="Fermer le panier" tabIndex={-1} onClick={() => setOpen(false)} />
      <div role="dialog" aria-modal="true" aria-labelledby="bn-cart-title" className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[#f4f1ea] text-[#20201d] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#20201d]/15 px-5 py-4">
          <h2 id="bn-cart-title" className="text-sm font-medium uppercase tracking-[0.2em]">Panier ({count})</h2>
          <button ref={closeRef} type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center hover:bg-[#20201d]/10" aria-label="Fermer le panier"><X className="h-5 w-5" aria-hidden="true" /></button>
        </div>
        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="h-10 w-10 text-[#20201d]/40" aria-hidden="true" />
            <p>Votre panier est vide.</p>
            <Link href={href('boutique')} onClick={() => setOpen(false)} className="bg-[#20201d] px-6 py-3 text-sm font-medium uppercase tracking-[0.15em] text-white hover:bg-[#3b5166]">Voir la boutique</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-[#20201d]/15 overflow-y-auto px-5">
              {lines.map((l) => <LineRow key={l.id + l.variant} line={l} compact />)}
            </ul>
            <div className="border-t border-[#20201d]/15 px-5 py-5">
              <div className="flex justify-between text-lg"><span>Sous-total</span><span className="font-medium tabular-nums">{chf(subtotal)}</span></div>
              <p className="mt-1 text-xs text-[#5d5c56]">TVA incluse. Livraison calculée à l’étape suivante.</p>
              <Link href={href('panier')} onClick={() => setOpen(false)} className="mt-4 block bg-[#20201d] px-6 py-3.5 text-center text-sm font-medium uppercase tracking-[0.15em] text-white hover:bg-[#3b5166]">Voir le panier</Link>
              <button type="button" onClick={() => setOpen(false)} className="mt-2 w-full py-2.5 text-sm underline underline-offset-4">Continuer mes achats</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function Header({ pages, current }: { pages: { key: string; label: string }[]; current: string }) {
  const [menu, setMenu] = useState(false);
  const { count, setOpen, ready } = useCart();
  const nav = pages.filter((p) => p.key !== 'panier' && p.key !== 'produit');
  const isCurrent = (key: string) => current === key || (key === 'boutique' && current === 'produit');
  return (
    <header className="sticky top-0 z-40 border-b border-[#20201d]/15 bg-[#f4f1ea]/95 backdrop-blur">
      <p className="bg-[#20201d] px-4 py-1.5 text-center text-xs tracking-wide text-[#f4f1ea]">Livraison offerte en Suisse dès CHF 150.–</p>
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
        <div>
          <button type="button" className="-ml-2 grid h-11 w-11 place-items-center md:hidden" aria-expanded={menu} aria-controls="bn-mobile-nav" aria-label={menu ? 'Fermer le menu' : 'Ouvrir le menu'} onClick={() => setMenu((m) => !m)}>
            {menu ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
          <nav aria-label="Navigation principale" className="hidden gap-7 md:flex">
            {nav.map((p) => (
              <Link key={p.key} href={href(p.key)} aria-current={isCurrent(p.key) ? 'page' : undefined} className={`py-1 text-sm uppercase tracking-[0.15em] ${isCurrent(p.key) ? 'border-b border-[#20201d]' : 'border-b border-transparent hover:border-[#20201d]/40'}`}>{p.label}</Link>
            ))}
          </nav>
        </div>
        <Link href={href('')} className="text-xl font-light uppercase tracking-[0.35em]">Nord<span className="text-[#b07a1c]">.</span></Link>
        <div className="flex justify-end">
          <button type="button" onClick={() => setOpen(true)} className="relative -mr-2 flex h-11 items-center gap-2 px-2 text-sm uppercase tracking-[0.15em]" aria-label={`Ouvrir le panier, ${ready ? count : 0} article${count > 1 ? 's' : ''}`}>
            <span className="hidden sm:inline">Panier</span>
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#20201d] px-1 text-[11px] font-medium tracking-normal text-white" aria-hidden="true">{ready ? count : 0}</span>
          </button>
        </div>
      </div>
      {menu && (
        <nav id="bn-mobile-nav" aria-label="Navigation mobile" className="border-t border-[#20201d]/15 px-4 pb-3 md:hidden">
          {pages.filter((p) => p.key !== 'produit').map((p) => (
            <Link key={p.key} href={href(p.key)} onClick={() => setMenu(false)} aria-current={isCurrent(p.key) ? 'page' : undefined} className={`block border-b border-[#20201d]/10 py-3.5 text-sm uppercase tracking-[0.15em] ${isCurrent(p.key) ? 'font-semibold' : ''}`}>{p.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}
