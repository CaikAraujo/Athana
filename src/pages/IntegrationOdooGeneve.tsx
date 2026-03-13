import { Helmet } from 'react-helmet-async';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../../components/ui/Section';

export default function IntegrationOdooGenevePage() {
  const headlineVariant = useMemo(() => {
    if (typeof window === 'undefined') return 'a';
    return new URLSearchParams(window.location.search).get('hl') === 'b' ? 'b' : 'a';
  }, []);

  const headline =
    headlineVariant === 'b'
      ? "Intégration Odoo à Genève pour éliminer les frictions entre vos équipes"
      : "Intégration Odoo & Systèmes ERP à Genève";

  const heroText =
    headlineVariant === 'b'
      ? 'Nous relions ERP, CRM et outils métier pour réduire les erreurs, accélérer les cycles et améliorer la visibilité opérationnelle.'
      : 'Nous connectons vos outils critiques (ERP, CRM, portail client, facturation) pour supprimer les doubles saisies et accélérer vos opérations.';

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: "Quels systèmes peuvent être connectés à Odoo ?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nous intégrons Odoo avec CRM, outils de facturation, plateformes e-commerce, portails clients et APIs métier.'
        }
      },
      {
        '@type': 'Question',
        name: "Combien de temps prend une intégration ERP ?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "La durée dépend du nombre de flux et de règles métiers. Un cadrage initial permet d'estimer précisément les étapes."
        }
      },
      {
        '@type': 'Question',
        name: 'Proposez-vous aussi un audit avant implémentation ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Oui. Nous démarrons généralement par un audit d'architecture et de données pour sécuriser l'implémentation."
        }
      }
    ]
  };

  return (
    <div className="bg-athana-black min-h-screen text-athana-text selection:bg-athana-accent selection:text-black">
      <Helmet>
        <title>Intégration Odoo & ERP à Genève | ATHANA</title>
        <meta
          name="description"
          content="Partenaire technique pour intégration Odoo et ERP à Genève. ATHANA connecte CRM, ERP, facturation et outils métier avec une architecture fiable."
        />
        <link rel="canonical" href="https://athana.ch/services/integration-odoo-erp-geneve" />
      </Helmet>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-athana-accent/5 blur-[120px] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <Reveal>
            <p className="text-athana-accent uppercase tracking-widest text-xs font-mono mb-4">
              Genève - ERP / Odoo
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
            Nous définissons une architecture d'intégration robuste entre Odoo/SAP et vos applications métier:
            API sécurisées, synchronisation des données, workflows automatisés, monitoring et évolutivité.
            Objectif: une vue unifiée de votre activité et un gain de productivité concret.
          </p>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-display font-bold text-white mb-4">Preuve</h2>
          <p className="text-athana-muted leading-relaxed">
            Référence technique: <span className="text-white font-semibold">Scheduler API</span> - backend
            transactionnel sécurisé conçu pour des flux critiques. Cette expertise s'applique directement aux
            scénarios d'intégration ERP/CRM où fiabilité et cohérence des données sont essentielles.
          </p>
          <a
            href="https://github.com/CaikAraujo/Scheduler-API"
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-4 text-athana-accent hover:underline"
          >
            Voir la référence technique
          </a>
        </section>

        <section className="bg-athana-accent/10 border border-athana-accent/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-display font-bold text-white mb-3">Besoin d'une architecture claire?</h2>
          <p className="text-athana-muted mb-6">
            Recevez un audit d'intégration avec priorités, risques et feuille de route.
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
