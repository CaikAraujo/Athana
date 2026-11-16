import { useId } from 'react';

export type ArtKind = 'facade' | 'toiture' | 'interieur' | 'exterieur';

const SKIES: [string, string][] = [
  ['#f6c453', '#f08a3c'],
  ['#9fc3d6', '#e9e3d5'],
  ['#3d4a57', '#8b98a3'],
  ['#e8d9bf', '#c9b79a'],
];

/** Decorative SVG compositions standing in for project photography. */
export function ProjectArt({ kind, tone = 0, className }: { kind: ArtKind; tone?: number; className?: string }) {
  const id = useId();
  const [a, b] = SKIES[tone % SKIES.length];
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <pattern id={`${id}h`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="14" fill="#1b1d1f" />
          <rect x="7" width="7" height="14" fill="#ffc400" />
        </pattern>
        <pattern id={`${id}t`} width="20" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 12 Q10 0 20 12" fill="none" stroke="#00000033" strokeWidth="1.5" />
        </pattern>
        <pattern id={`${id}p`} width="40" height="300" patternUnits="userSpaceOnUse">
          <rect width="40" height="300" fill="none" stroke="#00000022" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="400" height="300" fill={`url(#${id}s)`} />
      {kind === 'facade' && (
        <g>
          <circle cx="320" cy="70" r="34" fill="#ffffff55" />
          <path d="M70 40 V250 M70 48 H250 M70 48 L40 80 M250 48 V96" stroke="#1b1d1f" strokeWidth="5" fill="none" />
          <rect x="240" y="96" width="20" height="14" fill="#ffc400" stroke="#1b1d1f" strokeWidth="2" />
          <rect x="120" y="110" width="170" height="190" fill="#2a2d30" />
          <rect x="290" y="150" width="80" height="150" fill="#3a3e42" />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3].map((c) => (
              <rect key={`${r}${c}`} x={134 + c * 38} y={124 + r * 42} width="26" height="28" fill={(r + c) % 3 === 0 ? '#ffc400' : '#cfd6da'} opacity={(r + c) % 3 === 0 ? 1 : 0.75} />
            )),
          )}
          {[0, 1, 2].map((r) => (
            <rect key={r} x="304" y={166 + r * 42} width="52" height="24" fill="#cfd6da" opacity="0.6" />
          ))}
          <rect x="0" y="286" width="400" height="14" fill={`url(#${id}h)`} />
        </g>
      )}
      {kind === 'toiture' && (
        <g>
          <circle cx="70" cy="70" r="30" fill="#ffffff66" />
          <rect x="250" y="70" width="30" height="70" fill="#2a2d30" />
          <path d="M30 200 L200 60 L370 200 Z" fill="#b4472b" />
          <path d="M30 200 L200 60 L370 200 Z" fill={`url(#${id}t)`} />
          <path d="M22 204 L200 56 L378 204" stroke="#1b1d1f" strokeWidth="8" fill="none" strokeLinejoin="round" />
          <rect x="60" y="200" width="280" height="100" fill="#efe9dc" />
          <rect x="165" y="110" width="70" height="46" fill="#9fc3d6" stroke="#1b1d1f" strokeWidth="4" transform="skewY(-0)" />
          <rect x="90" y="225" width="60" height="50" fill="#3a3e42" />
          <rect x="250" y="225" width="60" height="50" fill="#3a3e42" />
          <rect x="180" y="220" width="40" height="80" fill="#ffc400" />
        </g>
      )}
      {kind === 'interieur' && (
        <g>
          <rect width="400" height="190" fill="#ece6d8" />
          <path d="M0 190 H400 V300 H0 Z" fill="#b98a5a" />
          <path d="M0 190 H400 V300 H0 Z" fill={`url(#${id}p)`} />
          <rect x="40" y="40" width="130" height="110" fill={`url(#${id}s)`} stroke="#1b1d1f" strokeWidth="5" />
          <path d="M105 40 V150 M40 95 H170" stroke="#1b1d1f" strokeWidth="4" />
          <rect x="215" y="120" width="170" height="90" fill="#2a2d30" />
          <rect x="210" y="112" width="180" height="10" fill="#d9d2c3" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={224 + i * 54} y="132" width="44" height="68" fill="none" stroke="#ffc400" strokeWidth="2" />
          ))}
          <rect x="215" y="40" width="170" height="44" fill="#3a3e42" />
          <path d="M300 0 V26" stroke="#1b1d1f" strokeWidth="2" />
          <path d="M284 40 L300 24 L316 40 Z" fill="#ffc400" />
        </g>
      )}
      {kind === 'exterieur' && (
        <g>
          <path d="M0 150 Q100 110 200 140 T400 120 V300 H0 Z" fill="#5f7a4e" />
          <rect x="40" y="90" width="210" height="130" fill="#efe9dc" />
          <rect x="60" y="112" width="70" height="108" fill="#2a2d30" />
          <rect x="150" y="112" width="80" height="60" fill="#9fc3d6" />
          <path d="M240 96 H380 M250 96 V220 M370 96 V220 M240 108 H380" stroke="#1b1d1f" strokeWidth="6" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d={`M${262 + i * 20} 92 V112`} stroke="#1b1d1f" strokeWidth="3" />
          ))}
          <rect x="0" y="220" width="400" height="80" fill="#8d8f8c" />
          <path d="M0 240 H400 M0 262 H400 M0 284 H400 M80 220 V300 M190 220 V300 M300 220 V300" stroke="#00000022" strokeWidth="2" />
          <circle cx="24" cy="196" r="26" fill="#3f5a36" />
          <circle cx="330" cy="196" r="18" fill="#3f5a36" />
          <rect x="318" y="206" width="24" height="18" fill="#ffc400" />
        </g>
      )}
    </svg>
  );
}
