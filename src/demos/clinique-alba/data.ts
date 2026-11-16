export type Practitioner = { name: string; role: string; specialty: string; initials: string; tone: string; days: string; langs: string; focus: string };

export const specialties = [
  { key: 'Médecine générale', text: 'Suivi au long cours, bilans de santé, vaccinations et prise en charge des affections courantes pour toute la famille.', examples: ['Bilan de santé', 'Vaccinations', 'Suivi des maladies chroniques'] },
  { key: 'Pédiatrie', text: 'Du nourrisson à l’adolescent : contrôles de développement, conseils aux parents et consultations sans rendez-vous le matin.', examples: ['Contrôles de croissance', 'Vaccins de l’enfant', 'Conseils en allaitement'] },
  { key: 'Cardiologie', text: 'Dépistage et suivi des maladies cardiovasculaires, avec examens réalisés sur place.', examples: ['Électrocardiogramme', 'Échographie cardiaque', 'Test d’effort'] },
  { key: 'Dermatologie', text: 'Examen de la peau, des cheveux et des ongles, dépistage des lésions et petite chirurgie cutanée.', examples: ['Contrôle des grains de beauté', 'Acné et eczéma', 'Petite chirurgie'] },
  { key: 'Gynécologie', text: 'Suivi gynécologique à tous les âges de la vie, contraception et accompagnement de la grossesse.', examples: ['Contrôle annuel', 'Suivi de grossesse', 'Contraception'] },
  { key: 'Physiothérapie', text: 'Rééducation après blessure ou opération, traitement des douleurs et programmes d’exercices personnalisés.', examples: ['Rééducation post-opératoire', 'Douleurs dorsales', 'Physiothérapie du sport'] },
] as const;

export const team: Practitioner[] = [
  { name: 'Dre Léa Exemple', role: 'Médecin généraliste', specialty: 'Médecine générale', initials: 'LE', tone: '#0c7c78', days: 'Lundi au jeudi', langs: 'Français, allemand', focus: 'Médecine de famille et prévention' },
  { name: 'Dr Marc Modèle', role: 'Médecin généraliste', specialty: 'Médecine générale', initials: 'MM', tone: '#1f6f9c', days: 'Mardi au vendredi', langs: 'Français, anglais', focus: 'Suivi des maladies chroniques' },
  { name: 'Dre Inès Fictive', role: 'Pédiatre', specialty: 'Pédiatrie', initials: 'IF', tone: '#c2674a', days: 'Lundi, mercredi, vendredi', langs: 'Français, italien', focus: 'Nourrissons et petite enfance' },
  { name: 'Dr Paul Spécimen', role: 'Cardiologue', specialty: 'Cardiologie', initials: 'PS', tone: '#12344d', days: 'Mardi et jeudi', langs: 'Français, anglais', focus: 'Prévention cardiovasculaire' },
  { name: 'Dre Nora Démo', role: 'Dermatologue', specialty: 'Dermatologie', initials: 'ND', tone: '#7a5aa6', days: 'Lundi et jeudi', langs: 'Français, espagnol', focus: 'Dépistage et dermatologie pédiatrique' },
  { name: 'Dre Clara Essai', role: 'Gynécologue', specialty: 'Gynécologie', initials: 'CE', tone: '#b0527a', days: 'Mercredi au vendredi', langs: 'Français, portugais', focus: 'Suivi de grossesse' },
  { name: 'Hugo Prototype', role: 'Physiothérapeute', specialty: 'Physiothérapie', initials: 'HP', tone: '#3d7d4f', days: 'Lundi au vendredi', langs: 'Français, allemand', focus: 'Rééducation et sport' },
  { name: 'Maya Gabarit', role: 'Physiothérapeute', specialty: 'Physiothérapie', initials: 'MG', tone: '#0c7c78', days: 'Lundi, mardi, jeudi', langs: 'Français, anglais', focus: 'Douleurs chroniques et posture' },
];
