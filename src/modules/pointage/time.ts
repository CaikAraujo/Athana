/**
 * Pure time computations for ATHANA Pointage (no database, no Next.js, no date library).
 * Instants are UTC `Date`s; calendar days are `YYYY-MM-DD` keys in the organization's timezone.
 * Timezone conversion relies on `Intl.DateTimeFormat` only.
 */

export type EntryType = 'CLOCK_IN' | 'CLOCK_OUT' | 'BREAK_START' | 'BREAK_END';
export type ClockState = 'OUT' | 'IN' | 'BREAK';
export type EntryLike = { type: EntryType; at: Date };

export const ENTRY_TYPES: EntryType[] = ['CLOCK_IN', 'BREAK_START', 'BREAK_END', 'CLOCK_OUT'];

// ───────────────────────────── State machine ─────────────────────────────

const TRANSITIONS: Record<ClockState, Partial<Record<EntryType, ClockState>>> = {
  OUT: { CLOCK_IN: 'IN' },
  IN: { BREAK_START: 'BREAK', CLOCK_OUT: 'OUT' },
  BREAK: { BREAK_END: 'IN' },
};

/** State an employee is in after an entry of the given type (null = no entry yet). */
export function stateAfter(type: EntryType | null | undefined): ClockState {
  if (type === 'CLOCK_IN' || type === 'BREAK_END') return 'IN';
  if (type === 'BREAK_START') return 'BREAK';
  return 'OUT';
}

export function transition(state: ClockState, action: EntryType): ClockState | null {
  return TRANSITIONS[state][action] ?? null;
}

export function nextActions(state: ClockState): EntryType[] {
  return Object.keys(TRANSITIONS[state]) as EntryType[];
}

/** Walks a chronologically sorted list of entries; fails on the first invalid transition. */
export function validateSequence(initial: ClockState, entries: { type: EntryType }[]): { ok: true; state: ClockState } | { ok: false; index: number; state: ClockState } {
  let state = initial;
  for (let i = 0; i < entries.length; i++) {
    const next = transition(state, entries[i].type);
    if (!next) return { ok: false, index: i, state };
    state = next;
  }
  return { ok: true, state };
}

// ───────────────────────────── Timezones ─────────────────────────────

const formatters = new Map<string, Intl.DateTimeFormat>();
function formatter(timeZone: string) {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    formatters.set(timeZone, f);
  }
  return f;
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

export type ZonedParts = { year: number; month: number; day: number; hour: number; minute: number; second: number };

/** Wall-clock components of an instant in a timezone. */
export function zonedParts(d: Date, timeZone: string): ZonedParts {
  const out: Record<string, number> = {};
  for (const p of formatter(timeZone).formatToParts(d)) if (p.type !== 'literal') out[p.type] = Number(p.value);
  return { year: out.year, month: out.month, day: out.day, hour: out.hour % 24, minute: out.minute, second: out.second };
}

const pad = (n: number, len = 2) => String(n).padStart(len, '0');

/** Offset (ms) to add to UTC to obtain the local wall-clock time at that instant. */
export function tzOffsetMs(d: Date, timeZone: string): number {
  const p = zonedParts(d, timeZone);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(d.getTime() / 1000) * 1000;
}

/** Local calendar day (`YYYY-MM-DD`) of an instant. */
export function localDateKey(d: Date, timeZone: string): string {
  const p = zonedParts(d, timeZone);
  return `${pad(p.year, 4)}-${pad(p.month)}-${pad(p.day)}`;
}

/** Local time of day (`HH:mm`) of an instant. */
export function localTimeKey(d: Date, timeZone: string): string {
  const p = zonedParts(d, timeZone);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

export const DATE_KEY_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
export const TIME_KEY_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** True for a real calendar date (rejects 2025-02-30). */
export function isDateKey(v: unknown): v is string {
  if (typeof v !== 'string' || !DATE_KEY_RE.test(v)) return false;
  const [y, mo, d] = v.split('-').map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}

/**
 * Local wall-clock date-time in a timezone → UTC instant.
 * - A local time that does not exist (spring-forward gap) returns null in strict mode,
 *   otherwise the instant right after the gap.
 * - An ambiguous local time (autumn fall-back) resolves to the second occurrence (standard time).
 */
export function zonedToUtc(dateKey: string, time: string, timeZone: string, strict = false): Date | null {
  const [y, mo, d] = dateKey.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi, 0);
  let candidate = wall - tzOffsetMs(new Date(wall), timeZone);
  const second = wall - tzOffsetMs(new Date(candidate), timeZone);
  if (second !== candidate) {
    // The two guesses straddle a transition: keep the one that maps back to the requested wall time.
    const p = zonedParts(new Date(second), timeZone);
    if (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) === wall) candidate = second;
  }
  const back = zonedParts(new Date(candidate), timeZone);
  if (Date.UTC(back.year, back.month - 1, back.day, back.hour, back.minute) !== wall) {
    if (strict) return null;
    // Inside a gap: take the later of the two guesses (the first valid instant side).
    candidate = Math.max(candidate, second);
  }
  return new Date(candidate);
}

