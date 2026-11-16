export type Kind = 'Appartement' | 'Villa' | 'Chalet' | 'Attique';
export type Deal = 'Acheter' | 'Louer';
export type Property = { id: string; title: string; kind: Kind; deal: Deal; city: string; price: number; rooms: number; area: number; sky: [string, string]; feature: string };

export const properties: Property[] = [
  { id: 'HI-101', title: 'Appartement traversant avec balcon', kind: 'Appartement', deal: 'Acheter', city: 'Lausanne', price: 895000, rooms: 3.5, area: 92, sky: ['#bcd7ea', '#f6e3cf'], feature: 'Balcon plein sud' },
  { id: 'HI-102', title: 'Villa contemporaine et jardin arboré', kind: 'Villa', deal: 'Acheter', city: 'Nyon', price: 2350000, rooms: 6.5, area: 210, sky: ['#9fc4e0', '#e9eef0'], feature: 'Jardin de 800 m²' },
  { id: 'HI-103', title: 'Attique avec terrasse panoramique', kind: 'Attique', deal: 'Acheter', city: 'Montreux', price: 1780000, rooms: 4.5, area: 138, sky: ['#f3b58c', '#fbe6c8'], feature: 'Terrasse de 60 m²' },
  { id: 'HI-104', title: 'Chalet en madrier, vue dégagée', kind: 'Chalet', deal: 'Acheter', city: 'Verbier', price: 2900000, rooms: 5.5, area: 165, sky: ['#a9c9e8', '#ffffff'], feature: 'Accès skis aux pieds' },
  { id: 'HI-105', title: 'Deux pièces lumineux proche gare', kind: 'Appartement', deal: 'Louer', city: 'Genève', price: 2150, rooms: 2, area: 54, sky: ['#c9d6e8', '#f1ded3'], feature: 'Cuisine rénovée' },
  { id: 'HI-106', title: 'Appartement familial, quartier calme', kind: 'Appartement', deal: 'Louer', city: 'Fribourg', price: 2680, rooms: 4.5, area: 108, sky: ['#b5d8d2', '#f3efe0'], feature: 'Deux places de parc' },
  { id: 'HI-107', title: 'Villa mitoyenne avec terrasse', kind: 'Villa', deal: 'Acheter', city: 'Morges', price: 1420000, rooms: 5.5, area: 156, sky: ['#d3c6e6', '#f8e4d8'], feature: 'Proche des écoles' },
  { id: 'HI-108', title: 'Attique meublé en vieille ville', kind: 'Attique', deal: 'Louer', city: 'Neuchâtel', price: 3900, rooms: 3.5, area: 96, sky: ['#f0c0a0', '#f8ecd6'], feature: 'Poutres apparentes' },
  { id: 'HI-109', title: 'Studio rénové, idéal pied-à-terre', kind: 'Appartement', deal: 'Acheter', city: 'Vevey', price: 465000, rooms: 1.5, area: 38, sky: ['#b8d4ee', '#eef3f6'], feature: 'À cinq minutes du lac' },
  { id: 'HI-110', title: 'Chalet familial à l’année', kind: 'Chalet', deal: 'Louer', city: 'Gruyères', price: 3400, rooms: 5.5, area: 140, sky: ['#a8cfe0', '#f5f1e6'], feature: 'Poêle et grand jardin' },
  { id: 'HI-111', title: 'Appartement neuf avec loggia', kind: 'Appartement', deal: 'Acheter', city: 'Sion', price: 720000, rooms: 3.5, area: 88, sky: ['#f2c6a6', '#f9ecdc'], feature: 'Construction récente' },
  { id: 'HI-112', title: 'Villa d’architecte, piscine', kind: 'Villa', deal: 'Acheter', city: 'Lutry', price: 3650000, rooms: 7.5, area: 280, sky: ['#9dbfe0', '#f4dfc9'], feature: 'Piscine chauffée' },
];

export const chf = (n: number) => `CHF ${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '’')}`;
export const priceLabel = (p: Property) => (p.deal === 'Louer' ? `${chf(p.price)} / mois` : chf(p.price));

