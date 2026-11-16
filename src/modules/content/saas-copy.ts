import type { TFn } from '@/i18n/translate';

/** Feature copy of the SaaS product pages (French source strings). */
export function saasCopy(key: string, t: TFn) {
  if (key === 'crm') return {
    metaTitle: t('Logiciel CRM pour PME — ATHANA CRM'), metaDescription: t('ATHANA CRM : contacts, entreprises, pipeline de vente, tâches et propositions commerciales. Logiciel CRM simple pour PME, en abonnement avec essai gratuit.'),
    features: [
      [t('Contacts et entreprises'), t('Toutes vos relations au même endroit, avec recherche et filtres.')], [t('Pipeline de vente'), t('Visualisez vos opportunités par étape et suivez vos prévisions.')],
      [t('Tâches et calendrier'), t('Relances, rendez-vous et échéances pour ne rien oublier.')], [t('Historique des échanges'), t('Notes, appels, e-mails et réunions rattachés à chaque contact.')],
      [t('Propositions commerciales'), t('Créez vos offres avec lignes, totaux et suivi du statut.')], [t('Rapports et export'), t('Tableau de bord, indicateurs de vente et export CSV.')],
    ] as [string, string][],
  };
  if (key === 'pointage') return {
    metaTitle: t('Logiciel de pointage et gestion des horaires — ATHANA Pointage'), metaDescription: t('ATHANA Pointage : logiciel de pointage en ligne pour PME. Entrées, sorties, pauses, heures supplémentaires, absences et rapports exportables.'),
    features: [
      [t('Pointage web et mobile'), t('Entrée, sortie et pauses en un geste, horodatées par le serveur.')], [t('Heures et heures supplémentaires'), t('Calcul automatique par jour et par semaine selon l’horaire prévu.')],
      [t('Absences et vacances'), t('Demandes, validation par le responsable et solde de vacances.')], [t('Équipes et départements'), t('Chaque responsable suit son équipe ; chaque employé voit ses propres données.')],
      [t('Rapports et exports'), t('Rapports par période, export CSV et PDF pour la paie.')], [t('Traçabilité'), t('Les corrections sont motivées et conservées dans un journal d’audit.')],
    ] as [string, string][],
    note: t('La géolocalisation et la biométrie ne sont pas activées : leur usage dépend de la législation de chaque pays. Les paramètres par pays sont indicatifs et doivent être validés avec un professionnel du droit du travail.'),
  };
  return null;
}
