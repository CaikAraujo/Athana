import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { DemoMeta } from '../types';
import { categories, duree, soins } from './data';
import DemoForm, { type Field } from './Form';
import Header from './Header';
import Soins from './Soins';

export const meta: DemoMeta = {
  slug: 'studio-eclat',
  name: 'Studio Éclat',
  language: 'fr',
  pages: [
    { key: '', label: 'Accueil' },
    { key: 'soins', label: 'Soins & tarifs' },
    { key: 'salon', label: 'Le salon' },
    { key: 'reservation', label: 'Réservation' },
    { key: 'contact', label: 'Contact' },
  ],
};

const base = `/demo/${meta.slug}`;
const href = (key: string) => (key ? `${base}/${key}` : base);
const serif = 'font-[family-name:var(--serif)]';
const caps = 'text-[0.7rem] font-semibold uppercase tracking-[0.26em]';

const hours: [string, string][] = [
  ['Mardi – Vendredi', '9h00 – 19h00'],
  ['Samedi', '9h00 – 17h00'],
  ['Dimanche – Lundi', 'Fermé'],
];

const bookingFields: Field[] = [
  { name: 'soin', label: 'Soin souhaité', type: 'select', required: true, placeholder: 'Choisir un soin…', options: soins.map((s) => `${s.cat} · ${s.name} (${duree(s.min)}, CHF ${s.price}.–)`) },
  { name: 'date', label: 'Date', type: 'date', required: true, half: true, hint: 'Le salon est fermé le dimanche et le lundi.' },
  { name: 'pour', label: 'Pour', type: 'select', half: true, placeholder: '1 personne', options: ['2 personnes (cabine double)'] },
  { name: 'heure', label: 'Heure', type: 'chips', required: true, options: ['9h00', '10h00', '11h00', '13h30', '14h30', '15h30', '16h30', '17h30'] },
  { name: 'nom', label: 'Nom et prénom', type: 'text', required: true },
  { name: 'email', label: 'E-mail', type: 'email', required: true, half: true },
  { name: 'tel', label: 'Téléphone', type: 'tel', required: true, half: true, placeholder: '+41 00 000 00 00' },
  { name: 'message', label: 'Une précision à nous transmettre ? (facultatif)', type: 'textarea', placeholder: 'Peau sensible, grossesse, préférence de pression…' },
  { name: 'accord', label: 'J’accepte d’être contacté·e pour confirmer ce rendez-vous.', type: 'checkbox', required: true },
];

const contactFields: Field[] = [
  { name: 'nom', label: 'Nom', type: 'text', required: true, half: true },
  { name: 'email', label: 'E-mail', type: 'email', required: true, half: true },
  { name: 'sujet', label: 'Sujet', type: 'chips', required: true, options: ['Bon cadeau', 'Conseil', 'Événement privé', 'Autre'] },
  { name: 'message', label: 'Message', type: 'textarea', required: true },
];

