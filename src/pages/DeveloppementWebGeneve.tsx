import { Helmet } from 'react-helmet-async';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Reveal } from '../../components/ui/Section';
import { DEFAULT_LOCALE, isLocale, SUPPORTED_LOCALES, withLocalePath } from '../i18n/routing';

type Locale = (typeof SUPPORTED_LOCALES)[number];

const pageCopy: Record<Locale, {
  metaTitle: string;
  metaDescription: string;
  badge: string;
  headlineA: string;
  headlineB: string;
  heroA: string;
  heroB: string;
  serviceTitle: string;
  serviceCopy: string;
  proofTitle: string;
  proofCopy: string;
  proofCta: string;
  finalTitle: string;
  finalCopy: string;
  finalCta: string;
  faq: Array<{ q: string; a: string }>;
}> = {
  fr: {
    metaTitle: 'Développement Web sur Mesure à Genève | ATHANA',
    metaDescription: 'Agence de développement web sur mesure à Genève. ATHANA conçoit des sites et applications performants pour PME et entreprises suisses avec accompagnement stratégique.',
    badge: 'Genève - Landing Locale',
    headlineA: 'Développement Web sur Mesure à Genève',
    headlineB: 'Agence de Développement Web à Genève qui transforme vos visiteurs en opportunités',
    heroA: 'Nous aidons les entreprises genevoises à transformer leurs processus et leur acquisition digitale avec des plateformes web rapides, évolutives et orientées conversion.',
    heroB: "Un site ou une plateforme n'a de valeur que s'il génère des résultats. Nous concevons des expériences rapides, crédibles et orientées conversion pour les entreprises genevoises.",
    serviceTitle: 'Le service',
    serviceCopy: 'ATHANA conçoit des solutions web de bout en bout: cadrage, UX, architecture technique, développement, SEO technique et maintenance. Chaque projet est conçu sur mesure pour vos objectifs business à Genève et en Suisse romande.',
    proofTitle: 'Preuve',
    proofCopy: "Projet récent: VF Froid - refonte complète d'un site corporate avec identité premium, performance optimisée et meilleure lisibilité des services. Résultat: une présentation plus crédible pour transformer des visiteurs en demandes qualifiées.",
    proofCta: 'Voir la référence',
    finalTitle: 'Parlons de votre projet à Genève',
    finalCopy: "Obtenez un cadrage rapide, un plan d'exécution clair et un devis réaliste.",
    finalCta: 'Demander un Audit',
    faq: [
      { q: 'Quel est le délai moyen pour un projet web sur mesure à Genève ?', a: 'Selon la complexité, un projet démarre souvent entre 4 et 10 semaines, avec une phase de cadrage initiale.' },
      { q: "Pouvez-vous reprendre un site existant et l'améliorer ?", a: "Oui. Nous pouvons auditer l'existant, corriger les points critiques, puis planifier une refonte progressive." },
      { q: 'Travaillez-vous uniquement avec des entreprises basées à Genève ?', a: 'Nous accompagnons principalement Genève et la Suisse romande, mais nous travaillons aussi avec des équipes dans toute la Suisse.' },
    ],
  },
  en: {
    metaTitle: 'Custom Web Development in Geneva | ATHANA',
    metaDescription: 'Custom web development agency in Geneva. ATHANA builds high-performance websites and apps for Swiss companies with strategic guidance.',
    badge: 'Geneva - Local Landing',
    headlineA: 'Custom Web Development in Geneva',
    headlineB: 'Geneva Web Development Agency that turns visitors into opportunities',
    heroA: 'We help Geneva companies transform operations and digital acquisition with fast, scalable, conversion-focused web platforms.',
    heroB: 'A website or platform only has value if it drives results. We design fast, credible, conversion-oriented experiences for Geneva businesses.',
    serviceTitle: 'The service',
    serviceCopy: 'ATHANA delivers end-to-end web solutions: discovery, UX, technical architecture, development, technical SEO, and maintenance. Every project is tailored to your business goals in Geneva and French-speaking Switzerland.',
    proofTitle: 'Proof',
    proofCopy: 'Recent project: VF Froid - complete corporate website redesign with premium identity, optimized performance, and clearer service structure. Result: stronger credibility to convert visitors into qualified requests.',
    proofCta: 'View case',
    finalTitle: 'Let us discuss your Geneva project',
    finalCopy: 'Get fast scoping, a clear execution plan, and a realistic quote.',
    finalCta: 'Request an Audit',
    faq: [
      { q: 'What is the average timeline for a custom web project in Geneva?', a: 'Depending on complexity, projects usually start between 4 and 10 weeks, including an initial discovery phase.' },
      { q: 'Can you improve an existing website?', a: 'Yes. We can audit the current setup, fix critical issues, and then plan a phased redesign.' },
      { q: 'Do you only work with Geneva-based companies?', a: 'We mainly support Geneva and French-speaking Switzerland, but we also work with teams across Switzerland.' },
    ],
  },
  de: {
    metaTitle: 'Individuelle Webentwicklung in Genf | ATHANA',
    metaDescription: 'Agentur fuer individuelle Webentwicklung in Genf. ATHANA entwickelt performante Websites und Apps fuer Schweizer Unternehmen mit strategischer Begleitung.',
    badge: 'Genf - Lokale Landingpage',
    headlineA: 'Individuelle Webentwicklung in Genf',
    headlineB: 'Webentwicklungsagentur in Genf, die Besucher in Chancen verwandelt',
    heroA: 'Wir helfen Genfer Unternehmen, Prozesse und digitale Akquise mit schnellen, skalierbaren und conversion-orientierten Plattformen zu verbessern.',
    heroB: 'Eine Website oder Plattform hat nur dann Wert, wenn sie Ergebnisse liefert. Wir entwickeln schnelle, glaubwuerdige und conversion-orientierte Erlebnisse fuer Unternehmen in Genf.',
    serviceTitle: 'Die Leistung',
    serviceCopy: 'ATHANA liefert End-to-End-Webloesungen: Discovery, UX, technische Architektur, Entwicklung, technisches SEO und Wartung. Jedes Projekt wird auf Ihre Geschaeftsziele in Genf und der Romandie zugeschnitten.',
    proofTitle: 'Nachweis',
    proofCopy: 'Aktuelles Projekt: VF Froid - kompletter Relaunch einer Corporate-Website mit Premium-Identitaet, optimierter Performance und klarerer Servicestruktur. Ergebnis: mehr Glaubwuerdigkeit und mehr qualifizierte Anfragen.',
    proofCta: 'Referenz ansehen',
    finalTitle: 'Sprechen wir ueber Ihr Projekt in Genf',
    finalCopy: 'Erhalten Sie ein schnelles Scoping, einen klaren Umsetzungsplan und ein realistisches Angebot.',
    finalCta: 'Audit anfragen',
    faq: [
      { q: 'Wie lange dauert ein individuelles Webprojekt in Genf durchschnittlich?', a: 'Je nach Komplexitaet starten Projekte meist zwischen 4 und 10 Wochen inklusive initialer Analysephase.' },
      { q: 'Koennen Sie eine bestehende Website verbessern?', a: 'Ja. Wir auditieren den aktuellen Stand, beheben kritische Punkte und planen danach einen schrittweisen Relaunch.' },
      { q: 'Arbeiten Sie nur mit Unternehmen aus Genf?', a: 'Wir begleiten vor allem Genf und die Romandie, arbeiten aber auch mit Teams in der ganzen Schweiz.' },
    ],
  },
  it: {
    metaTitle: 'Sviluppo Web su Misura a Ginevra | ATHANA',
    metaDescription: 'Agenzia di sviluppo web su misura a Ginevra. ATHANA realizza siti e app performanti per aziende svizzere con supporto strategico.',
    badge: 'Ginevra - Landing Locale',
    headlineA: 'Sviluppo Web su Misura a Ginevra',
    headlineB: 'Agenzia Web a Ginevra che trasforma visitatori in opportunita',
    heroA: 'Aiutiamo le aziende ginevrine a migliorare processi e acquisizione digitale con piattaforme veloci, scalabili e orientate alla conversione.',
    heroB: 'Un sito o una piattaforma ha valore solo se genera risultati. Progettiamo esperienze veloci, credibili e orientate alla conversione per le aziende di Ginevra.',
    serviceTitle: 'Il servizio',
    serviceCopy: 'ATHANA offre soluzioni web end-to-end: discovery, UX, architettura tecnica, sviluppo, SEO tecnico e manutenzione. Ogni progetto e su misura per i tuoi obiettivi business a Ginevra e nella Svizzera romanda.',
    proofTitle: 'Prova',
    proofCopy: 'Progetto recente: VF Froid - redesign completo del sito corporate con identita premium, performance ottimizzata e maggiore chiarezza dei servizi. Risultato: piu credibilita e piu richieste qualificate.',
    proofCta: 'Vedi referenza',
    finalTitle: 'Parliamo del tuo progetto a Ginevra',
    finalCopy: 'Ricevi una valutazione rapida, un piano di esecuzione chiaro e un preventivo realistico.',
    finalCta: 'Richiedi un Audit',
    faq: [
      { q: 'Qual e la tempistica media per un progetto web su misura a Ginevra?', a: 'In base alla complessita, i progetti partono in genere tra 4 e 10 settimane, con una fase iniziale di analisi.' },
      { q: 'Potete migliorare un sito esistente?', a: 'Si. Possiamo auditare la situazione attuale, correggere i punti critici e pianificare un redesign progressivo.' },
      { q: 'Lavorate solo con aziende di Ginevra?', a: 'Supportiamo soprattutto Ginevra e la Svizzera romanda, ma collaboriamo anche con team in tutta la Svizzera.' },
    ],
  },
};

