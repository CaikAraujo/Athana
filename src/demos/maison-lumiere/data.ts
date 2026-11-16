export type Cat = 'Entrées' | 'Plats' | 'Desserts' | 'Vins';
export type Dish = { cat: Cat; name: string; desc: string; price: number; veg?: boolean };

export const dishes: Dish[] = [
  { cat: 'Entrées', name: 'Velouté de courge rôtie', desc: 'Noisettes torréfiées, huile de pépins de courge, crème double', price: 16, veg: true },
  { cat: 'Entrées', name: 'Féra du Léman fumée', desc: 'Pickles de légumes, crème acidulée à l’aneth, pain de seigle', price: 22 },
  { cat: 'Entrées', name: 'Œuf parfait', desc: 'Champignons des bois, émulsion au vin jaune, croûtons au beurre noisette', price: 19, veg: true },
  { cat: 'Entrées', name: 'Tartare de bœuf au couteau', desc: 'Câpres, échalote confite, jaune d’œuf mariné, toast brioché', price: 24 },
  { cat: 'Plats', name: 'Filets de perche meunière', desc: 'Beurre citronné, pommes vapeur, jeunes pousses', price: 42 },
  { cat: 'Plats', name: 'Suprême de volaille fermière', desc: 'Jus au thym, gratin de pommes de terre, carottes glacées', price: 38 },
  { cat: 'Plats', name: 'Joue de bœuf braisée', desc: 'Sept heures de cuisson, polenta crémeuse, légumes racines', price: 44 },
  { cat: 'Plats', name: 'Risotto aux bolets', desc: 'Parmesan affiné, persil plat, noisettes du Piémont', price: 34, veg: true },
  { cat: 'Plats', name: 'Raviole ouverte aux herbes', desc: 'Ricotta, épinards, beurre de sauge, citron confit', price: 32, veg: true },
  { cat: 'Desserts', name: 'Tarte fine aux pommes', desc: 'Caramel au beurre salé, glace vanille maison', price: 15, veg: true },
  { cat: 'Desserts', name: 'Meringue et double crème', desc: 'Fruits rouges de saison, coulis de framboise', price: 14, veg: true },
  { cat: 'Desserts', name: 'Moelleux au chocolat noir', desc: 'Cœur coulant, sorbet poire, éclats de fève de cacao', price: 16, veg: true },
  { cat: 'Desserts', name: 'Assiette de fromages affinés', desc: 'Sélection de trois fromages, pain aux noix, chutney', price: 18, veg: true },
  { cat: 'Vins', name: 'Chasselas — Lavaux', desc: 'Blanc sec et minéral · le verre 1 dl', price: 8, veg: true },
  { cat: 'Vins', name: 'Petite Arvine — Valais', desc: 'Blanc vif aux notes d’agrumes · le verre 1 dl', price: 10, veg: true },
  { cat: 'Vins', name: 'Pinot Noir — Neuchâtel', desc: 'Rouge délicat et fruité · le verre 1 dl', price: 9, veg: true },
  { cat: 'Vins', name: 'Cornalin — Valais', desc: 'Rouge charpenté aux notes de cerise noire · le verre 1 dl', price: 11, veg: true },
];
