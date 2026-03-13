import { Helmet } from 'react-helmet-async';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Reveal } from '../../components/ui/Section';

export default function DeveloppementWebGenevePage() {
  const headlineVariant = useMemo(() => {
    if (typeof window === 'undefined') return 'a';
    return new URLSearchParams(window.location.search).get('hl') === 'b' ? 'b' : 'a';
  }, []);

  const headline =
    headlineVariant === 'b'
      ? "Agence de Développement Web à Genève qui transforme vos visiteurs en opportunités"
      : 'Développement Web sur Mesure à Genève';

  const heroText =
    headlineVariant === 'b'
      ? "Un site ou une plateforme n'a de valeur que s'il génère des résultats. Nous concevons des expériences rapides, crédibles et orientées conversion pour les entreprises genevoises."
      : 'Nous aidons les entreprises genevoises à transformer leurs processus et leur acquisition digitale avec des plateformes web rapides, évolutives et orientées conversion.';

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Quel est le délai moyen pour un projet web sur mesure à Genève ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Selon la complexité, un projet démarre souvent entre 4 et 10 semaines, avec une phase de cadrage initiale.'
        }
      },
      {
        '@type': 'Question',
        name: "Pouvez-vous reprendre un site existant et l'améliorer ?",
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Oui. Nous pouvons auditer l'existant, corriger les points critiques, puis planifier une refonte progressive."
        }
      },
      {
        '@type': 'Question',
        name: 'Travaillez-vous uniquement avec des entreprises basées à Genève ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nous accompagnons principalement Genève et la Suisse romande, mais nous travaillons aussi avec des équipes dans toute la Suisse.'
        }
      }
    ]
  };

  return (
    <div className="bg-athana-black min-h-screen text-athana-text selection:bg-athana-accent selection:text-black">
      <Helmet>
        <title>Développement Web sur Mesure à Genève | ATHANA</title>
        <meta
          name="description"
          content="Agence de développement web sur mesure à Genève. ATHANA conçoit des sites et applications performants pour PME et entreprises suisses avec accompagnement stratégique."
        />
        <link rel="canonical" href="https://athana.ch/services/developpement-web-sur-mesure-geneve" />
      </Helmet>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="pt-40 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-athana-accent/5 blur-[120px] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <Reveal>
            <p className="text-athana-accent uppercase tracking-widest text-xs font-mono mb-4">
              Genève - Landing Locale
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
            ATHANA conçoit des solutions web de bout en bout: cadrage, UX, architecture technique,
            développement, SEO technique et maintenance. Chaque projet est conçu sur mesure pour vos objectifs
            business à Genève et en Suisse romande.
          </p>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-display font-bold text-white mb-4">Preuve</h2>
          <p className="text-athana-muted leading-relaxed">
            Projet récent: <span className="text-white font-semibold">VF Froid</span> - refonte complète d'un
            site corporate avec identité premium, performance optimisée et meilleure lisibilité des services.
            Résultat: une présentation plus crédible pour transformer des visiteurs en demandes qualifiées.
          </p>
          <a
            href="https://vffroid.ch"
            target="_blank"
            rel="noreferrer"
            className="inline-block mt-4 text-athana-accent hover:underline"
          >
            Voir la référence
          </a>
        </section>

        <section className="bg-athana-accent/10 border border-athana-accent/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-display font-bold text-white mb-3">Parlons de votre projet à Genève</h2>
          <p className="text-athana-muted mb-6">
            Obtenez un cadrage rapide, un plan d'exécution clair et un devis réaliste.
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
