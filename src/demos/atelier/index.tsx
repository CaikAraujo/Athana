import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, Bell, CalendarDays, ChartColumn, Check, ChevronDown, ClipboardList, FileText, Lock, Plug, Timer, Workflow, Zap } from 'lucide-react';
import type { DemoMeta } from '../types';
import DemoForm, { type Field } from './Form';
import Nav from './Nav';
import Pricing from './Pricing';

export const meta: DemoMeta = {
  slug: 'atelier',
  name: 'Atelier',
  language: 'fr',
  pages: [
    { key: '', label: 'Accueil' },
    { key: 'fonctionnalites', label: 'Fonctionnalités' },
    { key: 'tarifs', label: 'Tarifs' },
    { key: 'contact', label: 'Contact' },
  ],
};

const base = `/demo/${meta.slug}`;
const href = (key: string) => (key ? `${base}/${key}` : base);

const features = [
  { icon: CalendarDays, title: 'Planning glisser-déposer', text: 'Affectez machines et équipes en quelques gestes. Les conflits de charge sont signalés avant qu’ils ne deviennent des retards.' },
  { icon: ClipboardList, title: 'Ordres de travail', text: 'Chaque commande devient un ordre clair, avec ses étapes, ses pièces jointes et son responsable.' },
  { icon: Timer, title: 'Suivi des temps', text: 'Les opérateurs pointent depuis une tablette. Vous comparez le temps prévu au temps réel, poste par poste.' },
  { icon: FileText, title: 'Devis et factures', text: 'Transformez un devis accepté en ordre de fabrication, puis en facture, sans ressaisie.' },
  { icon: ChartColumn, title: 'Marges en direct', text: 'Coûts matière, heures et sous-traitance sont consolidés pour chaque affaire, au jour le jour.' },
  { icon: Workflow, title: 'Automatisations', text: 'Relances, changements de statut et notifications suivent vos règles, sans une ligne de code.' },
  { icon: Plug, title: 'Connecteurs', text: 'Reliez votre comptabilité, votre ERP ou votre boutique en ligne grâce à l’API et aux connecteurs prêts à l’emploi.' },
  { icon: Lock, title: 'Données protégées', text: 'Hébergement en Suisse, sauvegardes quotidiennes et droits d’accès par rôle.' },
];

const faqs = [
  { q: 'Combien de temps faut-il pour démarrer ?', a: 'La plupart des équipes importent leurs clients et leurs articles, puis planifient leurs premiers ordres dans la journée. Un guide pas à pas vous accompagne à chaque étape.' },
  { q: 'Puis-je importer mes données existantes ?', a: 'Oui. Atelier accepte les fichiers CSV et Excel pour les clients, les articles et les commandes en cours. Les colonnes sont associées à l’écran avant l’import.' },
  { q: 'Où sont hébergées mes données ?', a: 'Les données sont hébergées en Suisse et sauvegardées chaque jour. Vous pouvez les exporter à tout moment dans un format ouvert.' },
  { q: 'Y a-t-il un engagement de durée ?', a: 'Non. La formule mensuelle se résilie d’un mois à l’autre. La formule annuelle est facturée en une fois et inclut deux mois offerts.' },
  { q: 'Atelier fonctionne-t-il sur tablette ?', a: 'Oui. L’interface de pointage et les ordres de travail sont pensés pour les tablettes utilisées en production.' },
];

const leadFields: Field[] = [
  { name: 'prenom', label: 'Prénom', type: 'text', required: true, half: true },
  { name: 'nom', label: 'Nom', type: 'text', required: true, half: true },
  { name: 'email', label: 'E-mail professionnel', type: 'email', required: true, half: true, placeholder: 'vous@entreprise.ch' },
  { name: 'societe', label: 'Entreprise', type: 'text', required: true, half: true },
  { name: 'taille', label: 'Taille de l’équipe', type: 'chips', required: true, options: ['1–10', '11–50', '51–200', '200+'] },
  { name: 'message', label: 'Votre besoin en quelques mots', type: 'textarea', placeholder: 'Ex. : planifier trois ateliers et suivre les temps par affaire.' },
  { name: 'accord', label: 'J’accepte d’être recontacté·e au sujet de ma demande.', type: 'checkbox', required: true },
];

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="inline-block rounded-full border-2 border-[#0d0f1a] bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]">{children}</p>;
}

