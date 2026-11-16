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
    metaTitle: 'Application Web Securisee en Suisse (nFADP) | ATHANA',
    metaDescription: "Conception d'applications web securisees pour entreprises suisses. ATHANA accompagne la conformite nFADP et l'architecture de securite applicative.",
    badge: 'Suisse - Securite & nFADP',
    headlineA: "Conception d'Applications Web Securisees en Suisse",
    headlineB: 'Applications Web Securisees pour Entreprises Suisses (nFADP)',
    heroA: 'Nous construisons des applications robustes avec un niveau de securite adapte aux exigences B2B suisses, y compris les bonnes pratiques de conformite nFADP.',
    heroB: "Nous renforcons la securite applicative des l'architecture, pour proteger vos donnees sensibles et soutenir vos exigences de conformite.",
    serviceTitle: 'Le service',
    serviceCopy: 'Notre approche couvre la securite applicative des la conception: architecture API defensive, gestion des acces, journalisation, chiffrement des flux, segmentation des environnements et recommandations pratiques pour aligner votre stack avec la nFADP.',
    proofTitle: 'Preuve',
    proofCopy: "Reference pertinente: Fridge Telemetry - systeme critique avec alertes en temps reel, tracabilite et fiabilite operationnelle. Ce type d'architecture est directement transposable aux plateformes sensibles (sante, finance, industrie).",
    proofCta: 'Voir la reference technique',
    finalTitle: 'Evaluez votre niveau de securite',
    finalCopy: "Nous analysons vos risques prioritaires et proposons un plan d'action concret.",
    finalCta: 'Demander un Audit',
    faq: [
      { q: 'Que couvre votre approche de securite applicative ?', a: "Nous couvrons l'architecture, les acces, la journalisation, le chiffrement, le monitoring et les bonnes pratiques de deploiement." },
      { q: 'Pouvez-vous accompagner la conformite nFADP ?', a: "Oui. Nous aidons a aligner les choix techniques et les processus avec les exigences de la nFADP." },
      { q: 'Intervenez-vous sur une application deja en production ?', a: "Oui. Nous realisons des audits cibles et proposons une feuille de route d'amelioration progressive." },
    ],
  },
  en: {
    metaTitle: 'Secure Web Application in Switzerland (nFADP) | ATHANA',
    metaDescription: 'Secure web application engineering for Swiss companies. ATHANA supports nFADP compliance and application security architecture.',
    badge: 'Switzerland - Security & nFADP',
    headlineA: 'Secure Web Application Design in Switzerland',
    headlineB: 'Secure Web Applications for Swiss Businesses (nFADP)',
    heroA: 'We build robust applications with a security level aligned with Swiss B2B requirements, including nFADP compliance best practices.',
    heroB: 'We harden application security from architecture level to protect sensitive data and support compliance requirements.',
    serviceTitle: 'The service',
    serviceCopy: 'Our approach covers application security from day one: defensive API architecture, access management, logging, encrypted data flows, environment segmentation, and practical recommendations to align your stack with nFADP.',
    proofTitle: 'Proof',
    proofCopy: 'Relevant reference: Fridge Telemetry - critical system with real-time alerts, traceability, and operational reliability. This architecture approach is directly applicable to sensitive platforms (health, finance, industry).',
    proofCta: 'View technical reference',
    finalTitle: 'Evaluate your current security level',
    finalCopy: 'We analyze your top risks and provide a concrete action plan.',
    finalCta: 'Request an Audit',
    faq: [
      { q: 'What does your application security approach include?', a: 'We cover architecture, access control, logging, encryption, monitoring, and secure deployment best practices.' },
      { q: 'Can you support nFADP compliance?', a: 'Yes. We help align technical decisions and internal processes with nFADP requirements.' },
      { q: 'Can you work on an app that is already in production?', a: 'Yes. We run targeted audits and provide a progressive improvement roadmap.' },
    ],
  },
  de: {
    metaTitle: 'Sichere Webanwendung in der Schweiz (nFADP) | ATHANA',
    metaDescription: 'Entwicklung sicherer Webanwendungen fuer Schweizer Unternehmen. ATHANA begleitet nFADP-Compliance und Sicherheitsarchitektur.',
    badge: 'Schweiz - Sicherheit & nFADP',
    headlineA: 'Entwicklung sicherer Webanwendungen in der Schweiz',
    headlineB: 'Sichere Webanwendungen fuer Schweizer Unternehmen (nFADP)',
    heroA: 'Wir entwickeln robuste Anwendungen mit einem Sicherheitsniveau, das den Schweizer B2B-Anforderungen entspricht - inklusive nFADP-Best-Practices.',
    heroB: 'Wir verankern Anwendungssicherheit bereits in der Architektur, um sensible Daten zu schuetzen und Compliance-Anforderungen zu erfuellen.',
    serviceTitle: 'Die Leistung',
    serviceCopy: 'Unser Ansatz deckt Anwendungssicherheit von Anfang an ab: defensive API-Architektur, Zugriffsmanagement, Protokollierung, verschluesselte Datenfluesse, Umgebungssegmentierung und praxisnahe Empfehlungen zur Ausrichtung auf nFADP.',
    proofTitle: 'Nachweis',
    proofCopy: 'Relevente Referenz: Fridge Telemetry - kritisches System mit Echtzeit-Alerts, Nachvollziehbarkeit und operativer Zuverlaessigkeit. Dieser Architekturansatz ist direkt auf sensible Plattformen uebertragbar (Gesundheit, Finanzen, Industrie).',
    proofCta: 'Technische Referenz ansehen',
    finalTitle: 'Bewerten Sie Ihr aktuelles Sicherheitsniveau',
    finalCopy: 'Wir analysieren Ihre wichtigsten Risiken und liefern einen konkreten Aktionsplan.',
    finalCta: 'Audit anfragen',
    faq: [
      { q: 'Was umfasst Ihr Ansatz fuer Anwendungssicherheit?', a: 'Wir decken Architektur, Zugriffe, Protokollierung, Verschluesselung, Monitoring und sichere Deployment-Best-Practices ab.' },
      { q: 'Koennen Sie bei nFADP-Compliance unterstuetzen?', a: 'Ja. Wir helfen, technische Entscheidungen und Prozesse auf die Anforderungen der nFADP auszurichten.' },
      { q: 'Arbeiten Sie auch mit bereits produktiven Anwendungen?', a: 'Ja. Wir fuehren gezielte Audits durch und liefern eine schrittweise Verbesserungs-Roadmap.' },
    ],
  },
  it: {
    metaTitle: 'Applicazione Web Sicura in Svizzera (nFADP) | ATHANA',
    metaDescription: "Progettazione di applicazioni web sicure per aziende svizzere. ATHANA supporta conformita nFADP e architettura di sicurezza applicativa.",
    badge: 'Svizzera - Sicurezza & nFADP',
    headlineA: 'Progettazione di Applicazioni Web Sicure in Svizzera',
    headlineB: 'Applicazioni Web Sicure per Aziende Svizzere (nFADP)',
    heroA: 'Costruiamo applicazioni robuste con un livello di sicurezza adatto ai requisiti B2B svizzeri, incluse le buone pratiche di conformita nFADP.',
    heroB: "Rafforziamo la sicurezza applicativa fin dall'architettura per proteggere i dati sensibili e sostenere i requisiti di conformita.",
    serviceTitle: 'Il servizio',
    serviceCopy: 'Il nostro approccio copre la sicurezza applicativa fin dalla progettazione: architettura API difensiva, gestione accessi, logging, cifratura dei flussi, segmentazione ambienti e raccomandazioni pratiche per allineare lo stack alla nFADP.',
    proofTitle: 'Prova',
    proofCopy: "Riferimento rilevante: Fridge Telemetry - sistema critico con alert in tempo reale, tracciabilita e affidabilita operativa. Questo approccio architetturale e direttamente applicabile a piattaforme sensibili (sanita, finanza, industria).",
    proofCta: 'Vedi riferimento tecnico',
    finalTitle: 'Valuta il tuo livello di sicurezza',
    finalCopy: "Analizziamo i rischi prioritari e proponiamo un piano d'azione concreto.",
    finalCta: 'Richiedi un Audit',
    faq: [
      { q: 'Cosa include il vostro approccio alla sicurezza applicativa?', a: 'Copriamo architettura, accessi, logging, cifratura, monitoraggio e buone pratiche di deploy sicuro.' },
      { q: 'Potete supportare la conformita nFADP?', a: 'Si. Aiutiamo ad allineare scelte tecniche e processi ai requisiti nFADP.' },
      { q: 'Intervenite anche su applicazioni gia in produzione?', a: 'Si. Eseguiamo audit mirati e forniamo una roadmap di miglioramento progressivo.' },
    ],
  },
};

export default function ApplicationWebSecuriseeGenevePage() {
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
        <link rel="canonical" href={`https://athana.ch${withLocalePath(locale, '/services/application-web-securisee-suisse')}`} />
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
            href="https://github.com/CaikAraujo/Fridge-Telemetry-System"
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