/** UTC bounds [start, end) of a local calendar day. */
export function dayBounds(dateKey: string, timeZone: string): { start: Date; end: Date } {
  return { start: zonedToUtc(dateKey, '00:00', timeZone)!, end: zonedToUtc(addDays(dateKey, 1), '00:00', timeZone)! };
}

// ───────────────────────────── Calendar arithmetic on date keys ─────────────────────────────

const keyToUtc = (dateKey: string) => {
  const [y, mo, d] = dateKey.split('-').map(Number);
  return Date.UTC(y, mo - 1, d);
};
const utcToKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function addDays(dateKey: string, n: number): string {
  return utcToKey(keyToUtc(dateKey) + n * 86400_000);
}

export function diffDays(from: string, to: string): number {
  return Math.round((keyToUtc(to) - keyToUtc(from)) / 86400_000);
}

/** ISO weekday: 1 = Monday … 7 = Sunday. */
export function isoWeekday(dateKey: string): number {
  return new Date(keyToUtc(dateKey)).getUTCDay() || 7;
}

/** Monday of the ISO week containing the date. */
export function weekStart(dateKey: string): string {
  return addDays(dateKey, 1 - isoWeekday(dateKey));
}

/** ISO 8601 week key, e.g. `2025-W01` (the week belongs to the year of its Thursday). */
export function isoWeekKey(dateKey: string): string {
  const thursday = addDays(weekStart(dateKey), 3);
  const year = Number(thursday.slice(0, 4));
  const week = Math.floor(diffDays(`${pad(year, 4)}-01-01`, thursday) / 7) + 1;
  return `${pad(year, 4)}-W${pad(week)}`;
}

/** Inclusive list of date keys. */
export function dateRange(from: string, to: string): string[] {
  const out: string[] = [];
  for (let k = from; k <= to; k = addDays(k, 1)) out.push(k);
  return out;
}

/** `YYYY-MM-DD` key → Date at UTC midnight (the representation of Prisma `@db.Date` columns). */
export function dateKeyToDate(dateKey: string): Date {
  return new Date(keyToUtc(dateKey));
}
export function dateToDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Durations are shown as `7 h 45`. */
export function formatDuration(minutes: number): string {
  const sign = minutes < 0 ? '−' : '';
  const abs = Math.abs(Math.round(minutes));
  return `${sign}${Math.floor(abs / 60)} h ${pad(abs % 60)}`;
}

// ───────────────────────────── Schedules ─────────────────────────────

export type ScheduleDay = { day: number; start: string; end: string; breakMinutes: number };

const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

export function scheduleDayMinutes(d: ScheduleDay): number {
  return Math.max(0, toMinutes(d.end) - toMinutes(d.start) - d.breakMinutes);
}

export function scheduleWeeklyMinutes(days: ScheduleDay[]): number {
  return days.reduce((sum, d) => sum + scheduleDayMinutes(d), 0);
}

/** Tolerant reader for the `PtSchedule.days` Json column. */
export function parseScheduleDays(value: unknown): ScheduleDay[] {
  if (!Array.isArray(value)) return [];
  const out: ScheduleDay[] = [];
  for (const raw of value) {
    const r = raw as Partial<ScheduleDay> | null;
    if (!r || typeof r.day !== 'number' || r.day < 1 || r.day > 7) continue;
    if (typeof r.start !== 'string' || typeof r.end !== 'string' || !TIME_KEY_RE.test(r.start) || !TIME_KEY_RE.test(r.end)) continue;
    out.push({ day: r.day, start: r.start, end: r.end, breakMinutes: typeof r.breakMinutes === 'number' && r.breakMinutes > 0 ? Math.floor(r.breakMinutes) : 0 });
  }
  return out.sort((a, b) => a.day - b.day);
}

/**
 * Minutes an employee is expected to work on a date: the schedule's day when there is one,
 * otherwise the organization's daily target from Monday to Friday.
 */