function Cta({ to, children, dark = false }: { to: string; children: ReactNode; dark?: boolean }) {
  return (
    <Link
      href={to}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-base font-semibold transition hover:translate-x-0.5 hover:translate-y-0.5 ${
        dark ? 'border-2 border-[#0d0f1a] bg-white hover:bg-[#0d0f1a] hover:text-white' : 'bg-[#2b3bff] text-white shadow-[4px_4px_0_#0d0f1a] hover:shadow-[2px_2px_0_#0d0f1a]'
      }`}
    >
      {children}
    </Link>
  );
}

/** CSS/SVG product mock-up: a planning board. */
function ProductMock() {
  const rows = [
    { label: 'Découpe laser', bars: [{ l: 2, w: 34, c: '#2b3bff' }, { l: 44, w: 22, c: '#0d0f1a' }] },
    { label: 'Pliage', bars: [{ l: 18, w: 40, c: '#ff6a3d' }] },
    { label: 'Soudure', bars: [{ l: 8, w: 20, c: '#0d0f1a' }, { l: 52, w: 38, c: '#2b3bff' }] },
    { label: 'Thermolaquage', bars: [{ l: 36, w: 30, c: '#11a37f' }] },
    { label: 'Montage', bars: [{ l: 60, w: 34, c: '#ff6a3d' }] },
  ];
  return (
    <div role="img" aria-label="Aperçu de l’interface de planning Atelier" className="relative">
      <div className="absolute -right-3 -top-3 size-24 rounded-full bg-[#d9ff5b]" aria-hidden="true" />
      <div className="relative rounded-3xl border-2 border-[#0d0f1a] bg-white shadow-[10px_10px_0_#0d0f1a]">
        <div className="flex items-center gap-2 border-b-2 border-[#0d0f1a] px-4 py-3">
          <span className="size-3 rounded-full bg-[#ff6a3d]" />
          <span className="size-3 rounded-full bg-[#d9ff5b] ring-1 ring-[#0d0f1a]/30" />
          <span className="size-3 rounded-full bg-[#2b3bff]" />
          <span className="ml-3 truncate font-display text-sm font-semibold">Planning · Semaine 24</span>
          <span className="ml-auto hidden rounded-full bg-[#0d0f1a] px-3 py-1 text-xs font-semibold text-white sm:block">+ Nouvel ordre</span>
        </div>
        <div className="p-4 sm:p-5">
          <div className="mb-3 grid grid-cols-[5.5rem_1fr] text-[11px] font-semibold uppercase tracking-wide text-[#0d0f1a]/50 sm:grid-cols-[8rem_1fr]">
            <span>Poste</span>
            <div className="grid grid-cols-5 text-center">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
          <div className="grid gap-2.5">
            {rows.map((r) => (
              <div key={r.label} className="grid grid-cols-[5.5rem_1fr] items-center sm:grid-cols-[8rem_1fr]">
                <span className="truncate pr-2 text-xs font-medium sm:text-sm">{r.label}</span>
                <div className="relative h-8 rounded-lg bg-[repeating-linear-gradient(90deg,#f4f3ee_0,#f4f3ee_calc(20%-1px),#dddbd0_calc(20%-1px),#dddbd0_20%)]">
                  {r.bars.map((b) => (
                    <span key={b.l} className="absolute inset-y-1 rounded-md" style={{ left: `${b.l}%`, width: `${b.w}%`, background: b.c }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
            {[
              { l: 'À lancer', c: 'bg-[#f4f3ee]' },
              { l: 'En cours', c: 'bg-[#d9ff5b]' },
              { l: 'À contrôler', c: 'bg-[#ffd9cd]' },
            ].map((s) => (
              <div key={s.l} className={`rounded-xl border-2 border-[#0d0f1a] p-3 ${s.c}`}>
                <p className="font-semibold">{s.l}</p>
                <div className="mt-2 grid gap-1.5">
                  <span className="h-1.5 w-full rounded-full bg-[#0d0f1a]/70" />
                  <span className="h-1.5 w-2/3 rounded-full bg-[#0d0f1a]/30" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border-2 border-[#0d0f1a] bg-white px-4 py-3 text-sm shadow-[4px_4px_0_#2b3bff] sm:-left-6">
        <Bell aria-hidden="true" className="size-4 text-[#2b3bff]" />
        <span className="font-medium">Surcharge détectée : Pliage, jeudi</span>
      </div>
    </div>
  );
}

function Faq() {
  return (
    <div className="grid gap-3">
      {faqs.map((f) => (
        <details key={f.q} className="group rounded-2xl border-2 border-[#0d0f1a] bg-white open:shadow-[5px_5px_0_#0d0f1a]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 font-display text-lg font-semibold [&::-webkit-details-marker]:hidden">
            {f.q}
            <ChevronDown aria-hidden="true" className="size-5 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <p className="px-5 pb-5 text-[#0d0f1a]/75">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

function PageHead({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <section className="border-b-2 border-[#0d0f1a] bg-[radial-gradient(#0d0f1a22_1px,transparent_1px)] [background-size:18px_18px]">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold tracking-tight sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg text-[#0d0f1a]/75">{lead}</p>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#0d0f1a] bg-[#2b3bff] px-6 py-12 text-white [&_:focus-visible]:outline-[#d9ff5b]! sm:px-14 sm:py-16">
        <div aria-hidden="true" className="absolute -right-16 -top-16 size-64 rounded-full border-[28px] border-[#d9ff5b]" />
        <h2 className="relative max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-5xl">Voyez votre propre planning dans Atelier.</h2>
        <p className="relative mt-4 max-w-xl text-lg text-white/85">Une démonstration de trente minutes, sur vos cas concrets, sans engagement.</p>
        <Link href={href('contact')} className="relative mt-8 inline-flex items-center gap-2 rounded-full bg-[#d9ff5b] px-7 py-4 font-semibold text-[#0d0f1a] transition hover:bg-white">
          Réserver ma démo <ArrowRight aria-hidden="true" className="size-5" />
        </Link>
      </div>
    </section>
  );
}

function Home() {
  return (
    <>
      <section className="border-b-2 border-[#0d0f1a]">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-12 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
          <div>
            <Eyebrow>Logiciel de gestion de production</Eyebrow>
            <h1 className="mt-6 font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight sm:text-7xl">
              Vos délais,{' '}
              <span className="relative whitespace-nowrap">
                <span aria-hidden="true" className="absolute inset-x-0 bottom-1 h-4 -rotate-1 bg-[#d9ff5b] sm:h-6" />
                <span className="relative">enfin tenus.</span>
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-[#0d0f1a]/75 sm:text-xl">
              Atelier réunit planning, ordres de travail, suivi des temps et facturation dans un seul outil, pensé pour les PME qui fabriquent.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Cta to={href('contact')}>
                Demander une démo <ArrowRight aria-hidden="true" className="size-5" />
              </Cta>
              <Cta to={href('fonctionnalites')} dark>
                Voir les fonctionnalités
              </Cta>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-[#0d0f1a]/75">
              {['Essai gratuit de 14 jours', 'Sans carte bancaire', 'Hébergé en Suisse'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Check aria-hidden="true" className="size-4 text-[#2b3bff]" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <ProductMock />
        </div>
      </section>

      <section aria-label="Secteurs" className="overflow-hidden border-b-2 border-[#0d0f1a] bg-[#0d0f1a] py-4 text-white">
        <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-5 font-display text-sm font-semibold uppercase tracking-[0.16em]">
          {['Tôlerie', 'Menuiserie', 'Usinage', 'Imprimerie', 'Mécanique', 'Horlogerie'].map((s) => (
            <li key={s} className="flex items-center gap-8">
              {s}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <Eyebrow>Tout-en-un</Eyebrow>
        <h2 className="mt-5 max-w-3xl font-display text-3xl font-bold tracking-tight sm:text-5xl">Un seul outil, du devis à la facture.</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-6">
          <article className="rounded-3xl border-2 border-[#0d0f1a] bg-[#d9ff5b] p-7 md:col-span-4">
            <CalendarDays aria-hidden="true" className="size-8" />
            <h3 className="mt-5 font-display text-2xl font-bold">Un planning que tout le monde comprend</h3>
            <p className="mt-2 max-w-lg text-[#0d0f1a]/80">Charge par poste, jalons client et disponibilités d’équipe sur un même écran. Déplacez un ordre : le reste se recalcule.</p>
            <div aria-hidden="true" className="mt-6 grid gap-2">
              {[70, 45, 88].map((w, i) => (
                <div key={w} className="h-3 rounded-full bg-[#0d0f1a]/15">
                  <div className="h-3 rounded-full bg-[#0d0f1a]" style={{ width: `${w}%`, marginLeft: `${i * 6}%`, maxWidth: `${100 - i * 6}%` }} />
                </div>
              ))}
            </div>
          </article>
          <article className="rounded-3xl border-2 border-[#0d0f1a] bg-white p-7 md:col-span-2">
            <Timer aria-hidden="true" className="size-8 text-[#2b3bff]" />
            <h3 className="mt-5 font-display text-2xl font-bold">Pointage en un geste</h3>
            <p className="mt-2 text-[#0d0f1a]/75">Sur tablette, au poste. Fini les feuilles d’heures à ressaisir.</p>
          </article>
          <article className="rounded-3xl border-2 border-[#0d0f1a] bg-white p-7 md:col-span-2">
            <ChartColumn aria-hidden="true" className="size-8 text-[#2b3bff]" />
            <h3 className="mt-5 font-display text-2xl font-bold">Marge par affaire</h3>
            <p className="mt-2 text-[#0d0f1a]/75">Sachez ce que chaque commande rapporte, avant la clôture.</p>
          </article>
          <article className="rounded-3xl border-2 border-[#0d0f1a] bg-[#0d0f1a] p-7 text-white md:col-span-4 [&_:focus-visible]:outline-[#d9ff5b]!">
            <Zap aria-hidden="true" className="size-8 text-[#d9ff5b]" />
            <h3 className="mt-5 font-display text-2xl font-bold">Des automatisations qui travaillent pour vous</h3>
            <p className="mt-2 max-w-lg text-white/75">« Quand un ordre passe en contrôle, prévenir la qualité. » Écrivez vos règles comme vous les diriez.</p>
            <Link href={href('fonctionnalites')} className="mt-6 inline-flex items-center gap-2 font-semibold text-[#d9ff5b] underline-offset-4 hover:underline">
              Toutes les fonctionnalités <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </article>
        </div>
      </section>

      <section className="border-y-2 border-[#0d0f1a] bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
          <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-5xl">Opérationnel en trois étapes.</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { t: 'Importez', d: 'Clients, articles et commandes en cours depuis vos fichiers Excel ou CSV.' },
              { t: 'Planifiez', d: 'Décrivez vos postes et vos équipes, puis placez vos premiers ordres.' },
              { t: 'Pilotez', d: 'Suivez l’avancement, les temps et les marges depuis un tableau de bord unique.' },
            ].map((s, i) => (
              <li key={s.t} className="border-t-4 border-[#0d0f1a] pt-5">
                <span className="font-display text-6xl font-bold text-[#2b3bff]">0{i + 1}</span>
                <h3 className="mt-3 font-display text-2xl font-bold">{s.t}</h3>
                <p className="mt-2 text-[#0d0f1a]/75">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">Des tarifs lisibles.</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#0d0f1a]/75">Par utilisateur, sans frais d’installation. Changez de formule à tout moment.</p>
        </div>
        <div className="mt-8">
          <Pricing contactHref={href('contact')} compact />
        </div>
        <p className="mt-8 text-center">
          <Link href={href('tarifs')} className="font-semibold underline underline-offset-4">
            Comparer les formules en détail
          </Link>
        </p>
      </section>

      <section className="border-t-2 border-[#0d0f1a] bg-[#eceadf]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-5xl">Questions fréquentes</h2>
            <p className="mt-4 text-[#0d0f1a]/75">
              Une autre question ?{' '}
              <Link href={href('contact')} className="font-semibold underline underline-offset-4">
                Écrivez-nous
              </Link>
              .
            </p>
          </div>
          <Faq />
        </div>
      </section>
      <FinalCta />
    </>
  );
}

function Features() {
  return (
    <>
      <PageHead eyebrow="Fonctionnalités" title="Tout ce qu’il faut pour faire tourner l’atelier." lead="Huit modules qui partagent les mêmes données : ce qui est saisi une fois est disponible partout." />
      <section className="mx-auto max-w-6xl px-5 py-16">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <li key={f.title} className="rounded-3xl border-2 border-[#0d0f1a] bg-white p-6 transition hover:-translate-y-1 hover:shadow-[6px_6px_0_#0d0f1a]">
              <span className={`grid size-12 place-items-center rounded-2xl border-2 border-[#0d0f1a] ${i % 3 === 0 ? 'bg-[#d9ff5b]' : i % 3 === 1 ? 'bg-[#2b3bff] text-white' : 'bg-[#ffd9cd]'}`}>
                <f.icon aria-hidden="true" className="size-6" />
              </span>
              <h2 className="mt-5 font-display text-xl font-bold">{f.title}</h2>
              <p className="mt-2 text-sm text-[#0d0f1a]/75">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>
      <section className="border-y-2 border-[#0d0f1a] bg-[#0d0f1a] text-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:py-24 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">Avant, après.</h2>
            <p className="mt-4 max-w-md text-white/75">Atelier remplace l’empilement d’outils par un flux unique, de la demande client à l’expédition.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border-2 border-white/25 p-6">
              <h3 className="font-display text-lg font-bold text-white/70">Sans Atelier</h3>
              <ul className="mt-4 grid gap-3 text-sm text-white/75">
                {['Planning sur tableau blanc', 'Tableurs en plusieurs versions', 'Heures ressaisies le vendredi', 'Marges connues après coup'].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span aria-hidden="true" className="mt-2 h-0.5 w-3 shrink-0 bg-white/50" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border-2 border-[#d9ff5b] bg-[#d9ff5b] p-6 text-[#0d0f1a]">
              <h3 className="font-display text-lg font-bold">Avec Atelier</h3>
              <ul className="mt-4 grid gap-3 text-sm font-medium">
                {['Planning partagé, à jour', 'Une seule source de données', 'Pointage en temps réel', 'Marges visibles au quotidien'].map((t) => (
                  <li key={t} className="flex gap-3">
                    <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
      <FinalCta />
    </>
  );
}

function Tarifs() {
  const rows: [string, boolean, boolean, boolean][] = [
    ['Planning et ordres de travail', true, true, true],
    ['Devis, bons de livraison, factures', true, true, true],
    ['Suivi des temps sur tablette', false, true, true],
    ['Automatisations sans code', false, true, true],
    ['Connecteurs et API', false, true, true],
    ['SSO et droits avancés', false, false, true],
    ['Hébergement dédié', false, false, true],
  ];
  return (
    <>
      <PageHead eyebrow="Tarifs" title="Un prix par utilisateur. Rien de caché." lead="Essayez gratuitement pendant 14 jours. Aucune carte bancaire n’est demandée pour commencer." />
      <section className="mx-auto max-w-6xl px-5 py-16">
        <Pricing contactHref={href('contact')} />
      </section>
      <section className="mx-auto max-w-6xl px-5 pb-16">
        <h2 className="font-display text-3xl font-bold tracking-tight">Comparatif des formules</h2>
        <div className="mt-6 overflow-x-auto rounded-3xl border-2 border-[#0d0f1a] bg-white">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="bg-[#0d0f1a] text-white">
              <tr>
                <th scope="col" className="px-5 py-4 font-display text-base">Fonctionnalité</th>
                {['Établi', 'Atelier', 'Manufacture'].map((p) => (
                  <th key={p} scope="col" className="px-4 py-4 text-center font-display text-base">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, ...cols]) => (
                <tr key={label} className="border-t border-[#0d0f1a]/15">
                  <th scope="row" className="px-5 py-4 font-medium">{label}</th>
                  {cols.map((ok, i) => (
                    <td key={i} className="px-4 py-4 text-center">
                      {ok ? (
                        <>
                          <Check aria-hidden="true" className="mx-auto size-5 text-[#2b3bff]" />
                          <span className="sr-only">Inclus</span>
                        </>
                      ) : (
                        <>
                          <span aria-hidden="true" className="text-[#0d0f1a]/40">—</span>
                          <span className="sr-only">Non inclus</span>
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-5 pb-8">
        <h2 className="mb-6 font-display text-3xl font-bold tracking-tight">Questions sur les tarifs</h2>
        <Faq />
      </section>
      <FinalCta />
    </>
  );
}

function Contact() {
  return (
    <>
      <PageHead eyebrow="Contact" title="Parlons de votre atelier." lead="Décrivez votre organisation : nous préparons une démonstration adaptée à vos flux, en trente minutes." />
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="font-display text-2xl font-bold">Ce qui vous attend</h2>
          <ol className="mt-6 grid gap-5">
            {[
              ['Un échange de cadrage', 'Quinze minutes pour comprendre vos postes, vos volumes et vos outils actuels.'],
              ['Une démo sur mesure', 'Nous reproduisons un de vos flux réels dans Atelier.'],
              ['Un essai accompagné', 'Quatorze jours pour tester avec votre équipe, avec notre aide.'],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-[#0d0f1a] bg-[#d9ff5b] font-display font-bold">{i + 1}</span>
                <div>
                  <h3 className="font-display text-lg font-bold">{t}</h3>
                  <p className="text-sm text-[#0d0f1a]/75">{d}</p>
                </div>
              </li>
            ))}
          </ol>
          <address className="mt-10 rounded-3xl border-2 border-[#0d0f1a] bg-white p-6 text-sm not-italic">
            <p className="font-display text-lg font-bold">Atelier Logiciels SA</p>
            <p className="mt-2">Rue de l’Exemple 12, 1000 Lausanne</p>
            <p>+41 00 000 00 00</p>
            <p>bonjour@example.ch</p>
          </address>
        </div>
        <div className="rounded-3xl border-2 border-[#0d0f1a] bg-[#eceadf] p-6 shadow-[8px_8px_0_#0d0f1a] sm:p-8">
          <h2 className="mb-6 font-display text-2xl font-bold">Demander une démo</h2>
          <DemoForm fields={leadFields} submitLabel="Envoyer ma demande" title="Demande de démonstration" />
        </div>
      </section>
    </>
  );
}

export default function Demo({ page }: { page: string }) {
  const known = meta.pages.some((p) => p.key === page) ? page : '';
  const items = meta.pages.map((p) => ({ href: href(p.key), label: p.label, active: p.key === known }));
  return (
    <div className="min-h-dvh bg-[#f4f3ee] font-sans text-[#0d0f1a] [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-2 [&_:focus-visible]:outline-[#2b3bff]">
      <Nav items={items} home={base} />
      <main>{known === 'fonctionnalites' ? <Features /> : known === 'tarifs' ? <Tarifs /> : known === 'contact' ? <Contact /> : <Home />}</main>
      <footer className="border-t-2 border-[#0d0f1a] bg-[#0d0f1a] text-white [&_:focus-visible]:outline-[#d9ff5b]!">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="font-display text-2xl font-bold">Atelier</p>
            <p className="mt-3 max-w-xs text-sm text-white/70">Le logiciel de gestion de production des PME qui fabriquent.</p>
          </div>
          <nav aria-label="Pied de page">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9ff5b]">Produit</p>
            <ul className="mt-4 grid gap-2 text-sm">
              {items.map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="text-white/80 hover:text-white hover:underline">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <address className="text-sm not-italic text-white/80">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#d9ff5b]">Contact</p>
            <p className="mt-4">Rue de l’Exemple 12</p>
            <p>1000 Lausanne</p>
            <p className="mt-2">+41 00 000 00 00</p>
            <p>bonjour@example.ch</p>
          </address>
        </div>
        <p className="border-t border-white/15 px-5 py-5 text-center text-xs text-white/60">© Atelier Logiciels SA — Tous droits réservés.</p>
      </footer>
    </div>
  );
}
