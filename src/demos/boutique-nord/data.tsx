import { useId } from 'react';

export const BASE = '/demo/boutique-nord';
export const href = (key: string) => (key ? `${BASE}/${key}` : BASE);
export const chf = (n: number) => `CHF ${n.toFixed(2)}`;

export type Shape = 'lamp' | 'pendant' | 'stool' | 'shelf' | 'vase' | 'cups' | 'plaid' | 'candle' | 'carafe';
export type Variant = { name: string; hex: string };
export type Product = { id: string; name: string; kind: string; cat: string; price: number; shape: Shape; bg: string; variants: Variant[]; text: string; details: string[] };

export const CATEGORIES = ['Tout', 'Luminaires', 'Mobilier', 'Table', 'Décoration', 'Textile'];

export const PRODUCTS: Product[] = [
  { id: 'fjord', name: 'Fjord', kind: 'Lampe de table', cat: 'Luminaires', price: 189, shape: 'lamp', bg: '#e6e1d6', variants: [{ name: 'Ardoise', hex: '#3b5166' }, { name: 'Sable', hex: '#c9b48f' }, { name: 'Noir', hex: '#20201d' }], text: 'Un abat-jour en acier laqué posé sur un pied en frêne massif. Lumière chaude, dirigée vers le bas, idéale pour un bureau ou un chevet.', details: ['Acier laqué mat, pied en frêne', 'Hauteur 38 cm, Ø 22 cm', 'Douille E27, ampoule non fournie', 'Câble textile de 2 m'] },
  { id: 'halo', name: 'Halo', kind: 'Suspension', cat: 'Luminaires', price: 249, shape: 'pendant', bg: '#dfe4e6', variants: [{ name: 'Moutarde', hex: '#d9a441' }, { name: 'Ardoise', hex: '#3b5166' }], text: 'Une coupole généreuse en aluminium repoussé, pensée pour éclairer une table sans éblouir les convives.', details: ['Aluminium repoussé, intérieur blanc', 'Ø 42 cm, hauteur 24 cm', 'Câble réglable jusqu’à 1,5 m', 'Douille E27'] },
  { id: 'birk', name: 'Birk', kind: 'Tabouret', cat: 'Mobilier', price: 159, shape: 'stool', bg: '#ece5d8', variants: [{ name: 'Bouleau naturel', hex: '#d8bd8f' }, { name: 'Noir teinté', hex: '#20201d' }], text: 'Trois pieds, une assise légèrement creusée : un tabouret qui sert aussi de table d’appoint ou de chevet.', details: ['Bouleau massif, huile naturelle', 'Hauteur 45 cm, assise Ø 32 cm', 'Assemblage sans vis apparente', 'Livré monté'] },
  { id: 'linje', name: 'Linje', kind: 'Étagère murale', cat: 'Mobilier', price: 219, shape: 'shelf', bg: '#e3e6df', variants: [{ name: 'Chêne', hex: '#b98f5c' }, { name: 'Noyer', hex: '#6b4a32' }], text: 'Deux tablettes fines portées par des équerres en acier. Assez sobre pour une entrée, assez solide pour des livres.', details: ['Placage bois sur multiplis', 'Largeur 80 cm, profondeur 20 cm', 'Charge maximale 15 kg par tablette', 'Fixations murales incluses'] },
  { id: 'sten', name: 'Sten', kind: 'Vase en grès', cat: 'Décoration', price: 69, shape: 'vase', bg: '#e9e2da', variants: [{ name: 'Craie', hex: '#f3efe6' }, { name: 'Argile', hex: '#b4735a' }, { name: 'Ardoise', hex: '#3b5166' }], text: 'Tourné à la main, émaillé à l’intérieur seulement : la surface garde le grain du grès brut.', details: ['Grès tourné à la main', 'Hauteur 24 cm', 'Étanche, émail intérieur', 'Chaque pièce est légèrement différente'] },
  { id: 'kopp', name: 'Kopp', kind: 'Tasses, lot de 2', cat: 'Table', price: 38, shape: 'cups', bg: '#e2e6e8', variants: [{ name: 'Craie', hex: '#f3efe6' }, { name: 'Moutarde', hex: '#d9a441' }, { name: 'Ardoise', hex: '#3b5166' }], text: 'Sans anse, bien en main, pour le café du matin comme pour la tisane du soir.', details: ['Porcelaine émaillée', 'Contenance 20 cl', 'Lave-vaisselle et micro-ondes', 'Lot de deux tasses'] },
  { id: 'vann', name: 'Vann', kind: 'Carafe en verre', cat: 'Table', price: 59, shape: 'carafe', bg: '#e8e4dc', variants: [{ name: 'Transparent', hex: '#cfe0e4' }, { name: 'Fumé', hex: '#7b7f80' }], text: 'Une carafe soufflée aux lignes droites, avec un bouchon en liège qui sert aussi de dessous de verre.', details: ['Verre soufflé', 'Contenance 1 l', 'Bouchon en liège naturel', 'Lavage à la main recommandé'] },
  { id: 'ull', name: 'Ull', kind: 'Plaid en laine', cat: 'Textile', price: 129, shape: 'plaid', bg: '#e6e2db', variants: [{ name: 'Ardoise', hex: '#3b5166' }, { name: 'Moutarde', hex: '#d9a441' }, { name: 'Argile', hex: '#b4735a' }], text: 'Un tissage serré, chaud sans être lourd, bordé de franges courtes. À laisser sur le canapé toute l’année.', details: ['Pure laine vierge', '130 × 180 cm', 'Tissage chevron', 'Nettoyage à sec'] },
  { id: 'lys', name: 'Lys', kind: 'Bougeoir', cat: 'Décoration', price: 45, shape: 'candle', bg: '#e4e3dd', variants: [{ name: 'Laiton', hex: '#c69a4a' }, { name: 'Noir', hex: '#20201d' }], text: 'Un socle lesté et une tige fine : le bougeoir disparaît pour ne laisser voir que la flamme.', details: ['Acier, finition laiton ou noir mat', 'Hauteur 14 cm', 'Pour bougies de Ø 2,2 cm', 'Bougie non fournie'] },
];

