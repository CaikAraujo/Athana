import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import type { DemoMeta } from '../types';
import Carte from './Carte';
import { dishes } from './data';
import DemoForm, { type Field } from './Form';
import Header from './Header';

export const meta: DemoMeta = {
  slug: 'maison-lumiere',
  name: 'Maison Lumière',
  language: 'fr',
  pages: [
    { key: '', label: 'Accueil' },
    { key: 'carte', label: 'La carte' },
    { key: 'histoire', label: 'Notre histoire' },
    { key: 'reservation', label: 'Réserver' },
    { key: 'contact', label: 'Contact' },
  ],
};

const base = `/demo/${meta.slug}`;
const href = (key: string) => (key ? `${base}/${key}` : base);
const serif = 'font-[family-name:var(--serif)]';

const hours: [string, string][] = [
  ['Mardi – Vendredi', '11h45 – 14h00 · 18h45 – 22h30'],
  ['Samedi', '18h30 – 23h00'],
  ['Dimanche – Lundi', 'Fermé'],
];

const reservationFields: Field[] = [
  { name: 'date', label: 'Date', type: 'date', required: true, half: true },
  { name: 'couverts', label: 'Nombre de convives', type: 'select', required: true, half: true, options: ['1 personne', '2 personnes', '3 personnes', '4 personnes', '5 personnes', '6 personnes', '7 personnes', '8 personnes'] },
  { name: 'heure', label: 'Heure d’arrivée', type: 'chips', required: true, options: ['12h00', '12h30', '13h00', '19h00', '19h30', '20h00', '20h30', '21h00'], hint: 'Service du midi du mardi au vendredi uniquement.' },
  { name: 'nom', label: 'Nom et prénom', type: 'text', required: true },
  { name: 'email', label: 'E-mail', type: 'email', required: true, half: true },
  { name: 'tel', label: 'Téléphone', type: 'tel', required: true, half: true, placeholder: '+41 00 000 00 00' },
  { name: 'occasion', label: 'Occasion', type: 'select', half: true, placeholder: 'Aucune en particulier', options: ['Anniversaire', 'Repas d’affaires', 'Dîner en tête-à-tête', 'Fête de famille'] },
  { name: 'table', label: 'Préférence', type: 'select', half: true, placeholder: 'Sans préférence', options: ['Salle', 'Près de la verrière', 'Terrasse (selon météo)'] },
  { name: 'message', label: 'Allergies ou demandes particulières', type: 'textarea' },
];

const contactFields: Field[] = [
  { name: 'nom', label: 'Nom', type: 'text', required: true, half: true },
  { name: 'email', label: 'E-mail', type: 'email', required: true, half: true },
  { name: 'sujet', label: 'Objet', type: 'select', required: true, options: ['Privatisation', 'Bon cadeau', 'Presse', 'Autre demande'] },
  { name: 'message', label: 'Message', type: 'textarea', required: true },
];

function Ornament({ light = false }: { light?: boolean }) {
  return (
    <div aria-hidden="true" className={`mx-auto flex w-44 items-center gap-3 ${light ? 'text-[#d8b872]' : 'text-[#8a6a2c]'}`}>
      <span className="h-px flex-1 bg-current" />
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5 19 19M19 5l-3.5 3.5M8.5 15.5 5 19" />
      </svg>
      <span className="h-px flex-1 bg-current" />
    </div>
  );
}

