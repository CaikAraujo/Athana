'use client';

import { useEffect, useState } from 'react';

const OPTIONS = [['cyan', '#0891b2'], ['green', '#059669'], ['teal', '#0d9488']] as const;

/**
 * Development-only helper to compare accent colours live (never rendered in production builds).
 * The permanent choice is NEXT_PUBLIC_ACCENT in .env.
 */
export function AccentSwitcher() {
  const [current, setCurrent] = useState<string>('');
  useEffect(() => {
    const saved = localStorage.getItem('athana-accent');
    if (saved) document.documentElement.dataset.accent = saved;
    setCurrent(document.documentElement.dataset.accent || 'cyan');
  }, []);
  const pick = (name: string) => { document.documentElement.dataset.accent = name; localStorage.setItem('athana-accent', name); setCurrent(name); };
  return (
    <div className="no-print fixed bottom-3 left-3 z-50 flex items-center gap-2 rounded-full border border-line-strong bg-ink-850 px-3 py-2 text-xs shadow-lg" role="group" aria-label="Accent colour (development only)">
      <span className="muted">Cor</span>
      <select aria-label="Design language" defaultValue="" className="cursor-pointer bg-transparent text-xs" onChange={(e) => { const el = document.querySelector<HTMLElement>('.site'); if (el && e.target.value) el.dataset.style = e.target.value; }}>
        <option value="" disabled>Estilo</option><option value="carbon">Carbon (IBM)</option><option value="geist">Geist (Vercel)</option><option value="material">Material 3</option>
      </select>
      {OPTIONS.map(([name, color]) => (
        <button key={name} type="button" title={name} aria-label={name} aria-pressed={current === name} onClick={() => pick(name)}
          className={`h-6 w-6 cursor-pointer rounded-full border-2 ${current === name ? 'border-fg' : 'border-transparent'}`} style={{ background: color }} />
      ))}
    </div>
  );
}
