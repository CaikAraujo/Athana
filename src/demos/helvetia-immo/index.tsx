import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight, Camera, Compass, FileSignature, Handshake, KeyRound, Mail, MapPin, Phone, Scale, Search } from 'lucide-react';
import type { DemoMeta } from '../types';
import { properties, PropertyArt } from './data';
import DemoForm, { type Field } from './Form';
import Header from './Header';
import Listings, { PropertyCard } from './Listings';

export const meta: DemoMeta = {
  slug: 'helvetia-immo',
  name: 'Helvetia Immo',
  language: 'fr',
  pages: [
    { key: '', label: 'Accueil' },
    { key: 'biens', label: 'Nos biens' },
    { key: 'vendre', label: 'Vendre' },
    { key: 'agence', label: 'L’agence' },
    { key: 'contact', label: 'Contact' },
  ],
};

const base = `/demo/${meta.slug}`;
const href = (key: string) => (key ? `${base}/${key}` : base);
const cap = 'font-display text-xs font-semibold uppercase tracking-[0.16em]';

const estimationFields: Field[] = [
  { name: 'type', label: 'Type de bien', type: 'chips', required: true, options: ['Appartement', 'Villa', 'Attique', 'Chalet', 'Immeuble'] },
  { name: 'npa', label: 'NPA et localité', type: 'text', required: true, half: true, placeholder: '1000 Lausanne' },
  { name: 'surface', label: 'Surface habitable (m²)', type: 'number', required: true, half: true, min: 10, max: 2000 },
  { name: 'pieces', label: 'Nombre de pièces', type: 'select', required: true, half: true, options: ['1 – 2,5', '3 – 3,5', '4 – 4,5', '5 – 5,5', '6 et plus'] },
  { name: 'annee', label: 'Année de construction', type: 'number', half: true, min: 1700, max: 2030 },
  { name: 'delai', label: 'Horizon de vente', type: 'chips', required: true, options: ['Dès que possible', 'Dans 6 mois', 'Dans l’année', 'Je m’informe'] },
  { name: 'nom', label: 'Nom et prénom', type: 'text', required: true },
  { name: 'email', label: 'E-mail', type: 'email', required: true, half: true },
  { name: 'tel', label: 'Téléphone', type: 'tel', required: true, half: true, placeholder: '+41 00 000 00 00' },
  { name: 'accord', label: 'J’accepte d’être contacté·e par l’agence au sujet de mon estimation.', type: 'checkbox', required: true },
];

const contactFields: Field[] = [
  { name: 'projet', label: 'Votre projet', type: 'chips', required: true, options: ['Acheter', 'Louer', 'Vendre', 'Mettre en gérance'] },
  { name: 'nom', label: 'Nom et prénom', type: 'text', required: true, half: true },
  { name: 'email', label: 'E-mail', type: 'email', required: true, half: true },
  { name: 'ref', label: 'Référence du bien (facultatif)', type: 'text', placeholder: 'HI-101' },
  { name: 'message', label: 'Message', type: 'textarea', required: true },
];

function Btn({ to, children, dark = false }: { to: string; children: ReactNode; dark?: boolean }) {
  return (
    <Link
      href={to}
      className={`inline-flex items-center justify-center gap-2 px-7 py-4 font-display text-sm font-semibold uppercase tracking-[0.12em] transition ${
        dark ? 'bg-[#15171c] text-white hover:bg-[#d52b1e]' : 'bg-[#d52b1e] text-white hover:bg-[#15171c]'
      }`}
    >
      {children} <ArrowUpRight aria-hidden="true" className="size-4" />
    </Link>
  );
}

function SectionHead({ index, label, title }: { index: string; label: string; title: string }) {
  return (
    <div className="grid gap-4 border-t border-[#15171c] pt-5 md:grid-cols-[12rem_1fr]">
      <p className={cap}>
        <span className="text-[#d52b1e]">{index}</span> — {label}
      </p>
      <h2 className="max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{title}</h2>
    </div>
  );
}

function PageHead({ label, title, lead }: { label: string; title: string; lead: string }) {
  return (
    <section className="border-b border-[#15171c] bg-[#15171c] text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:py-20">
        <p className={`${cap} text-[#ff8f86]`}>{label}</p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-white/75">{lead}</p>
      </div>
    </section>
  );
}

