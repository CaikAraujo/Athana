import type { TFn } from '@/i18n/translate';

/**
 * Campaign landing pages (/offres/<slug>). One entry per ad group; add entries here to create new pages.
 * They are focused, navigation-light and noindex (they duplicate the intent of the main service pages).
 */
export function campaign(slug: string, t: TFn) {
  const map: Record<string, { title: string; lead: string; bullets: string[]; interest: string; cta: { href: string; label: string } }> = {
    'site-internet': { interest: 'website', title: t('Votre site internet professionnel, en ligne en quelques jours'), lead: t('Choisissez un modèle, nous l’adaptons à votre entreprise. Prix fixe, délai annoncé, suivi en ligne.'), bullets: [t('Démonstration visible avant l’achat'), t('Personnalisation à votre marque'), t('Adapté au mobile et au référencement'), t('Paiement sécurisé en ligne')], cta: { href: '/templates', label: t('Voir les modèles et les prix') } },
    'boutique-en-ligne': { interest: 'ecommerce', title: t('Lancez votre boutique en ligne sans complexité'), lead: t('Catalogue, panier, paiement sécurisé et gestion des commandes : une base prête à vendre, à vos couleurs.'), bullets: [t('Tunnel de commande pensé pour le mobile'), t('Paiement par carte et moyens locaux selon votre pays'), t('Codes promo et suivi des commandes'), t('Accompagnement à la mise en ligne')], cta: { href: '/templates?category=e-commerce', label: t('Voir le modèle e-commerce') } },
    'logiciel-crm': { interest: 'software', title: t('Un CRM simple pour suivre vos clients et vos ventes'), lead: t('Contacts, pipeline, tâches et propositions commerciales. Essai gratuit, sans carte bancaire.'), bullets: [t('Prise en main en quelques minutes'), t('Données séparées par entreprise'), t('Export de vos données à tout moment'), t('Résiliable en ligne')], cta: { href: '/software/crm', label: t('Essayer ATHANA CRM') } },
    'logiciel-pointage': { interest: 'software', title: t('Le pointage de vos équipes, simple et fiable'), lead: t('Entrées, sorties, pauses, absences et rapports pour la paie. Sur ordinateur et sur mobile.'), bullets: [t('Horodatage par le serveur'), t('Heures supplémentaires calculées automatiquement'), t('Exports CSV et PDF'), t('Essai gratuit, sans carte bancaire')], cta: { href: '/software/pointage', label: t('Essayer ATHANA Pointage') } },
  };
  return map[slug] ?? null;
}
export const CAMPAIGN_SLUGS = ['site-internet', 'boutique-en-ligne', 'logiciel-crm', 'logiciel-pointage'];