export function scheduledMinutesOn(dateKey: string, schedule: ScheduleDay[] | null, dailyTargetMinutes: number): number {
  const wd = isoWeekday(dateKey);
  if (schedule) return schedule.filter((d) => d.day === wd).reduce((s, d) => s + scheduleDayMinutes(d), 0);
  return wd <= 5 ? dailyTargetMinutes : 0;
}

/** A working day is a scheduled day (or Monday–Friday without a schedule). */
export function isWorkingDay(dateKey: string, schedule: ScheduleDay[] | null): boolean {
  const wd = isoWeekday(dateKey);
  return schedule && schedule.length ? schedule.some((d) => d.day === wd) : wd <= 5;
}

export function countWorkingDays(from: string, to: string, schedule: ScheduleDay[] | null): number {
  let n = 0;
  for (let k = from; k <= to; k = addDays(k, 1)) if (isWorkingDay(k, schedule)) n++;
  return n;
}

// ───────────────────────────── Daily computation ─────────────────────────────

export type Anomaly = 'MISSING_CLOCK_OUT' | 'BREAK_NOT_ENDED' | 'EXCEEDS_MAX_DAILY' | 'INSUFFICIENT_BREAK' | 'ORPHAN_ENTRY';

export type DaySummary = {
  date: string;
  /** Worked minutes, breaks excluded. */
  workedMinutes: number;
  breakMinutes: number;
  firstIn: Date | null;
  lastOut: Date | null;
  /** A session started that day is still running (counted up to `now`). */
  open: boolean;
  anomalies: Anomaly[];
};

export type ComputeOptions = {
  /** Reference instant used to count a running session. Without it an unfinished session is an anomaly. */
  now?: Date;
  maxDailyMinutes?: number;
  minBreakMinutesAfter6h?: number;
};

/** A session left open longer than this is no longer "running": it is a forgotten clock-out. */
export const OPEN_SESSION_MAX_MS = 24 * 3600_000;

type DayAcc = { workMs: number; breakMs: number; gapMs: number; firstIn: Date | null; lastOut: Date | null; open: boolean; anomalies: Set<Anomaly>; lastSessionEnd: Date | null };

/**
 * Groups entries into sessions (CLOCK_IN … CLOCK_OUT) and totals them per local day.
 * A session is attributed entirely to the local day it STARTED on, so a night shift crossing
 * midnight counts on its first day. Durations are differences between UTC instants, which keeps
 * them exact on daylight-saving change days.
 */