export const findProduct = (id: string | null | undefined) => PRODUCTS.find((p) => p.id === id);

/** Minimal product illustration, tinted by the chosen variant. Decorative. */
export function ProductArt({ product, color, className }: { product: Product; color?: string; className?: string }) {
  const id = useId();
  const c = color ?? product.variants[0].hex;
  const wood = '#c9a877';
  return (
    <svg viewBox="0 0 300 300" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.18" />
        </linearGradient>
      </defs>
      <rect width="300" height="300" fill={product.bg} />
      <rect y="232" width="300" height="68" fill="#00000010" />
      <ellipse cx="150" cy="238" rx="78" ry="9" fill="#00000022" />
      {product.shape === 'lamp' && (
        <g>
          <rect x="144" y="130" width="12" height="96" fill={wood} />
          <ellipse cx="150" cy="230" rx="38" ry="8" fill={wood} />
          <path d="M104 132 L122 62 H178 L196 132 Z" fill={c} />
          <path d="M104 132 L122 62 H178 L196 132 Z" fill={`url(#${id}l)`} />
          <ellipse cx="150" cy="132" rx="46" ry="6" fill="#fff4cf" />
        </g>
      )}
      {product.shape === 'pendant' && (
        <g>
          <path d="M150 0 V84" stroke="#20201d" strokeWidth="3" />
          <path d="M70 160 Q70 84 150 84 Q230 84 230 160 Z" fill={c} />
          <path d="M70 160 Q70 84 150 84 Q230 84 230 160 Z" fill={`url(#${id}l)`} />
          <ellipse cx="150" cy="160" rx="80" ry="10" fill="#fff4cf" />
          <path d="M96 172 L60 238 H240 L204 172 Z" fill="#fff4cf" opacity="0.35" />
        </g>
      )}
      {product.shape === 'stool' && (
        <g>
          <path d="M112 128 L92 234 M188 128 L208 234 M150 128 V238" stroke={c} strokeWidth="12" strokeLinecap="round" />
          <ellipse cx="150" cy="122" rx="66" ry="14" fill={c} />
          <ellipse cx="150" cy="119" rx="58" ry="10" fill="#ffffff22" />
        </g>
      )}
      {product.shape === 'shelf' && (
        <g>
          <rect x="40" y="120" width="220" height="10" fill={c} />
          <rect x="40" y="196" width="220" height="10" fill={c} />
          <path d="M70 130 V160 M230 130 V160 M70 206 V232 M230 206 V232" stroke="#20201d" strokeWidth="4" />
          <rect x="84" y="78" width="14" height="42" fill="#3b5166" />
          <rect x="100" y="70" width="12" height="50" fill="#d9a441" />
          <rect x="114" y="84" width="16" height="36" fill="#f3efe6" />
          <path d="M196 120 q-10 -34 12 -40 q22 6 12 40 Z" fill="#b4735a" />
          <rect x="150" y="170" width="60" height="26" fill="#f3efe6" />
        </g>
      )}
      {product.shape === 'vase' && (
        <g>
          <path d="M150 80 q-34 -38 -8 -62 M152 84 q30 -30 44 -56 M148 84 q-6 -36 6 -70" stroke="#5f6f52" strokeWidth="3" fill="none" />
          <path d="M130 90 H170 V112 Q206 150 196 204 Q190 236 150 236 Q110 236 104 204 Q94 150 130 112 Z" fill={c} />
          <path d="M130 90 H170 V112 Q206 150 196 204 Q190 236 150 236 Q110 236 104 204 Q94 150 130 112 Z" fill={`url(#${id}l)`} />
        </g>
      )}
      {product.shape === 'cups' && (
        <g>
          <path d="M62 160 H138 L130 236 H70 Z" fill={c} />
          <path d="M62 160 H138 L130 236 H70 Z" fill={`url(#${id}l)`} />
          <path d="M162 176 H238 L231 236 H169 Z" fill={c} />
          <path d="M162 176 H238 L231 236 H169 Z" fill={`url(#${id}l)`} />
          <path d="M92 150 q-10 -16 0 -30 q10 -14 0 -30" stroke="#00000030" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      )}
      {product.shape === 'carafe' && (
        <g>
          <rect x="136" y="48" width="28" height="18" rx="3" fill={wood} />
          <path d="M134 66 H166 V104 L196 136 V228 Q196 236 188 236 H112 Q104 236 104 228 V136 L134 104 Z" fill={c} opacity="0.8" />
          <path d="M108 160 H192 V228 Q192 232 188 232 H112 Q108 232 108 228 Z" fill="#ffffff55" />
          <path d="M134 66 H166 V104 L196 136 V228 Q196 236 188 236 H112 Q104 236 104 228 V136 L134 104 Z" fill={`url(#${id}l)`} />
        </g>
      )}
      {product.shape === 'plaid' && (
        <g>
          <rect x="70" y="150" width="160" height="28" rx="12" fill={c} />
          <rect x="62" y="176" width="176" height="30" rx="13" fill={c} />
          <rect x="62" y="176" width="176" height="30" rx="13" fill="#00000018" />
          <rect x="56" y="204" width="188" height="32" rx="14" fill={c} />
          <path d="M80 164 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 M72 220 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8 l10 -8 l10 8" stroke="#ffffff55" strokeWidth="2" fill="none" />
        </g>
      )}
      {product.shape === 'candle' && (
        <g>
          <path d="M150 62 q-12 16 0 28 q12 -12 0 -28 Z" fill="#f2b84b" />
          <rect x="143" y="90" width="14" height="80" fill="#f8f4ea" />
          <rect x="136" y="168" width="28" height="8" fill={c} />
          <rect x="147" y="176" width="6" height="46" fill={c} />
          <ellipse cx="150" cy="230" rx="40" ry="9" fill={c} />
          <ellipse cx="150" cy="227" rx="34" ry="6" fill="#ffffff22" />
        </g>
      )}
    </svg>
  );
}
