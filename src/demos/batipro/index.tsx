import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, Building2, ClipboardCheck, Clock, Hammer, Home, Mail, MapPin, PaintRoller, Phone, Ruler, ShieldCheck, Trees, Users, Wrench } from 'lucide-react';
import type { DemoMeta } from '../types';
import { ProjectArt } from './art';
import { Gallery, Header, QuoteForm } from './ui';

export const meta: DemoMeta = {
  slug: 'batipro',
  name: 'BatiPro',
  language: 'fr',
  pages: [
    { key: '', label: 'Accueil' },
    { key: 'services', label: 'Services' },
    { key: 'realisations', label: 'Réalisations' },
    { key: 'entreprise', label: 'Entreprise' },
    { key: 'devis', label: 'Devis' },
  ],
};

const BASE = '/demo/batipro';
const wrap = 'mx-auto max-w-6xl px-4 sm:px-6';

const SERVICES = [
  { icon: Building2, title: 'Gros œuvre & maçonnerie', text: 'Fondations, dalles, murs porteurs et structures en béton armé pour villas, immeubles et halles.', items: ['Terrassement et fouilles', 'Béton armé et coffrage', 'Maçonnerie traditionnelle', 'Surélévations et extensions'] },
  { icon: Home, title: 'Toiture & charpente', text: 'Pose, réfection et isolation de toitures inclinées ou plates, charpente bois et ferblanterie.', items: ['Charpente bois', 'Couverture tuiles et ardoises', 'Étanchéité de toits plats', 'Fenêtres de toit'] },
  { icon: PaintRoller, title: 'Rénovation intérieure', text: 'Transformation complète d’appartements et de maisons, de la démolition aux finitions.', items: ['Cuisines et salles de bains', 'Cloisons et faux plafonds', 'Sols, carrelage et parquet', 'Peinture et plâtrerie'] },
  { icon: ShieldCheck, title: 'Façades & isolation', text: 'Assainissement énergétique de l’enveloppe du bâtiment et remise à neuf des façades.', items: ['Isolation périphérique', 'Crépis et enduits', 'Bardage bois ou métal', 'Remplacement des fenêtres'] },
  { icon: Trees, title: 'Aménagements extérieurs', text: 'Terrasses, accès, murs de soutènement et tout ce qui entoure votre bâtiment.', items: ['Terrasses et dallages', 'Murs et escaliers', 'Pergolas et couverts', 'Canalisations et drainage'] },
  { icon: ClipboardCheck, title: 'Entreprise générale', text: 'Un seul interlocuteur qui coordonne tous les corps de métier, du permis à la remise des clés.', items: ['Étude de faisabilité', 'Planification et budget', 'Coordination des artisans', 'Suivi de chantier hebdomadaire'] },
];

const STEPS = [
  { n: '01', title: 'Visite sur place', text: 'Nous venons mesurer, écouter vos besoins et repérer les contraintes techniques.' },
  { n: '02', title: 'Devis détaillé', text: 'Chaque poste est chiffré séparément, avec les variantes possibles et un planning.' },
  { n: '03', title: 'Chantier', text: 'Un chef de chantier attitré, un point hebdomadaire et un site tenu propre.' },
  { n: '04', title: 'Réception', text: 'Visite de contrôle commune, levée des réserves et remise du dossier d’ouvrage.' },
];

