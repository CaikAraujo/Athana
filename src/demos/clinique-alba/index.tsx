import Link from 'next/link';
import type { ReactNode } from 'react';
import { Accessibility, Activity, ArrowRight, Baby, Bus, CalendarDays, Check, CircleAlert, ClipboardCheck, Clock, Droplets, Flower2, HeartPulse, Mail, MapPin, Phone, SquareParking, Stethoscope, UserRound } from 'lucide-react';
import type { DemoMeta } from '../types';
import { specialties, team } from './data';
import DemoForm, { type Field } from './Form';
import Header from './Header';
import Team from './Team';

export const meta: DemoMeta = {
  slug: 'clinique-alba',
  name: 'Clinique Alba',
  language: 'fr',
  pages: [
    { key: '', label: 'Accueil' },
    { key: 'specialites', label: 'Spécialités' },
    { key: 'equipe', label: 'Équipe' },
    { key: 'rendez-vous', label: 'Rendez-vous' },
    { key: 'contact', label: 'Infos pratiques' },
  ],
};

const base = `/demo/${meta.slug}`;
const href = (key: string) => (key ? `${base}/${key}` : base);
const icons = [Stethoscope, Baby, HeartPulse, Droplets, Flower2, Activity];

const hours: [string, string][] = [
  ['Lundi – Vendredi', '7h30 – 19h00'],
  ['Samedi', '8h00 – 12h00'],
  ['Dimanche et jours fériés', 'Fermé'],
];

const rdvFields: Field[] = [
  { name: 'motif', label: 'Type de demande', type: 'chips', required: true, options: ['Première consultation', 'Suivi', 'Contrôle annuel', 'Autre'] },
  { name: 'specialite', label: 'Spécialité', type: 'select', required: true, half: true, options: specialties.map((s) => s.key) },
  { name: 'praticien', label: 'Praticien souhaité', type: 'select', half: true, placeholder: 'Sans préférence', options: team.map((p) => p.name) },
  { name: 'date', label: 'Date souhaitée', type: 'date', required: true, half: true, hint: 'Nous vous proposerons le créneau disponible le plus proche.' },
  { name: 'moment', label: 'Moment de la journée', type: 'chips', required: true, half: true, options: ['Matin', 'Midi', 'Après-midi'] },
  { name: 'prenom', label: 'Prénom', type: 'text', required: true, half: true },
  { name: 'nom', label: 'Nom', type: 'text', required: true, half: true },
  { name: 'tel', label: 'Téléphone', type: 'tel', required: true, half: true, placeholder: '+41 00 000 00 00' },
  { name: 'email', label: 'E-mail', type: 'email', required: true, half: true },
  { name: 'message', label: 'Précisions utiles (facultatif)', type: 'textarea', hint: 'N’indiquez pas d’informations médicales détaillées dans ce formulaire.' },
  { name: 'accord', label: 'J’accepte d’être contacté·e par la clinique pour fixer ce rendez-vous.', type: 'checkbox', required: true },
];

const contactFields: Field[] = [
  { name: 'nom', label: 'Nom et prénom', type: 'text', required: true, half: true },
  { name: 'email', label: 'E-mail', type: 'email', required: true, half: true },
  { name: 'sujet', label: 'Sujet', type: 'select', required: true, options: ['Question administrative', 'Facturation', 'Accès et stationnement', 'Autre'] },
  { name: 'message', label: 'Votre message', type: 'textarea', required: true },
];

