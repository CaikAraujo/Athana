import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import type { DemoMeta } from '../types';
import { ContactForm, Expertises, Header, Publications } from './ui';

export const meta: DemoMeta = {
  slug: 'cabinet-meridien',
  name: 'Cabinet Méridien',
  language: 'fr',
  pages: [
    { key: '', label: 'Accueil' },
    { key: 'expertises', label: 'Expertises' },
    { key: 'equipe', label: 'Équipe' },
    { key: 'publications', label: 'Publications' },
    { key: 'contact', label: 'Contact' },
  ],
};

const BASE = '/demo/cabinet-meridien';
const wrap = 'mx-auto max-w-6xl px-4 sm:px-6';
const over = 'text-xs font-semibold uppercase tracking-[0.25em] text-[#8a6d32]';

/** Decorative globe with meridians — the firm's emblem, enlarged. */
function Globe({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true" focusable="false">
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="200" cy="200" r="190" />
        {[40, 85, 130, 170].map((rx) => <ellipse key={rx} cx="200" cy="200" rx={rx} ry="190" />)}
        {[-140, -90, -40, 40, 90, 140].map((y) => {
          const w = Math.round(Math.sqrt(190 * 190 - y * y));
          return <path key={y} d={`M${200 - w} ${200 + y} H${200 + w}`} />;
        })}
        <path d="M10 200 H390" />
      </g>
      <path d="M200 0 V400" stroke="#c9a961" strokeWidth="2.5" />
      <circle cx="200" cy="118" r="7" fill="#c9a961" />
    </svg>
  );
}

const METHOD = [
  { t: 'Écoute', d: 'Un premier entretien, sans engagement, pour comprendre votre situation, vos échéances et vos priorités.' },
  { t: 'Diagnostic', d: 'Nous analysons vos documents et vous remettons une note de synthèse avec les points d’attention.' },
  { t: 'Mandat', d: 'Une lettre de mission précise le périmètre, les délais, les interlocuteurs et les honoraires.' },
  { t: 'Exécution', d: 'Les travaux sont menés par une équipe stable, selon un calendrier partagé.' },
  { t: 'Suivi', d: 'Des points réguliers pour anticiper plutôt que corriger, et ajuster le mandat si nécessaire.' },
];

const TEAM = [
  { i: 'HV', n: 'Hélène Vautier', r: 'Associée — Fiscalité', b: 'Accompagne dirigeants et familles sur les questions fiscales et patrimoniales.', l: 'Français, anglais, allemand' },
  { i: 'JR', n: 'Julien Rochat', r: 'Associé — Comptabilité & révision', b: 'Supervise les mandats comptables et les bouclements des sociétés clientes.', l: 'Français, anglais' },
  { i: 'AB', n: 'Amira Benali', r: 'Responsable — Salaires & RH', b: 'Pilote l’administration des salaires et les relations avec les assurances sociales.', l: 'Français, italien' },
  { i: 'NK', n: 'Nicolas Keller', r: 'Conseiller — Entreprises', b: 'Intervient sur les créations, évaluations et transmissions de sociétés.', l: 'Français, allemand' },
  { i: 'CM', n: 'Clara Monnier', r: 'Comptable', b: 'Tient les comptabilités courantes et prépare les décomptes TVA.', l: 'Français, anglais' },
  { i: 'DP', n: 'David Perrin', r: 'Fiscaliste', b: 'Prépare les déclarations des personnes physiques et morales.', l: 'Français, espagnol' },
];

