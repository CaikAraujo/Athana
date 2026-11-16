'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { CheckCircle2, HardHat, Menu, X } from 'lucide-react';
import { ProjectArt, type ArtKind } from './art';

const BASE = '/demo/batipro';
const href = (key: string) => (key ? `${BASE}/${key}` : BASE);

export function Header({ pages, current }: { pages: { key: string; label: string }[]; current: string }) {
  const [open, setOpen] = useState(false);
  const links = pages.filter((p) => p.key !== 'devis');
  return (
    <header className="sticky top-0 z-40 bg-[#1b1d1f] text-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={BASE} className="flex items-center gap-2 font-display text-xl font-bold uppercase tracking-tight">
          <span className="grid h-9 w-9 place-items-center bg-[#ffc400] text-[#1b1d1f]">
            <HardHat className="h-5 w-5" aria-hidden="true" />
          </span>
          Bati<span className="text-[#ffc400]">Pro</span>
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
          {links.map((p) => (
            <Link
              key={p.key}
              href={href(p.key)}
              aria-current={current === p.key ? 'page' : undefined}
              className={`px-3 py-2 text-sm font-semibold uppercase tracking-wider transition-colors hover:text-[#ffc400] ${current === p.key ? 'text-[#ffc400] shadow-[inset_0_-3px_0_#ffc400]' : 'text-white/85'}`}
            >
              {p.label}
            </Link>
          ))}
          <Link href={href('devis')} className="ml-3 bg-[#ffc400] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-[#1b1d1f] transition-colors hover:bg-white">
            Devis gratuit
          </Link>
        </nav>
        <button type="button" className="grid h-11 w-11 place-items-center md:hidden" aria-expanded={open} aria-controls="bp-mobile-nav" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} onClick={() => setOpen((o) => !o)}>
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>
      {open && (
        <nav id="bp-mobile-nav" aria-label="Navigation mobile" className="border-t border-white/10 px-4 pb-4 md:hidden">
          {pages.map((p) => (
            <Link key={p.key} href={href(p.key)} onClick={() => setOpen(false)} aria-current={current === p.key ? 'page' : undefined} className={`block border-b border-white/10 py-3.5 text-sm font-semibold uppercase tracking-wider ${current === p.key ? 'text-[#ffc400]' : 'text-white'}`}>
              {p.label}
            </Link>
          ))}
        </nav>
      )}
      <div className="h-1.5 bg-[repeating-linear-gradient(135deg,#ffc400_0_14px,#1b1d1f_14px_28px)]" aria-hidden="true" />
    </header>
  );
}

/* ───────── Gallery ───────── */

type Project = { title: string; place: string; cat: string; kind: ArtKind; tone: number; scope: string; duration: string };

const PROJECTS: Project[] = [
  { title: 'Surélévation d’un immeuble locatif', place: 'Lausanne', cat: 'Gros œuvre', kind: 'facade', tone: 1, scope: 'Deux étages en ossature bois sur structure béton', duration: '9 mois' },
  { title: 'Réfection complète de toiture', place: 'Morges', cat: 'Toiture', kind: 'toiture', tone: 0, scope: 'Charpente, isolation, tuiles et ferblanterie', duration: '7 semaines' },
  { title: 'Cuisine ouverte et séjour', place: 'Nyon', cat: 'Rénovation intérieure', kind: 'interieur', tone: 3, scope: 'Démolition d’un mur porteur, parquet chêne, cuisine sur mesure', duration: '10 semaines' },
  { title: 'Terrasse et pergola bioclimatique', place: 'Vevey', cat: 'Extérieurs', kind: 'exterieur', tone: 1, scope: 'Dallage grès cérame, pergola aluminium, éclairage', duration: '5 semaines' },
  { title: 'Halle artisanale', place: 'Yverdon-les-Bains', cat: 'Gros œuvre', kind: 'facade', tone: 2, scope: 'Fondations, dalle industrielle, structure métallique', duration: '6 mois' },
  { title: 'Transformation de combles', place: 'Fribourg', cat: 'Toiture', kind: 'toiture', tone: 1, scope: 'Création de deux chambres, velux et isolation', duration: '3 mois' },
  { title: 'Salle de bains à l’italienne', place: 'Genève', cat: 'Rénovation intérieure', kind: 'interieur', tone: 1, scope: 'Douche de plain-pied, carrelage grand format', duration: '4 semaines' },
  { title: 'Aménagement d’accès et murs de soutènement', place: 'Bulle', cat: 'Extérieurs', kind: 'exterieur', tone: 0, scope: 'Terrassement, murs en béton apparent, pavage', duration: '8 semaines' },
  { title: 'Assainissement de façade', place: 'Neuchâtel', cat: 'Gros œuvre', kind: 'facade', tone: 0, scope: 'Isolation périphérique, crépi minéral, échafaudages', duration: '11 semaines' },
];