function Home() {
  const hero = properties[1];
  const featured = [properties[2], properties[0], properties[3]];
  return (
    <>
      <section className="border-b border-[#15171c]">
        <div className="mx-auto grid max-w-7xl lg:grid-cols-[1fr_1.1fr]">
          <div className="flex flex-col justify-center px-5 py-12 sm:py-20 lg:pr-12">
            <p className={cap}>
              <span className="text-[#d52b1e]">●</span> Agence immobilière · Arc lémanique
            </p>
            <h1 className="mt-6 font-display text-[2.7rem] font-bold leading-[0.98] tracking-tight sm:text-7xl">
              Trouver
              <br />
              le bon lieu,
              <br />
              <span className="text-[#d52b1e]">au juste prix.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-[#15171c]/75">Achat, vente et location : une équipe locale vous accompagne de la première visite à la remise des clés.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Btn to={href('biens')}>Voir les biens</Btn>
              <Btn to={href('vendre')} dark>
                Estimer mon bien
              </Btn>
            </div>
          </div>
          <div className="relative min-h-72 border-t border-[#15171c] lg:border-l lg:border-t-0">
            <PropertyArt p={{ ...hero, id: 'hero' }} className="absolute inset-0 size-full" />
            <div className="absolute bottom-0 left-0 max-w-[85%] bg-[#fbfaf7] p-5 sm:max-w-xs">
              <p className={`${cap} text-[#d52b1e]`}>À la une</p>
              <p className="mt-2 font-display text-lg font-semibold leading-snug">{hero.title}</p>
              <p className="mt-1 text-sm text-[#15171c]/70">
                {hero.city} · {String(hero.rooms).replace('.', ',')} pièces · {hero.area} m²
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Nos métiers" className="border-b border-[#15171c] bg-[#f3f1ec]">
        <ul className="mx-auto grid max-w-7xl md:grid-cols-3">
          {[
            { icon: Search, t: 'Acheter', d: 'Appartements, villas et chalets sélectionnés et visités par nos soins.', to: 'biens' },
            { icon: Scale, t: 'Vendre', d: 'Une estimation argumentée et une mise en valeur soignée de votre bien.', to: 'vendre' },
            { icon: KeyRound, t: 'Louer', d: 'Des locations de qualité et une gérance attentive pour les propriétaires.', to: 'biens' },
          ].map((s, i) => (
            <li key={s.t} className="border-b border-[#15171c]/20 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
              <Link href={href(s.to)} className="group block h-full p-7 transition hover:bg-[#15171c] hover:text-white sm:p-9">
                <div className="flex items-start justify-between">
                  <s.icon aria-hidden="true" className="size-8 text-[#d52b1e]" />
                  <span className={`${cap} opacity-60`}>0{i + 1}</span>
                </div>
                <h2 className="mt-8 flex items-center gap-2 font-display text-2xl font-bold">
                  {s.t} <ArrowUpRight aria-hidden="true" className="size-5 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                </h2>
                <p className="mt-2 opacity-75">{s.d}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:py-24">
        <SectionHead index="01" label="Sélection" title="Des biens choisis, présentés sans détour." />
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <li key={p.id}>
              <PropertyCard p={p} />
            </li>
          ))}
        </ul>
        <div className="mt-10">
          <Btn to={href('biens')} dark>
            Tous les biens
          </Btn>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:pb-24">
        <SectionHead index="02" label="Méthode" title="Un accompagnement clair, étape par étape." />
        <ol className="mt-10 grid gap-px border border-[#15171c]/20 bg-[#15171c]/20 md:grid-cols-4">
          {[
            ['Écoute', 'Nous cernons votre projet, votre budget et vos priorités.'],
            ['Sélection', 'Vous recevez uniquement les biens qui correspondent.'],
            ['Visites', 'Nous organisons et commentons chaque visite avec vous.'],
            ['Signature', 'Nous vous accompagnons jusque chez le notaire.'],
          ].map(([t, d], i) => (
            <li key={t} className="bg-[#fbfaf7] p-6">
              <span className="font-display text-5xl font-bold text-[#15171c]/15">0{i + 1}</span>
              <h3 className="mt-4 font-display text-xl font-bold">{t}</h3>
              <p className="mt-2 text-sm text-[#15171c]/75">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-[#d52b1e] text-white [&_:focus-visible]:outline-[#ffffff]!">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-14 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Combien vaut votre bien ?</h2>
            <p className="mt-2 max-w-xl text-white/90">Recevez une estimation argumentée, établie par un courtier qui connaît votre quartier.</p>
          </div>
          <Btn to={href('vendre')} dark>
            Demander une estimation
          </Btn>
        </div>
      </section>
    </>
  );
}

function Vendre() {
  return (
    <>
      <PageHead label="Vendre" title="Vendre au juste prix, dans de bonnes conditions." lead="Une estimation fondée sur le marché local, puis un plan de mise en vente adapté à votre bien et à votre calendrier." />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className={cap}>
            <span className="text-[#d52b1e]">01</span> — Notre démarche
          </p>
          <ol className="mt-6 grid gap-0">
            {[
              { icon: Compass, t: 'Visite et estimation', d: 'Un courtier visite votre bien et vous remet une fourchette de prix argumentée.' },
              { icon: Camera, t: 'Mise en valeur', d: 'Reportage photo, plans et descriptif rédigé avec soin.' },
              { icon: Handshake, t: 'Visites et négociation', d: 'Nous qualifions les acquéreurs et défendons vos intérêts.' },
              { icon: FileSignature, t: 'Acte de vente', d: 'Nous coordonnons les démarches jusqu’à la signature chez le notaire.' },
            ].map((s) => (
              <li key={s.t} className="flex gap-5 border-t border-[#15171c]/20 py-6 last:border-b">
                <span className="grid size-12 shrink-0 place-items-center bg-[#15171c] text-white">
                  <s.icon aria-hidden="true" className="size-6" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-bold">{s.t}</h2>
                  <p className="mt-1 text-[#15171c]/75">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-[#15171c]/70">L’estimation est gratuite et ne vous engage à rien.</p>
        </div>
        <div className="border border-[#15171c] bg-white p-6 shadow-[10px_10px_0_#15171c] sm:p-9">
          <p className={`${cap} text-[#d52b1e]`}>Estimation gratuite</p>
          <h2 className="mb-7 mt-2 font-display text-3xl font-bold tracking-tight">Décrivez votre bien</h2>
          <DemoForm fields={estimationFields} submitLabel="Recevoir mon estimation" title="Demande d’estimation" />
        </div>
      </section>
    </>
  );
}

function Agence() {
  return (
    <>
      <PageHead label="L’agence" title="Une équipe locale, un conseil indépendant." lead="Helvetia Immo est une agence à taille humaine : chaque client a un interlocuteur unique, du premier échange à la remise des clés." />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-2 lg:items-center">
        <div className="border border-[#15171c]">
          <PropertyArt p={{ ...properties[2], id: 'agence' }} className="block aspect-[4/3] w-full" />
        </div>
        <div>
          <p className={cap}>
            <span className="text-[#d52b1e]">01</span> — Notre approche
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">Connaître chaque rue avant d’en parler.</h2>
          <p className="mt-5 text-lg text-[#15171c]/75">
            Nos courtiers vivent et travaillent dans les communes qu’ils couvrent. Ils connaissent les quartiers, les écoles, les projets d’urbanisme, et vous en parlent avec franchise.
          </p>
          <p className="mt-4 text-lg text-[#15171c]/75">Nous préférons présenter moins de biens, mais les présenter bien : descriptifs précis, plans à l’échelle et réponses claires à vos questions.</p>
        </div>
      </section>
      <section className="border-y border-[#15171c] bg-[#f3f1ec]">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <SectionHead index="02" label="Valeurs" title="Ce sur quoi vous pouvez compter." />
          <ul className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              ['Transparence', 'Honoraires annoncés dès le premier rendez-vous, comptes rendus après chaque visite.'],
              ['Disponibilité', 'Un interlocuteur unique, joignable directement, qui connaît votre dossier.'],
              ['Rigueur', 'Des dossiers complets et vérifiés avant toute mise sur le marché.'],
            ].map(([t, d]) => (
              <li key={t} className="border-l-4 border-[#d52b1e] pl-5">
                <h3 className="font-display text-xl font-bold">{t}</h3>
                <p className="mt-2 text-[#15171c]/75">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionHead index="03" label="Équipe" title="Vos interlocuteurs." />
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Sophie Exemple', 'Directrice, courtière', 'SE'],
            ['Lucas Modèle', 'Courtier vente', 'LM'],
            ['Émilie Fictive', 'Responsable location', 'EF'],
            ['Thomas Spécimen', 'Gérance et administration', 'TS'],
          ].map(([n, r, i], idx) => (
            <li key={n} className="border border-[#15171c]/15 bg-white p-6">
              <span aria-hidden="true" className={`grid size-20 place-items-center font-display text-2xl font-bold text-white ${idx % 2 ? 'bg-[#d52b1e]' : 'bg-[#15171c]'}`}>
                {i}
              </span>
              <h3 className="mt-5 font-display text-lg font-bold">{n}</h3>
              <p className="text-sm text-[#15171c]/70">{r}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Contact() {
  return (
    <>
      <PageHead label="Contact" title="Parlons de votre projet." lead="Une question sur un bien, une vente à préparer ? Écrivez-nous ou passez à l’agence." />
      <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <address className="grid gap-5 text-lg not-italic">
            <p className="flex items-start gap-4">
              <MapPin aria-hidden="true" className="mt-1 size-5 shrink-0 text-[#d52b1e]" />
              <span>
                Helvetia Immo
                <br />
                Rue de l’Exemple 12
                <br />
                1000 Lausanne
              </span>
            </p>
            <p className="flex items-center gap-4">
              <Phone aria-hidden="true" className="size-5 shrink-0 text-[#d52b1e]" /> +41 00 000 00 00
            </p>
            <p className="flex items-center gap-4">
              <Mail aria-hidden="true" className="size-5 shrink-0 text-[#d52b1e]" /> contact@example.ch
            </p>
          </address>
          <h2 className={`${cap} mt-10`}>Horaires de l’agence</h2>
          <dl className="mt-4 border-t border-[#15171c]">
            {[
              ['Lundi – Vendredi', '8h30 – 12h00 · 13h30 – 18h00'],
              ['Samedi', 'Sur rendez-vous'],
              ['Dimanche', 'Fermé'],
            ].map(([d, h]) => (
              <div key={d} className="flex flex-wrap justify-between gap-x-6 border-b border-[#15171c]/20 py-3">
                <dt className="font-semibold">{d}</dt>
                <dd className="text-[#15171c]/75">{h}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="border border-[#15171c] bg-white p-6 sm:p-9">
          <h2 className="mb-7 font-display text-3xl font-bold tracking-tight">Écrivez-nous</h2>
          <DemoForm fields={contactFields} submitLabel="Envoyer" title="Formulaire de contact" />
        </div>
      </section>
    </>
  );
}

export default function Demo({ page }: { page: string }) {
  const known = meta.pages.some((p) => p.key === page) ? page : '';
  const items = meta.pages.map((p) => ({ href: href(p.key), label: p.label, active: p.key === known }));
  return (
    <div className="min-h-dvh bg-[#fbfaf7] font-sans text-[#15171c] [&_:focus-visible]:rounded-none [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-2 [&_:focus-visible]:outline-[#d52b1e]">
      <Header items={items} home={base} />
      <main>
        {known === 'biens' ? (
          <>
            <PageHead label="Nos biens" title="À vendre et à louer." lead="Affinez par type, budget et nombre de pièces. Chaque bien a été visité par un courtier de l’agence." />
            <section className="mx-auto max-w-7xl px-5 py-12">
              <Listings />
            </section>
          </>
        ) : known === 'vendre' ? (
          <Vendre />
        ) : known === 'agence' ? (
          <Agence />
        ) : known === 'contact' ? (
          <Contact />
        ) : (
          <Home />
        )}
      </main>
      <footer className="border-t border-[#15171c] bg-[#15171c] text-white [&_:focus-visible]:outline-[#ffffff]!">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl font-bold uppercase tracking-[0.08em]">
              Helvetia <span className="font-normal">Immo</span>
            </p>
            <p className="mt-3 max-w-sm text-white/70">Achat, vente, location et gérance sur l’arc lémanique.</p>
          </div>
          <nav aria-label="Pied de page">
            <p className={`${cap} text-[#ff8f86]`}>Plan du site</p>
            <ul className="mt-4 grid gap-2">
              {items.map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="text-white/80 hover:text-white hover:underline">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <address className="not-italic text-white/80">
            <p className={`${cap} text-[#ff8f86]`}>Agence</p>
            <p className="mt-4">Rue de l’Exemple 12</p>
            <p>1000 Lausanne</p>
            <p className="mt-2">+41 00 000 00 00</p>
            <p>contact@example.ch</p>
          </address>
        </div>
        <p className="border-t border-white/15 px-5 py-5 text-center text-xs text-white/60">© Helvetia Immo — Tous droits réservés.</p>
      </footer>
    </div>
  );
}
