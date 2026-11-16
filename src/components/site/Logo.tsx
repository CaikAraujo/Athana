/** Brand mark (from the existing ATHANA favicon artwork) + wordmark; scales from 20px to hero size. */
export function Logo({ size = 28, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5" aria-label="ATHANA">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/favicon.svg" alt="" width={size} height={size} style={{ width: size, height: size }} />
      {withWordmark && <span className="font-display text-[1.05rem] font-semibold tracking-[0.22em] text-fg" style={{ fontSize: Math.max(14, size * 0.6) }}>ATHANA</span>}
    </span>
  );
}