const CATS = ['Tous', 'Gros œuvre', 'Toiture', 'Rénovation intérieure', 'Extérieurs'];

export function Gallery() {
  const [cat, setCat] = useState('Tous');
  const list = PROJECTS.filter((p) => cat === 'Tous' || p.cat === cat);
  return (
    <div>
      <div role="group" aria-label="Filtrer les réalisations par catégorie" className="flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={`border-2 px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${cat === c ? 'border-[#1b1d1f] bg-[#1b1d1f] text-[#ffc400]' : 'border-[#1b1d1f]/25 text-[#1b1d1f] hover:border-[#1b1d1f]'}`}>
            {c}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-[#5b5e61]" aria-live="polite">
        {list.length} chantier{list.length > 1 ? 's' : ''} affiché{list.length > 1 ? 's' : ''}
      </p>
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <li key={p.title} className="group flex flex-col bg-white shadow-[6px_6px_0_#1b1d1f]">
            <div className="relative aspect-[4/3] overflow-hidden">
              <ProjectArt kind={p.kind} tone={p.tone} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute left-0 top-4 bg-[#ffc400] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1b1d1f]">{p.cat}</span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-display text-lg font-bold leading-snug">{p.title}</h3>
              <p className="mt-2 flex-1 text-sm text-[#5b5e61]">{p.scope}</p>
              <dl className="mt-4 flex justify-between border-t-2 border-[#1b1d1f]/10 pt-3 text-xs font-semibold uppercase tracking-wider">
                <div>
                  <dt className="sr-only">Lieu</dt>
                  <dd>{p.place}</dd>
                </div>
                <div>
                  <dt className="sr-only">Durée</dt>
                  <dd className="text-[#5b5e61]">{p.duration}</dd>
                </div>
              </dl>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────── Quote form ───────── */

const TYPES = ['Construction neuve', 'Rénovation intérieure', 'Toiture / charpente', 'Façade / isolation', 'Aménagements extérieurs', 'Autre'];
const BUDGETS = ['Moins de CHF 20 000', 'CHF 20 000 – 50 000', 'CHF 50 000 – 150 000', 'CHF 150 000 – 500 000', 'Plus de CHF 500 000'];

const input = 'mt-1.5 w-full border-2 border-[#1b1d1f]/25 bg-white px-3 py-3 text-[#1b1d1f] placeholder:text-[#8a8d90] focus:border-[#1b1d1f] aria-[invalid=true]:border-[#b3261e]';

export function QuoteForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [budget, setBudget] = useState('');

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const v = (k: string) => String(d.get(k) ?? '').trim();
    const err: Record<string, string> = {};
    if (v('nom').length < 2) err.nom = 'Indiquez votre nom.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) err.email = 'Adresse e-mail invalide.';
    if (!v('type')) err.type = 'Sélectionnez un type de projet.';
    if (!budget) err.budget = 'Choisissez une fourchette de budget.';
    if (v('message').length < 20) err.message = 'Décrivez votre projet en 20 caractères minimum.';
    setErrors(err);
    if (Object.keys(err).length === 0) setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="border-l-8 border-[#ffc400] bg-white p-8">
        <CheckCircle2 className="h-10 w-10 text-[#2e7d32]" aria-hidden="true" />
        <h3 className="mt-4 font-display text-2xl font-bold">Merci !</h3>
        <p className="mt-2 text-[#3d4043]">Ceci est une démonstration : aucune donnée n’a été envoyée.</p>
        <button type="button" onClick={() => { setSent(false); setBudget(''); }} className="mt-6 border-2 border-[#1b1d1f] px-5 py-2.5 text-sm font-bold uppercase tracking-wider hover:bg-[#1b1d1f] hover:text-white">
          Nouvelle demande
        </button>
      </div>
    );
  }

  const E = ({ k }: { k: string }) => (errors[k] ? <p id={`bp-${k}-err`} className="mt-1 text-sm font-medium text-[#b3261e]">{errors[k]}</p> : null);
  const a = (k: string) => ({ id: `bp-${k}`, name: k, 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `bp-${k}-err` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="bg-white p-6 shadow-[8px_8px_0_#1b1d1f] sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="bp-nom" className="text-sm font-bold uppercase tracking-wider">Nom et prénom *</label>
          <input {...a('nom')} autoComplete="name" className={input} />
          <E k="nom" />
        </div>
        <div>
          <label htmlFor="bp-email" className="text-sm font-bold uppercase tracking-wider">E-mail *</label>
          <input {...a('email')} type="email" autoComplete="email" placeholder="vous@example.ch" className={input} />
          <E k="email" />
        </div>
        <div>
          <label htmlFor="bp-tel" className="text-sm font-bold uppercase tracking-wider">Téléphone</label>
          <input id="bp-tel" name="tel" type="tel" autoComplete="tel" className={input} />
        </div>
        <div>
          <label htmlFor="bp-npa" className="text-sm font-bold uppercase tracking-wider">NPA / localité du chantier</label>
          <input id="bp-npa" name="npa" className={input} />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="bp-type" className="text-sm font-bold uppercase tracking-wider">Type de projet *</label>
          <select {...a('type')} defaultValue="" className={input}>
            <option value="" disabled>Sélectionnez…</option>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <E k="type" />
        </div>
        <fieldset className="sm:col-span-2" aria-describedby={errors.budget ? 'bp-budget-err' : undefined}>
          <legend className="text-sm font-bold uppercase tracking-wider">Budget estimé *</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {BUDGETS.map((b) => (
              <label key={b} className={`cursor-pointer border-2 px-3 py-2 text-sm font-semibold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 ${budget === b ? 'border-[#1b1d1f] bg-[#ffc400]' : 'border-[#1b1d1f]/25 hover:border-[#1b1d1f]'}`}>
                <input type="radio" name="budget" value={b} checked={budget === b} onChange={() => setBudget(b)} className="sr-only" />
                {b}
              </label>
            ))}
          </div>
          <E k="budget" />
        </fieldset>
        <div className="sm:col-span-2">
          <label htmlFor="bp-message" className="text-sm font-bold uppercase tracking-wider">Votre projet *</label>
          <textarea {...a('message')} rows={5} placeholder="Surface, état actuel, délais souhaités…" className={input} />
          <E k="message" />
        </div>
      </div>
      <button type="submit" className="mt-6 w-full bg-[#1b1d1f] px-6 py-4 font-display text-base font-bold uppercase tracking-wider text-[#ffc400] transition-colors hover:bg-black sm:w-auto">
        Demander mon devis
      </button>
      <p className="mt-3 text-xs text-[#5b5e61]">* Champs obligatoires. Formulaire de démonstration : rien n’est transmis.</p>
    </form>
  );
}
