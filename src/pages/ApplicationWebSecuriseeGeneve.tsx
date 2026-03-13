import { Helmet } from 'react-helmet-async';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../../components/ui/Section';

export default function ApplicationWebSecuriseeGenevePage() {
  const headlineVariant = useMemo(() => {
    if (typeof window === 'undefined') return 'a';
    return new URLSearchParams(window.location.search).get('hl') === 'b' ? 'b' : 'a';
  }, []);

  const headline =
    headlineVariant === 'b'
      ? "Applications Web Sécurisées pour Entreprises Suisses (nFADP)"
      : "Conception d'Applications Web Sécurisées en Suisse";

  const heroText =
    headlineVariant === 'b'
      ? "Nous renforçons la sécurité applicative dès l'architecture, pour protéger vos données sensibles et soutenir vos exigences de conformité."
      : "Nous construisons des applications robustes avec un niveau de sécurité adapté aux exigences B2B suisses, y compris les bonnes pratiques de conformité nFADP.";

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Que couvre votre approche de sécurité applicative ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Nous couvrons l'architecture, les accès, la journalisation, le chiffrement, le monitoring et les bonnes pratiques de déploiement."
        }
      },
      {
        '@type': 'Question',
        name: 'Pouvez-vous accompagner la conformité nFADP ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Oui. Nous aidons à aligner les choix techniques et les processus avec les exigences de la nFADP."
        }
      },
      {
        '@type': 'Question',
        name: 'Intervenez-vous sur une application déjà en production ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Oui. Nous réalisons des audits ciblés et proposons une feuille de route d'amélioration progressive."
        }
      }
    ]
  };

  return (
    <div className="bg-athana-black min-h-screen text-athana-text selection:bg-athana-accent selection:text-black">
      <Helmet>
        <title>Application Web Sécurisée en Suisse (nFADP) | ATHANA</title>
        <meta
          name="description"
          content="Conception d'applications web sécurisées pour entreprises suisses. ATHANA accompagne la conformité nFADP et l'architecture de sécurité applicative."
        />
        <link rel="canonical" href="https://athana.ch/services/application-web-securisee-suisse" />
      </Helmet>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-athana-accent/5 blur-[120px] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <Reveal>
            <p className="text-athana-accent uppercase tracking-widest text-xs font-mono mb-4">
              Suisse - Sécurité & nFADP
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
          <h2 className="text-2xl font-display font-bold text-white mb-4">Le service</h2>
          <p className="text-athana-muted leading-relaxed">
            Notre approche couvre la sécurité applicative dès la conception: architecture API défensive,
            gestion des accès, journalisation, chiffrement des flux, segmentation des environnements et
            recommandations pratiques pour aligner votre stack avec la nFADP.
          </p>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-display font-bold text-white mb-4">Preuve</h2>
          <p className="text-athana-muted leading-relaxed">
            Référence pertinente: <span className="text-white font-semibold">Fridge Telemetry</span> -
            système critique avec alertes en temps réel, traçabilité et fiabilité opérationnelle. Ce type
            d'architecture est directement transposable aux plateformes sensibles (santé, finance, industrie).
          </p>
          <a
            href="https://github.com/CaikAraujo/Fridge-Telemetry-System"
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-4 text-athana-accent hover:underline"
          >
            Voir la référence technique
          </a>
        </section>

        <section className="bg-athana-accent/10 border border-athana-accent/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-display font-bold text-white mb-3">Évaluez votre niveau de sécurité</h2>
          <p className="text-athana-muted mb-6">
            Nous analysons vos risques prioritaires et proposons un plan d'action concret.
          </p>
          <Link
            to="/demarrer"
            className="inline-flex items-center justify-center px-6 py-3 bg-athana-accent text-black font-bold rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            Demander un Audit
          </Link>
        </section>
      </main>
    </div>
  );
}
