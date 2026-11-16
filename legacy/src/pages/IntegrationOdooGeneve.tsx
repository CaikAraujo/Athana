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
    metaTitle: 'Integration Odoo & ERP a Geneve | ATHANA',
    metaDescription: 'Partenaire technique pour integration Odoo et ERP a Geneve. ATHANA connecte CRM, ERP, facturation et outils metier avec une architecture fiable.',
    badge: 'Geneve - ERP / Odoo',
    headlineA: 'Integration Odoo & Systemes ERP a Geneve',
    headlineB: 'Integration Odoo a Geneve pour eliminer les frictions entre vos equipes',
    heroA: 'Nous connectons vos outils critiques (ERP, CRM, portail client, facturation) pour supprimer les doubles saisies et accelerer vos operations.',
    heroB: 'Nous relions ERP, CRM et outils metier pour reduire les erreurs, accelerer les cycles et ameliorer la visibilite operationnelle.',
    serviceTitle: 'Le service',
    serviceCopy: "Nous definissons une architecture d'integration robuste entre Odoo/SAP et vos applications metier: API securisees, synchronisation des donnees, workflows automatises, monitoring et evolutivite. Objectif: une vue unifiee de votre activite et un gain de productivite concret.",
    proofTitle: 'Preuve',
    proofCopy: "Reference technique: Scheduler API - backend transactionnel securise concu pour des flux critiques. Cette expertise s'applique directement aux scenarios d'integration ERP/CRM ou fiabilite et coherence des donnees sont essentielles.",
    proofCta: 'Voir la reference technique',
    finalTitle: "Besoin d'une architecture claire?",
    finalCopy: "Recevez un audit d'integration avec priorites, risques et feuille de route.",
    finalCta: 'Demander un Audit',
    faq: [
      { q: 'Quels systemes peuvent etre connectes a Odoo ?', a: 'Nous integrons Odoo avec CRM, outils de facturation, plateformes e-commerce, portails clients et APIs metier.' },
      { q: 'Combien de temps prend une integration ERP ?', a: "La duree depend du nombre de flux et de regles metier. Un cadrage initial permet d'estimer precisement les etapes." },
      { q: 'Proposez-vous aussi un audit avant implementation ?', a: "Oui. Nous demarrons generalement par un audit d'architecture et de donnees pour securiser l'implementation." },
    ],
  },
  en: {
    metaTitle: 'Odoo & ERP Integration in Geneva | ATHANA',
    metaDescription: 'Technical partner for Odoo and ERP integration in Geneva. ATHANA connects CRM, ERP, billing, and business tools with reliable architecture.',
    badge: 'Geneva - ERP / Odoo',
    headlineA: 'Odoo & ERP Integration in Geneva',
    headlineB: 'Odoo Integration in Geneva to remove friction between your teams',
    heroA: 'We connect your critical tools (ERP, CRM, client portal, billing) to remove duplicate entries and accelerate operations.',
    heroB: 'We connect ERP, CRM, and business tools to reduce errors, speed up cycles, and improve operational visibility.',
    serviceTitle: 'The service',
    serviceCopy: 'We define a robust integration architecture between Odoo/SAP and your business apps: secure APIs, data synchronization, automated workflows, monitoring, and scalability. Goal: a unified business view and measurable productivity gain.',
    proofTitle: 'Proof',
    proofCopy: 'Technical reference: Scheduler API - secure transactional backend designed for critical flows. This expertise applies directly to ERP/CRM integration scenarios where reliability and data consistency are essential.',
    proofCta: 'View technical reference',
    finalTitle: 'Need a clear architecture?',
    finalCopy: 'Get an integration audit with priorities, risks, and roadmap.',
    finalCta: 'Request an Audit',
    faq: [
      { q: 'Which systems can be connected to Odoo?', a: 'We integrate Odoo with CRM, billing tools, e-commerce platforms, client portals, and business APIs.' },
      { q: 'How long does an ERP integration take?', a: 'Duration depends on the number of flows and business rules. An initial discovery phase provides a precise estimate.' },
      { q: 'Do you offer an audit before implementation?', a: 'Yes. We usually start with an architecture and data audit to secure implementation.' },
    ],
  },
  de: {
    metaTitle: 'Odoo- & ERP-Integration in Genf | ATHANA',
    metaDescription: 'Technischer Partner fuer Odoo- und ERP-Integration in Genf. ATHANA verbindet CRM, ERP, Abrechnung und Business-Tools mit zuverlaessiger Architektur.',
    badge: 'Genf - ERP / Odoo',
    headlineA: 'Odoo- & ERP-Integration in Genf',
    headlineB: 'Odoo-Integration in Genf, um Reibung zwischen Teams zu entfernen',
    heroA: 'Wir verbinden Ihre kritischen Tools (ERP, CRM, Kundenportal, Abrechnung), um doppelte Eingaben zu vermeiden und Prozesse zu beschleunigen.',
    heroB: 'Wir verbinden ERP, CRM und Business-Tools, um Fehler zu reduzieren, Zyklen zu beschleunigen und operative Transparenz zu verbessern.',
    serviceTitle: 'Die Leistung',
    serviceCopy: 'Wir definieren eine robuste Integrationsarchitektur zwischen Odoo/SAP und Ihren Business-Anwendungen: sichere APIs, Datensynchronisierung, automatisierte Workflows, Monitoring und Skalierbarkeit. Ziel: ein einheitlicher Blick auf Ihr Unternehmen und messbare Produktivitaetsgewinne.',
    proofTitle: 'Nachweis',
    proofCopy: 'Technische Referenz: Scheduler API - sicherer transaktionaler Backend-Stack fuer kritische Datenfluesse. Diese Expertise ist direkt auf ERP/CRM-Integrationsszenarien uebertragbar, in denen Zuverlaessigkeit und Datenkonsistenz entscheidend sind.',
    proofCta: 'Technische Referenz ansehen',
    finalTitle: 'Brauchen Sie eine klare Architektur?',
    finalCopy: 'Erhalten Sie ein Integrationsaudit mit Prioritaeten, Risiken und Roadmap.',
    finalCta: 'Audit anfragen',
    faq: [
      { q: 'Welche Systeme koennen mit Odoo verbunden werden?', a: 'Wir integrieren Odoo mit CRM, Abrechnungstools, E-Commerce-Plattformen, Kundenportalen und Business-APIs.' },
      { q: 'Wie lange dauert eine ERP-Integration?', a: 'Die Dauer haengt von Anzahl der Datenfluesse und Geschaeftsregeln ab. Eine initiale Analyse liefert eine praezise Einschaetzung.' },
      { q: 'Bieten Sie vor der Umsetzung auch ein Audit an?', a: 'Ja. Wir starten in der Regel mit einem Architektur- und Datenaudit, um die Umsetzung abzusichern.' },
    ],
  },
  it: {
    metaTitle: 'Integrazione Odoo & ERP a Ginevra | ATHANA',
    metaDescription: 'Partner tecnico per integrazione Odoo ed ERP a Ginevra. ATHANA collega CRM, ERP, fatturazione e strumenti business con architettura affidabile.',
    badge: 'Ginevra - ERP / Odoo',
    headlineA: 'Integrazione Odoo & ERP a Ginevra',
    headlineB: 'Integrazione Odoo a Ginevra per eliminare le frizioni tra i team',
    heroA: 'Colleghiamo i tuoi strumenti critici (ERP, CRM, portale clienti, fatturazione) per eliminare doppie registrazioni e accelerare le operazioni.',
    heroB: 'Connettiamo ERP, CRM e strumenti business per ridurre errori, velocizzare i cicli e migliorare la visibilita operativa.',
    serviceTitle: 'Il servizio',
    serviceCopy: "Definiamo un'architettura di integrazione robusta tra Odoo/SAP e le tue applicazioni business: API sicure, sincronizzazione dati, workflow automatizzati, monitoraggio e scalabilita. Obiettivo: visione unificata dell'attivita e produttivita misurabile.",
    proofTitle: 'Prova',
    proofCopy: "Riferimento tecnico: Scheduler API - backend transazionale sicuro progettato per flussi critici. Questa esperienza si applica direttamente agli scenari di integrazione ERP/CRM in cui affidabilita e coerenza dei dati sono essenziali.",
    proofCta: 'Vedi riferimento tecnico',
    finalTitle: "Ti serve un'architettura chiara?",
    finalCopy: 'Ricevi un audit di integrazione con priorita, rischi e roadmap.',
    finalCta: 'Richiedi un Audit',
    faq: [
      { q: 'Quali sistemi possono essere collegati a Odoo?', a: 'Integriamo Odoo con CRM, strumenti di fatturazione, piattaforme e-commerce, portali clienti e API business.' },
      { q: "Quanto tempo richiede un'integrazione ERP?", a: 'La durata dipende dal numero di flussi e regole business. Una fase iniziale di analisi permette una stima precisa.' },
      { q: "Offrite un audit prima dell'implementazione?", a: "Si. Di norma iniziamo con un audit di architettura e dati per mettere in sicurezza l'implementazione." },
    ],
  },
};

export default function IntegrationOdooGenevePage() {
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
        <link rel="canonical" href={`https://athana.ch${withLocalePath(locale, '/services/integration-odoo-erp-geneve')}`} />
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
            href="https://github.com/CaikAraujo/Scheduler-API"
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
