'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { Check, Menu, Minus, Mountain, Plus, X } from 'lucide-react';
import { Landscape, type Scene, type Season } from './landscape';

const BASE = '/demo/alpina-voyages';
const href = (key: string) => (key ? `${BASE}/${key}` : BASE);

export function Header({ pages, current }: { pages: { key: string; label: string }[]; current: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-[#0f3d3e]/10 bg-[#faf6ee]/95 backdrop-blur">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href={BASE} className="flex items-center gap-2.5 text-[#0f3d3e]">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0f3d3e] text-[#faf6ee]"><Mountain className="h-5 w-5" aria-hidden="true" /></span>
          <span className="av-serif text-2xl italic leading-none">Alpina <span className="not-italic text-[#c24e28]">Voyages</span></span>
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-1 rounded-full bg-white p-1 shadow-sm md:flex">
          {pages.map((p) => (
            <Link key={p.key} href={href(p.key)} aria-current={current === p.key ? 'page' : undefined} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${current === p.key ? 'bg-[#0f3d3e] text-white' : 'text-[#0f3d3e] hover:bg-[#0f3d3e]/10'}`}>
              {p.label}
            </Link>
          ))}
        </nav>
        <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-white text-[#0f3d3e] shadow-sm md:hidden" aria-expanded={open} aria-controls="av-mobile-nav" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} onClick={() => setOpen((o) => !o)}>
          {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>
      {open && (
        <nav id="av-mobile-nav" aria-label="Navigation mobile" className="mx-4 mb-4 rounded-3xl bg-white p-3 shadow-lg md:hidden">
          {pages.map((p) => (
            <Link key={p.key} href={href(p.key)} onClick={() => setOpen(false)} aria-current={current === p.key ? 'page' : undefined} className={`block rounded-2xl px-4 py-3 font-medium ${current === p.key ? 'bg-[#0f3d3e] text-white' : 'text-[#0f3d3e]'}`}>
              {p.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

/* ───────── Destinations ───────── */

type Dest = { name: string; region: string; season: Season; scene: Scene; kind: string; days: number; price: number; text: string };

const SEASONS: { key: Season | 'toutes'; label: string }[] = [
  { key: 'toutes', label: 'Toutes saisons' },
  { key: 'printemps', label: 'Printemps' },
  { key: 'ete', label: 'Été' },
  { key: 'automne', label: 'Automne' },
  { key: 'hiver', label: 'Hiver' },
];
const KINDS = ['Tous', 'Randonnée', 'Bien-être', 'Train panoramique', 'Ski & neige', 'Gastronomie'];

const DESTS: Dest[] = [
  { name: 'Lac des Quatre-Cantons', region: 'Suisse centrale', season: 'ete', scene: 'lac', kind: 'Bien-être', days: 4, price: 890, text: 'Bateau à vapeur, baignades et soirées au bord de l’eau.' },
  { name: 'Haute Route des glaciers', region: 'Valais', season: 'ete', scene: 'glacier', kind: 'Randonnée', days: 7, price: 1680, text: 'De cabane en cabane, avec guide de montagne diplômé.' },
  { name: 'Vignobles en terrasses', region: 'Lavaux', season: 'automne', scene: 'lac', kind: 'Gastronomie', days: 3, price: 640, text: 'Vendanges, caveaux et tables d’hôtes face au Léman.' },
  { name: 'Ligne de la Bernina', region: 'Grisons', season: 'hiver', scene: 'sommet', kind: 'Train panoramique', days: 5, price: 1240, text: 'Viaducs, cols enneigés et wagons panoramiques.' },
  { name: 'Villages de l’Engadine', region: 'Grisons', season: 'hiver', scene: 'village', kind: 'Ski & neige', days: 6, price: 1490, text: 'Ski de fond, sgraffites et bains thermaux.' },
  { name: 'Sentier des bisses', region: 'Valais', season: 'printemps', scene: 'village', kind: 'Randonnée', days: 4, price: 720, text: 'Marche douce le long des canaux d’irrigation historiques.' },
  { name: 'Mélèzes dorés du val d’Anniviers', region: 'Valais', season: 'automne', scene: 'sommet', kind: 'Randonnée', days: 5, price: 980, text: 'Lumière d’octobre, forêts flamboyantes et raclette au feu de bois.' },
  { name: 'Sources chaudes des Alpes', region: 'Oberland bernois', season: 'printemps', scene: 'glacier', kind: 'Bien-être', days: 3, price: 760, text: 'Bains, sauna et balades faciles au réveil de la nature.' },
  { name: 'Grand tour en train', region: 'Toute la Suisse', season: 'ete', scene: 'village', kind: 'Train panoramique', days: 8, price: 2150, text: 'Huit jours, cinq lignes mythiques, aucun volant.' },
];

const chip = (on: boolean) => `rounded-full border px-4 py-2 text-sm font-medium transition-colors ${on ? 'border-[#0f3d3e] bg-[#0f3d3e] text-white' : 'border-[#0f3d3e]/25 bg-white text-[#0f3d3e] hover:border-[#0f3d3e]'}`;

export function Destinations() {
  const [season, setSeason] = useState<Season | 'toutes'>('toutes');
  const [kind, setKind] = useState('Tous');
  const list = DESTS.filter((d) => (season === 'toutes' || d.season === season) && (kind === 'Tous' || d.kind === kind));
  return (
    <div>
      <div className="grid gap-5 rounded-[2rem] bg-white p-5 shadow-sm sm:p-6">
        <div role="group" aria-label="Filtrer par saison">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5c6f6f]">Saison</p>
          <div className="flex flex-wrap gap-2">
            {SEASONS.map((s) => <button key={s.key} type="button" aria-pressed={season === s.key} onClick={() => setSeason(s.key)} className={chip(season === s.key)}>{s.label}</button>)}
          </div>
        </div>
        <div role="group" aria-label="Filtrer par type de voyage">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#5c6f6f]">Type de voyage</p>
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={chip(kind === k)}>{k}</button>)}
          </div>
        </div>
      </div>
      <p className="mt-5 text-sm text-[#5c6f6f]" aria-live="polite">{list.length} destination{list.length > 1 ? 's' : ''}</p>
      {list.length === 0 ? (
        <div className="mt-6 rounded-[2rem] border border-dashed border-[#0f3d3e]/30 p-10 text-center">
          <p className="av-serif text-2xl italic text-[#0f3d3e]">Aucune destination pour cette combinaison.</p>
          <button type="button" onClick={() => { setSeason('toutes'); setKind('Tous'); }} className="mt-4 rounded-full bg-[#c24e28] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#a53f1e]">Réinitialiser les filtres</button>
        </div>
      ) : (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((d) => (
            <li key={d.name} className="group overflow-hidden rounded-[2rem] bg-white shadow-sm transition-shadow hover:shadow-xl">
              <div className="relative aspect-[5/4] overflow-hidden">
                <Landscape season={d.season} scene={d.scene} className="h-full w-full transition-transform duration-700 group-hover:scale-110" />
                <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#0f3d3e]">{d.kind}</span>
                <span className="absolute right-4 top-4 rounded-full bg-[#0f3d3e] px-3 py-1 text-xs font-semibold text-white">{SEASONS.find((s) => s.key === d.season)?.label}</span>
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c24e28]">{d.region}</p>
                <h3 className="av-serif mt-1 text-2xl text-[#0f3d3e]">{d.name}</h3>
                <p className="mt-2 text-sm text-[#4b5f5f]">{d.text}</p>
                <div className="mt-4 flex items-end justify-between border-t border-[#0f3d3e]/10 pt-4">
                  <span className="text-sm text-[#4b5f5f]">{d.days} jours</span>
                  <span className="text-sm text-[#4b5f5f]">dès <strong className="av-serif text-xl text-[#0f3d3e]">CHF {d.price.toLocaleString('fr-CH')}</strong></span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ───────── Trip detail with day-by-day itinerary ───────── */

type Trip = { id: string; name: string; tagline: string; season: Season; scene: Scene; days: number; price: number; level: string; group: string; itinerary: { title: string; text: string }[]; included: string[] };

const TRIPS: Trip[] = [
  {
    id: 'glaciers', name: 'Haute Route des glaciers', tagline: 'Sept jours de cabane en cabane, entre Arolla et Zermatt.', season: 'ete', scene: 'glacier', days: 7, price: 1680, level: 'Sportif', group: '4 à 8 personnes',
    itinerary: [
      { title: 'Arrivée à Arolla', text: 'Accueil par votre guide, vérification du matériel et dîner au village.' },
      { title: 'Montée à la première cabane', text: 'Cinq heures de marche dans les alpages, coucher de soleil sur les séracs.' },
      { title: 'Traversée du col', text: 'Passage encordé sur le glacier, pique-nique face aux sommets.' },
      { title: 'Journée de récupération', text: 'Courte étape, sieste sur la terrasse et initiation à la lecture de carte.' },
      { title: 'Le grand plateau', text: 'La plus longue étape : départ à l’aube, arrivée en cabane en début d’après-midi.' },
      { title: 'Descente vers Zermatt', text: 'Mélèzes, hameaux d’alpage et premier regard sur le Cervin.' },
      { title: 'Retour', text: 'Petit-déjeuner tardif, puis train jusqu’à votre gare de départ.' },
    ],
    included: ['Guide de montagne diplômé', 'Demi-pension en cabane', 'Prêt du matériel de glacier', 'Transport des bagages au point d’arrivée'],
  },
  {
    id: 'bernina', name: 'Hiver sur la ligne de la Bernina', tagline: 'Cinq jours en train panoramique, de Coire à la frontière italienne.', season: 'hiver', scene: 'sommet', days: 5, price: 1240, level: 'Facile', group: '2 à 12 personnes',
    itinerary: [
      { title: 'Coire, la vieille ville', text: 'Installation à l’hôtel, visite guidée et dîner de spécialités grisonnes.' },
      { title: 'Viaducs et tunnels hélicoïdaux', text: 'Voiture panoramique jusqu’en Engadine, balade en raquettes l’après-midi.' },
      { title: 'Le col à 2 253 m', text: 'Passage du col, arrêt au belvédère et descente vers les palmiers.' },
      { title: 'Journée libre en Engadine', text: 'Bains thermaux, ski de fond ou simple flânerie au bord du lac gelé.' },
      { title: 'Retour par l’Albula', text: 'Dernier trajet panoramique et correspondance vers votre domicile.' },
    ],
    included: ['Billets de train 1re classe', 'Quatre nuits en hôtel de charme', 'Petits-déjeuners et deux dîners', 'Carnet de voyage personnalisé'],
  },
  {
    id: 'lavaux', name: 'Vendanges en Lavaux', tagline: 'Trois jours gourmands dans les vignobles en terrasses.', season: 'automne', scene: 'lac', days: 3, price: 640, level: 'Très facile', group: '2 à 10 personnes',
    itinerary: [
      { title: 'Entre lac et murets', text: 'Marche commentée dans les vignes et première dégustation chez un vigneron.' },
      { title: 'Une journée de vendange', text: 'Sécateur en main le matin, repas des vendangeurs et croisière en fin de journée.' },
      { title: 'Marché et retour', text: 'Marché du samedi, déjeuner au bord de l’eau et départ en début d’après-midi.' },
    ],
    included: ['Deux nuits en maison d’hôtes', 'Trois dégustations commentées', 'Croisière sur le Léman', 'Transferts locaux en train'],
  },
];

export function TripPlanner() {
  const [id, setId] = useState(TRIPS[0].id);
  const [day, setDay] = useState(0);
  const trip = TRIPS.find((t) => t.id === id) ?? TRIPS[0];
  const step = trip.itinerary[Math.min(day, trip.itinerary.length - 1)];
  return (
    <div>
      <div role="tablist" aria-label="Choisir un séjour" className="flex gap-2 overflow-x-auto pb-2">
        {TRIPS.map((t) => (
          <button key={t.id} type="button" role="tab" id={`av-tab-${t.id}`} aria-selected={t.id === id} aria-controls="av-trip-panel" onClick={() => { setId(t.id); setDay(0); }} className={`shrink-0 ${chip(t.id === id)}`}>
            {t.name}
          </button>
        ))}
      </div>
      <div id="av-trip-panel" role="tabpanel" aria-labelledby={`av-tab-${trip.id}`} className="mt-4 overflow-hidden rounded-[2rem] bg-white shadow-sm">
        <div className="relative h-56 sm:h-80">
          <Landscape season={trip.season} scene={trip.scene} className="h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b2c2d]/85 via-transparent" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8">
            <h3 className="av-serif text-3xl sm:text-5xl">{trip.name}</h3>
            <p className="mt-1 max-w-xl text-white/90">{trip.tagline}</p>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-px bg-[#0f3d3e]/10 sm:grid-cols-4">
          {[['Durée', `${trip.days} jours`], ['Niveau', trip.level], ['Groupe', trip.group], ['Prix dès', `CHF ${trip.price.toLocaleString('fr-CH')}`]].map(([k, v]) => (
            <div key={k} className="bg-white p-4 sm:p-5">
              <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5c6f6f]">{k}</dt>
              <dd className="av-serif mt-1 text-xl text-[#0f3d3e]">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c24e28]">Itinéraire jour par jour</h4>
            <div role="group" aria-label="Jour de l’itinéraire" className="mt-3 flex flex-wrap gap-2">
              {trip.itinerary.map((s, i) => (
                <button key={s.title} type="button" aria-pressed={i === day} aria-label={`Jour ${i + 1}`} onClick={() => setDay(i)} className={`h-11 w-11 rounded-full text-sm font-semibold transition-colors ${i === day ? 'bg-[#c24e28] text-white' : 'bg-[#faf6ee] text-[#0f3d3e] hover:bg-[#cfe6e8]'}`}>
                  J{i + 1}
                </button>
              ))}
            </div>
            <div aria-live="polite" className="mt-5 rounded-3xl bg-[#faf6ee] p-5">
              <p className="av-serif text-2xl text-[#0f3d3e]">{step.title}</p>
              <p className="mt-2 text-[#4b5f5f]">{step.text}</p>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c24e28]">Compris dans le prix</h4>
            <ul className="mt-3 space-y-2.5">
              {trip.included.map((t) => (
                <li key={t} className="flex gap-3 text-[#2b4545]"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#1f7f6b]" aria-hidden="true" />{t}</li>
              ))}
            </ul>
            <Link href={href('contact')} className="mt-6 inline-block rounded-full bg-[#0f3d3e] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#c24e28]">Demander ce séjour</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── Enquiry form ───────── */

const field = 'mt-1.5 w-full rounded-2xl border border-[#0f3d3e]/25 bg-white px-4 py-3 text-[#0f3d3e] placeholder:text-[#7d8f8f] focus:border-[#0f3d3e] aria-[invalid=true]:border-[#b3261e]';

function Stepper({ label, value, min, onChange }: { label: string; value: number; min: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#0f3d3e]/25 bg-white px-4 py-2">
      <span className="font-medium text-[#0f3d3e]">{label}</span>
      <span className="flex items-center gap-3">
        <button type="button" aria-label={`Retirer : ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)} className="grid h-9 w-9 place-items-center rounded-full bg-[#faf6ee] text-[#0f3d3e] disabled:opacity-40"><Minus className="h-4 w-4" aria-hidden="true" /></button>
        <output aria-live="polite" className="w-5 text-center font-semibold">{value}</output>
        <button type="button" aria-label={`Ajouter : ${label}`} disabled={value >= 12} onClick={() => onChange(value + 1)} className="grid h-9 w-9 place-items-center rounded-full bg-[#faf6ee] text-[#0f3d3e] disabled:opacity-40"><Plus className="h-4 w-4" aria-hidden="true" /></button>
      </span>
    </div>
  );
}

export function EnquiryForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [adults, setAdults] = useState(2);
  const [kids, setKids] = useState(0);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const v = (k: string) => String(d.get(k) ?? '').trim();
    const err: Record<string, string> = {};
    if (v('nom').length < 2) err.nom = 'Merci d’indiquer votre nom.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) err.email = 'Adresse e-mail invalide.';
    if (!v('depart')) err.depart = 'Choisissez une date de départ.';
    if (!v('retour')) err.retour = 'Choisissez une date de retour.';
    else if (v('depart') && v('retour') <= v('depart')) err.retour = 'Le retour doit être après le départ.';
    if (v('message').length < 10) err.message = 'Dites-nous en un peu plus sur vos envies.';
    setErrors(err);
    if (Object.keys(err).length === 0) setSent(true);
  }

  if (sent) {
    return (
      <div role="status" className="rounded-[2rem] bg-[#0f3d3e] p-8 text-white sm:p-10">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-[#cfe6e8] text-[#0f3d3e]"><Check className="h-6 w-6" aria-hidden="true" /></span>
        <p className="av-serif mt-5 text-4xl italic">Merci !</p>
        <p className="mt-2 text-white/85">Ceci est une démonstration : aucune donnée n’a été envoyée.</p>
        <button type="button" onClick={() => setSent(false)} className="mt-6 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0f3d3e]">Nouvelle demande</button>
      </div>
    );
  }

  const a = (k: string) => ({ id: `av-${k}`, name: k, 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `av-${k}-err` : undefined });
  const err = (k: string) => (errors[k] ? <p id={`av-${k}-err`} className="mt-1 text-sm font-medium text-[#b3261e]">{errors[k]}</p> : null);
  const lab = 'text-sm font-semibold text-[#0f3d3e]';

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label htmlFor="av-nom" className={lab}>Nom et prénom *</label><input {...a('nom')} autoComplete="name" className={field} />{err('nom')}</div>
        <div><label htmlFor="av-email" className={lab}>E-mail *</label><input {...a('email')} type="email" autoComplete="email" placeholder="vous@example.ch" className={field} />{err('email')}</div>
        <div><label htmlFor="av-depart" className={lab}>Date de départ *</label><input {...a('depart')} type="date" className={field} />{err('depart')}</div>
        <div><label htmlFor="av-retour" className={lab}>Date de retour *</label><input {...a('retour')} type="date" className={field} />{err('retour')}</div>
        <fieldset className="sm:col-span-2">
          <legend className={lab}>Voyageurs</legend>
          <div className="mt-1.5 grid gap-3 sm:grid-cols-2">
            <Stepper label="Adultes" value={adults} min={1} onChange={setAdults} />
            <Stepper label="Enfants" value={kids} min={0} onChange={setKids} />
          </div>
        </fieldset>
        <div className="sm:col-span-2">
          <label htmlFor="av-envie" className={lab}>Type de voyage</label>
          <select id="av-envie" name="envie" className={field} defaultValue="Je ne sais pas encore">
            {['Je ne sais pas encore', ...KINDS.slice(1)].map((k) => <option key={k}>{k}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2"><label htmlFor="av-message" className={lab}>Vos envies *</label><textarea {...a('message')} rows={4} placeholder="Rythme, hébergement, occasions à fêter…" className={field} />{err('message')}</div>
      </div>
      <button type="submit" className="mt-6 w-full rounded-full bg-[#c24e28] px-7 py-3.5 font-semibold text-white transition-colors hover:bg-[#a53f1e] sm:w-auto">Envoyer ma demande</button>
      <p className="mt-3 text-xs text-[#5c6f6f]">* Champs obligatoires. Formulaire de démonstration : rien n’est transmis.</p>
    </form>
  );
}