function Kicker({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return <p className={`text-xs font-semibold uppercase tracking-[0.32em] ${light ? 'text-[#d8b872]' : 'text-[#7d5f24]'}`}>{children}</p>;
}

function Button({ to, children, light = false }: { to: string; children: ReactNode; light?: boolean }) {
  return (
    <Link
      href={to}
      className={`inline-flex items-center justify-center px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] transition ${
        light ? 'border border-[#f1e6d2]/60 text-[#f8f1e4] hover:bg-[#f8f1e4] hover:text-[#1f140f]' : 'bg-[#6e2233] text-[#f8f1e4] hover:bg-[#501624]'
      }`}
    >
      {children}
    </Link>
  );
}

/** Art-directed illustration: candle-lit table under an arched window. */
function TableScene({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 800 460" className={className} role="img" aria-label="Illustration : une table dressée, éclairée à la bougie, devant une verrière en arche" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="ml-glow" cx="50%" cy="48%" r="55%">
          <stop offset="0" stopColor="#f3c877" stopOpacity="0.9" />
          <stop offset="0.45" stopColor="#b9692f" stopOpacity="0.45" />
          <stop offset="1" stopColor="#1f140f" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ml-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2c1a14" />
          <stop offset="1" stopColor="#3d2218" />
        </linearGradient>
        <linearGradient id="ml-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#27344f" />
          <stop offset="1" stopColor="#8a5a52" />
        </linearGradient>
      </defs>
      <rect width="800" height="460" fill="url(#ml-wall)" />
      {[140, 400, 660].map((x) => (
        <g key={x}>
          <path d={`M${x - 85} 330V150a85 85 0 0 1 170 0v180z`} fill="url(#ml-sky)" stroke="#8a6a2c" strokeWidth="3" />
          <path d={`M${x} 66v264M${x - 85} 200h170M${x - 85} 270h170`} stroke="#8a6a2c" strokeWidth="2" opacity="0.8" />
          <circle cx={x + 34} cy={128} r="2" fill="#f8f1e4" />
          <circle cx={x - 40} cy={170} r="1.5" fill="#f8f1e4" />
        </g>
      ))}
      <rect y="330" width="800" height="130" fill="#1a100c" />
      <rect width="800" height="460" fill="url(#ml-glow)" />
      <ellipse cx="400" cy="372" rx="330" ry="34" fill="#f1e6d2" />
      <path d="M70 372c0 60 40 88 40 88h580s40-28 40-88z" fill="#e2d3b8" />
      <path d="M150 380q20 50 10 80M650 380q-20 50-10 80M300 400q6 30 0 60M500 400q-6 30 0 60" stroke="#c9b592" strokeWidth="2" fill="none" />
      <g>
        <rect x="392" y="262" width="16" height="92" fill="#f8f1e4" />
        <path d="M400 222c12 16 12 30 0 40-12-10-12-24 0-40z" fill="#f6b84a" />
        <path d="M400 238c5 8 5 16 0 22-5-6-5-14 0-22z" fill="#fff3cf" />
        <path d="M376 354h48l-8 16h-32z" fill="#a8823c" />
      </g>
      {[220, 580].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="372" rx="78" ry="13" fill="#fffaf0" stroke="#c9b592" />
          <ellipse cx={x} cy="371" rx="48" ry="7" fill="#f1e6d2" />
          <ellipse cx={x} cy="369" rx="20" ry="4" fill="#6e2233" />
          <path d={`M${x - 8} 366q8-10 16 0`} stroke="#4d6b3c" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      ))}
      {[318, 482].map((x) => (
        <g key={x} stroke="#f8f1e4" strokeWidth="2" fill="none" opacity="0.9">
          <path d={`M${x - 18} 286h36c0 34-8 46-18 46s-18-12-18-46z`} fill="#f8f1e4" fillOpacity="0.1" />
          <path d={`M${x - 16} 306h32c-2 18-8 26-16 26s-14-8-16-26z`} fill="#6e2233" stroke="none" />
          <path d={`M${x} 332v32M${x - 14} 366h28`} />
        </g>
      ))}
    </svg>
  );
}