function PageHead({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-[#1b1d1f] text-white">
      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:40px_40px]" aria-hidden="true" />
      <div className={`${wrap} relative py-14 sm:py-20`}>
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#ffc400]">{kicker}</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold uppercase leading-none tracking-tight sm:text-6xl">{title}</h1>
        {children && <p className="mt-5 max-w-2xl text-lg text-white/80">{children}</p>}
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section className="bg-[#ffc400]">
      <div className={`${wrap} flex flex-col items-start justify-between gap-6 py-12 md:flex-row md:items-center`}>
        <div>
          <h2 className="font-display text-3xl font-bold uppercase leading-none tracking-tight sm:text-4xl">Un projet en tête ?</h2>
          <p className="mt-2 max-w-xl text-[#1b1d1f]">Décrivez-le en quelques lignes : nous revenons vers vous avec une proposition de visite.</p>
        </div>
        <Link href={`${BASE}/devis`} className="inline-flex items-center gap-2 bg-[#1b1d1f] px-6 py-4 font-display font-bold uppercase tracking-wider text-white transition-colors hover:bg-black">
          Demander un devis <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-[#1b1d1f] text-white">
        <div className={`${wrap} grid gap-10 py-14 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:py-24`}>
          <div>
            <p className="inline-block bg-[#ffc400] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-[#1b1d1f]">Construction · Rénovation · Suisse romande</p>
            <h1 className="mt-6 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-7xl">
              On bâtit <span className="text-[#ffc400]">solide.</span>
              <br />
              On livre à l’heure.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">Du gros œuvre aux finitions, BatiPro réalise vos travaux avec ses propres équipes et un seul responsable de chantier.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`${BASE}/devis`} className="inline-flex items-center gap-2 bg-[#ffc400] px-6 py-4 font-display font-bold uppercase tracking-wider text-[#1b1d1f] transition-colors hover:bg-white">
                Devis gratuit <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link href={`${BASE}/realisations`} className="border-2 border-white/40 px-6 py-4 font-display font-bold uppercase tracking-wider transition-colors hover:border-[#ffc400] hover:text-[#ffc400]">
                Voir nos chantiers
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -left-3 -top-3 h-full w-full border-4 border-[#ffc400]" aria-hidden="true" />
            <ProjectArt kind="facade" tone={0} className="relative aspect-[4/3] w-full" />
            <div className="absolute -bottom-5 right-4 flex items-center gap-3 bg-white px-4 py-3 text-[#1b1d1f] shadow-lg">
              <Clock className="h-6 w-6 text-[#c77700]" aria-hidden="true" />
              <p className="text-sm font-semibold leading-tight">Planning écrit<br />remis avec chaque devis</p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${wrap} py-16 sm:py-20`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">Nos métiers</h2>
          <Link href={`${BASE}/services`} className="inline-flex items-center gap-1 font-bold uppercase tracking-wider underline decoration-[#ffc400] decoration-4 underline-offset-4">
            Tous les services <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-8 grid gap-px bg-[#1b1d1f]/15 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s) => (
            <li key={s.title} className="group bg-[#f2f0eb] p-6 transition-colors hover:bg-white">
              <s.icon className="h-9 w-9 text-[#1b1d1f] transition-colors group-hover:text-[#c77700]" aria-hidden="true" />
              <h3 className="mt-4 font-display text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-[#4a4d50]">{s.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-white">
        <div className={`${wrap} py-16 sm:py-20`}>
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">Comment se déroule un chantier</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="border-t-4 border-[#1b1d1f] pt-4">
                <span className="font-display text-5xl font-bold text-[#ffc400] [-webkit-text-stroke:1.5px_#1b1d1f]">{s.n}</span>
                <h3 className="mt-2 font-display text-lg font-bold uppercase">{s.title}</h3>
                <p className="mt-2 text-sm text-[#4a4d50]">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={`${wrap} py-16 sm:py-20`}>
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">Chantiers récents</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {([
            ['toiture', 0, 'Réfection de toiture', 'Morges'],
            ['interieur', 3, 'Cuisine ouverte et séjour', 'Nyon'],
            ['exterieur', 1, 'Terrasse et pergola', 'Vevey'],
          ] as const).map(([kind, tone, title, place]) => (
            <Link key={title} href={`${BASE}/realisations`} className="group relative block overflow-hidden">
              <ProjectArt kind={kind} tone={tone} className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-[#1b1d1f]/90 px-4 py-3 text-white">
                <span className="block font-display font-bold">{title}</span>
                <span className="text-xs uppercase tracking-wider text-[#ffc400]">{place}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#1b1d1f] text-white">
        <div className={`${wrap} grid gap-8 py-16 md:grid-cols-3`}>
          {[
            { icon: Ruler, title: 'Devis poste par poste', text: 'Vous savez exactement ce que vous payez, sans forfait opaque.' },
            { icon: Users, title: 'Un interlocuteur unique', text: 'Votre chef de chantier répond à vos questions du premier au dernier jour.' },
            { icon: ShieldCheck, title: 'Garantie sur les travaux', text: 'Réception commune, procès-verbal écrit et suivi des éventuelles retouches.' },
          ].map((g) => (
            <div key={g.title} className="border-l-4 border-[#ffc400] pl-5">
              <g.icon className="h-8 w-8 text-[#ffc400]" aria-hidden="true" />
              <h3 className="mt-3 font-display text-xl font-bold uppercase">{g.title}</h3>
              <p className="mt-2 text-white/75">{g.text}</p>
            </div>
          ))}
        </div>
      </section>
      <Cta />
    </>
  );
}

function ServicesPage() {
  return (
    <>
      <PageHead kicker="Services" title="Tous les corps de métier, une seule équipe">
        Que vous construisiez, agrandissiez ou rénoviez, nous prenons en charge l’ensemble des travaux ou seulement le lot dont vous avez besoin.
      </PageHead>
      <section className={`${wrap} space-y-6 py-16`}>
        {SERVICES.map((s, i) => (
          <article key={s.title} className="grid gap-6 bg-white p-6 shadow-[6px_6px_0_#1b1d1f] sm:p-8 md:grid-cols-[auto_1fr_1fr] md:items-start">
            <div className="flex items-center gap-4 md:flex-col md:items-start">
              <span className="font-display text-4xl font-bold text-[#1b1d1f]/20">{String(i + 1).padStart(2, '0')}</span>
              <span className="grid h-14 w-14 place-items-center bg-[#ffc400]"><s.icon className="h-7 w-7" aria-hidden="true" /></span>
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight">{s.title}</h2>
              <p className="mt-3 text-[#4a4d50]">{s.text}</p>
            </div>
            <ul className="grid gap-2 text-sm font-semibold">
              {s.items.map((it) => (
                <li key={it} className="flex items-center gap-3 border-b border-[#1b1d1f]/10 pb-2">
                  <span className="h-2.5 w-2.5 shrink-0 bg-[#ffc400] ring-2 ring-[#1b1d1f]" aria-hidden="true" />
                  {it}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
      <section className="bg-white">
        <div className={`${wrap} grid gap-8 py-16 md:grid-cols-2`}>
          <div>
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight">Dépannage et petits travaux</h2>
            <p className="mt-4 text-[#4a4d50]">Une infiltration, une porte à poser, un mur à reprendre ? Notre équipe d’intervention traite aussi les travaux de courte durée, sur rendez-vous.</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[[Wrench, 'Réparations ponctuelles'], [Hammer, 'Petite maçonnerie'], [PaintRoller, 'Retouches de peinture'], [Home, 'Entretien de toiture']].map(([Icon, label]) => {
              const I = Icon as typeof Wrench;
              return (
                <li key={label as string} className="flex items-center gap-3 border-2 border-[#1b1d1f] p-4 font-bold">
                  <I className="h-6 w-6 text-[#c77700]" aria-hidden="true" /> {label as string}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
      <Cta />
    </>
  );
}

function RealisationsPage() {
  return (
    <>
      <PageHead kicker="Réalisations" title="Nos chantiers, du gros œuvre aux finitions">
        Une sélection de projets menés pour des particuliers, des gérances et des entreprises. Filtrez par type de travaux.
      </PageHead>
      <section className={`${wrap} py-14`}>
        <Gallery />
      </section>
      <Cta />
    </>
  );
}

function EntreprisePage() {
  return (
    <>
      <PageHead kicker="Entreprise" title="Des gens de métier, pas des intermédiaires">
        BatiPro est une entreprise de construction indépendante. Nos maçons, charpentiers et peintres sont salariés de la maison : ce sont eux que vous verrez sur votre chantier.
      </PageHead>
      <section className={`${wrap} grid gap-10 py-16 lg:grid-cols-2 lg:items-center`}>
        <div>
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight">Notre façon de travailler</h2>
          <p className="mt-4 text-[#4a4d50]">Nous préférons les chantiers bien préparés aux promesses rapides. Avant le premier coup de pioche, le projet est planifié, les matériaux sont commandés et chaque intervenant connaît sa date d’arrivée.</p>
          <p className="mt-4 text-[#4a4d50]">Pendant les travaux, vous recevez chaque semaine un point de situation : ce qui a été fait, ce qui vient, et les éventuelles décisions à prendre.</p>
        </div>
        <div className="relative">
          <ProjectArt kind="exterieur" tone={0} className="aspect-[4/3] w-full" />
          <div className="absolute -bottom-4 -left-2 h-6 w-2/3 bg-[repeating-linear-gradient(135deg,#ffc400_0_14px,#1b1d1f_14px_28px)]" aria-hidden="true" />
        </div>
      </section>
      <section className="bg-[#1b1d1f] text-white">
        <div className={`${wrap} py-16`}>
          <h2 className="font-display text-3xl font-bold uppercase tracking-tight">Nos valeurs de chantier</h2>
          <div className="mt-8 grid gap-px bg-white/15 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Sécurité', 'Équipements contrôlés, zones balisées et consignes rappelées chaque matin.'],
              ['Propreté', 'Protection des sols, tri des déchets et nettoyage en fin de journée.'],
              ['Transparence', 'Tout supplément est discuté et validé par écrit avant d’être réalisé.'],
              ['Durabilité', 'Matériaux choisis pour durer et conseils pour améliorer l’efficacité énergétique.'],
            ].map(([t, d]) => (
              <div key={t} className="bg-[#1b1d1f] p-6">
                <h3 className="font-display text-xl font-bold uppercase text-[#ffc400]">{t}</h3>
                <p className="mt-2 text-sm text-white/75">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className={`${wrap} py-16`}>
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight">L’équipe</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['MD', 'Marc Dubuis', 'Direction & devis'],
            ['SC', 'Sofia Carrel', 'Conduite de travaux'],
            ['YB', 'Yann Berset', 'Chef d’équipe maçonnerie'],
            ['LP', 'Léa Pittet', 'Administration & planning'],
          ].map(([i, n, r]) => (
            <li key={n} className="bg-white p-5">
              <span className="grid h-16 w-16 place-items-center bg-[#1b1d1f] font-display text-xl font-bold text-[#ffc400]" aria-hidden="true">{i}</span>
              <p className="mt-4 font-display text-lg font-bold">{n}</p>
              <p className="text-sm text-[#4a4d50]">{r}</p>
            </li>
          ))}
        </ul>
        <p className="mt-10 border-l-4 border-[#ffc400] bg-white p-5 text-[#4a4d50]">
          <strong className="text-[#1b1d1f]">Zone d’intervention :</strong> Vaud, Genève, Fribourg et Neuchâtel. Pour les projets plus éloignés, contactez-nous : nous étudions chaque demande.
        </p>
      </section>
      <Cta />
    </>
  );
}

function DevisPage() {
  return (
    <>
      <PageHead kicker="Devis gratuit" title="Parlez-nous de votre projet">
        Remplissez le formulaire : plus votre description est précise, plus notre première estimation le sera.
      </PageHead>
      <section className={`${wrap} grid gap-10 py-14 lg:grid-cols-[1.5fr_1fr]`}>
        <QuoteForm />
        <aside className="space-y-6">
          <div className="bg-[#1b1d1f] p-6 text-white">
            <h2 className="font-display text-xl font-bold uppercase text-[#ffc400]">Contact direct</h2>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-[#ffc400]" aria-hidden="true" /> Rue de l’Exemple 12, 1000 Lausanne</li>
              <li className="flex gap-3"><Phone className="h-5 w-5 shrink-0 text-[#ffc400]" aria-hidden="true" /> +41 00 000 00 00</li>
              <li className="flex gap-3"><Mail className="h-5 w-5 shrink-0 text-[#ffc400]" aria-hidden="true" /> devis@batipro.example.ch</li>
              <li className="flex gap-3"><Clock className="h-5 w-5 shrink-0 text-[#ffc400]" aria-hidden="true" /> Lun–ven, 7h00–17h30</li>
            </ul>
          </div>
          <div className="bg-white p-6">
            <h2 className="font-display text-xl font-bold uppercase">Et ensuite ?</h2>
            <ol className="mt-4 space-y-4 text-sm text-[#4a4d50]">
              {['Nous vous rappelons pour préciser votre besoin.', 'Nous fixons une visite sur place, sans engagement.', 'Vous recevez un devis détaillé avec un planning.'].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center bg-[#ffc400] font-display font-bold text-[#1b1d1f]">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </section>
    </>
  );
}

export default function Demo({ page }: { page: string }) {
  const current = meta.pages.some((p) => p.key === page) ? page : '';
  return (
    <div className="bp-root min-h-screen bg-[#f2f0eb] font-sans text-[#1b1d1f]">
      <style>{`.bp-root :focus-visible{outline:3px solid #1b1d1f;outline-offset:2px;border-radius:0;box-shadow:0 0 0 6px #ffc400}.bp-root ::selection{background:#ffc400;color:#1b1d1f}`}</style>
      <a href="#bp-main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2">Aller au contenu</a>
      <Header pages={meta.pages} current={current} />
      <main id="bp-main">
        {current === 'services' ? <ServicesPage /> : current === 'realisations' ? <RealisationsPage /> : current === 'entreprise' ? <EntreprisePage /> : current === 'devis' ? <DevisPage /> : <HomePage />}
      </main>
      <footer className="bg-[#111213] text-white/75">
        <div className={`${wrap} grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4`}>
          <div>
            <p className="font-display text-2xl font-bold uppercase text-white">Bati<span className="text-[#ffc400]">Pro</span></p>
            <p className="mt-3 text-sm">Construction et rénovation en Suisse romande.</p>
          </div>
          <nav aria-label="Pied de page">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffc400]">Navigation</p>
            <ul className="mt-3 space-y-2 text-sm">
              {meta.pages.map((p) => (
                <li key={p.key}><Link href={p.key ? `${BASE}/${p.key}` : BASE} className="hover:text-[#ffc400]">{p.label}</Link></li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffc400]">Contact</p>
            <address className="mt-3 space-y-2 text-sm not-italic">
              <p>Rue de l’Exemple 12<br />1000 Lausanne</p>
              <p>+41 00 000 00 00</p>
              <p>info@batipro.example.ch</p>
            </address>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#ffc400]">Horaires</p>
            <p className="mt-3 text-sm">Lundi – vendredi<br />7h00 – 17h30</p>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs">© {new Date().getFullYear()} BatiPro Sàrl — entreprise fictive.</div>
      </footer>
    </div>
  );
}
