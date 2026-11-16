/** Pure date helpers (no server imports — usable from client components). */

function offsetMs(at: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(at);
  const p: Record<string, number> = {};
  for (const x of parts) if (x.type !== 'literal') p[x.type] = Number(x.value);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(at.getTime() / 1000) * 1000;
}

function safeZone(timeZone: string): string {
  try { new Intl.DateTimeFormat('en-US', { timeZone }); return timeZone; } catch { return 'UTC'; }
}

/** "2026-11-16T14:30" typed in a time zone → the matching UTC instant. Returns null when unparsable. */
export function zonedToUtc(naive: string, timeZone: string): Date | null {
  const mt = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(naive.trim());
  if (!mt) return null;
  const wall = Date.UTC(+mt[1], +mt[2] - 1, +mt[3], +mt[4], +mt[5], +(mt[6] ?? 0));
  if (Number.isNaN(wall)) return null;
  const tz = safeZone(timeZone);
  const first = offsetMs(new Date(wall), tz);
  let utc = new Date(wall - first);
  const second = offsetMs(utc, tz);
  if (second !== first) utc = new Date(wall - second);
  return utc;
}

/** Calendar day ("YYYY-MM-DD") of an instant in a time zone. */
export function dayKey(d: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: safeZone(timeZone), year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

/** Value for <input type="datetime-local"> in a time zone. */
export function toLocalInput(d: Date, timeZone: string): string {
  const tz = safeZone(timeZone);
  return new Date(d.getTime() + offsetMs(d, tz)).toISOString().slice(0, 16);
}

/** Value for <input type="date">. Date-only values are stored at 12:00 UTC so the day is stable in every time zone. */
export function toDateInput(d: Date | null | undefined): string {
  return d ? d.toISOString().slice(0, 10) : '';
}

/**
 * Accepted inputs: "YYYY-MM-DD" (stored at 12:00 UTC), an ISO string with offset, or a naive
 * "YYYY-MM-DDTHH:mm" which is read as UTC (actions convert it from the tenant time zone first).
 */
export function parseDateString(s: string): Date | null {
  const v = s.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    const d = new Date(`${v}T12:00:00.000Z`);
    return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v ? null : d;
  }
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(v)) return zonedToUtc(v, 'UTC');
  if (!/^\d{4}-\d{2}-\d{2}T/.test(v)) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function startOfUtcDay(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export function startOfUtcMonth(d = new Date(), shift = 0): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + shift, 1));
}