/** Abstract plated-dish illustration, tinted per variant. */
function Plate({ tone, label }: { tone: string; label: string }) {
  return (
    <svg viewBox="0 0 300 300" role="img" aria-label={label} className="aspect-square w-full">
      <rect width="300" height="300" fill="#2a1c15" />
      <circle cx="150" cy="150" r="118" fill="#f8f1e4" />
      <circle cx="150" cy="150" r="84" fill="none" stroke="#e2d3b8" strokeWidth="2" />
      <path d="M96 168c10-50 60-66 96-42 22 16 22 50-4 64-34 18-98 16-92-22z" fill={tone} />
      <circle cx="132" cy="140" r="14" fill="#f3c877" />
      <path d="M150 174q24-34 50-22" stroke="#4d6b3c" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="184" cy="184" r="6" fill="#6e2233" />
      <circle cx="108" cy="188" r="4" fill="#4d6b3c" />
      <path d="M78 110q10-20 30-28" stroke={tone} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function PageHead({ kicker, title, lead }: { kicker: string; title: string; lead: string }) {
  return (
    <section className="bg-[#1f140f] px-5 pb-16 pt-10 text-center text-[#f8f1e4]">
      <Kicker light>{kicker}</Kicker>
      <h1 className={`${serif} mx-auto mt-4 max-w-3xl text-5xl italic sm:text-6xl`}>{title}</h1>
      <p className="mx-auto mt-5 max-w-xl text-lg text-[#f1e6d2]/85">{lead}</p>
      <div className="mt-8">
        <Ornament light />
      </div>
    </section>
  );
}

function Hours() {
  return (
    <dl className="grid gap-3">
      {hours.map(([d, h]) => (
        <div key={d} className="flex flex-wrap items-baseline justify-between gap-x-6 border-b border-current/15 pb-3">
          <dt className={`${serif} text-lg`}>{d}</dt>
          <dd className="text-sm opacity-85">{h}</dd>
        </div>
      ))}
    </dl>
  );
}

function Home() {
  const picks = ['Féra du Léman fumée', 'Joue de bœuf braisée', 'Tarte fine aux pommes'].map((n) => dishes.find((d) => d.name === n)!);
  const tones = ['#c98a5a', '#7a3b2a', '#d9a441'];
  return (
    <>
      <section className="relative overflow-hidden bg-[#1f140f] text-center text-[#f8f1e4]">
        <div className="relative z-10 mx-auto max-w-3xl px-5 pb-10 pt-8 sm:pt-14">
          <Kicker light>Cuisine de saison · Vieille ville</Kicker>
          <h1 className={`${serif} mt-5 text-5xl leading-[1.05] sm:text-7xl`}>
            La table où le temps <em className="text-[#d8b872]">ralentit</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[#f1e6d2]/85">
            Une cuisine française inspirée par les maraîchers, pêcheurs et vignerons de la région, servie à la lueur des bougies.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Button to={href('reservation')}>Réserver une table</Button>
            <Button to={href('carte')} light>
              Découvrir la carte
            </Button>
          </div>
        </div>
        <TableScene className="block h-64 w-full sm:h-96" />
      </section>

      <section className="mx-auto max-w-3xl px-5 py-20 text-center">
        <Kicker>La maison</Kicker>
        <h2 className={`${serif} mt-4 text-4xl sm:text-5xl`}>Simple, juste, de saison</h2>
        <p className="mt-6 text-lg leading-relaxed text-[#5b4a3c]">
          <span className={`${serif} float-left mr-3 text-6xl leading-[0.8] text-[#6e2233]`}>C</span>
          haque matin, la carte se construit autour de ce que la terre et le lac ont de meilleur à offrir. Peu de plats, cuisinés entièrement sur place, et une carte des vins qui fait la part belle aux domaines suisses.
        </p>
        <div className="mt-10">
          <Ornament />
        </div>
      </section>

      <section className="bg-[#efe5d3]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="text-center">
            <Kicker>À la carte en ce moment</Kicker>
            <h2 className={`${serif} mt-4 text-4xl sm:text-5xl`}>Les suggestions du chef</h2>
          </div>
          <ul className="mt-12 grid gap-8 md:grid-cols-3">
            {picks.map((d, i) => (
              <li key={d.name} className="bg-[#fffaf0] p-4 shadow-[0_20px_40px_-28px_#2a1c15]">
                <Plate tone={tones[i]} label={`Illustration du plat : ${d.name}`} />
                <div className="px-2 pb-3 pt-5 text-center">
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#7d5f24]">{d.cat}</p>
                  <h3 className={`${serif} mt-2 text-2xl`}>{d.name}</h3>
                  <p className="mt-2 text-sm text-[#5b4a3c]">{d.desc}</p>
                  <p className={`${serif} mt-3 text-lg text-[#6e2233]`}>CHF {d.price}.–</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-12 text-center">
            <Button to={href('carte')}>Voir toute la carte</Button>
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-px bg-[#2a1c15]/15 px-0 md:grid-cols-3">
        {[
          ['Menu du marché', 'Trois services, renouvelés chaque semaine, servis le midi du mardi au vendredi.', 'CHF 48.–'],
          ['Menu Lumière', 'Cinq services en accord avec la saison, pour toute la table, le soir.', 'CHF 96.–'],
          ['Accord mets et vins', 'Une sélection de crus suisses choisis pour accompagner chaque plat.', 'CHF 54.–'],
        ].map(([t, d, p]) => (
          <article key={t} className="bg-[#f8f1e4] px-8 py-12 text-center">
            <h3 className={`${serif} text-2xl italic text-[#6e2233]`}>{t}</h3>
            <p className="mx-auto mt-3 max-w-xs text-[#5b4a3c]">{d}</p>
            <p className={`${serif} mt-4 text-xl`}>{p}</p>
          </article>
        ))}
      </section>

      <section className="bg-[#6e2233] text-[#f8f1e4]">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center">
          <div>
            <Kicker light>Horaires</Kicker>
            <h2 className={`${serif} mt-4 text-4xl sm:text-5xl`}>Nous vous accueillons</h2>
            <p className="mt-4 max-w-md text-[#f1e6d2]/85">La réservation est vivement conseillée, en particulier le vendredi et le samedi soir.</p>
            <div className="mt-8">
              <Button to={href('reservation')} light>
                Réserver
              </Button>
            </div>
          </div>
          <Hours />
        </div>
      </section>
    </>
  );
}

function Histoire() {
  return (
    <>
      <PageHead kicker="Notre histoire" title="Une maison, une flamme" lead="Derrière la verrière, une petite équipe cuisine avec patience ce que la région produit de plus beau." />
      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center">
        <div className="overflow-hidden rounded-t-full border border-[#8a6a2c] p-2">
          <TableScene className="aspect-[4/5] w-full rounded-t-full" />
        </div>
        <div>
          <Kicker>L’esprit des lieux</Kicker>
          <h2 className={`${serif} mt-4 text-4xl`}>Une ancienne lampisterie devenue salle à manger</h2>
          <p className="mt-5 text-lg leading-relaxed text-[#5b4a3c]">
            Le restaurant occupe l’atelier d’un ancien fabricant de lampes, au cœur de la vieille ville. Les grandes verrières en arche ont été conservées ; le soir venu, seules les bougies éclairent les tables. C’est de là que la maison tient son nom.
          </p>
          <p className="mt-4 text-lg leading-relaxed text-[#5b4a3c]">
            En cuisine, la brigade travaille des produits entiers, achetés en direct. Les pains, les fonds et les glaces sont faits sur place, chaque jour.
          </p>
        </div>
      </section>
      <section className="bg-[#efe5d3]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className={`${serif} text-center text-4xl sm:text-5xl`}>Ce qui nous guide</h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {[
              ['La saison d’abord', 'La carte change au rythme des récoltes. Si un produit n’est pas à son meilleur, il n’est pas à la carte.'],
              ['Des circuits courts', 'Légumes, poissons du lac, viandes et fromages viennent de producteurs que nous connaissons personnellement.'],
              ['Le temps qu’il faut', 'Braisages lents, jus réduits, pâtes levées : la cuisine prend son temps, et vous aussi.'],
            ].map(([t, d], i) => (
              <li key={t} className="text-center">
                <span className={`${serif} text-6xl italic text-[#8a6a2c]`}>{['I', 'II', 'III'][i]}</span>
                <h3 className={`${serif} mt-3 text-2xl`}>{t}</h3>
                <p className="mt-3 text-[#5b4a3c]">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-5 py-20">
        <h2 className={`${serif} text-center text-4xl`}>L’équipe</h2>
        <ul className="mt-10 grid gap-8 sm:grid-cols-3">
          {[
            ['Camille Exemple', 'Cheffe de cuisine', 'C'],
            ['Julien Modèle', 'Chef pâtissier', 'J'],
            ['Anouk Fictive', 'Sommelière et directrice de salle', 'A'],
          ].map(([n, r, l]) => (
            <li key={n} className="text-center">
              <span aria-hidden="true" className={`${serif} mx-auto grid size-28 place-items-center rounded-full border border-[#8a6a2c] bg-[#fffaf0] text-5xl italic text-[#6e2233]`}>
                {l}
              </span>
              <h3 className={`${serif} mt-4 text-xl`}>{n}</h3>
              <p className="text-sm uppercase tracking-[0.14em] text-[#7d5f24]">{r}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Infos() {
  return (
    <address className="grid gap-4 not-italic">
      {[
        [MapPin, 'Rue de l’Exemple 12, 1200 Genève'],
        [Phone, '+41 00 000 00 00'],
        [Mail, 'bonjour@example.ch'],
      ].map(([Icon, text]) => {
        const I = Icon as typeof MapPin;
        return (
          <p key={text as string} className="flex items-start gap-3">
            <I aria-hidden="true" className="mt-1 size-5 shrink-0 text-[#8a6a2c]" />
            {text as string}
          </p>
        );
      })}
    </address>
  );
}

export default function Demo({ page }: { page: string }) {
  const known = meta.pages.some((p) => p.key === page) ? page : '';
  const items = meta.pages.map((p) => ({ href: href(p.key), label: p.label, active: p.key === known }));
  const vars = { '--serif': '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif' } as CSSProperties;
  return (
    <div
      style={vars}
      className="min-h-dvh bg-[#f8f1e4] font-sans text-[#2a1c15] [&_:focus-visible]:rounded-none [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-[#b8873a]"
    >
      <Header items={items} home={base} />
      <main>
        {known === 'carte' ? (
          <>
            <PageHead kicker="La carte" title="Les saveurs du moment" lead="Une carte courte, renouvelée au fil des arrivages. Filtrez par catégorie pour composer votre repas." />
            <section className="mx-auto max-w-5xl px-5 py-16">
              <Carte />
            </section>
          </>
        ) : known === 'histoire' ? (
          <Histoire />
        ) : known === 'reservation' ? (
          <>
            <PageHead kicker="Réservation" title="Votre table vous attend" lead="Indiquez la date, l’heure et le nombre de convives : nous confirmons votre réservation par e-mail." />
            <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.5fr_1fr]">
              <div className="border border-[#8a6a2c]/50 bg-[#fffaf0] p-6 sm:p-10">
                <h2 className={`${serif} mb-8 text-3xl italic text-[#6e2233]`}>Demande de réservation</h2>
                <DemoForm fields={reservationFields} submitLabel="Demander ma table" title="Demande de réservation" />
              </div>
              <aside className="grid content-start gap-8">
                <div>
                  <h2 className={`${serif} flex items-center gap-3 text-2xl`}>
                    <Clock aria-hidden="true" className="size-5 text-[#8a6a2c]" /> Horaires
                  </h2>
                  <div className="mt-4">
                    <Hours />
                  </div>
                </div>
                <div>
                  <h2 className={`${serif} text-2xl`}>Bon à savoir</h2>
                  <ul className="mt-4 grid gap-3 text-[#5b4a3c]">
                    <li>Les tables sont gardées quinze minutes après l’heure réservée.</li>
                    <li>À partir de neuf convives, contactez-nous pour une privatisation.</li>
                    <li>Signalez-nous vos allergies : la cuisine adapte volontiers les plats.</li>
                  </ul>
                </div>
              </aside>
            </section>
          </>
        ) : known === 'contact' ? (
          <>
            <PageHead kicker="Contact" title="Nous trouver, nous écrire" lead="Pour une réservation, préférez le formulaire dédié. Pour tout le reste, écrivez-nous ici." />
            <section className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-2">
              <div>
                <h2 className={`${serif} text-3xl`}>Maison Lumière</h2>
                <div className="mt-5 text-lg">
                  <Infos />
                </div>
                <svg viewBox="0 0 400 220" role="img" aria-label="Plan stylisé du quartier indiquant l’emplacement du restaurant" className="mt-8 w-full border border-[#8a6a2c]/50 bg-[#efe5d3]">
                  <path d="M0 150q120-50 220-20t180-40v130H0z" fill="#b9cdd6" />
                  <g stroke="#fffaf0" strokeWidth="14" fill="none">
                    <path d="M-10 60h420M120-10v150M260-10v130M-10 112l300-30" />
                  </g>
                  <g fill="#e2d3b8">
                    <rect x="20" y="10" width="80" height="34" />
                    <rect x="140" y="10" width="100" height="34" />
                    <rect x="280" y="10" width="100" height="34" />
                    <rect x="20" y="74" width="80" height="22" />
                    <rect x="280" y="74" width="100" height="14" />
                  </g>
                  <path d="M190 44c-14 0-24 10-24 23 0 17 24 37 24 37s24-20 24-37c0-13-10-23-24-23z" fill="#6e2233" />
                  <circle cx="190" cy="67" r="8" fill="#f8f1e4" />
                </svg>
                <div className="mt-8">
                  <h3 className={`${serif} text-2xl`}>Horaires</h3>
                  <div className="mt-4">
                    <Hours />
                  </div>
                </div>
              </div>
              <div className="border border-[#8a6a2c]/50 bg-[#fffaf0] p-6 sm:p-10">
                <h2 className={`${serif} mb-8 text-3xl italic text-[#6e2233]`}>Nous écrire</h2>
                <DemoForm fields={contactFields} submitLabel="Envoyer le message" title="Formulaire de contact" />
              </div>
            </section>
          </>
        ) : (
          <Home />
        )}
      </main>
      <footer className="bg-[#1f140f] text-[#f1e6d2]">
        <div className="mx-auto max-w-6xl px-5 py-16 text-center">
          <p className={`${serif} text-4xl italic text-[#f8f1e4]`}>Maison Lumière</p>
          <div className="mt-5">
            <Ornament light />
          </div>
          <nav aria-label="Pied de page" className="mt-8">
            <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs font-semibold uppercase tracking-[0.2em]">
              {items.map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="hover:text-[#d8b872]">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <address className="mt-8 text-sm not-italic text-[#f1e6d2]/80">
            Rue de l’Exemple 12, 1200 Genève · +41 00 000 00 00 · bonjour@example.ch
          </address>
          <p className="mt-6 text-xs text-[#f1e6d2]/60">© Maison Lumière — Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
