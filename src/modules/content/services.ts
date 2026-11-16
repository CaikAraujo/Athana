import type { TFn } from '@/i18n/translate';
import type { ServiceContent } from '@/components/site/ServicePage';

/** Commercial copy of the service pages. French source strings; translations live in the dictionaries. */
export function serviceContent(key: 'websites' | 'ecommerce' | 'automation' | 'custom', t: TFn): ServiceContent & { metaTitle: string; metaDescription: string } {
  const process: [string, string][] = [
    [t('Échange'), t('Nous clarifions votre besoin, vos contraintes et vos priorités.')],
    [t('Proposition'), t('Vous recevez un périmètre, un budget et un calendrier écrits.')],
    [t('Réalisation'), t('Développement par étapes, avec des points de validation réguliers.')],
    [t('Mise en ligne'), t('Déploiement, formation et accompagnement après le lancement.')],
  ];
  switch (key) {
    case 'websites': return {
      path: '/websites', eyebrow: t('Sites web'), serviceType: 'Website creation', interest: 'website',
      metaTitle: t('Création de site internet professionnel — Suisse, France, Portugal, Brésil'),
      metaDescription: t('Création de site internet pour PME et indépendants : site vitrine, institutionnel ou sur mesure. Modèles personnalisés dès quelques jours, prix clair.'),
      title: t('Création de sites internet professionnels'), lead: t('Un site rapide, clair et adapté au mobile, qui présente votre activité et transforme vos visiteurs en clients. À partir d’un modèle personnalisé ou entièrement sur mesure.'),
      primary: { href: '/templates', label: t('Voir les modèles') }, secondary: { href: '#contact', label: t('Demander un devis') },
      featuresTitle: t('Ce que votre site fait pour vous'),
      features: [
        { title: t('Site vitrine'), text: t('Présentez vos services, vos réalisations et vos coordonnées sur un site soigné.') },
        { title: t('Landing page'), text: t('Une page unique conçue pour convertir le trafic de vos campagnes.') },
        { title: t('Site d’entreprise'), text: t('Plusieurs pages, plusieurs langues, un blog et des formulaires adaptés.') },
        { title: t('Adapté au mobile'), text: t('Chaque page est pensée d’abord pour le téléphone, puis pour l’ordinateur.') },
        { title: t('Référencement'), text: t('Structure technique propre, balises, données structurées et temps de chargement maîtrisé.') },
        { title: t('Réservations et demandes'), text: t('Formulaires de contact, de devis ou de réservation reliés à votre boîte e-mail.') },
      ],
      includedTitle: t('Inclus dans chaque projet'), included: [t('Personnalisation à votre identité (logo, couleurs, polices)'), t('Intégration de vos textes et de vos images'), t('Version mobile, tablette et ordinateur'), t('Formulaire de contact protégé contre le spam'), t('Bandeau cookies et pages légales à compléter'), t('Suivi du projet dans votre espace client')],
      stepsTitle: t('Comment se déroule un projet'), steps: process, formTitle: t('Parlez-nous de votre site'),
    };
    case 'ecommerce': return {
      path: '/ecommerce', eyebrow: t('E-commerce'), serviceType: 'E-commerce development', interest: 'ecommerce',
      metaTitle: t('Création de boutique en ligne — e-commerce clé en main'),
      metaDescription: t('Création de boutique en ligne : catalogue, panier, paiement sécurisé et gestion des commandes. Une base prête à vendre, adaptée à votre marque.'),
      title: t('Création de boutiques en ligne'), lead: t('Vendez vos produits en ligne avec une boutique rapide, simple à gérer et connectée à votre prestataire de paiement.'),
      primary: { href: '/templates?category=e-commerce', label: t('Voir le modèle e-commerce') }, secondary: { href: '#contact', label: t('Demander un devis') },
      featuresTitle: t('Tout ce qu’il faut pour vendre'),
      features: [
        { title: t('Catalogue'), text: t('Catégories, filtres, variantes et fiches produits détaillées.') },
        { title: t('Panier et commande'), text: t('Un tunnel de commande court, pensé pour le mobile.') },
        { title: t('Paiement sécurisé'), text: t('Paiement sur une page hébergée par le prestataire : aucune donnée de carte ne transite par votre site.') },
        { title: t('Gestion des commandes'), text: t('Suivi des commandes, des statuts et des clients depuis une interface d’administration.') },
        { title: t('Codes promo'), text: t('Coupons en pourcentage ou en montant, avec dates de validité.') },
        { title: t('Plusieurs pays'), text: t('Langues, devises et taxes configurables par marché.') },
      ],
      includedTitle: t('À prévoir de votre côté'), included: [t('Un compte chez un prestataire de paiement (nous vous guidons)'), t('Vos produits : photos, descriptions, prix et stocks'), t('Vos conditions de vente, de livraison et de retour'), t('Votre politique de TVA selon les pays de vente')],
      stepsTitle: t('Comment se déroule un projet'), steps: process, formTitle: t('Parlez-nous de votre boutique'),
    };
    case 'automation': return {
      path: '/automation', eyebrow: 'ATHANA Automation', serviceType: 'Business process automation', interest: 'automation',
      metaTitle: t('Automatisation des processus, intégrations API et IA pour PME'),
      metaDescription: t('Automatisez les tâches répétitives : intégrations entre vos outils, API, flux de données et assistants IA adaptés à votre entreprise.'),
      title: t('Automatisations, intégrations et intelligence artificielle'), lead: t('Reliez vos outils entre eux et supprimez les tâches répétitives : moins de ressaisies, moins d’erreurs, plus de temps pour vos clients.'),
      primary: { href: '/quote', label: t('Décrire mon besoin') },
      featuresTitle: t('Ce que nous automatisons'),
      features: [
        { title: t('Intégrations API'), text: t('Synchronisation entre votre site, votre CRM, votre ERP, votre comptabilité ou votre outil de facturation.') },
        { title: t('Flux de travail'), text: t('Création automatique de tâches, de documents, de relances et de notifications.') },
        { title: t('Intelligence artificielle'), text: t('Assistants qui classent des demandes, résument des documents ou préparent des réponses, sous votre contrôle.') },
        { title: t('Formulaires et données'), text: t('Collecte, validation et transfert des données sans ressaisie.') },
        { title: t('Rapports'), text: t('Tableaux de bord et exports envoyés automatiquement aux bonnes personnes.') },
        { title: t('ERP et outils métier'), text: t('Connexion et adaptation d’outils existants, par exemple Odoo.') },
      ],
      includedTitle: t('Notre façon de travailler'), included: [t('Nous partons d’un processus réel et mesurons le temps gagné'), t('Vos données restent chez vous : accès limités au strict nécessaire'), t('Chaque automatisation est documentée et peut être désactivée'), t('Aucune donnée personnelle n’est envoyée à un service d’IA sans accord explicite')],
      stepsTitle: t('Comment se déroule un projet'), steps: process, formTitle: t('Quel processus voulez-vous automatiser ?'),
    };
    default: return {
      path: '/custom', eyebrow: 'ATHANA Custom', serviceType: 'Custom software development', interest: 'custom',
      metaTitle: t('Développement d’applications web et de logiciels sur mesure'),
      metaDescription: t('Développement d’application web sur mesure : plateformes, espaces clients, outils internes et intégrations spécifiques, conçus pour vos processus.'),
      title: t('Applications et logiciels sur mesure'), lead: t('Quand aucun outil du marché ne correspond à votre façon de travailler, nous le construisons : plateforme web, espace client, outil interne ou application métier.'),
      primary: { href: '/quote', label: t('Demander un devis') }, secondary: { href: '/work', label: t('Voir nos réalisations') },
      featuresTitle: t('Ce que nous développons'),
      features: [
        { title: t('Plateformes web'), text: t('Applications accessibles depuis un navigateur, avec comptes utilisateurs et rôles.') },
        { title: t('Espaces clients'), text: t('Suivi de dossiers, documents, messagerie et paiements en ligne.') },
        { title: t('Outils internes'), text: t('Planification, suivi d’interventions, gestion de stock, tableaux de bord.') },
        { title: t('Logiciels en abonnement'), text: t('Architecture multi-entreprises, plans, facturation récurrente.') },
        { title: t('Intégrations spécifiques'), text: t('Connexion à vos systèmes existants et à des services tiers.') },
        { title: t('Reprise de projets'), text: t('Audit, sécurisation et évolution d’une application existante.') },
      ],
      includedTitle: t('Nos engagements techniques'), included: [t('Technologies éprouvées : TypeScript, React, Next.js, PostgreSQL'), t('Contrôles d’accès vérifiés côté serveur'), t('Tests automatisés sur les parcours essentiels'), t('Code documenté et remis au client'), t('Environnements de test et de production séparés'), t('Sauvegardes et procédure de retour arrière')],
      stepsTitle: t('Comment se déroule un projet'), steps: process, formTitle: t('Décrivez votre projet'),
    };
  }
}
