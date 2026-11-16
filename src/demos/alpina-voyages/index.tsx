import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowUpRight, Compass, HeartHandshake, Leaf, Mail, MapPin, Phone, Sparkles, TrainFront } from 'lucide-react';
import type { DemoMeta } from '../types';
import { Landscape } from './landscape';
import { Destinations, EnquiryForm, Header, TripPlanner } from './ui';

export const meta: DemoMeta = {
  slug: 'alpina-voyages',
  name: 'Alpina Voyages',
  language: 'fr',
  pages: [
    { key: '', label: 'Accueil' },
    { key: 'destinations', label: 'Destinations' },
    { key: 'sejours', label: 'Séjours' },
    { key: 'agence', label: 'L’agence' },
    { key: 'contact', label: 'Contact' },
  ],
};

const BASE = '/demo/alpina-voyages';
const wrap = 'mx-auto max-w-6xl px-4 sm:px-6';
const kicker = 'text-xs font-semibold uppercase tracking-[0.2em] text-[#c24e28]';

function PageHead({ label, title, children, season = 'ete' }: { label: string; title: string; children: ReactNode; season?: 'ete' | 'automne' | 'hiver' | 'printemps' }) {
  return (
    <section className={`${wrap} pt-6`}>
      <div className="relative overflow-hidden rounded-[2.5rem]">
        <Landscape season={season} scene="sommet" className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b2c2d]/90 via-[#0b2c2d]/60 to-transparent" aria-hidden="true" />
        <div className="relative px-6 py-14 text-white sm:px-12 sm:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ffd9a8]">{label}</p>
          <h1 className="av-serif mt-3 max-w-2xl text-4xl sm:text-6xl">{title}</h1>
          <p className="mt-4 max-w-xl text-lg text-white/90">{children}</p>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <Landscape season="ete" scene="lac" className="absolute inset-0 -z-10 h-full w-full" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0b2c2d]/55 via-[#0b2c2d]/10 to-[#faf6ee]" aria-hidden="true" />
        <div className={`${wrap} pb-40 pt-20 text-center sm:pb-56 sm:pt-28`}>
          <p className="inline-block rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#0f3d3e]">Voyages sur mesure dans les Alpes</p>
          <h1 className="av-serif mx-auto mt-6 max-w-4xl text-5xl text-white [text-shadow:0_2px_24px_rgb(11_44_45/0.55)] sm:text-7xl lg:text-8xl">
            Prenez de la <em>hauteur</em>, nous nous occupons du reste.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white [text-shadow:0_1px_12px_rgb(11_44_45/0.7)]">Randonnées, trains panoramiques et escapades au bord des lacs, imaginés par des passionnés de montagne.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href={`${BASE}/destinations`} className="rounded-full bg-[#c24e28] px-7 py-3.5 font-semibold text-white shadow-lg transition-colors hover:bg-[#a53f1e]">Explorer les destinations</Link>
            <Link href={`${BASE}/contact`} className="rounded-full bg-white px-7 py-3.5 font-semibold text-[#0f3d3e] shadow-lg transition-colors hover:bg-[#cfe6e8]">Créer mon voyage</Link>
          </div>
        </div>
      </section>

      <section className={`${wrap} -mt-20 sm:-mt-28`}>
        <ul className="grid gap-4 rounded-[2rem] bg-white p-4 shadow-xl sm:grid-cols-3 sm:p-6">
          {[
            { icon: Compass, title: 'Itinéraires sur mesure', text: 'Chaque voyage est dessiné à partir de vos envies et de votre rythme.' },
            { icon: TrainFront, title: 'En train, dès que possible', text: 'Nous privilégions le rail, le bateau et la marche.' },
            { icon: HeartHandshake, title: 'Un conseiller attitré', text: 'La même personne vous suit, de la première idée au retour.' },
          ].map((f) => (
            <li key={f.title} className="rounded-3xl bg-[#faf6ee] p-5">
              <f.icon className="h-7 w-7 text-[#c24e28]" aria-hidden="true" />
              <h2 className="av-serif mt-3 text-xl text-[#0f3d3e]">{f.title}</h2>
              <p className="mt-1 text-sm text-[#4b5f5f]">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${wrap} py-16 sm:py-24`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className={kicker}>Quatre saisons</p>
            <h2 className="av-serif mt-2 text-4xl text-[#0f3d3e] sm:text-5xl">La montagne change, nos idées aussi</h2>
          </div>
          <Link href={`${BASE}/destinations`} className="inline-flex items-center gap-1 font-semibold text-[#0f3d3e] underline decoration-[#c24e28] decoration-2 underline-offset-4">Toutes les destinations <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {([
            ['printemps', 'village', 'Printemps', 'Bisses, cascades et prairies en fleurs'],
            ['ete', 'glacier', 'Été', 'Cabanes d’altitude et lacs turquoise'],
            ['automne', 'sommet', 'Automne', 'Mélèzes dorés et tables de vignerons'],
            ['hiver', 'village', 'Hiver', 'Villages enneigés et bains chauds'],
          ] as const).map(([season, scene, label, text], i) => (
            <Link key={season} href={`${BASE}/destinations`} className={`group relative block overflow-hidden rounded-[2rem] ${i % 2 ? 'lg:mt-10' : ''}`}>
              <Landscape season={season} scene={scene} className="aspect-[3/4] w-full transition-transform duration-700 group-hover:scale-110" />
              <span className="absolute inset-0 bg-gradient-to-t from-[#0b2c2d]/85 via-transparent" aria-hidden="true" />
              <span className="absolute inset-x-0 bottom-0 p-5 text-white">
                <span className="av-serif block text-3xl italic">{label}</span>
                <span className="mt-1 block text-sm text-white/90">{text}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#0f3d3e] text-white">
        <div className={`${wrap} grid gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:items-center`}>
          <div className="overflow-hidden rounded-[2.5rem]">
            <Landscape season="hiver" scene="sommet" className="aspect-[4/3] w-full" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ffd9a8]">Séjour à la une</p>
            <h2 className="av-serif mt-2 text-4xl sm:text-5xl">Hiver sur la ligne de la Bernina</h2>
            <p className="mt-4 text-white/85">Cinq jours en voiture panoramique, entre viaducs de pierre, cols enneigés et villages de l’Engadine. Hôtels de charme et carnet de voyage inclus.</p>
            <p className="mt-6 text-white/85">dès <span className="av-serif text-3xl text-white">CHF 1 240</span> par personne</p>
            <Link href={`${BASE}/sejours`} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#cfe6e8] px-6 py-3 font-semibold text-[#0f3d3e] transition-colors hover:bg-white">Voir le programme <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className={`${wrap} py-16 sm:py-24`}>
        <p className={kicker}>Comment ça marche</p>
        <h2 className="av-serif mt-2 text-4xl text-[#0f3d3e] sm:text-5xl">Trois étapes jusqu’au départ</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            ['Vous nous racontez', 'Vos envies, vos dates, votre budget et votre forme du moment.'],
            ['Nous dessinons', 'Vous recevez une proposition détaillée, à ajuster ensemble autant qu’il le faut.'],
            ['Vous partez', 'Billets, réservations et carnet de route : tout est prêt, il ne reste qu’à boucler le sac.'],
          ].map(([t, d], i) => (
            <li key={t} className="relative rounded-[2rem] border border-[#0f3d3e]/15 p-6 pt-10">
              <span className="av-serif absolute -top-6 left-6 grid h-12 w-12 place-items-center rounded-full bg-[#c24e28] text-xl italic text-white">{i + 1}</span>
              <h3 className="av-serif text-2xl text-[#0f3d3e]">{t}</h3>
              <p className="mt-2 text-[#4b5f5f]">{d}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

function AgencePage() {
  return (
    <>
      <PageHead label="L’agence" title="Une petite équipe, de grandes envies d’ailleurs" season="automne">
        Alpina Voyages est une agence indépendante installée à Sion. Nous ne vendons que des itinéraires que nous avons parcourus nous-mêmes.
      </PageHead>
      <section className={`${wrap} grid gap-10 py-16 lg:grid-cols-[1fr_1.2fr]`}>
        <div>
          <p className={kicker}>Notre philosophie</p>
          <h2 className="av-serif mt-2 text-4xl text-[#0f3d3e]">Voyager moins vite, voir davantage</h2>
        </div>
        <div className="space-y-4 text-lg text-[#3d5252]">
          <p>Nous croyons qu’un bon voyage laisse du temps : pour une sieste dans l’herbe, un détour par une fromagerie d’alpage ou une conversation avec la gardienne de cabane.</p>
          <p>Nos programmes comptent donc peu d’étapes, des hébergements choisis un à un et des prestataires locaux que nous connaissons par leur prénom.</p>
        </div>
      </section>
      <section className="bg-white">
        <div className={`${wrap} grid gap-6 py-16 md:grid-cols-3`}>
          {[
            { icon: Leaf, title: 'Mobilité douce', text: 'Train, car postal, bateau : nos itinéraires se font sans voiture chaque fois que c’est possible.' },
            { icon: Sparkles, title: 'Adresses choisies', text: 'Maisons d’hôtes, hôtels familiaux et cabanes : des lieux à taille humaine.' },
            { icon: HeartHandshake, title: 'Prix clairs', text: 'Ce qui est compris et ce qui ne l’est pas figure noir sur blanc dans chaque proposition.' },
          ].map((v) => (
            <div key={v.title} className="rounded-[2rem] bg-[#faf6ee] p-7">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[#cfe6e8] text-[#0f3d3e]"><v.icon className="h-6 w-6" aria-hidden="true" /></span>
              <h3 className="av-serif mt-4 text-2xl text-[#0f3d3e]">{v.title}</h3>
              <p className="mt-2 text-[#4b5f5f]">{v.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className={`${wrap} py-16`}>
        <p className={kicker}>L’équipe</p>
        <h2 className="av-serif mt-2 text-4xl text-[#0f3d3e]">Vos conseillers</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            ['CR', 'Camille Rey', 'Randonnée & cabanes', '#c24e28'],
            ['TM', 'Thomas Moret', 'Voyages en train', '#0f3d3e'],
            ['IF', 'Inès Favre', 'Bien-être & gastronomie', '#1f7f6b'],
          ].map(([i, n, r, c]) => (
            <li key={n} className="flex items-center gap-4 rounded-[2rem] bg-white p-5 shadow-sm">
              <span className="av-serif grid h-16 w-16 shrink-0 place-items-center rounded-full text-xl italic text-white" style={{ background: c }} aria-hidden="true">{i}</span>
              <span>
                <span className="av-serif block text-xl text-[#0f3d3e]">{n}</span>
                <span className="text-sm text-[#4b5f5f]">{r}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default function Demo({ page }: { page: string }) {
  const current = meta.pages.some((p) => p.key === page) ? page : '';
  return (
    <div className="av-root min-h-screen bg-[#faf6ee] font-sans text-[#1d3334]">
      <style>{`.av-root .av-serif{font-family:'Iowan Old Style','Palatino Linotype',Palatino,'Book Antiqua',Georgia,serif;font-weight:400;letter-spacing:-0.015em;line-height:1.08}.av-root :focus-visible{outline:3px solid #c24e28;outline-offset:3px;border-radius:999px}.av-root input:focus-visible,.av-root textarea:focus-visible,.av-root select:focus-visible{border-radius:1rem}.av-root ::selection{background:#cfe6e8;color:#0f3d3e}`}</style>
      <a href="#av-main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2">Aller au contenu</a>
      <Header pages={meta.pages} current={current} />
      <main id="av-main">
        {current === 'destinations' ? (
          <>
            <PageHead label="Destinations" title="Où souhaitez-vous poser votre sac ?" season="printemps">Neuf idées de voyages à travers les Alpes suisses. Filtrez par saison et par type d’expérience.</PageHead>
            <section className={`${wrap} py-12`}><Destinations /></section>
          </>
        ) : current === 'sejours' ? (
          <>
            <PageHead label="Séjours" title="Nos séjours, jour après jour" season="ete">Trois programmes prêts à partir, à réserver tels quels ou à adapter. Parcourez l’itinéraire de chacun.</PageHead>
            <section className={`${wrap} py-12`}><TripPlanner /></section>
            <section className={`${wrap} pb-16`}>
              <div className="rounded-[2rem] border border-[#0f3d3e]/15 p-6 sm:p-8">
                <h2 className="av-serif text-3xl text-[#0f3d3e]">Bon à savoir</h2>
                <dl className="mt-5 grid gap-6 md:grid-cols-3">
                  {[
                    ['Prix', 'Les tarifs s’entendent par personne, en chambre double, hors trajet depuis votre domicile.'],
                    ['Modifications', 'Chaque séjour peut être allongé, raccourci ou combiné avec un autre.'],
                    ['Annulation', 'Les conditions exactes sont précisées dans la proposition que vous recevez avant toute réservation.'],
                  ].map(([t, d]) => (
                    <div key={t}>
                      <dt className={kicker}>{t}</dt>
                      <dd className="mt-2 text-[#4b5f5f]">{d}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </section>
          </>
        ) : current === 'agence' ? (
          <AgencePage />
        ) : current === 'contact' ? (
          <>
            <PageHead label="Contact" title="Racontez-nous votre prochain voyage" season="hiver">Quelques informations suffisent pour que nous préparions une première proposition, sans engagement.</PageHead>
            <section className={`${wrap} grid gap-8 py-12 lg:grid-cols-[1.6fr_1fr]`}>
              <EnquiryForm />
              <aside className="space-y-4">
                <div className="rounded-[2rem] bg-[#cfe6e8] p-6 text-[#0f3d3e]">
                  <h2 className="av-serif text-2xl">Nous rendre visite</h2>
                  <ul className="mt-4 space-y-3 text-sm">
                    <li className="flex gap-3"><MapPin className="h-5 w-5 shrink-0" aria-hidden="true" />Rue de l’Exemple 12, 1950 Sion</li>
                    <li className="flex gap-3"><Phone className="h-5 w-5 shrink-0" aria-hidden="true" />+41 00 000 00 00</li>
                    <li className="flex gap-3"><Mail className="h-5 w-5 shrink-0" aria-hidden="true" />bonjour@alpina-voyages.example.ch</li>
                  </ul>
                </div>
                <div className="rounded-[2rem] bg-white p-6 shadow-sm">
                  <h2 className="av-serif text-2xl text-[#0f3d3e]">Horaires</h2>
                  <dl className="mt-3 space-y-1.5 text-sm text-[#4b5f5f]">
                    <div className="flex justify-between"><dt>Mardi – vendredi</dt><dd>9h00 – 18h00</dd></div>
                    <div className="flex justify-between"><dt>Samedi</dt><dd>9h00 – 13h00</dd></div>
                    <div className="flex justify-between"><dt>Dimanche, lundi</dt><dd>Fermé</dd></div>
                  </dl>
                </div>
              </aside>
            </section>
          </>
        ) : (
          <HomePage />
        )}
      </main>
      <footer className="relative mt-10 overflow-hidden bg-[#0b2c2d] text-white/80">
        <svg viewBox="0 0 800 60" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-10 w-full -translate-y-[1px]" aria-hidden="true">
          <path d="M0 0 H800 V20 L720 50 L640 18 L540 56 L450 22 L360 52 L260 16 L170 48 L80 20 L0 44 Z" fill="#faf6ee" />
        </svg>
        <div className={`${wrap} grid gap-8 pb-10 pt-20 sm:grid-cols-3`}>
          <div>
            <p className="av-serif text-3xl italic text-white">Alpina Voyages</p>
            <p className="mt-2 text-sm">Agence de voyages indépendante, spécialiste des Alpes suisses.</p>
          </div>
          <nav aria-label="Pied de page">
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {meta.pages.map((p) => <li key={p.key}><Link href={p.key ? `${BASE}/${p.key}` : BASE} className="hover:text-white hover:underline">{p.label}</Link></li>)}
            </ul>
          </nav>
          <address className="text-sm not-italic">Rue de l’Exemple 12, 1950 Sion<br />+41 00 000 00 00<br />bonjour@alpina-voyages.example.ch</address>
        </div>
        <p className="border-t border-white/10 py-5 text-center text-xs">© {new Date().getFullYear()} Alpina Voyages — agence fictive.</p>
      </footer>
    </div>
  );
}