/** Art-directed "photo": a flat architectural illustration generated per property type. */
export function PropertyArt({ p, className = '' }: { p: Pick<Property, 'id' | 'kind' | 'sky' | 'title'>; className?: string }) {
  const g = `sky-${p.id}`;
  const windows = (x: number, y: number, cols: number, rows: number, w = 22, h = 26, gap = 14) =>
    Array.from({ length: cols * rows }, (_, i) => (
      <rect key={i} x={x + (i % cols) * (w + gap)} y={y + Math.floor(i / cols) * (h + gap)} width={w} height={h} fill={i % 3 === 0 ? '#f6d48a' : '#2a3442'} />
    ));
  return (
    <svg viewBox="0 0 400 260" role="img" aria-label={`Illustration du bien : ${p.title}`} className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="1" stopColor={p.sky[1]} />
        </linearGradient>
      </defs>
      <rect width="400" height="260" fill={`url(#${g})`} />
      <circle cx="320" cy="62" r="26" fill="#fff" opacity="0.7" />
      {p.kind === 'Chalet' ? (
        <>
          <path d="M0 200 90 90l60 60 70-100 90 110 90-60v160H0z" fill="#8fa3b8" />
          <path d="M220 50l22 28-14-6-10 12-12-10z" fill="#fff" />
          <path d="M0 215h400v45H0z" fill="#f4f6f8" />
          <path d="M110 215v-70l90-52 90 52v70z" fill="#7a4a2b" />
          <path d="M96 150 200 88l104 62-10 12-94-56-94 56z" fill="#3a2416" />
          <path d="M110 180h180M110 162h180M110 198h180" stroke="#5e3820" strokeWidth="2" />
          {windows(138, 160, 2, 1, 26, 28, 72)}
          <rect x="186" y="170" width="28" height="45" fill="#3a2416" />
          <path d="M40 215v-40l14-26 14 26v40zM330 215v-52l16-30 16 30v52z" fill="#2f5d48" />
        </>
      ) : p.kind === 'Villa' ? (
        <>
          <path d="M0 200q100-30 200-10t200-20v90H0z" fill="#7fae7a" />
          <rect x="70" y="120" width="190" height="90" fill="#fbfaf7" />
          <rect x="200" y="86" width="140" height="124" fill="#e9e4da" />
          <rect x="60" y="112" width="210" height="10" fill="#15171c" />
          <rect x="190" y="78" width="160" height="10" fill="#15171c" />
          <rect x="88" y="138" width="96" height="72" fill="#2a3442" />
          <path d="M136 138v72M88 174h96" stroke="#fbfaf7" strokeWidth="3" />
          {windows(222, 106, 2, 2, 40, 30, 16)}
          <rect x="0" y="210" width="400" height="50" fill="#5f9460" />
          <rect x="250" y="222" width="130" height="22" rx="4" fill="#8fd0e6" />
          <circle cx="40" cy="170" r="30" fill="#3f7a4b" />
          <rect x="37" y="190" width="6" height="24" fill="#5e3820" />
        </>
      ) : p.kind === 'Attique' ? (
        <>
          <path d="M0 190 60 150l50 30 60-50 70 40 60-30 100 50v70H0z" fill="#b9a9bd" opacity="0.7" />
          <rect x="60" y="150" width="280" height="110" fill="#d9d2c5" />
          {windows(80, 190, 7, 2, 22, 26, 16)}
          <rect x="90" y="92" width="200" height="58" fill="#fbfaf7" />
          <rect x="80" y="84" width="220" height="9" fill="#15171c" />
          <rect x="104" y="104" width="120" height="46" fill="#2a3442" />
          <path d="M144 104v46M184 104v46" stroke="#fbfaf7" strokeWidth="3" />
          <path d="M60 150h280M60 136h30M290 136h50" stroke="#15171c" strokeWidth="3" />
          <path d="M66 136v14M78 136v14M300 136v14M314 136v14M328 136v14" stroke="#15171c" strokeWidth="2" />
          <circle cx="258" cy="130" r="14" fill="#3f7a4b" />
          <rect x="250" y="138" width="16" height="12" fill="#b0613a" />
        </>
      ) : (
        <>
          <rect x="20" y="130" width="90" height="130" fill="#c9c2b6" opacity="0.8" />
          <rect x="300" y="110" width="90" height="150" fill="#c9c2b6" opacity="0.8" />
          <rect x="100" y="60" width="200" height="200" fill="#fbfaf7" />
          <rect x="100" y="60" width="200" height="8" fill="#d52b1e" />
          {windows(122, 86, 3, 4, 34, 24, 26)}
          {[110, 158, 206].map((y) => (
            <rect key={y} x="112" y={y} width="176" height="4" fill="#15171c" />
          ))}
          <rect x="0" y="246" width="400" height="14" fill="#8a8f96" />
          <circle cx="60" cy="226" r="20" fill="#3f7a4b" />
          <rect x="57" y="236" width="6" height="14" fill="#5e3820" />
        </>
      )}
    </svg>
  );
}