function PageHead({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-[#10233f] text-[#f7f3ea]">
      <Globe className="pointer-events-none absolute -right-24 top-1/2 h-[460px] w-[460px] -translate-y-1/2 text-[#f7f3ea]/15" />
      <div className={`${wrap} relative py-16 sm:py-24`}>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d6b775]">{label}</p>
        <h1 className="cm-serif mt-4 max-w-3xl text-4xl sm:text-6xl">{title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#f7f3ea]/85">{children}</p>
      </div>
    </section>
  );
}

function Method() {
  return (
    <section className={`${wrap} py-16 sm:py-24`}>
      <p className={over}>Notre méthode</p>
      <h2 className="cm-serif mt-3 max-w-2xl text-4xl text-[#10233f] sm:text-5xl">Cinq étapes, aucune surprise</h2>
      <ol className="relative mt-12 grid gap-10 md:grid-cols-5 md:gap-6">
        <span className="absolute left-[19px] top-0 h-full w-px bg-[#10233f]/20 md:left-0 md:top-[19px] md:h-px md:w-full" aria-hidden="true" />
        {METHOD.map((m, i) => (
          <li key={m.t} className="relative pl-14 md:pl-0 md:pt-14">
            <span className="cm-serif absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-full border border-[#8a6d32] bg-[#f7f3ea] text-lg text-[#8a6d32]">{i + 1}</span>
            <h3 className="cm-serif text-2xl text-[#10233f]">{m.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#3a4558]">{m.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Cta() {
  return (
    <section className="border-y border-[#10233f]/15 bg-[#efe9dc]">
      <div className={`${wrap} flex flex-col items-start justify-between gap-6 py-14 md:flex-row md:items-center`}>
        <h2 className="cm-serif max-w-xl text-3xl text-[#10233f] sm:text-4xl">Un premier entretien pour faire le point sur votre situation.</h2>
        <Link href={`${BASE}/contact`} className="inline-flex shrink-0 items-center gap-2 bg-[#10233f] px-7 py-4 font-semibold tracking-wide text-[#f7f3ea] transition-colors hover:bg-[#8a6d32]">
          Prendre contact <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <>
      <section className={`${wrap} grid gap-10 py-14 sm:py-24 lg:grid-cols-[1.3fr_1fr] lg:items-center`}>
        <div>
          <p className={over}>Fiduciaire indépendante</p>
          <h1 className="cm-serif mt-5 text-5xl text-[#10233f] sm:text-7xl">La clarté des chiffres, <em className="text-[#8a6d32]">la sérénité</em> des décisions.</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#3a4558]">Comptabilité, fiscalité, salaires et conseil : le Cabinet Méridien accompagne les entreprises et les particuliers avec méthode et discrétion.</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href={`${BASE}/expertises`} className="bg-[#10233f] px-7 py-4 font-semibold tracking-wide text-[#f7f3ea] transition-colors hover:bg-[#8a6d32]">Nos expertises</Link>
            <Link href={`${BASE}/contact`} className="border border-[#10233f] px-7 py-4 font-semibold tracking-wide text-[#10233f] transition-colors hover:bg-[#10233f] hover:text-[#f7f3ea]">Prendre rendez-vous</Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-sm bg-[#10233f] p-10">
          <Globe className="w-full text-[#f7f3ea]/45" />
          <p className="cm-serif mt-6 border-t border-[#f7f3ea]/25 pt-5 text-center text-lg italic text-[#f7f3ea]">« Un repère fixe pour s’orienter. »</p>
        </div>
      </section>

      <section className="bg-white">
        <div className={`${wrap} py-16 sm:py-24`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={over}>Domaines d’expertise</p>
              <h2 className="cm-serif mt-3 text-4xl text-[#10233f] sm:text-5xl">Quatre métiers, un interlocuteur</h2>
            </div>
            <Link href={`${BASE}/expertises`} className="inline-flex items-center gap-2 border-b border-[#8a6d32] pb-1 font-semibold text-[#10233f]">Voir le détail <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <ul className="mt-10 grid border-l border-t border-[#10233f]/15 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Comptabilité & révision', 'Tenue des comptes, bouclements et préparation à la révision.'],
              ['Fiscalité', 'Déclarations, planification et relations avec les administrations.'],
              ['Salaires & RH', 'Gestion des salaires, assurances sociales et impôt à la source.'],
              ['Conseil d’entreprise', 'Création, évaluation, restructuration et transmission.'],
            ].map(([t, d], i) => (
              <li key={t} className="border-b border-r border-[#10233f]/15 p-7">
                <span className="cm-serif text-sm italic text-[#8a6d32]">{['I', 'II', 'III', 'IV'][i]}</span>
                <h3 className="cm-serif mt-6 text-2xl text-[#10233f]">{t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#3a4558]">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Method />

      <section className="bg-[#10233f] text-[#f7f3ea]">
        <div className={`${wrap} grid gap-12 py-16 sm:py-24 lg:grid-cols-[1fr_2fr]`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d6b775]">Nos engagements</p>
            <h2 className="cm-serif mt-3 text-4xl sm:text-5xl">Ce que vous pouvez attendre de nous</h2>
          </div>
          <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {[
              ['Confidentialité', 'Vos informations sont traitées avec la discrétion qu’exige notre profession.'],
              ['Indépendance', 'Nous ne percevons aucune commission de tiers : nos recommandations ne servent que vos intérêts.'],
              ['Disponibilité', 'Un associé reste votre interlocuteur direct et répond personnellement à vos questions.'],
              ['Honoraires annoncés', 'Chaque mandat fait l’objet d’une offre écrite avant le début des travaux.'],
            ].map(([t, d]) => (
              <div key={t} className="border-t border-[#f7f3ea]/25 pt-5">
                <dt className="cm-serif text-2xl text-[#d6b775]">{t}</dt>
                <dd className="mt-2 leading-relaxed text-[#f7f3ea]/85">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={`${wrap} py-16 sm:py-24`}>
        <p className={over}>Publications</p>
        <h2 className="cm-serif mt-3 text-4xl text-[#10233f] sm:text-5xl">Nos dernières analyses</h2>
        <ul className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            ['Fiscalité', 'Bouclement annuel : dix points à vérifier avant le 31 décembre'],
            ['Entreprise', 'Sàrl ou SA ? Les critères qui comptent vraiment'],
            ['Salaires', 'Engager son premier collaborateur : le calendrier administratif'],
          ].map(([th, t]) => (
            <li key={t} className="border-t-2 border-[#10233f] pt-5">
              <p className={over}>{th}</p>
              <h3 className="cm-serif mt-3 text-2xl text-[#10233f]"><Link href={`${BASE}/publications`} className="hover:underline hover:decoration-[#8a6d32] hover:underline-offset-4">{t}</Link></h3>
            </li>
          ))}
        </ul>
      </section>
      <Cta />
    </>
  );
}

export default function Demo({ page }: { page: string }) {
  const current = meta.pages.some((p) => p.key === page) ? page : '';
  return (
    <div className="cm-root min-h-screen bg-[#f7f3ea] font-sans text-[#1c2a40]">
      <style>{`.cm-root .cm-serif{font-family:Georgia,'Times New Roman',Times,serif;font-weight:400;letter-spacing:-0.01em;line-height:1.12}.cm-root :focus-visible{outline:2px solid #8a6d32;outline-offset:3px;border-radius:0}.cm-root .bg-\\[\\#10233f\\] :focus-visible{outline-color:#d6b775}.cm-root footer :focus-visible{outline-color:#d6b775}.cm-root ::selection{background:#10233f;color:#f7f3ea}`}</style>
      <a href="#cm-main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2">Aller au contenu</a>
      <Header pages={meta.pages} current={current} />
      <main id="cm-main">
        {current === 'expertises' ? (
          <>
            <PageHead label="Expertises" title="Des compétences complémentaires, réunies sous un même toit">Sélectionnez un domaine pour en découvrir les prestations.</PageHead>
            <section className={`${wrap} py-14`}><Expertises /></section>
            <div className="bg-white"><Method /></div>
            <Cta />
          </>
        ) : current === 'equipe' ? (
          <>
            <PageHead label="Équipe" title="Des professionnels qui connaissent votre dossier">Une équipe volontairement resserrée : les personnes que vous rencontrez sont celles qui travaillent sur vos comptes.</PageHead>
            <section className={`${wrap} py-14 sm:py-20`}>
              <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {TEAM.map((m, i) => (
                  <li key={m.n}>
                    <div className={`flex aspect-[4/3] items-end p-5 ${i % 3 === 0 ? 'bg-[#10233f] text-[#f7f3ea]' : i % 3 === 1 ? 'bg-[#e4dccb] text-[#10233f]' : 'bg-[#8a6d32] text-[#f7f3ea]'}`} aria-hidden="true">
                      <span className="cm-serif text-7xl italic opacity-90">{m.i}</span>
                    </div>
                    <h2 className="cm-serif mt-5 text-2xl text-[#10233f]">{m.n}</h2>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8a6d32]">{m.r}</p>
                    <p className="mt-3 text-sm leading-relaxed text-[#3a4558]">{m.b}</p>
                    <p className="mt-3 border-t border-[#10233f]/15 pt-3 text-sm text-[#5a6577]">Langues : {m.l}</p>
                  </li>
                ))}
              </ul>
            </section>
            <section className="bg-white">
              <div className={`${wrap} grid gap-8 py-16 md:grid-cols-2`}>
                <div>
                  <p className={over}>Nous rejoindre</p>
                  <h2 className="cm-serif mt-3 text-4xl text-[#10233f]">Candidatures spontanées</h2>
                </div>
                <p className="text-lg leading-relaxed text-[#3a4558]">Nous accueillons volontiers les profils rigoureux et curieux, en comptabilité comme en fiscalité. Écrivez-nous à carrieres@cabinet-meridien.example.ch.</p>
              </div>
            </section>
            <Cta />
          </>
        ) : current === 'publications' ? (
          <>
            <PageHead label="Publications" title="Analyses et repères pour les dirigeants">Des articles courts, rédigés par notre équipe, pour éclairer les questions qui reviennent le plus souvent.</PageHead>
            <section className={`${wrap} py-14`}><Publications /></section>
            <section className={`${wrap} pb-16`}>
              <p className="border-l-2 border-[#8a6d32] pl-5 text-sm leading-relaxed text-[#5a6577]">Ces publications ont une portée générale et ne remplacent pas un conseil personnalisé. Titres et contenus sont fictifs.</p>
            </section>
          </>
        ) : current === 'contact' ? (
          <>
            <PageHead label="Contact" title="Parlons de votre situation">Décrivez-nous brièvement votre demande : un associé vous proposera un premier entretien.</PageHead>
            <section className={`${wrap} grid gap-10 py-14 lg:grid-cols-[1.6fr_1fr]`}>
              <ContactForm />
              <aside>
                <h2 className="cm-serif text-3xl text-[#10233f]">Nos bureaux</h2>
                <ul className="mt-6 space-y-5 border-t border-[#10233f]/20 pt-6 text-[#3a4558]">
                  <li className="flex gap-4"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#8a6d32]" aria-hidden="true" /><span>Rue de l’Exemple 12<br />1200 Genève</span></li>
                  <li className="flex gap-4"><Phone className="mt-0.5 h-5 w-5 shrink-0 text-[#8a6d32]" aria-hidden="true" />+41 00 000 00 00</li>
                  <li className="flex gap-4"><Mail className="mt-0.5 h-5 w-5 shrink-0 text-[#8a6d32]" aria-hidden="true" /><span className="break-all">contact@cabinet-meridien.example.ch</span></li>
                  <li className="flex gap-4"><Clock className="mt-0.5 h-5 w-5 shrink-0 text-[#8a6d32]" aria-hidden="true" /><span>Lundi – vendredi<br />8h30 – 12h00, 13h30 – 17h30</span></li>
                </ul>
                <p className="mt-8 bg-[#efe9dc] p-5 text-sm leading-relaxed text-[#3a4558]">Les entretiens ont lieu sur rendez-vous, dans nos bureaux ou par visioconférence.</p>
              </aside>
            </section>
          </>
        ) : (
          <HomePage />
        )}
      </main>
      <footer className="bg-[#0b1930] text-[#f7f3ea]/75">
        <div className={`${wrap} grid gap-10 py-14 md:grid-cols-[2fr_1fr_1fr]`}>
          <div>
            <p className="cm-serif text-3xl text-[#f7f3ea]">Cabinet Méridien</p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed">Fiduciaire et conseil pour les entreprises et les particuliers.</p>
          </div>
          <nav aria-label="Pied de page">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d6b775]">Le cabinet</p>
            <ul className="mt-4 space-y-2 text-sm">
              {meta.pages.map((p) => <li key={p.key}><Link href={p.key ? `${BASE}/${p.key}` : BASE} className="hover:text-[#f7f3ea] hover:underline">{p.label}</Link></li>)}
            </ul>
          </nav>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#d6b775]">Adresse</p>
            <address className="mt-4 text-sm not-italic leading-relaxed">Rue de l’Exemple 12<br />1200 Genève<br />+41 00 000 00 00</address>
          </div>
        </div>
        <p className="border-t border-[#f7f3ea]/15 py-5 text-center text-xs">© {new Date().getFullYear()} Cabinet Méridien SA — société fictive.</p>
      </footer>
    </div>
  );
}
