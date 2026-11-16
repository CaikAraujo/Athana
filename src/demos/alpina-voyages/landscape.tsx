import { useId } from 'react';

export type Season = 'printemps' | 'ete' | 'automne' | 'hiver';
export type Scene = 'lac' | 'sommet' | 'village' | 'glacier';

const PAL: Record<Season, { sky: [string, string]; sun: string; far: string; mid: string; near: string; tree: string; water: [string, string] }> = {
  printemps: { sky: ['#bfe3e0', '#fdf3dc'], sun: '#fff7d6', far: '#9cc3c1', mid: '#6fa58f', near: '#3f7a5c', tree: '#24543f', water: ['#8fcfd0', '#4f9aa3'] },
  ete: { sky: ['#6ec1d8', '#fbe9c8'], sun: '#fff1b8', far: '#7fb0c4', mid: '#4d8a8c', near: '#1f5f55', tree: '#0f3d3e', water: ['#59b8c9', '#1f7f95'] },
  automne: { sky: ['#f2a56b', '#fde6c4'], sun: '#fff0cf', far: '#c98a6b', mid: '#a55d3a', near: '#6e3b22', tree: '#3d2415', water: ['#e9b384', '#9c5f43'] },
  hiver: { sky: ['#8fa8cf', '#eef3fa'], sun: '#ffffff', far: '#c9d6ea', mid: '#93a9c9', near: '#e9eff7', tree: '#2e4664', water: ['#c7d9ee', '#7f9cc2'] },
};

/** Layered alpine landscape, drawn entirely in SVG. Decorative. */
export function Landscape({ season, scene, className }: { season: Season; scene: Scene; className?: string }) {
  const id = useId();
  const p = PAL[season];
  const snow = season === 'hiver' ? '#ffffff' : '#ffffffcc';
  return (
    <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="1" stopColor={p.sky[1]} />
        </linearGradient>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.water[0]} />
          <stop offset="1" stopColor={p.water[1]} />
        </linearGradient>
        <radialGradient id={`${id}g`}>
          <stop offset="0" stopColor={p.sun} stopOpacity="0.9" />
          <stop offset="1" stopColor={p.sun} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill={`url(#${id}s)`} />
      <circle cx={scene === 'sommet' ? 600 : 220} cy="130" r="150" fill={`url(#${id}g)`} />
      <circle cx={scene === 'sommet' ? 600 : 220} cy="130" r="38" fill={p.sun} />
      {/* far range */}
      <path d="M0 330 L90 240 L160 290 L260 170 L340 260 L430 150 L520 250 L610 190 L700 270 L800 210 V500 H0 Z" fill={p.far} />
      <path d="M260 170 L290 204 L272 214 L250 200 L236 206 Z M430 150 L462 186 L440 196 L424 182 L404 190 Z M610 190 L634 214 L616 220 L600 210 L590 214 Z" fill={snow} />
      {scene === 'glacier' && <path d="M300 250 Q380 300 360 380 T420 500 H250 Q300 420 270 350 T300 250 Z" fill="#ffffff" opacity="0.85" />}
      {scene === 'sommet' && (
        <>
          <path d="M210 420 L400 70 L590 420 Z" fill={p.mid} />
          <path d="M400 70 L452 166 L420 190 L398 160 L372 196 L350 162 Z" fill={snow} />
          <path d="M400 70 L590 420 H400 Z" fill="#00000018" />
        </>
      )}
      {/* mid range */}
      <path d="M0 380 L120 300 L220 360 L340 290 L470 370 L590 300 L700 350 L800 310 V500 H0 Z" fill={p.mid} opacity={scene === 'sommet' ? 0.92 : 1} />
      {scene === 'lac' && (
        <>
          <rect y="390" width="800" height="110" fill={`url(#${id}w)`} />
          <path d="M120 410 H320 M400 430 H640 M60 452 H260 M480 468 H760 M200 484 H420" stroke="#ffffff" strokeOpacity="0.45" strokeWidth="3" strokeLinecap="round" />
          <path d="M560 398 l28 -34 v34 Z M592 398 l0 -26 l18 26 Z" fill="#ffffff" />
          <path d="M548 400 h72 l-8 10 h-56 Z" fill={p.tree} />
        </>
      )}
      {/* near hill */}
      {scene !== 'lac' && <path d="M0 440 Q200 380 420 430 T800 400 V500 H0 Z" fill={p.near} />}
      {scene === 'lac' && <path d="M0 400 Q90 372 190 398 L0 430 Z M800 396 Q700 370 610 398 L800 420 Z" fill={p.near} />}
      {scene === 'village' && (
        <g>
          <rect x="330" y="390" width="56" height="40" fill="#f6efe2" />
          <path d="M322 392 L358 364 L394 392 Z" fill="#7a3b22" />
          <rect x="352" y="406" width="12" height="24" fill="#7a3b22" />
          <rect x="410" y="384" width="70" height="48" fill="#efe3cf" />
          <path d="M402 386 L445 352 L488 386 Z" fill="#5d2c19" />
          <rect x="424" y="398" width="12" height="12" fill="#f2b84b" />
          <rect x="452" y="398" width="12" height="12" fill="#f2b84b" />
          <rect x="520" y="350" width="22" height="80" fill="#f6efe2" />
          <path d="M516 352 L531 318 L546 352 Z" fill="#5d2c19" />
        </g>
      )}
      {[40, 90, 130, 660, 710, 750].map((x, i) => (
        <path key={x} d={`M${x} ${452 - (i % 2) * 8} l18 -52 l18 52 Z M${x + 4} ${428 - (i % 2) * 8} l14 -40 l14 40 Z`} fill={p.tree} opacity={scene === 'lac' ? 0 : 1} />
      ))}
    </svg>
  );
}
