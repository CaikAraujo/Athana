'use client';

import { useId, useState } from 'react';
import { BedDouble, MapPin, Maximize, SearchX } from 'lucide-react';
import { chf, priceLabel, properties, PropertyArt, type Deal, type Kind, type Property } from './data';

const kinds: Kind[] = ['Appartement', 'Villa', 'Attique', 'Chalet'];
const budgets: Record<Deal, number[]> = { Acheter: [750000, 1000000, 1500000, 2500000], Louer: [2500, 3000, 3500] };
const selectCls = 'w-full border border-[#15171c]/25 bg-white px-3 py-3 text-base text-[#15171c] focus:border-[#15171c] focus:outline-none focus:shadow-[inset_0_-3px_0_#d52b1e]';
const labelCls = 'font-display text-xs font-semibold uppercase tracking-[0.12em]';

export function PropertyCard({ p }: { p: Property }) {
  return (
    <article className="group flex h-full flex-col border border-[#15171c]/15 bg-white">
      <div className="relative overflow-hidden">
        <PropertyArt p={p} className="block aspect-[4/3] w-full transition duration-500 group-hover:scale-105" />
        <span className={`absolute left-0 top-4 px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.12em] text-white ${p.deal === 'Louer' ? 'bg-[#15171c]' : 'bg-[#d52b1e]'}`}>
          {p.deal === 'Louer' ? 'À louer' : 'À vendre'}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-sm text-[#15171c]/70">
          <MapPin aria-hidden="true" className="size-4 text-[#d52b1e]" /> {p.city} · {p.kind}
        </p>
        <h3 className="mt-2 font-display text-lg font-semibold leading-snug">{p.title}</h3>
        <p className="mb-4 mt-1 text-sm text-[#15171c]/70">{p.feature}</p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-[#15171c]/10 pt-4">
          <p className="font-display text-xl font-bold">{priceLabel(p)}</p>
          <ul className="flex gap-4 text-sm text-[#15171c]/80">
            <li className="flex items-center gap-1.5">
              <BedDouble aria-hidden="true" className="size-4" /> {String(p.rooms).replace('.', ',')} p.
            </li>
            <li className="flex items-center gap-1.5">
              <Maximize aria-hidden="true" className="size-4" /> {p.area} m²
            </li>
          </ul>
        </div>
        <p className="mt-3 text-xs text-[#15171c]/55">Réf. {p.id}</p>
      </div>
    </article>
  );
}

export default function Listings() {
  const uid = useId();
  const [deal, setDeal] = useState<Deal>('Acheter');
  const [kind, setKind] = useState<'' | Kind>('');
  const [budget, setBudget] = useState(0);
  const [rooms, setRooms] = useState(0);
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');

  const list = properties
    .filter((p) => p.deal === deal && (!kind || p.kind === kind) && (!budget || p.price <= budget) && p.rooms >= rooms)
    .sort((a, b) => (sort === 'asc' ? a.price - b.price : b.price - a.price));
  const reset = () => {
    setKind('');
    setBudget(0);
    setRooms(0);
  };

  return (
    <div>
      <form onSubmit={(e) => e.preventDefault()} aria-label="Filtrer les biens" className="border border-[#15171c] bg-[#f3f1ec] p-5 sm:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1fr_1fr] lg:items-end">
          <div role="group" aria-label="Type de transaction" className="flex md:col-span-2 lg:col-span-1">
            {(['Acheter', 'Louer'] as Deal[]).map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={deal === d}
                onClick={() => {
                  setDeal(d);
                  setBudget(0);
                }}
                className="flex-1 border border-[#15171c] bg-white px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.1em] aria-pressed:bg-[#15171c] aria-pressed:text-white"
              >
                {d}
              </button>
            ))}
          </div>
          <div className="grid gap-1.5">
            <label htmlFor={`${uid}-k`} className={labelCls}>Type de bien</label>
            <select id={`${uid}-k`} value={kind} onChange={(e) => setKind(e.target.value as '' | Kind)} className={selectCls}>
              <option value="">Tous les types</option>
              {kinds.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor={`${uid}-b`} className={labelCls}>{deal === 'Louer' ? 'Loyer maximum' : 'Budget maximum'}</label>
            <select id={`${uid}-b`} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className={selectCls}>
              <option value={0}>Indifférent</option>
              {budgets[deal].map((b) => (
                <option key={b} value={b}>
                  Jusqu’à {chf(b)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor={`${uid}-r`} className={labelCls}>Pièces</label>
            <select id={`${uid}-r`} value={rooms} onChange={(e) => setRooms(Number(e.target.value))} className={selectCls}>
              <option value={0}>Indifférent</option>
              {[2, 3, 4, 5].map((r) => (
                <option key={r} value={r}>
                  {r} pièces et plus
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <label htmlFor={`${uid}-s`} className={labelCls}>Trier par</label>
            <select id={`${uid}-s`} value={sort} onChange={(e) => setSort(e.target.value as 'asc' | 'desc')} className={selectCls}>
              <option value="asc">Prix croissant</option>
              <option value="desc">Prix décroissant</option>
            </select>
          </div>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="font-display text-sm font-semibold uppercase tracking-[0.1em]">
          {list.length} bien{list.length > 1 ? 's' : ''} {deal === 'Louer' ? 'à louer' : 'à vendre'}
        </p>
        {(kind || budget > 0 || rooms > 0) && (
          <button type="button" onClick={reset} className="text-sm font-semibold underline underline-offset-4 hover:text-[#d52b1e]">
            Réinitialiser les filtres
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="mt-6 border border-dashed border-[#15171c]/40 px-6 py-16 text-center">
          <SearchX aria-hidden="true" className="mx-auto size-10 text-[#d52b1e]" />
          <p className="mt-4 font-display text-xl font-semibold">Aucun bien ne correspond à ces critères.</p>
          <p className="mt-2 text-[#15171c]/70">Élargissez votre recherche ou réinitialisez les filtres.</p>
          <button type="button" onClick={reset} className="mt-6 bg-[#15171c] px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.1em] text-white hover:bg-[#d52b1e]">
            Réinitialiser
          </button>
        </div>
      ) : (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <li key={p.id}>
              <PropertyCard p={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