/** Editorial "photo": a soft gradient arch with a botanical line drawing. */
function Arch({ from, to, variant = 0, label, className = '' }: { from: string; to: string; variant?: 0 | 1 | 2; label: string; className?: string }) {
  return (
    <div role="img" aria-label={label} className={`relative overflow-hidden rounded-t-full ${className}`} style={{ background: `linear-gradient(160deg, ${from}, ${to})` }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#ffffff66,transparent_55%)]" />
      <svg viewBox="0 0 300 400" className="absolute inset-0 size-full" fill="none" stroke="#3d2330" strokeWidth="1.6" strokeLinecap="round" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
        {variant === 0 ? (
          <>
            <path d="M150 400V170" />
            {[0, 1, 2, 3, 4].map((i) => (
              <g key={i}>
                <path d={`M150 ${350 - i * 40}c-40-6-64-30-70-66 36 4 62 26 70 66z`} fill="#3d233018" />
                <path d={`M150 ${330 - i * 40}c40-6 64-30 70-66-36 4-62 26-70 66z`} fill="#ffffff40" />
              </g>
            ))}
            <circle cx="150" cy="150" r="20" fill="#fbeee8" />
          </>
        ) : variant === 1 ? (
          <>
            <path d="M90 400c0-60 20-90 60-90s60 30 60 90" fill="#fffaf7" />
            <path d="M110 310c-10-50 10-90 40-90s50 40 40 90" fill="#ffffff55" />
            <ellipse cx="150" cy="212" rx="34" ry="10" fill="#3d233022" />
            <path d="M150 210c-30-40-20-80 0-110 20 30 30 70 0 110zM150 210c-50-20-66-56-62-90 34 10 58 40 62 90zM150 210c50-20 66-56 62-90-34 10-58 40-62 90z" fill="#ffffff30" />
          </>
        ) : (
          <>
            <circle cx="150" cy="210" r="70" fill="#ffffff35" />
            <circle cx="150" cy="210" r="46" />
            <circle cx="150" cy="210" r="22" fill="#3d233018" />
            <path d="M40 330q55-40 110 0t110 0M40 360q55-40 110 0t110 0M40 390q55-40 110 0t110 0" />
          </>
        )}
      </svg>
    </div>
  );
}

function Pill({ to, children, light = false }: { to: string; children: ReactNode; light?: boolean }) {
  return (
    <Link
      href={to}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 ${caps} transition ${
        light ? 'border border-current hover:bg-[#fbeee8] hover:text-[#3d2330]' : 'bg-[#3d2330] text-[#fbeee8] hover:bg-[#a4533c]'
      }`}
    >
      {children}
    </Link>
  );
}

function PageHead({ kicker, title, em, lead }: { kicker: string; title: string; em: string; lead: string }) {
  return (
    <section className="mx-auto grid max-w-6xl gap-6 px-5 pb-12 pt-6 md:grid-cols-[1.4fr_1fr] md:items-end md:pb-16 md:pt-10">
      <div>
        <p className={`${caps} text-[#a4533c]`}>{kicker}</p>
        <h1 className={`${serif} mt-4 text-5xl leading-[1.02] sm:text-7xl`}>
          {title} <em className="text-[#a4533c]">{em}</em>
        </h1>
      </div>
      <p className="max-w-md text-lg text-[#6b4a57] md:justify-self-end">{lead}</p>
    </section>
  );
}

function HoursList() {
  return (
    <dl className="grid gap-3">
      {hours.map(([d, h]) => (
        <div key={d} className="flex flex-wrap items-baseline justify-between gap-x-6 border-b border-current/20 pb-3">
          <dt className={`${serif} text-xl italic`}>{d}</dt>
          <dd className="text-sm">{h}</dd>
        </div>
      ))}
    </dl>
  );
}

function Home() {
  const tints: [string, string][] = [
    ['#f0b9a3', '#e9cfc0'],
    ['#c9d2bf', '#e9e3d2'],
    ['#e4c1cf', '#f3dcd3'],
    ['#e8c99a', '#f3e2cc'],
  ];
  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-4 md:grid-cols-[1.15fr_1fr] md:items-end md:pb-24">
        <div className="relative z-10 md:pb-10">
          <p className={`${caps} text-[#a4533c]`}>Institut de beauté &amp; bien-être</p>
          <h1 className={`${serif} mt-6 text-[3.4rem] leading-[0.95] sm:text-8xl md:-mr-24`}>
            Prendre
            <br />
            <em className="text-[#a4533c]">le temps</em>
            <br />
            de soi.
          </h1>
          <p className="mt-7 max-w-sm text-lg text-[#6b4a57]">Soins du visage, massages et rituels dans un salon lumineux, pensé comme une parenthèse au cœur de la ville.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Pill to={href('reservation')}>Réserver un soin</Pill>
            <Pill to={href('soins')} light>
              Soins &amp; tarifs
            </Pill>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-sm md:max-w-none">
          <Arch from="#f0b9a3" to="#d9907a" label="Illustration botanique dans une arche aux tons terracotta" className="aspect-[3/4]" />
          <div className={`absolute -left-4 bottom-10 grid size-28 place-items-center rounded-full bg-[#3d2330] text-center ${caps} leading-relaxed text-[#fbeee8] sm:-left-10 sm:size-32`}>
            <span>
              Sur
              <br />
              rendez-vous
            </span>
          </div>
        </div>
      </section>

      <section aria-label="Nos univers" className="border-y border-[#3d2330]/20 py-5">
        <ul className={`mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-2 px-5 ${serif} text-2xl italic text-[#3d2330]`}>
          {categories.map((c, i) => (
            <li key={c} className="flex items-center gap-10">
              {i > 0 && <span aria-hidden="true" className="hidden text-[#a4533c] sm:inline">✦</span>}
              {c}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-6 md:grid-cols-2 md:items-end">
          <h2 className={`${serif} text-4xl leading-tight sm:text-6xl`}>
            Quatre univers, <em className="text-[#a4533c]">une même douceur</em>
          </h2>
          <p className="max-w-md text-[#6b4a57] md:justify-self-end">Chaque soin commence par un échange : nous adaptons les gestes et les produits à votre peau et à votre humeur du jour.</p>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {categories.map((c, i) => {
            const first = soins.filter((s) => s.cat === c);
            const min = Math.min(...first.map((s) => s.price));
            return (
              <li key={c} className={i % 2 ? 'lg:mt-12' : ''}>
                <Link href={href('soins')} className="group block">
                  <Arch from={tints[i][0]} to={tints[i][1]} variant={(i % 3) as 0 | 1 | 2} label={`Illustration de l’univers ${c}`} className="aspect-[3/4] transition duration-500 group-hover:-translate-y-2" />
                  <p className={`${caps} mt-5 text-[#a4533c]`}>0{i + 1}</p>
                  <h3 className={`${serif} mt-1 flex items-center gap-2 text-2xl sm:text-3xl`}>
                    {c} <ArrowUpRight aria-hidden="true" className="size-5 opacity-0 transition group-hover:opacity-100" />
                  </h3>
                  <p className="mt-1 text-sm text-[#6b4a57]">
                    {first.length} soins · dès CHF {min}.–
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bg-[#3d2330] text-[#fbeee8] [&_:focus-visible]:outline-[#f0b9a3]!">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-[1fr_1.3fr] md:items-center">
          <Arch from="#6b3f50" to="#a4533c" variant={2} label="Illustration abstraite évoquant l’eau et la détente" className="mx-auto aspect-[3/4] w-full max-w-xs" />
          <div>
            <p className={`${caps} text-[#f0b9a3]`}>Notre philosophie</p>
            <p className={`${serif} mt-6 text-3xl leading-snug sm:text-5xl`}>
              La beauté n’est pas une course. C’est une <em className="text-[#f0b9a3]">attention</em> que l’on s’accorde.
            </p>
            <ul className="mt-10 grid gap-6 sm:grid-cols-3">
              {[
                ['Sur mesure', 'Un diagnostic avant chaque soin.'],
                ['Formules douces', 'Des produits choisis pour leur tolérance.'],
                ['Sans hâte', 'Du temps prévu entre deux rendez-vous.'],
              ].map(([t, d]) => (
                <li key={t} className="border-t border-[#fbeee8]/30 pt-4">
                  <h3 className={`${serif} text-xl italic`}>{t}</h3>
                  <p className="mt-1 text-sm text-[#fbeee8]/80">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20">
        <h2 className={`${serif} text-center text-4xl sm:text-5xl`}>
          Les soins <em className="text-[#a4533c]">les plus demandés</em>
        </h2>
        <ul className="mt-10">
          {[soins[0], soins[4], soins[11]].map((s) => (
            <li key={s.name} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[#3d2330]/20 py-5">
              <div>
                <h3 className={`${serif} text-2xl`}>{s.name}</h3>
                <p className="text-sm text-[#6b4a57]">
                  {s.cat} · {duree(s.min)}
                </p>
              </div>
              <p className={`${serif} text-2xl italic text-[#a4533c]`}>CHF {s.price}.–</p>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center">
          <Pill to={href('soins')}>Toute la carte des soins</Pill>
        </p>
      </section>
    </>
  );
}

function Salon() {
  return (
    <>
      <PageHead kicker="Le salon" title="Un lieu pour" em="ralentir" lead="Trois cabines, une lumière douce et une équipe qui prend le temps de vous connaître." />
      <section className="mx-auto grid max-w-6xl gap-5 px-5 pb-20 sm:grid-cols-3">
        <Arch from="#f0b9a3" to="#e9cfc0" variant={1} label="Illustration : vasque et fleurs séchées" className="aspect-[3/4] sm:mt-16" />
        <Arch from="#c9d2bf" to="#e9e3d2" label="Illustration : feuillage" className="aspect-[3/4]" />
        <Arch from="#e4c1cf" to="#f3dcd3" variant={2} label="Illustration : ondes d’eau" className="aspect-[3/4] sm:mt-16" />
      </section>
      <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 md:grid-cols-2">
        <h2 className={`${serif} text-4xl leading-tight sm:text-5xl`}>
          Pensé comme <em className="text-[#a4533c]">un appartement</em>, pas comme un institut.
        </h2>
        <div className="grid gap-5 text-lg text-[#6b4a57]">
          <p>Studio Éclat occupe le premier étage d’un immeuble ancien. Parquet, lin lavé et lumière du matin : tout a été choisi pour que l’on s’y sente attendu.</p>
          <p>Vous êtes accueilli·e au salon avec une infusion, puis accompagné·e en cabine. Après le soin, rien ne presse : le salon reste à vous le temps qu’il faut.</p>
        </div>
      </section>
      <section className="bg-[#f3dcd3]">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className={`${serif} text-4xl sm:text-5xl`}>
            L’<em className="text-[#a4533c]">équipe</em>
          </h2>
          <ul className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              ['Élise Exemple', 'Fondatrice, soins du visage', 'É', '#a4533c'],
              ['Manon Modèle', 'Massages et rituels', 'M', '#6b3f50'],
              ['Jade Fictive', 'Beauté des mains et des pieds', 'J', '#7b8a6f'],
            ].map(([n, r, l, c]) => (
              <li key={n} className="flex items-center gap-5 sm:block">
                <span aria-hidden="true" className={`${serif} grid h-28 w-24 shrink-0 place-items-center rounded-t-full text-5xl italic text-[#fbeee8] sm:h-40 sm:w-32`} style={{ background: c }}>
                  {l}
                </span>
                <div className="sm:mt-5">
                  <h3 className={`${serif} text-2xl`}>{n}</h3>
                  <p className="text-sm text-[#6b4a57]">{r}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-5 py-20 text-center">
        <p className={`${serif} mx-auto max-w-2xl text-3xl italic sm:text-4xl`}>Envie de découvrir le salon ?</p>
        <p className="mt-8">
          <Pill to={href('reservation')}>Réserver un soin</Pill>
        </p>
      </section>
    </>
  );
}

export default function Demo({ page }: { page: string }) {
  const known = meta.pages.some((p) => p.key === page) ? page : '';
  const items = meta.pages.map((p) => ({ href: href(p.key), label: p.label, active: p.key === known }));
  const vars = { '--serif': 'Didot, "Bodoni 72", "Bodoni MT", "Hoefler Text", "Baskerville Old Face", Garamond, "Times New Roman", serif' } as CSSProperties;
  return (
    <div
      style={vars}
      className="min-h-dvh overflow-x-clip bg-[#fbeee8] font-sans text-[#3d2330] [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-4 [&_:focus-visible]:outline-[#a4533c] [&_:is(h1,h2,h3)]:font-normal [&_:is(h1,h2,h3)]:tracking-normal"
    >
      <Header items={items} home={base} bookHref={href('reservation')} />
      <main>
        {known === 'soins' ? (
          <>
            <PageHead kicker="Soins & tarifs" title="La carte" em="des soins" lead="Choisissez un univers pour découvrir les soins, leur durée et leur tarif." />
            <section className="mx-auto max-w-6xl px-5 pb-20">
              <Soins bookHref={href('reservation')} />
              <p className="mt-10 text-sm text-[#6b4a57]">Prix en francs suisses, TVA comprise. Merci de prévenir 24 heures à l’avance en cas d’empêchement.</p>
            </section>
          </>
        ) : known === 'salon' ? (
          <Salon />
        ) : known === 'reservation' ? (
          <>
            <PageHead kicker="Réservation" title="Votre moment," em="votre rythme" lead="Choisissez un soin, une date et une heure. Nous confirmons votre rendez-vous par e-mail." />
            <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 lg:grid-cols-[1.5fr_1fr]">
              <div className="rounded-[2.5rem] bg-[#f3dcd3] p-6 sm:p-10">
                <DemoForm fields={bookingFields} submitLabel="Demander ce rendez-vous" title="Demande de réservation" />
              </div>
              <aside className="grid content-start gap-8">
                <Arch from="#c9d2bf" to="#e9e3d2" label="Illustration : feuillage dans une arche vert sauge" className="hidden aspect-[4/3] lg:block" />
                <div>
                  <h2 className={`${serif} text-3xl`}>Horaires</h2>
                  <div className="mt-4">
                    <HoursList />
                  </div>
                </div>
                <div>
                  <h2 className={`${serif} text-3xl`}>Avant votre venue</h2>
                  <ul className="mt-4 grid gap-2 text-[#6b4a57]">
                    <li>Arrivez dix minutes en avance pour profiter du salon.</li>
                    <li>Signalez-nous toute allergie ou sensibilité.</li>
                    <li>Les bons cadeaux se présentent à l’accueil.</li>
                  </ul>
                </div>
              </aside>
            </section>
          </>
        ) : known === 'contact' ? (
          <>
            <PageHead kicker="Contact" title="Écrivez-nous," em="passez nous voir" lead="Pour un conseil, un bon cadeau ou un événement privé, nous vous répondons avec plaisir." />
            <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 lg:grid-cols-[1fr_1.3fr]">
              <div className="grid content-start gap-10">
                <address className="not-italic">
                  <h2 className={`${caps} text-[#a4533c]`}>Adresse</h2>
                  <p className={`${serif} mt-3 text-3xl leading-snug`}>
                    Rue de l’Exemple 12
                    <br />
                    1700 Fribourg
                  </p>
                  <p className="mt-4 text-lg">+41 00 000 00 00</p>
                  <p className="text-lg">bonjour@example.ch</p>
                </address>
                <div>
                  <h2 className={`${caps} text-[#a4533c]`}>Horaires</h2>
                  <div className="mt-4">
                    <HoursList />
                  </div>
                </div>
              </div>
              <div className="rounded-[2.5rem] bg-[#f3dcd3] p-6 sm:p-10">
                <DemoForm fields={contactFields} submitLabel="Envoyer" title="Formulaire de contact" />
              </div>
            </section>
          </>
        ) : (
          <Home />
        )}
      </main>
      <footer className="mx-3 mb-3 rounded-[2.5rem] bg-[#3d2330] text-[#fbeee8] [&_:focus-visible]:outline-[#f0b9a3]!">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className={`${serif} text-6xl leading-none sm:text-8xl`}>
            Studio <em className="text-[#f0b9a3]">Éclat</em>
          </p>
          <div className="mt-12 grid gap-10 border-t border-[#fbeee8]/25 pt-10 sm:grid-cols-3">
            <nav aria-label="Pied de page">
              <ul className={`grid gap-3 ${caps}`}>
                {items.map((i) => (
                  <li key={i.href}>
                    <Link href={i.href} className="hover:text-[#f0b9a3]">
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <address className="text-sm not-italic text-[#fbeee8]/85">
              <p>Rue de l’Exemple 12, 1700 Fribourg</p>
              <p className="mt-2">+41 00 000 00 00</p>
              <p>bonjour@example.ch</p>
            </address>
            <div className="text-[#fbeee8]/85">
              <HoursList />
            </div>
          </div>
          <p className="mt-10 text-xs text-[#fbeee8]/65">© Studio Éclat — Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