export function computeDays(entries: EntryLike[], timeZone: string, opts: ComputeOptions = {}): DaySummary[] {
  const sorted = [...entries].sort((a, b) => a.at.getTime() - b.at.getTime());
  const days = new Map<string, DayAcc>();
  const day = (key: string) => {
    let d = days.get(key);
    if (!d) days.set(key, (d = { workMs: 0, breakMs: 0, gapMs: 0, firstIn: null, lastOut: null, open: false, anomalies: new Set(), lastSessionEnd: null }));
    return d;
  };
  type Session = { date: string; start: Date; workMs: number; breakMs: number; workingSince: Date | null; breakSince: Date | null; last: Date };
  let cur: Session | null = null;

  const flush = (s: Session, end: Date | null, flags: { open?: boolean; anomalies?: Anomaly[] }) => {
    const d = day(s.date);
    if (d.lastSessionEnd && s.start > d.lastSessionEnd) d.gapMs += s.start.getTime() - d.lastSessionEnd.getTime();
    d.workMs += s.workMs;
    d.breakMs += s.breakMs;
    if (!d.firstIn || s.start < d.firstIn) d.firstIn = s.start;
    if (end && (!d.lastOut || end > d.lastOut)) d.lastOut = end;
    d.lastSessionEnd = end ?? s.last;
    if (flags.open) d.open = true;
    for (const a of flags.anomalies ?? []) d.anomalies.add(a);
  };
  const closeStale = (s: Session) => flush(s, null, { anomalies: s.breakSince ? ['MISSING_CLOCK_OUT', 'BREAK_NOT_ENDED'] : ['MISSING_CLOCK_OUT'] });
  const orphan = (e: EntryLike) => day(localDateKey(e.at, timeZone)).anomalies.add('ORPHAN_ENTRY');

  for (const e of sorted) {
    const t = e.at.getTime();
    if (e.type === 'CLOCK_IN') {
      if (cur) closeStale(cur);
      cur = { date: localDateKey(e.at, timeZone), start: e.at, workMs: 0, breakMs: 0, workingSince: e.at, breakSince: null, last: e.at };
      continue;
    }
    if (!cur) { orphan(e); continue; }
    if (e.type === 'BREAK_START') {
      if (!cur.workingSince) { orphan(e); continue; }
      cur.workMs += t - cur.workingSince.getTime();
      cur.workingSince = null;
      cur.breakSince = e.at;
    } else if (e.type === 'BREAK_END') {
      if (!cur.breakSince) { orphan(e); continue; }
      cur.breakMs += t - cur.breakSince.getTime();
      cur.breakSince = null;
      cur.workingSince = e.at;
    } else {
      const anomalies: Anomaly[] = [];
      if (cur.breakSince) {
        cur.breakMs += t - cur.breakSince.getTime();
        anomalies.push('BREAK_NOT_ENDED');
      } else if (cur.workingSince) {
        cur.workMs += t - cur.workingSince.getTime();
      }
      flush(cur, e.at, { anomalies });
      cur = null;
      continue;
    }
    cur.last = e.at;
  }
  if (cur) {
    const now = opts.now;
    if (now && now >= cur.last && now.getTime() - cur.start.getTime() <= OPEN_SESSION_MAX_MS) {
      if (cur.workingSince) cur.workMs += now.getTime() - cur.workingSince.getTime();
      if (cur.breakSince) cur.breakMs += now.getTime() - cur.breakSince.getTime();
      flush(cur, null, { open: true });
    } else {
      closeStale(cur);
    }
  }

  const out: DaySummary[] = [];
  for (const [date, d] of [...days.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const workedMinutes = Math.floor(d.workMs / 60_000);
    const breakMinutes = Math.floor(d.breakMs / 60_000);
    if (opts.maxDailyMinutes && workedMinutes > opts.maxDailyMinutes) d.anomalies.add('EXCEEDS_MAX_DAILY');
    if (opts.minBreakMinutesAfter6h && !d.open && workedMinutes > 360 && Math.floor((d.breakMs + d.gapMs) / 60_000) < opts.minBreakMinutesAfter6h) d.anomalies.add('INSUFFICIENT_BREAK');
    out.push({ date, workedMinutes, breakMinutes, firstIn: d.firstIn, lastOut: d.lastOut, open: d.open, anomalies: [...d.anomalies] });
  }
  return out;
}

// ───────────────────────────── Weekly computation ─────────────────────────────

export type WeekSummary = {
  week: string;
  /** Monday of the week. */
  start: string;
  workedMinutes: number;
  scheduledMinutes: number;
  overtimeMinutes: number;
  /** worked − scheduled */
  balanceMinutes: number;
  days: DaySummary[];
};

export type WeekOptions = {
  /** Weekly threshold beyond which worked time is overtime. */
  overtimeAfterMinutes: number;
  /** Expected minutes for a date (schedule or daily target). */
  scheduledFor: (dateKey: string) => number;
  /** Only dates inside [from, to] count towards the scheduled minutes (partial weeks, future days). */
  from?: string;
  to?: string;
  /** Dates covered by an approved absence: nothing is expected on those days. */
  absentDates?: Set<string>;
};

export function computeWeeks(days: DaySummary[], opts: WeekOptions): WeekSummary[] {
  const byWeek = new Map<string, DaySummary[]>();
  for (const d of days) {
    const ws = weekStart(d.date);
    byWeek.set(ws, [...(byWeek.get(ws) ?? []), d]);
  }
  // Weeks of the requested range exist even when nothing was clocked.
  if (opts.from && opts.to) for (let ws = weekStart(opts.from); ws <= opts.to; ws = addDays(ws, 7)) if (!byWeek.has(ws)) byWeek.set(ws, []);
  const out: WeekSummary[] = [];
  for (const [start, list] of [...byWeek.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const workedMinutes = list.reduce((s, d) => s + d.workedMinutes, 0);
    let scheduledMinutes = 0;
    for (let i = 0; i < 7; i++) {
      const k = addDays(start, i);
      if ((opts.from && k < opts.from) || (opts.to && k > opts.to) || opts.absentDates?.has(k)) continue;
      scheduledMinutes += opts.scheduledFor(k);
    }
    out.push({
      week: isoWeekKey(start), start, workedMinutes, scheduledMinutes,
      overtimeMinutes: Math.max(0, workedMinutes - opts.overtimeAfterMinutes),
      balanceMinutes: workedMinutes - scheduledMinutes,
      days: list.sort((a, b) => (a.date < b.date ? -1 : 1)),
    });
  }
  return out;
}
