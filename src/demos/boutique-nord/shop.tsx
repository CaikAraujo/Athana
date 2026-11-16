'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ArrowLeft, Check, Info, Plus, ShieldCheck, Truck } from 'lucide-react';
import { CATEGORIES, chf, findProduct, href, ProductArt, PRODUCTS, type Product } from './data';
import { LineRow, QtyControl, useCart } from './cart';

const productHref = (p: Product) => `${href('produit')}?p=${p.id}`;

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  return (
    <li className="group relative flex flex-col">
      <Link href={productHref(product)} className="block overflow-hidden" aria-label={`${product.name}, ${product.kind}, ${chf(product.price)}`}>
        <ProductArt product={product} className="aspect-square w-full transition-transform duration-700 group-hover:scale-105" />
      </Link>
      <button type="button" onClick={() => add(product.id, product.variants[0].name)} className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white text-[#20201d] shadow-sm transition-colors hover:bg-[#20201d] hover:text-white" aria-label={`Ajouter ${product.name} au panier`}>
        <Plus className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{product.name}</p>
          <p className="text-sm text-[#5d5c56]">{product.kind}</p>
        </div>
        <p className="tabular-nums">{chf(product.price)}</p>
      </div>
      <ul className="mt-2 flex gap-1.5" aria-label="Coloris disponibles">
        {product.variants.map((v) => (
          <li key={v.name} title={v.name} className="h-3.5 w-3.5 rounded-full border border-[#20201d]/30" style={{ background: v.hex }}><span className="sr-only">{v.name}</span></li>
        ))}
      </ul>
    </li>
  );
}

export function Featured({ ids }: { ids: string[] }) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
      {ids.map((id) => {
        const p = findProduct(id);
        return p ? <ProductCard key={id} product={p} /> : null;
      })}
    </ul>
  );
}

type Sort = 'selection' | 'prix-asc' | 'prix-desc' | 'nom';