function Btn({ to, children, ghost = false }: { to: string; children: ReactNode; ghost?: boolean }) {
  return (
    <Link
      href={to}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-base font-semibold transition ${
        ghost ? 'border border-[#9fc3cf] bg-white text-[#12344d] hover:border-[#0c7c78]' : 'bg-[#0c7c78] text-white hover:bg-[#096360]'
      }`}
    >
      {children}
    </Link>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#0c7c78]">{children}</p>;
}

/** Calm abstract illustration: sunrise ("alba") over soft hills with a pulse line. */
function Sunrise() {
  return (
    <svg viewBox="0 0 520 440" role="img" aria-label="Illustration : lever de soleil sur des collines, traversé par une ligne de pouls" className="w-full rounded-[2rem]">
      <defs>
        <linearGradient id="alba-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfeaf1" />
          <stop offset="0.7" stopColor="#fbe7d6" />
        </linearGradient>
        <radialGradient id="alba-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff6e6" />
          <stop offset="1" stopColor="#f5bf94" />
        </radialGradient>
      </defs>
      <rect width="520" height="440" fill="url(#alba-sky)" />
      <circle cx="300" cy="250" r="150" fill="#fff" opacity="0.35" />
      <circle cx="300" cy="250" r="96" fill="url(#alba-sun)" />
      <path d="M0 290q130-80 260-20t260-40v210H0z" fill="#8fcfc8" />
      <path d="M0 340q140-70 300-10t220-50v160H0z" fill="#3fa69e" />
      <path d="M0 390q180-60 320-10t200-30v90H0z" fill="#0c7c78" />
      <path d="M30 210h120l18-34 24 70 22-52 14 16h130" fill="none" stroke="#12344d" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="translate(408 70)">
        <rect width="64" height="64" rx="18" fill="#fff" />
        <path d="M32 16v32M16 32h32" stroke="#0c7c78" strokeWidth="8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function HoursList() {
  return (
    <dl className="grid gap-2 text-[0.95rem]">
      {hours.map(([d, h]) => (
        <div key={d} className="flex justify-between gap-4 border-b border-current/10 pb-2">
          <dt>{d}</dt>
          <dd className="font-semibold">{h}</dd>
        </div>
      ))}
    </dl>
  );
}

function PageHead({ label, title, lead }: { label: string; title: string; lead: string }) {
  return (
    <section className="bg-gradient-to-b from-[#e2f1f5] to-[#f4fafb]">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <Label>{label}</Label>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-[#12344d] sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg text-[#33526a]">{lead}</p>
      </div>
    </section>
  );
}

function Urgency() {
  return (
    <p className="flex items-start gap-3 rounded-xl border border-[#e8c9a8] bg-[#fff6ea] p-4 text-sm text-[#5a3b12]">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#b25e09]" />
      <span>
        <strong>En cas d’urgence vitale, appelez le 144.</strong> Ce site ne permet pas de traiter les demandes urgentes.
      </span>
    </p>
  );
}

function Home() {
  return (
    <>
      <section className="bg-gradient-to-b from-[#e2f1f5] to-[#f4fafb]">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-24 pt-10 lg:grid-cols-2 lg:pt-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-[#07504d] ring-1 ring-[#bfe1dd]">
              <span aria-hidden="true" className="size-2 rounded-full bg-[#0c7c78]" /> Nouveaux patients bienvenus
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-[1.1] tracking-tight text-[#12344d] sm:text-6xl">
              Votre santé, suivie avec <span className="text-[#0c7c78]">attention</span>.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-[#33526a]">
              Un cabinet de groupe au centre-ville : six spécialités réunies sous un même toit, pour une prise en charge coordonnée de toute la famille.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Btn to={href('rendez-vous')}>
                <CalendarDays aria-hidden="true" className="size-5" /> Prendre rendez-vous
              </Btn>
              <Btn to={href('specialites')} ghost>
                Nos spécialités
              </Btn>
            </div>
            <p className="mt-6 flex items-center gap-2 text-[#33526a]">
              <Phone aria-hidden="true" className="size-4 text-[#0c7c78]" /> Secrétariat : <strong className="text-[#12344d]">+41 00 000 00 00</strong>
            </p>
          </div>
          <div className="relative">
            <Sunrise />
            <div className="absolute -bottom-6 left-4 right-4 rounded-2xl bg-white p-5 shadow-[0_18px_40px_-20px_#12344d80] sm:left-auto sm:right-6 sm:w-72">
              <p className="flex items-center gap-2 font-semibold text-[#12344d]">
                <Clock aria-hidden="true" className="size-4 text-[#0c7c78]" /> Horaires d’ouverture
              </p>
              <div className="mt-3 text-[#33526a]">
                <HoursList />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <ul className="grid gap-4 md:grid-cols-3">
          {[
            { icon: CalendarDays, t: 'Demander un rendez-vous', d: 'Indiquez vos disponibilités, nous vous rappelons pour confirmer.', to: 'rendez-vous' },
            { icon: UserRound, t: 'Choisir un praticien', d: 'Découvrez l’équipe, ses jours de consultation et ses langues.', to: 'equipe' },
            { icon: MapPin, t: 'Préparer votre venue', d: 'Accès, stationnement et documents à apporter.', to: 'contact' },
          ].map((c) => (
            <li key={c.t}>
              <Link href={href(c.to)} className="group flex h-full items-start gap-4 rounded-2xl border border-[#d5e6ec] bg-white p-6 transition hover:border-[#0c7c78] hover:shadow-[0_14px_30px_-22px_#12344d]">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#e2f4f2] text-[#0c7c78]">
                  <c.icon aria-hidden="true" className="size-6" />
                </span>
                <span>
                  <span className="flex items-center gap-2 text-lg font-semibold text-[#12344d]">
                    {c.t} <ArrowRight aria-hidden="true" className="size-4 transition group-hover:translate-x-1" />
                  </span>
                  <span className="mt-1 block text-sm text-[#4a6577]">{c.d}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Label>Spécialités</Label>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#12344d] sm:text-4xl">Six disciplines, une seule adresse</h2>
          </div>
          <Link href={href('specialites')} className="inline-flex items-center gap-2 font-semibold text-[#07504d] hover:underline">
            Tout voir <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-6">
          {specialties.map((s, i) => {
            const Icon = icons[i];
            return (
              <li key={s.key} className="rounded-2xl bg-white p-5 text-center ring-1 ring-[#d5e6ec]">
                <Icon aria-hidden="true" className="mx-auto size-8 text-[#0c7c78]" />
                <p className="mt-3 text-sm font-semibold text-[#12344d]">{s.key}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="bg-[#12344d] text-white [&_:focus-visible]:outline-[#ffffff]!">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8fd8d0]">Votre parcours</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Simple, du premier contact au suivi</h2>
            <p className="mt-4 text-[#c5d8e2]">Chaque étape est pensée pour vous faire gagner du temps et vous garder informé·e.</p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {[
              ['Demande', 'Vous envoyez votre demande en ligne ou par téléphone.'],
              ['Confirmation', 'Le secrétariat vous rappelle pour fixer le créneau.'],
              ['Consultation', 'Vous êtes reçu·e par le praticien de votre choix.'],
              ['Suivi', 'Un compte rendu est transmis à votre médecin traitant, avec votre accord.'],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-2xl bg-white/8 p-5 ring-1 ring-white/15">
                <span className="grid size-9 place-items-center rounded-full bg-[#8fd8d0] text-sm font-bold text-[#12344d]">{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-[#c5d8e2]">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <Label>Nos engagements</Label>
        <ul className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            ['Du temps pour vous écouter', 'Des consultations planifiées sans précipitation, pour aborder toutes vos questions.'],
            ['Une équipe coordonnée', 'Les praticiens échangent entre eux afin de vous éviter les démarches répétées.'],
            ['Des explications claires', 'Vous repartez avec un plan de traitement compréhensible et les prochaines étapes.'],
          ].map(([t, d]) => (
            <li key={t} className="flex gap-4">
              <Check aria-hidden="true" className="mt-1 size-6 shrink-0 rounded-full bg-[#e2f4f2] p-1 text-[#0c7c78]" />
              <div>
                <h3 className="text-lg font-semibold text-[#12344d]">{t}</h3>
                <p className="mt-1 text-[#4a6577]">{d}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Specialites() {
  return (
    <>
      <PageHead label="Spécialités" title="Des soins complets, à chaque étape de la vie" lead="Nos praticiens travaillent ensemble pour vous proposer une prise en charge continue, de la prévention au suivi." />
      <section className="mx-auto max-w-6xl px-5 py-12">
        <ul className="grid gap-5 md:grid-cols-2">
          {specialties.map((s, i) => {
            const Icon = icons[i];
            const count = team.filter((p) => p.specialty === s.key).length;
            return (
              <li key={s.key} className="rounded-2xl border border-[#d5e6ec] bg-white p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <span className="grid size-14 place-items-center rounded-2xl bg-[#e2f4f2] text-[#0c7c78]">
                    <Icon aria-hidden="true" className="size-7" />
                  </span>
                  <div>
                    <h2 className="text-2xl font-semibold text-[#12344d]">{s.key}</h2>
                    <p className="text-sm text-[#4a6577]">
                      {count} praticien{count > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-[#33526a]">{s.text}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {s.examples.map((e) => (
                    <li key={e} className="rounded-full bg-[#eef6f8] px-3 py-1.5 text-sm text-[#12344d]">
                      {e}
                    </li>
                  ))}
                </ul>
                <Link href={href('rendez-vous')} className="mt-6 inline-flex items-center gap-2 font-semibold text-[#07504d] hover:underline">
                  Demander un rendez-vous <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

function Contact() {
  return (
    <>
      <PageHead label="Infos pratiques" title="Préparer votre venue" lead="Horaires, accès et contact : tout ce qu’il faut savoir avant votre consultation." />
      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-12 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#d5e6ec] bg-white p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-[#12344d]">
            <Clock aria-hidden="true" className="size-5 text-[#0c7c78]" /> Horaires
          </h2>
          <div className="mt-4 text-[#33526a]">
            <HoursList />
          </div>
          <p className="mt-4 text-sm text-[#4a6577]">Permanence téléphonique dès 7h30.</p>
        </div>
        <address className="rounded-2xl border border-[#d5e6ec] bg-white p-6 not-italic">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-[#12344d]">
            <MapPin aria-hidden="true" className="size-5 text-[#0c7c78]" /> Adresse
          </h2>
          <p className="mt-4 text-[#33526a]">
            Clinique Alba
            <br />
            Rue de l’Exemple 12
            <br />
            2000 Neuchâtel
          </p>
          <p className="mt-4 flex items-center gap-2 text-[#12344d]">
            <Phone aria-hidden="true" className="size-4 text-[#0c7c78]" /> +41 00 000 00 00
          </p>
          <p className="mt-1 flex items-center gap-2 text-[#12344d]">
            <Mail aria-hidden="true" className="size-4 text-[#0c7c78]" /> accueil@example.ch
          </p>
        </address>
        <div className="rounded-2xl border border-[#d5e6ec] bg-white p-6">
          <h2 className="text-xl font-semibold text-[#12344d]">Accès</h2>
          <ul className="mt-4 grid gap-3 text-[#33526a]">
            <li className="flex gap-3">
              <Bus aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#0c7c78]" /> Arrêt de bus à deux minutes à pied
            </li>
            <li className="flex gap-3">
              <SquareParking aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#0c7c78]" /> Parking public à proximité immédiate
            </li>
            <li className="flex gap-3">
              <Accessibility aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#0c7c78]" /> Entrée de plain-pied et ascenseur
            </li>
          </ul>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-16 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold text-[#12344d]">
            <ClipboardCheck aria-hidden="true" className="size-6 text-[#0c7c78]" /> À apporter
          </h2>
          <ul className="mt-4 grid gap-3 text-[#33526a]">
            {['Votre carte d’assurance maladie', 'La liste de vos médicaments actuels', 'Vos résultats d’examens récents', 'Le carnet de vaccination, pour les enfants'].map((t) => (
              <li key={t} className="flex gap-3">
                <Check aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#0c7c78]" /> {t}
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Urgency />
          </div>
        </div>
        <div className="rounded-2xl border border-[#d5e6ec] bg-white p-6 sm:p-8">
          <h2 className="mb-6 text-2xl font-semibold text-[#12344d]">Une question ?</h2>
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
    <div className="min-h-dvh bg-[#f4fafb] font-sans text-[#12344d] [&_:focus-visible]:outline-2 [&_:focus-visible]:outline-offset-2 [&_:focus-visible]:outline-[#0c7c78] [&_:is(h1,h2,h3)]:font-sans">
      <div className="bg-[#12344d] text-white">
        <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-2 text-sm">
          <span>Urgence vitale : appelez le 144</span>
          <span className="hidden text-[#c5d8e2] sm:inline">Lun – Ven 7h30 – 19h00 · Sam 8h00 – 12h00</span>
        </p>
      </div>
      <Header items={items} home={base} bookHref={href('rendez-vous')} />
      <main>
        {known === 'specialites' ? (
          <Specialites />
        ) : known === 'equipe' ? (
          <>
            <PageHead label="Équipe" title="Des praticiens à votre écoute" lead="Filtrez par spécialité pour trouver le praticien qui vous convient, puis demandez un rendez-vous." />
            <section className="mx-auto max-w-6xl px-5 py-12">
              <Team bookHref={href('rendez-vous')} />
            </section>
          </>
        ) : known === 'rendez-vous' ? (
          <>
            <PageHead label="Rendez-vous" title="Demander un rendez-vous" lead="Remplissez ce formulaire : le secrétariat vous rappelle pour confirmer la date et l’heure." />
            <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1.6fr_1fr]">
              <div className="rounded-2xl border border-[#d5e6ec] bg-white p-6 sm:p-8">
                <DemoForm fields={rdvFields} submitLabel="Envoyer ma demande" title="Demande de rendez-vous" />
              </div>
              <aside className="grid content-start gap-5">
                <Urgency />
                <div className="rounded-2xl bg-[#e2f4f2] p-6">
                  <h2 className="text-lg font-semibold text-[#07504d]">Par téléphone</h2>
                  <p className="mt-2 text-2xl font-semibold text-[#12344d]">+41 00 000 00 00</p>
                  <p className="mt-1 text-sm text-[#33526a]">Du lundi au vendredi, de 7h30 à 19h00.</p>
                </div>
                <div className="rounded-2xl border border-[#d5e6ec] bg-white p-6">
                  <h2 className="text-lg font-semibold">Annulation</h2>
                  <p className="mt-2 text-sm text-[#33526a]">Merci de prévenir le secrétariat au moins 24 heures à l’avance si vous ne pouvez pas venir.</p>
                </div>
              </aside>
            </section>
          </>
        ) : known === 'contact' ? (
          <Contact />
        ) : (
          <Home />
        )}
      </main>
      <footer className="border-t border-[#d5e6ec] bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-semibold">
              Clinique <span className="text-[#0c7c78]">Alba</span>
            </p>
            <p className="mt-2 text-sm text-[#4a6577]">Cabinet médical de groupe au centre-ville.</p>
          </div>
          <nav aria-label="Pied de page">
            <p className="text-sm font-semibold">Navigation</p>
            <ul className="mt-3 grid gap-2 text-sm text-[#33526a]">
              {items.map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="hover:text-[#07504d] hover:underline">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <address className="text-sm not-italic text-[#33526a]">
            <p className="font-semibold text-[#12344d]">Contact</p>
            <p className="mt-3">Rue de l’Exemple 12, 2000 Neuchâtel</p>
            <p>+41 00 000 00 00</p>
            <p>accueil@example.ch</p>
          </address>
          <div className="text-sm text-[#33526a]">
            <p className="font-semibold text-[#12344d]">Horaires</p>
            <div className="mt-3">
              <HoursList />
            </div>
          </div>
        </div>
        <p className="border-t border-[#d5e6ec] px-5 py-4 text-center text-xs text-[#4a6577]">© Clinique Alba — Site de présentation. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