export default function DeveloppementWebGenevePage() {
  const { lang } = useParams();
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const copy = pageCopy[locale];
  const headlineVariant = useMemo(() => {
    if (typeof window === 'undefined') return 'a';
    return new URLSearchParams(window.location.search).get('hl') === 'b' ? 'b' : 'a';
  }, []);
  const headline = headlineVariant === 'b' ? copy.headlineB : copy.headlineA;
  const heroText = headlineVariant === 'b' ? copy.heroB : copy.heroA;

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: copy.faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <div className="bg-athana-black min-h-screen text-athana-text selection:bg-athana-accent selection:text-black">
      <Helmet>
        <title>{copy.metaTitle}</title>
        <meta
          name="description"
          content={copy.metaDescription}
        />
        <link rel="canonical" href={`https://athana.ch${withLocalePath(locale, '/services/developpement-web-sur-mesure-geneve')}`} />
      </Helmet>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-athana-accent/5 blur-[120px] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <Reveal>
            <p className="text-athana-accent uppercase tracking-widest text-xs font-mono mb-4">
              {copy.badge}
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
              {headline}
            </h1>
            <p className="text-lg text-athana-muted max-w-3xl leading-relaxed">
              {heroText}
            </p>
          </Reveal>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-6 pt-8 pb-20 space-y-12">
        <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-display font-bold text-white mb-4">{copy.serviceTitle}</h2>
          <p className="text-athana-muted leading-relaxed">
            {copy.serviceCopy}
          </p>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-display font-bold text-white mb-4">{copy.proofTitle}</h2>
          <p className="text-athana-muted leading-relaxed">
            {copy.proofCopy}
          </p>
          <a
            href="https://vffroid.ch"
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-4 text-athana-accent hover:underline"
          >
            {copy.proofCta}
          </a>
        </section>

        <section className="bg-athana-accent/10 border border-athana-accent/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-display font-bold text-white mb-3">{copy.finalTitle}</h2>
          <p className="text-athana-muted mb-6">
            {copy.finalCopy}
          </p>
          <Link
            to={withLocalePath(locale, '/demarrer')}
            className="inline-flex items-center justify-center px-6 py-3 bg-athana-accent text-black font-bold rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            {copy.finalCta}
          </Link>
        </section>
      </main>
    </div>
  );
}