export function ShopGrid() {
  const [cat, setCat] = useState('Tout');
  const [sort, setSort] = useState<Sort>('selection');
  const list = PRODUCTS.filter((p) => cat === 'Tout' || p.cat === cat);
  if (sort === 'prix-asc') list.sort((a, b) => a.price - b.price);
  if (sort === 'prix-desc') list.sort((a, b) => b.price - a.price);
  if (sort === 'nom') list.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  return (
    <div>
      <div className="flex flex-col gap-4 border-y border-[#20201d]/15 py-4 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="Filtrer par catégorie" className="-mx-1 flex flex-wrap">
          {CATEGORIES.map((c) => (
            <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={`mx-1 px-2 py-2 text-sm uppercase tracking-[0.12em] ${cat === c ? 'border-b border-[#20201d] font-medium' : 'border-b border-transparent text-[#5d5c56] hover:text-[#20201d]'}`}>{c}</button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-[#5d5c56]">Trier par</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="border border-[#20201d]/30 bg-transparent px-3 py-2">
            <option value="selection">Notre sélection</option>
            <option value="prix-asc">Prix croissant</option>
            <option value="prix-desc">Prix décroissant</option>
            <option value="nom">Nom (A–Z)</option>
          </select>
        </label>
      </div>
      <p className="mt-4 text-sm text-[#5d5c56]" aria-live="polite">{list.length} article{list.length > 1 ? 's' : ''}</p>
      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-8">
        {list.map((p) => <ProductCard key={p.id} product={p} />)}
      </ul>
    </div>
  );
}

export function ProductDetail() {
  const params = useSearchParams();
  const product = findProduct(params.get('p')) ?? PRODUCTS[0];
  return <Detail key={product.id} product={product} />;
}

function Detail({ product }: { product: Product }) {
  const { add } = useCart();
  const [variant, setVariant] = useState(product.variants[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const others = PRODUCTS.filter((p) => p.id !== product.id && p.cat === product.cat).concat(PRODUCTS.filter((p) => p.cat !== product.cat)).slice(0, 4);
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link href={href('boutique')} className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.12em] text-[#5d5c56] hover:text-[#20201d]"><ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour à la boutique</Link>
      <div className="mt-6 grid gap-8 md:grid-cols-2 lg:gap-16">
        <div className="grid grid-cols-[1fr_auto] gap-3">
          <ProductArt product={product} color={variant.hex} className="aspect-square w-full" />
          <div className="flex flex-col gap-3" aria-hidden="true">
            {product.variants.map((v) => <ProductArt key={v.name} product={product} color={v.hex} className={`h-16 w-16 sm:h-20 sm:w-20 ${v.name === variant.name ? 'outline outline-1 outline-offset-2 outline-[#20201d]' : 'opacity-70'}`} />)}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#5d5c56]">{product.cat}</p>
          <h1 className="mt-2 text-5xl font-light tracking-tight sm:text-6xl">{product.name}</h1>
          <p className="mt-1 text-lg text-[#5d5c56]">{product.kind}</p>
          <p className="mt-5 text-2xl tabular-nums">{chf(product.price)}</p>
          <p className="mt-5 max-w-md leading-relaxed text-[#3c3b37]">{product.text}</p>

          <fieldset className="mt-7">
            <legend className="text-sm uppercase tracking-[0.15em]">Coloris : <span className="normal-case tracking-normal text-[#5d5c56]">{variant.name}</span></legend>
            <div className="mt-3 flex flex-wrap gap-3">
              {product.variants.map((v) => (
                <label key={v.name} className={`flex cursor-pointer items-center gap-2 border px-3 py-2 text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#3b5166] ${v.name === variant.name ? 'border-[#20201d] bg-white' : 'border-[#20201d]/25 hover:border-[#20201d]/60'}`}>
                  <input type="radio" name="coloris" value={v.name} checked={v.name === variant.name} onChange={() => { setVariant(v); setAdded(false); }} className="sr-only" />
                  <span className="h-4 w-4 rounded-full border border-[#20201d]/30" style={{ background: v.hex }} aria-hidden="true" />
                  {v.name}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <QtyControl value={qty} onChange={setQty} label={product.name} />
            <button type="button" onClick={() => { add(product.id, variant.name, qty); setAdded(true); }} className="flex-1 bg-[#20201d] px-6 py-3 text-sm font-medium uppercase tracking-[0.15em] text-white transition-colors hover:bg-[#3b5166] sm:flex-none sm:px-10">
              Ajouter au panier — {chf(product.price * qty)}
            </button>
          </div>
          <p aria-live="polite" className="mt-3 min-h-6 text-sm text-[#2f6b45]">
            {added && <span className="inline-flex items-center gap-1.5"><Check className="h-4 w-4" aria-hidden="true" /> Ajouté au panier.</span>}
          </p>

          <ul className="mt-6 space-y-2 border-t border-[#20201d]/15 pt-6 text-sm text-[#3c3b37]">
            {product.details.map((d) => <li key={d} className="flex gap-3"><span className="mt-2 h-px w-4 shrink-0 bg-[#20201d]" aria-hidden="true" />{d}</li>)}
          </ul>
          <ul className="mt-6 grid gap-3 text-sm text-[#5d5c56] sm:grid-cols-2">
            <li className="flex items-center gap-2"><Truck className="h-4 w-4" aria-hidden="true" /> Expédié sous 2 à 4 jours ouvrables</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" aria-hidden="true" /> Retour possible sous 30 jours</li>
          </ul>
        </div>
      </div>
      <section className="mt-20" aria-labelledby="bn-others">
        <h2 id="bn-others" className="text-sm uppercase tracking-[0.2em]">Vous aimerez aussi</h2>
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {others.map((p) => <ProductCard key={p.id} product={p} />)}
        </ul>
      </section>
    </div>
  );
}

export function CartPage() {
  const { lines, subtotal, count, ready, clear } = useCart();
  const shipping = subtotal === 0 || subtotal >= 150 ? 0 : 9;
  const total = subtotal + shipping;
  if (!ready) return <p className="py-20 text-center text-[#5d5c56]">Chargement du panier…</p>;
  if (lines.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-3xl font-light">Votre panier est vide.</p>
        <p className="mt-2 text-[#5d5c56]">Parcourez la collection pour y ajouter quelques objets.</p>
        <Link href={href('boutique')} className="mt-6 inline-block bg-[#20201d] px-8 py-3.5 text-sm font-medium uppercase tracking-[0.15em] text-white hover:bg-[#3b5166]">Voir la boutique</Link>
      </div>
    );
  }
  return (
    <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
      <section aria-labelledby="bn-items">
        <div className="flex items-baseline justify-between border-b border-[#20201d]/15 pb-3">
          <h2 id="bn-items" className="text-sm uppercase tracking-[0.2em]">Articles ({count})</h2>
          <button type="button" onClick={clear} className="text-sm text-[#5d5c56] underline underline-offset-4 hover:text-[#a23b22]">Vider le panier</button>
        </div>
        <ul className="divide-y divide-[#20201d]/15">
          {lines.map((l) => <LineRow key={l.id + l.variant} line={l} />)}
        </ul>
      </section>
      <section aria-labelledby="bn-summary" className="h-fit bg-white p-6 lg:sticky lg:top-32">
        <h2 id="bn-summary" className="text-sm uppercase tracking-[0.2em]">Récapitulatif de commande</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between"><dt>Sous-total</dt><dd className="tabular-nums">{chf(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Livraison (Suisse)</dt><dd className="tabular-nums">{shipping === 0 ? 'Offerte' : chf(shipping)}</dd></div>
          {shipping > 0 && <p className="text-xs text-[#5d5c56]">Plus que {chf(150 - subtotal)} pour la livraison offerte.</p>}
          <div className="flex justify-between border-t border-[#20201d]/15 pt-4 text-lg"><dt>Total</dt><dd className="font-medium tabular-nums">{chf(total)}</dd></div>
          <p className="text-xs text-[#5d5c56]">TVA incluse.</p>
        </dl>
        <div role="note" className="mt-6 flex gap-3 border border-[#3b5166] bg-[#e7edf2] p-4 text-sm text-[#22364a]">
          <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p><strong>Boutique de démonstration.</strong> Aucun paiement n’est traité et aucune commande n’est enregistrée : la commande s’arrête à ce récapitulatif.</p>
        </div>
        <button type="button" disabled aria-disabled="true" className="mt-4 w-full cursor-not-allowed bg-[#6f6e69] px-6 py-3.5 text-sm font-medium uppercase tracking-[0.15em] text-white">Paiement indisponible (démo)</button>
        <Link href={href('boutique')} className="mt-3 block text-center text-sm underline underline-offset-4">Continuer mes achats</Link>
      </section>
    </div>
  );
}
