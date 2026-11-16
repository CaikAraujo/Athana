'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

const BASE = '/demo/cabinet-meridien';
const href = (key: string) => (key ? `${BASE}/${key}` : BASE);

export function Header({ pages, current }: { pages: { key: string; label: string }[]; current: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b border-[#10233f]/15 bg-[#f7f3ea]">
      <div className="bg-[#10233f] text-[#f7f3ea]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs tracking-wide sm:px-6">
          <span>Fiduciaire &amp; conseil — Genève</span>
          <span className="hidden sm:inline">+41 00 000 00 00 · contact@cabinet-meridien.example.ch</span>
        </div>
      </div>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href={BASE} className="flex items-center gap-3 text-[#10233f]">
          <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
            <circle cx="20" cy="20" r="18.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M20 1.5 V38.5 M5 11 Q20 17 35 11 M5 29 Q20 23 35 29" fill="none" stroke="#8a6d32" strokeWidth="1.5" />
          </svg>
          <span>
            <span className="cm-serif block text-2xl leading-none">Cabinet Méridien</span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.3em] text-[#5a6577]">Fiduciaire · Conseil</span>
          </span>
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-8 lg:flex">
          {pages.map((p) => (
            <Link key={p.key} href={href(p.key)} aria-current={current === p.key ? 'page' : undefined} className={`relative py-2 text-[15px] text-[#10233f] after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-[#8a6d32] after:transition-transform hover:after:scale-x-100 ${current === p.key ? 'font-semibold after:scale-x-100' : 'after:scale-x-0'}`}>
              {p.label}
            </Link>
          ))}
        </nav>
        <button type="button" className="grid h-11 w-11 place-items-center border border-[#10233f]/30 text-[#10233f] lg:hidden" aria-expanded={open} aria-controls="cm-mobile-nav" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} onClick={() => setOpen((o) => !o)}>
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>
      {open && (
        <nav id="cm-mobile-nav" aria-label="Navigation mobile" className="border-t border-[#10233f]/15 px-4 pb-4 lg:hidden">
          {pages.map((p) => (
            <Link key={p.key} href={href(p.key)} onClick={() => setOpen(false)} aria-current={current === p.key ? 'page' : undefined} className={`cm-serif block border-b border-[#10233f]/10 py-3.5 text-xl text-[#10233f] ${current === p.key ? 'italic text-[#8a6d32]' : ''}`}>
              {p.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

/* ───────── Expertises (tabs) ───────── */

const AREAS = [
  { id: 'compta', title: 'Comptabilité & révision', intro: 'Une comptabilité tenue avec rigueur est le socle de toute décision. Nous prenons en charge tout ou partie de vos travaux comptables.', items: ['Tenue de comptabilité et bouclements', 'Décomptes TVA', 'Comptes annuels selon le Code des obligations', 'Préparation à la révision', 'Tableaux de bord trimestriels'], who: 'PME, indépendants, associations et fondations.' },
  { id: 'fiscal', title: 'Fiscalité', intro: 'Nous accompagnons entreprises et particuliers dans leurs obligations déclaratives et dans la planification de leur situation fiscale.', items: ['Déclarations d’impôts des personnes physiques et morales', 'Planification fiscale et prévoyance', 'Fiscalité immobilière', 'Relations avec les administrations', 'Questions intercantonales et transfrontalières'], who: 'Dirigeants, familles, sociétés de capitaux.' },
  { id: 'rh', title: 'Salaires & administration RH', intro: 'Externaliser la gestion des salaires, c’est gagner en confidentialité et en sérénité, sans renoncer au contrôle.', items: ['Fiches de salaire mensuelles', 'Décomptes aux assurances sociales', 'Certificats de salaire annuels', 'Impôt à la source', 'Contrats et règlements du personnel'], who: 'Employeurs de 1 à 150 collaborateurs.' },
  { id: 'conseil', title: 'Conseil d’entreprise', intro: 'De la création à la transmission, nous éclairons les étapes qui engagent durablement votre société.', items: ['Création et choix de la forme juridique', 'Plans financiers et budgets', 'Évaluation d’entreprise', 'Restructurations', 'Succession et transmission'], who: 'Fondateurs, actionnaires et conseils d’administration.' },
];

export function Expertises() {
  const [id, setId] = useState(AREAS[0].id);
  const area = AREAS.find((a) => a.id === id) ?? AREAS[0];
  return (
    <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
      <div role="tablist" aria-label="Domaines d’expertise" aria-orientation="vertical" className="flex flex-col border-t border-[#10233f]/20">
        {AREAS.map((a, i) => (
          <button key={a.id} type="button" role="tab" id={`cm-tab-${a.id}`} aria-selected={a.id === id} aria-controls="cm-area" onClick={() => setId(a.id)} className={`flex items-baseline gap-4 border-b border-[#10233f]/20 px-3 py-5 text-left transition-colors ${a.id === id ? 'bg-[#10233f] text-[#f7f3ea]' : 'text-[#10233f] hover:bg-[#10233f]/5'}`}>
            <span className={`cm-serif text-sm italic ${a.id === id ? 'text-[#d6b775]' : 'text-[#8a6d32]'}`}>{['I', 'II', 'III', 'IV'][i]}</span>
            <span className="cm-serif text-xl">{a.title}</span>
          </button>
        ))}
      </div>
      <div id="cm-area" role="tabpanel" aria-labelledby={`cm-tab-${area.id}`} className="border border-[#10233f]/15 bg-white p-6 sm:p-10">
        <h2 className="cm-serif text-3xl text-[#10233f] sm:text-4xl">{area.title}</h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#3a4558]">{area.intro}</p>
        <h3 className="mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-[#8a6d32]">Prestations</h3>
        <ul className="mt-3 grid gap-x-8 sm:grid-cols-2">
          {area.items.map((it) => <li key={it} className="border-b border-[#10233f]/10 py-3 text-[#10233f]">{it}</li>)}
        </ul>
        <p className="mt-8 text-sm text-[#5a6577]"><span className="font-semibold text-[#10233f]">Pour qui ?</span> {area.who}</p>
        <Link href={href('contact')} className="mt-8 inline-flex items-center gap-2 bg-[#10233f] px-6 py-3 text-sm font-semibold tracking-wide text-[#f7f3ea] transition-colors hover:bg-[#8a6d32]">
          Demander un entretien <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

/* ───────── Publications ───────── */

const POSTS = [
  { theme: 'Fiscalité', date: '2026-10-06', title: 'Bouclement annuel : dix points à vérifier avant le 31 décembre', read: 6, text: 'Provisions, amortissements, délimitations : une liste de contrôle pour aborder la clôture sans précipitation.' },
  { theme: 'Entreprise', date: '2026-09-15', title: 'Sàrl ou SA ? Les critères qui comptent vraiment', read: 8, text: 'Capital, gouvernance, image, transmission : comparaison raisonnée de deux formes juridiques.' },
  { theme: 'Salaires', date: '2026-08-28', title: 'Engager son premier collaborateur : le calendrier administratif', read: 5, text: 'Affiliations, contrats, assurances : les démarches dans l’ordre, de la promesse d’embauche au premier salaire.' },
  { theme: 'Fiscalité', date: '2026-07-02', title: 'Télétravail transfrontalier : ce que l’employeur doit documenter', read: 7, text: 'Tour d’horizon des questions à se poser lorsque des collaborateurs travaillent depuis l’étranger.' },
  { theme: 'Entreprise', date: '2026-05-20', title: 'Transmettre son entreprise : commencer cinq ans avant', read: 9, text: 'Une succession réussie se prépare tôt. Les étapes, les interlocuteurs et les écueils fréquents.' },
  { theme: 'Comptabilité', date: '2026-04-11', title: 'Lire un bilan en quinze minutes', read: 4, text: 'Les quelques ratios qui permettent à un dirigeant non financier de se faire une idée juste.' },
  { theme: 'Salaires', date: '2026-03-03', title: 'Frais professionnels : rédiger un règlement clair', read: 5, text: 'Pourquoi formaliser le remboursement des frais, et comment structurer le document.' },
];
const THEMES = ['Tous', 'Fiscalité', 'Comptabilité', 'Salaires', 'Entreprise'];
const fmt = new Intl.DateTimeFormat('fr-CH', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export function Publications() {
  const [theme, setTheme] = useState('Tous');
  const [q, setQ] = useState('');
  const list = POSTS.filter((p) => (theme === 'Tous' || p.theme === theme) && (p.title + p.text).toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div role="group" aria-label="Filtrer par thème" className="flex flex-wrap gap-x-6 gap-y-2">
          {THEMES.map((t) => (
            <button key={t} type="button" aria-pressed={theme === t} onClick={() => setTheme(t)} className={`cm-serif border-b-2 pb-1 text-lg ${theme === t ? 'border-[#8a6d32] text-[#10233f]' : 'border-transparent text-[#5a6577] hover:text-[#10233f]'}`}>{t}</button>
          ))}
        </div>
        <div>
          <label htmlFor="cm-q" className="sr-only">Rechercher dans les publications</label>
          <input id="cm-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="w-full border-b border-[#10233f]/40 bg-transparent px-1 py-2 text-[#10233f] placeholder:text-[#5a6577] md:w-64" />
        </div>
      </div>
      <p className="mt-6 text-sm text-[#5a6577]" aria-live="polite">{list.length} publication{list.length > 1 ? 's' : ''}</p>
      <ul className="mt-2 border-t border-[#10233f]/20">
        {list.map((p) => (
          <li key={p.title} className="grid gap-2 border-b border-[#10233f]/20 py-7 md:grid-cols-[180px_1fr_auto] md:gap-8">
            <div className="text-sm text-[#5a6577]">
              <time dateTime={p.date}>{fmt.format(new Date(p.date))}</time>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d32]">{p.theme}</p>
            </div>
            <div>
              <h2 className="cm-serif text-2xl text-[#10233f]">{p.title}</h2>
              <p className="mt-2 max-w-2xl text-[#3a4558]">{p.text}</p>
            </div>
            <p className="text-sm text-[#5a6577] md:text-right">{p.read} min de lecture</p>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="cm-serif py-10 text-center text-xl italic text-[#5a6577]">Aucune publication ne correspond à votre recherche.</p>}
    </div>
  );
}

/* ───────── Contact form ───────── */

const field = 'mt-2 w-full border border-[#10233f]/30 bg-white px-3.5 py-3 text-[#10233f] placeholder:text-[#7a8494] focus:border-[#10233f] aria-[invalid=true]:border-[#a3261e]';
const label = 'text-sm font-semibold text-[#10233f]';

export function ContactForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const v = (k: string) => String(d.get(k) ?? '').trim();
    const err: Record<string, string> = {};
    if (v('nom').length < 2) err.nom = 'Veuillez indiquer votre nom.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) err.email = 'Veuillez saisir une adresse e-mail valide.';
    if (!v('sujet')) err.sujet = 'Veuillez choisir un domaine.';
    if (v('message').length < 20) err.message = 'Votre message doit compter au moins 20 caractères.';
    if (!d.get('accord')) err.accord = 'Veuillez confirmer avoir pris connaissance de cette mention.';
    setErrors(err);
    if (Object.keys(err).length === 0) setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="border border-[#10233f]/15 border-t-4 border-t-[#8a6d32] bg-white p-8 sm:p-10">
        <p className="cm-serif text-4xl text-[#10233f]">Merci !</p>
        <p className="mt-3 text-lg text-[#3a4558]">Ceci est une démonstration : aucune donnée n’a été envoyée.</p>
        <button type="button" onClick={() => setSent(false)} className="mt-6 border border-[#10233f] px-5 py-2.5 text-sm font-semibold text-[#10233f] hover:bg-[#10233f] hover:text-[#f7f3ea]">Rédiger un nouveau message</button>
      </div>
    );
  }

  const a = (k: string) => ({ id: `cm-${k}`, name: k, 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `cm-${k}-err` : undefined });
  const err = (k: string) => (errors[k] ? <p id={`cm-${k}-err`} className="mt-1.5 text-sm text-[#a3261e]">{errors[k]}</p> : null);

  return (
    <form onSubmit={onSubmit} noValidate className="border border-[#10233f]/15 bg-white p-6 sm:p-10">
      <div className="grid gap-6 sm:grid-cols-2">
        <div><label htmlFor="cm-nom" className={label}>Nom et prénom *</label><input {...a('nom')} autoComplete="name" className={field} />{err('nom')}</div>
        <div><label htmlFor="cm-societe" className={label}>Société</label><input id="cm-societe" name="societe" autoComplete="organization" className={field} /></div>
        <div><label htmlFor="cm-email" className={label}>E-mail *</label><input {...a('email')} type="email" autoComplete="email" placeholder="vous@example.ch" className={field} />{err('email')}</div>
        <div><label htmlFor="cm-tel" className={label}>Téléphone</label><input id="cm-tel" name="tel" type="tel" autoComplete="tel" className={field} /></div>
        <div className="sm:col-span-2">
          <label htmlFor="cm-sujet" className={label}>Domaine concerné *</label>
          <select {...a('sujet')} defaultValue="" className={field}>
            <option value="" disabled>Choisir…</option>
            {AREAS.map((x) => <option key={x.id}>{x.title}</option>)}
            <option>Autre demande</option>
          </select>
          {err('sujet')}
        </div>
        <div className="sm:col-span-2"><label htmlFor="cm-message" className={label}>Votre message *</label><textarea {...a('message')} rows={6} className={field} />{err('message')}</div>
        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 text-sm text-[#3a4558]">
            <input type="checkbox" {...a('accord')} className="mt-1 h-4 w-4 accent-[#10233f]" />
            <span>J’ai compris que ce formulaire est une démonstration et qu’aucune information n’est transmise. *</span>
          </label>
          {err('accord')}
        </div>
      </div>
      <button type="submit" className="mt-8 bg-[#10233f] px-8 py-3.5 font-semibold tracking-wide text-[#f7f3ea] transition-colors hover:bg-[#8a6d32]">Envoyer le message</button>
    </form>
  );
}
