export type Soin = { cat: string; name: string; min: number; price: number; desc: string };

export const categories = ['Visage', 'Massages', 'Mains & pieds', 'Rituels'] as const;

export const soins: Soin[] = [
  { cat: 'Visage', name: 'Soin Éclat signature', min: 60, price: 135, desc: 'Nettoyage en profondeur, gommage doux, massage sculptant et masque sur mesure.' },
  { cat: 'Visage', name: 'Soin hydratation intense', min: 45, price: 105, desc: 'Un bain d’hydratation pour les peaux tiraillées et fatiguées.' },
  { cat: 'Visage', name: 'Soin pureté', min: 50, price: 115, desc: 'Vapeur, extraction délicate et masque rééquilibrant à l’argile.' },
  { cat: 'Visage', name: 'Coup d’éclat express', min: 30, price: 75, desc: 'L’essentiel en trente minutes, idéal avant une soirée.' },
  { cat: 'Massages', name: 'Massage relaxant aux huiles chaudes', min: 60, price: 130, desc: 'Manœuvres lentes et enveloppantes pour relâcher les tensions.' },
  { cat: 'Massages', name: 'Massage du dos et de la nuque', min: 30, price: 75, desc: 'Ciblé sur les zones qui encaissent les longues journées.' },
  { cat: 'Massages', name: 'Massage aux pierres chaudes', min: 75, price: 160, desc: 'La chaleur des pierres de basalte prolonge la détente musculaire.' },
  { cat: 'Massages', name: 'Massage prénatal', min: 60, price: 135, desc: 'Un moment de douceur adapté dès le quatrième mois de grossesse.' },
  { cat: 'Mains & pieds', name: 'Manucure soin complet', min: 45, price: 65, desc: 'Limage, cuticules, gommage, massage et pose de vernis.' },
  { cat: 'Mains & pieds', name: 'Pose de vernis semi-permanent', min: 40, price: 60, desc: 'Une tenue impeccable pendant deux à trois semaines.' },
  { cat: 'Mains & pieds', name: 'Beauté des pieds', min: 60, price: 85, desc: 'Bain aromatique, soin des talons, massage et vernis.' },
  { cat: 'Rituels', name: 'Rituel Aurore', min: 90, price: 185, desc: 'Gommage du corps suivi d’un massage relaxant aux huiles chaudes.' },
  { cat: 'Rituels', name: 'Rituel Plénitude', min: 120, price: 245, desc: 'Soin Éclat signature et massage complet, pour une parenthèse de deux heures.' },
  { cat: 'Rituels', name: 'Rituel en duo', min: 90, price: 350, desc: 'Deux massages relaxants en cabine double, infusion offerte au salon.' },
];

export const duree = (min: number) => (min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60}` : ''}`);
