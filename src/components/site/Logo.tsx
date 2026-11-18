import { MARK_PATHS, MARK_VIEWBOX } from './logo-paths';

/**
 * Brand mark + wordmark. The mark is drawn inline so it follows the accent colour of the theme
 * (and of a .section-dark band). The original gold artwork is kept in public/images/athana-mark-gold.svg.
 */
export function Logo({ size = 28, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="ATHANA">
      <svg viewBox={MARK_VIEWBOX} width={size} height={size} aria-hidden style={{ color: 'var(--accent-text, var(--color-accent-600))' }}>
        {MARK_PATHS.map((d, i) => <path key={i} d={d} fill="currentColor" />)}
      </svg>
      {withWordmark && <span className="font-display font-semibold tracking-[0.22em] text-fg" style={{ fontSize: Math.max(14, size * 0.6) }}>ATHANA</span>}
    </span>
  );
}
