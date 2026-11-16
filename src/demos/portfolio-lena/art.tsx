import { useId } from 'react';

export type ArtId = 'mare' | 'limao' | 'folego' | 'linha' | 'sal' | 'obvio' | 'tipos';

/** Generated poster-style artwork for each project. Decorative. */
export function Artwork({ id, className }: { id: ArtId; className?: string }) {
  const u = useId();
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${u}a`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff5a36" />
          <stop offset="1" stopColor="#ffb199" />
        </linearGradient>
        <linearGradient id={`${u}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4c64e" />
          <stop offset="0.55" stopColor="#e9703f" />
          <stop offset="1" stopColor="#3b1d4a" />
        </linearGradient>
        <linearGradient id={`${u}c`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7d9e3" />
          <stop offset="1" stopColor="#b9c7f2" />
        </linearGradient>
        <pattern id={`${u}d`} width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="2.2" fill="#0d0d0d" />
        </pattern>
      </defs>
      {id === 'mare' && (
        <g>
          <rect width="400" height="500" fill="#2a2bd6" />
          <circle cx="200" cy="170" r="110" fill={`url(#${u}a)`} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path key={i} d={`M-20 ${250 + i * 40} q55 -44 110 0 t110 0 t110 0 t110 0 V520 H-20 Z`} fill={i % 2 ? '#d7ff3e' : '#0d0d0d'} />
          ))}
        </g>
      )}
      {id === 'limao' && (
        <g>
          <rect width="400" height="500" fill="#f6e04a" />
          <rect x="40" y="40" width="320" height="420" fill="none" stroke="#0d0d0d" strokeWidth="6" />
          <ellipse cx="200" cy="250" rx="120" ry="92" fill="#0d0d0d" transform="rotate(-24 200 250)" />
          <ellipse cx="200" cy="250" rx="96" ry="70" fill="#f6e04a" transform="rotate(-24 200 250)" />
          {[0, 30, 60, 90, 120, 150].map((r) => <path key={r} d="M110 250 H290" stroke="#0d0d0d" strokeWidth="5" transform={`rotate(${r - 24} 200 250)`} />)}
          <path d="M292 130 q40 -40 70 -10 q-24 44 -70 10 Z" fill="#1f8a4c" />
          <rect x="40" y="400" width="320" height="60" fill="#0d0d0d" />
          <rect x="60" y="422" width="150" height="14" fill="#f6e04a" />
          <rect x="300" y="422" width="40" height="14" fill="#ff5a36" />
        </g>
      )}
      {id === 'folego' && (
        <g>
          <rect width="400" height="500" fill="#f2efe8" />
          <rect x="0" y="0" width="200" height="500" fill="#ff5a36" />
          <circle cx="200" cy="210" r="130" fill="#0d0d0d" />
          <path d="M200 80 A130 130 0 0 1 200 340 Z" fill="#f2efe8" />
          <rect x="200" y="80" width="130" height="260" fill={`url(#${u}d)`} opacity="0.35" />
          <rect x="30" y="400" width="140" height="10" fill="#0d0d0d" />
          <rect x="30" y="422" width="100" height="10" fill="#0d0d0d" />
          <rect x="30" y="444" width="120" height="10" fill="#0d0d0d" />
          <rect x="230" y="400" width="140" height="54" fill="#0d0d0d" />
        </g>
      )}
      {id === 'linha' && (
        <g>
          <rect width="400" height="500" fill={`url(#${u}b)`} />
          <circle cx="290" cy="130" r="46" fill="#fff3c4" />
          <path d="M0 330 L70 300 L70 250 L130 250 L130 290 L190 270 L190 220 L260 220 L260 280 L330 260 L400 290 V500 H0 Z" fill="#1a0f24" />
          <path d="M0 120 L400 190 M0 150 L400 220" stroke="#0d0d0d" strokeWidth="2" />
          <rect x="90" y="340" width="220" height="100" rx="14" fill="#f4c64e" />
          <rect x="90" y="400" width="220" height="40" fill="#f2efe8" />
          {[0, 1, 2, 3].map((i) => <rect key={i} x={106 + i * 50} y="356" width="38" height="34" rx="4" fill="#1a0f24" />)}
          <path d="M200 340 L230 204" stroke="#0d0d0d" strokeWidth="4" />
          <circle cx="130" cy="446" r="14" fill="#0d0d0d" />
          <circle cx="270" cy="446" r="14" fill="#0d0d0d" />
          <path d="M0 462 H400" stroke="#0d0d0d" strokeWidth="5" />
        </g>
      )}
      {id === 'sal' && (
        <g>
          <rect width="400" height="500" fill={`url(#${u}c)`} />
          {[0, 1, 2, 3, 4].map((r) =>
            [0, 1, 2].map((c) => (
              <path key={`${r}${c}`} d={`M${-40 + c * 160 + r * 20} ${230 + r * 56} h150 l-18 48 h-150 Z`} fill={(r + c) % 2 ? '#ffffff' : '#9fb4ea'} opacity="0.9" />
            )),
          )}
          <path d="M150 230 L200 130 L250 230 Z" fill="#ffffff" />
          <path d="M200 130 L250 230 H200 Z" fill="#d9dff5" />
          <path d="M270 232 L300 176 L330 232 Z" fill="#ffffff" />
          <circle cx="90" cy="90" r="34" fill="#ff5a36" />
        </g>
      )}
      {id === 'obvio' && (
        <g>
          <rect width="400" height="500" fill="#0d0d0d" />
          <rect x="40" y="60" width="320" height="380" rx="10" fill="#1c1c1c" stroke="#f2efe8" strokeWidth="2" />
          <circle cx="62" cy="82" r="5" fill="#ff5a36" />
          <circle cx="80" cy="82" r="5" fill="#f4c64e" />
          <circle cx="98" cy="82" r="5" fill="#d7ff3e" />
          <path d="M40 104 H360" stroke="#f2efe8" strokeWidth="2" />
          <rect x="64" y="130" width="170" height="26" fill="#d7ff3e" />
          <rect x="64" y="166" width="110" height="26" fill="#f2efe8" />
          <path d="M64 400 V260 L150 220 V400 Z M150 400 V250 L250 290 V400 Z M250 400 V230 L336 270 V400 Z" fill="none" stroke="#f2efe8" strokeWidth="3" />
          <path d="M150 400 V250 L250 290 V400 Z" fill="#7c5cff" />
        </g>
      )}
      {id === 'tipos' && (
        <g>
          <rect width="400" height="500" fill="#7c5cff" />
          <rect x="30" y="30" width="340" height="440" fill={`url(#${u}d)`} opacity="0.16" />
          <path d="M70 380 L150 120 H210 L290 380 H232 L218 328 H142 L128 380 Z M156 280 H204 L180 190 Z" fill="#f2efe8" />
          <path d="M250 380 a60 60 0 1 1 90 -52 v52 h-40 v-12 a40 40 0 0 1 -50 12 Z" fill="#d7ff3e" />
          <circle cx="284" cy="334" r="18" fill="#7c5cff" />
          <rect x="60" y="410" width="290" height="12" fill="#0d0d0d" />
        </g>
      )}
    </svg>
  );
}
