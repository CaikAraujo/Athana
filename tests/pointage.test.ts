import { afterAll, describe, expect, it } from 'vitest';
import { randomBytes } from 'node:crypto';
import type { PtRole } from '@prisma/client';
import { addMember, createTenant, db } from './helpers';
import { loadTenantCtx, type TenantCtx } from '@/modules/tenancy/context';
import { resolveActor } from '@/modules/pointage/actor';
import {
  addDays, computeDays, computeWeeks, countWorkingDays, formatDuration, isoWeekKey, isoWeekday, localDateKey, nextActions, scheduleWeeklyMinutes,
  scheduledMinutesOn, stateAfter, transition, validateSequence, weekStart, zonedToUtc, type EntryLike, type EntryType,
} from '@/modules/pointage/time';
import {
  addManualEntries, addManualEntry, cancelAbsence, clock, createDepartment, createEmployee, createSchedule, decideAbsence, getCalendar, getClockView, getDayDetail, getEmployee,
  getTeamStatus, getTimesheet, inviteEmployee, listAudit, listEmployees, listEntries, listMyAbsences, listTeamAbsences, requestAbsence, setEmployeeActive,
  updateDepartment, updateEmployee, vacationBalance, voidEntry,
} from '@/modules/pointage/service';
import { csvCell, exportReport, getMySummary, getReport, reportToPdf, toCsv, winAnsiSafe } from '@/modules/pointage/reports';
import { applyJurisdictionPreset, getSettings, parseSettings, updateSettings, DEFAULT_SETTINGS, JURISDICTION_PRESETS } from '@/modules/pointage/settings';
import { purgeExpired, runPointageRetention } from '@/modules/pointage/retention';
import { PDFDocument, StandardFonts } from 'pdf-lib';

const uid = () => randomBytes(4).toString('hex');
const TZ = 'Europe/Zurich';
const at = (date: string, time: string, tz = TZ) => zonedToUtc(date, time, tz, true)!;
const e = (type: EntryType, date: string, time: string): EntryLike => ({ type, at: at(date, time) });
const i18n = { t: (s: string) => s, locale: 'fr-ch' as const };

/** Employee record linked to a fresh organization member. */
async function linked(organizationId: string, role: PtRole = 'EMPLOYEE', departmentId: string | null = null) {
  const { user, ctx } = await addMember(organizationId, 'MEMBER', 'pointage');
  const employee = await db.ptEmployee.create({ data: { organizationId, userId: user.id, firstName: 'Emp', lastName: uid(), role, departmentId } });
  return { user, ctx, employee };
}
const insert = (organizationId: string, employeeId: string, type: EntryType, when: Date) => db.ptTimeEntry.create({ data: { organizationId, employeeId, type, at: when } });
/** Last working day (Mon–Fri) before today. */
const yesterday = () => { let d = addDays(localDateKey(new Date(), TZ), -1); while (isoWeekday(d) > 5) d = addDays(d, -1); return d; };

// ───────────────────────────── Pure time computation ─────────────────────────────

describe('pointage · time computation (pure)', () => {
  it('state machine helpers', () => {
    expect(stateAfter(null)).toBe('OUT');
    expect(stateAfter('CLOCK_IN')).toBe('IN');
    expect(stateAfter('BREAK_START')).toBe('BREAK');
    expect(stateAfter('BREAK_END')).toBe('IN');
    expect(stateAfter('CLOCK_OUT')).toBe('OUT');
    expect(nextActions('OUT')).toEqual(['CLOCK_IN']);
    expect(nextActions('IN').sort()).toEqual(['BREAK_START', 'CLOCK_OUT']);
    expect(nextActions('BREAK')).toEqual(['BREAK_END']);
    expect(transition('OUT', 'CLOCK_OUT')).toBeNull();
    expect(validateSequence('OUT', [{ type: 'CLOCK_IN' }, { type: 'BREAK_START' }, { type: 'BREAK_END' }, { type: 'CLOCK_OUT' }])).toEqual({ ok: true, state: 'OUT' });
    expect(validateSequence('OUT', [{ type: 'CLOCK_IN' }, { type: 'CLOCK_IN' }])).toMatchObject({ ok: false, index: 1 });
  });

  it('converts local time to UTC with the right offset (winter / summer)', () => {
    expect(at('2025-01-15', '08:00').toISOString()).toBe('2025-01-15T07:00:00.000Z');
    expect(at('2025-07-15', '08:00').toISOString()).toBe('2025-07-15T06:00:00.000Z');
    expect(zonedToUtc('2025-07-15', '08:00', 'America/Sao_Paulo')!.toISOString()).toBe('2025-07-15T11:00:00.000Z');
    expect(localDateKey(new Date('2025-01-15T23:30:00Z'), TZ)).toBe('2025-01-16');
    // 02:30 does not exist on the spring-forward day
    expect(zonedToUtc('2025-03-30', '02:30', TZ, true)).toBeNull();
    expect(zonedToUtc('2025-03-30', '02:30', TZ)).toBeInstanceOf(Date);
    expect(at('2025-03-30', '01:30').toISOString()).toBe('2025-03-30T00:30:00.000Z');
    expect(at('2025-03-30', '03:30').toISOString()).toBe('2025-03-30T01:30:00.000Z');
  });

  it('calendar helpers', () => {
    expect(isoWeekday('2025-06-02')).toBe(1);
    expect(isoWeekday('2025-06-08')).toBe(7);
    expect(weekStart('2025-06-05')).toBe('2025-06-02');
    expect(isoWeekKey('2024-12-30')).toBe('2025-W01');
    expect(isoWeekKey('2021-01-03')).toBe('2020-W53');
    expect(countWorkingDays('2025-06-02', '2025-06-08', null)).toBe(5);
    expect(countWorkingDays('2025-06-02', '2025-06-08', [{ day: 1, start: '08:00', end: '12:00', breakMinutes: 0 }, { day: 6, start: '08:00', end: '12:00', breakMinutes: 0 }])).toBe(2);
    expect(formatDuration(465)).toBe('7 h 45');
    expect(formatDuration(5)).toBe('0 h 05');
    expect(scheduleWeeklyMinutes([{ day: 1, start: '08:00', end: '17:00', breakMinutes: 60 }, { day: 2, start: '08:00', end: '12:00', breakMinutes: 0 }])).toBe(720);
    expect(scheduledMinutesOn('2025-06-07', null, 480)).toBe(0);
    expect(scheduledMinutesOn('2025-06-06', null, 480)).toBe(480);
  });

  it('excludes breaks from worked time', () => {
    const [day] = computeDays([e('CLOCK_IN', '2025-06-02', '08:00'), e('BREAK_START', '2025-06-02', '12:00'), e('BREAK_END', '2025-06-02', '12:45'), e('CLOCK_OUT', '2025-06-02', '17:00')], TZ);
    expect(day).toMatchObject({ date: '2025-06-02', workedMinutes: 495, breakMinutes: 45, open: false, anomalies: [] });
    expect(day.firstIn).toEqual(at('2025-06-02', '08:00'));
    expect(day.lastOut).toEqual(at('2025-06-02', '17:00'));
  });

  it('adds up several sessions of the same day and ignores input order', () => {
    const [day] = computeDays([e('CLOCK_OUT', '2025-06-02', '18:00'), e('CLOCK_IN', '2025-06-02', '13:00'), e('CLOCK_OUT', '2025-06-02', '12:00'), e('CLOCK_IN', '2025-06-02', '08:00')], TZ, { minBreakMinutesAfter6h: 30 });
    expect(day.workedMinutes).toBe(540);
    // the lunch gap between two sessions counts as rest
    expect(day.anomalies).toEqual([]);
  });

  it('counts an open session up to "now" and flags it as open', () => {
    const [day] = computeDays([e('CLOCK_IN', '2025-06-02', '08:00'), e('BREAK_START', '2025-06-02', '10:00'), e('BREAK_END', '2025-06-02', '10:15')], TZ, { now: at('2025-06-02', '11:15') });
    expect(day).toMatchObject({ workedMinutes: 180, breakMinutes: 15, open: true, lastOut: null, anomalies: [] });
    const [onBreak] = computeDays([e('CLOCK_IN', '2025-06-02', '08:00'), e('BREAK_START', '2025-06-02', '10:00')], TZ, { now: at('2025-06-02', '10:20') });
    expect(onBreak).toMatchObject({ workedMinutes: 120, breakMinutes: 20, open: true });
  });

  it('reports anomalies: missing clock-out, break not ended, max daily, insufficient break', () => {
    const [forgotten] = computeDays([e('CLOCK_IN', '2025-06-02', '08:00')], TZ, { now: at('2025-06-05', '09:00') });
    expect(forgotten).toMatchObject({ open: false, workedMinutes: 0, anomalies: ['MISSING_CLOCK_OUT'] });
    const [breakOpen] = computeDays([e('CLOCK_IN', '2025-06-02', '08:00'), e('BREAK_START', '2025-06-02', '12:00')], TZ);
    expect(breakOpen.workedMinutes).toBe(240);
    expect(breakOpen.anomalies.sort()).toEqual(['BREAK_NOT_ENDED', 'MISSING_CLOCK_OUT']);
    const [long] = computeDays([e('CLOCK_IN', '2025-06-02', '06:00'), e('CLOCK_OUT', '2025-06-02', '19:00')], TZ, { maxDailyMinutes: 600, minBreakMinutesAfter6h: 30 });
    expect(long.anomalies.sort()).toEqual(['EXCEEDS_MAX_DAILY', 'INSUFFICIENT_BREAK']);
    const [orphan] = computeDays([e('CLOCK_OUT', '2025-06-02', '17:00')], TZ);
    expect(orphan.anomalies).toEqual(['ORPHAN_ENTRY']);
  });

  it('attributes a shift crossing midnight to the day it started', () => {
    const days = computeDays([e('CLOCK_IN', '2025-06-02', '22:00'), e('BREAK_START', '2025-06-03', '01:00'), e('BREAK_END', '2025-06-03', '01:30'), e('CLOCK_OUT', '2025-06-03', '06:00')], TZ);
    expect(days).toHaveLength(1);
    expect(days[0]).toMatchObject({ date: '2025-06-02', workedMinutes: 450, breakMinutes: 30 });
  });

  it('is exact on DST change days in Europe/Zurich', () => {
    // Spring forward (30 March 2025): 01:00 → 04:00 on the wall clock is only 2 real hours.
    const [spring] = computeDays([e('CLOCK_IN', '2025-03-30', '01:00'), e('CLOCK_OUT', '2025-03-30', '04:00')], TZ);
    expect(spring).toMatchObject({ date: '2025-03-30', workedMinutes: 120 });
    // Fall back (26 October 2025): 01:00 → 04:00 on the wall clock is 4 real hours.
    const [autumn] = computeDays([e('CLOCK_IN', '2025-10-26', '01:00'), e('CLOCK_OUT', '2025-10-26', '04:00')], TZ);
    expect(autumn).toMatchObject({ date: '2025-10-26', workedMinutes: 240 });
    // A night shift over the change stays on its starting day, with the real duration.
    const [night] = computeDays([e('CLOCK_IN', '2025-03-29', '22:00'), e('CLOCK_OUT', '2025-03-30', '06:00')], TZ);
    expect(night).toMatchObject({ date: '2025-03-29', workedMinutes: 420 });
    // An ordinary day is 8 h whatever the offset.
    const [plain] = computeDays([e('CLOCK_IN', '2025-03-31', '08:00'), e('CLOCK_OUT', '2025-03-31', '16:00')], TZ);
    expect(plain.workedMinutes).toBe(480);
  });

  it('computes weekly totals, overtime and balance', () => {
    const entries: EntryLike[] = [];
    for (const d of ['2025-06-02', '2025-06-03', '2025-06-04', '2025-06-05', '2025-06-06']) entries.push(e('CLOCK_IN', d, '08:00'), e('CLOCK_OUT', d, '17:00')); // 5 × 9 h = 45 h
    entries.push(e('CLOCK_IN', '2025-06-09', '08:00'), e('CLOCK_OUT', '2025-06-09', '12:00')); // next week: 4 h
    const weeks = computeWeeks(computeDays(entries, TZ), { overtimeAfterMinutes: 2400, scheduledFor: (k) => scheduledMinutesOn(k, null, 480), from: '2025-06-02', to: '2025-06-15', absentDates: new Set(['2025-06-10']) });
    expect(weeks).toHaveLength(2);
    expect(weeks[0]).toMatchObject({ week: '2025-W23', start: '2025-06-02', workedMinutes: 2700, scheduledMinutes: 2400, overtimeMinutes: 300, balanceMinutes: 300 });
    // second week: 4 scheduled days (one approved absence) = 32 h expected, 4 h worked
    expect(weeks[1]).toMatchObject({ week: '2025-W24', workedMinutes: 240, scheduledMinutes: 1920, overtimeMinutes: 0, balanceMinutes: -1680 });
    // a schedule's weekly minutes is the overtime threshold of a part-time employee
    const partTime = computeWeeks(computeDays(entries, TZ), { overtimeAfterMinutes: 1200, scheduledFor: () => 240 });
    expect(partTime[0].overtimeMinutes).toBe(1500);
  });
});

describe('pointage · settings and export helpers (pure)', () => {
  it('parses settings with typed defaults and never enables geolocation / biometrics', () => {
    expect(parseSettings({})).toEqual(DEFAULT_SETTINGS);
    const parsed = parseSettings({ pointage: { jurisdiction: 'CH', retentionMonths: 60, dailyTargetMinutes: 'x', geolocation: true, biometrics: true, allowManualCorrections: false } });
    expect(parsed).toMatchObject({ jurisdiction: 'CH', retentionMonths: 60, dailyTargetMinutes: DEFAULT_SETTINGS.dailyTargetMinutes, geolocation: false, biometrics: false, allowManualCorrections: false });
  });

  it('escapes CSV cells and neutralises formulas', () => {
    expect(csvCell('=SUM(A1:A2)')).toBe("'=SUM(A1:A2)");
    expect(csvCell('+41 79')).toBe("'+41 79");
    expect(csvCell('-cmd')).toBe("'-cmd");
    expect(csvCell('@x')).toBe("'@x");
    expect(csvCell('a;b')).toBe('"a;b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('line\nbreak')).toBe('"line\nbreak"');
    expect(csvCell(-90)).toBe('-90');
    expect(csvCell(null)).toBe('');
    const csv = toCsv([['Nom', 'Durée'], ['Zoé', 5]]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('Nom;Durée\r\nZoé;5\r\n');
  });

  it('sanitises text for the standard PDF font and renders a report without throwing', async () => {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    expect(winAnsiSafe('Zoé Müller', font)).toBe('Zoé Müller');
    expect(winAnsiSafe('Ştefan 日本 😀 →', font)).toBe('Stefan ?? ? ->');
    expect(() => font.widthOfTextAtSize(winAnsiSafe('Ştefan Țuțu Ωmega  \u0000', font), 10)).not.toThrow();
    const days = computeDays([e('CLOCK_IN', '2025-06-02', '08:00'), e('CLOCK_OUT', '2025-06-02', '17:00')], TZ);
    const rows = Array.from({ length: 12 }, (_, i) => ({
      employee: { id: String(i), name: `Łukasz Żółć 日本 ${i}`, department: 'Atelier → Nord' }, daysWorked: 1, workedMinutes: 540, scheduledMinutes: 480, overtimeMinutes: 60, balanceMinutes: 60,
      absences: { VACATION: 2, SICK: 0, UNPAID: 0, OTHER: 0 }, anomalies: [], days: Array.from({ length: 12 }, () => days[0]),
    }));
    const bytes = await reportToPdf({ organization: 'Société “Ünï” 株式会社', timezone: TZ, from: '2025-06-01', to: '2025-06-30', rows, totals: { daysWorked: 12, workedMinutes: 6480, overtimeMinutes: 720, anomalies: 0 } }, i18n);
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe('%PDF-');
    expect((await PDFDocument.load(bytes)).getPageCount()).toBeGreaterThan(1);
  });
});

// ───────────────────────────── Clocking ─────────────────────────────

describe('pointage · clocking', () => {
  it('accepts the valid sequence, uses the server time and rejects every invalid transition', async () => {
    const { org } = await createTenant('pointage', 'BUSINESS');
    const { ctx, employee } = await linked(org.id);
    const rejects = async (action: EntryType) => expect(clock(ctx, action)).rejects.toMatchObject({ code: 'conflict' });
    const count = () => db.ptTimeEntry.count({ where: { employeeId: employee.id } });

    // OUT: only CLOCK_IN is valid
    await rejects('CLOCK_OUT'); await rejects('BREAK_START'); await rejects('BREAK_END');
    const before = Date.now();
    const first = await clock(ctx, 'CLOCK_IN', { source: 'mobile' });
    expect(first.at.getTime()).toBeGreaterThanOrEqual(before - 1000);
    expect(first.at.getTime()).toBeLessThanOrEqual(Date.now() + 1000);
    expect(first).toMatchObject({ organizationId: org.id, employeeId: employee.id, type: 'CLOCK_IN', source: 'mobile', voidedAt: null });
    // there is no way to pass a time: extra arguments / options are ignored
    const sneaky = await (clock as unknown as (...args: unknown[]) => Promise<{ at: Date; source: string }>)(ctx, 'BREAK_START', { at: new Date('2020-01-01T00:00:00Z'), source: 'evil', employeeId: 'x' }, new Date('2020-01-01T00:00:00Z'));
    expect(Math.abs(sneaky.at.getTime() - Date.now())).toBeLessThan(5000);
    expect(sneaky.source).toBe('web');
    expect(clock.length).toBeLessThanOrEqual(3);
    // BREAK: only BREAK_END is valid
    await rejects('CLOCK_IN'); await rejects('CLOCK_OUT'); await rejects('BREAK_START');
    await clock(ctx, 'BREAK_END');
    // IN: CLOCK_IN and BREAK_END are invalid
    await rejects('CLOCK_IN'); await rejects('BREAK_END');
    await clock(ctx, 'CLOCK_OUT');
    await rejects('CLOCK_OUT');
    expect(await count()).toBe(4);
    await expect(clock(ctx, 'NOPE' as EntryType)).rejects.toBeTruthy();
    expect(await db.auditLog.count({ where: { organizationId: org.id, action: 'pointage.clock' } })).toBe(4);

    const view = await getClockView(ctx);
    expect(view).toMatchObject({ state: 'OUT', actions: ['CLOCK_IN'] });
    expect(view!.entries).toHaveLength(4);
  });

  it('rejects an identical action within 60 seconds as a duplicate', async () => {
    const { org } = await createTenant('pointage', 'STARTER');
    const { ctx, employee } = await linked(org.id);
    // A full cycle a few seconds ago: state is OUT again, so CLOCK_IN is a valid transition…
    await insert(org.id, employee.id, 'CLOCK_IN', new Date(Date.now() - 20_000));
    await insert(org.id, employee.id, 'CLOCK_OUT', new Date(Date.now() - 10_000));
    // …but the same action 20 s earlier makes it a duplicate.
    await expect(clock(ctx, 'CLOCK_IN')).rejects.toMatchObject({ code: 'conflict', message: 'Ce pointage vient déjà d’être enregistré.' });
    await db.ptTimeEntry.updateMany({ where: { employeeId: employee.id }, data: { at: new Date(Date.now() - 120_000) } });
    await expect(clock(ctx, 'CLOCK_IN')).resolves.toMatchObject({ type: 'CLOCK_IN' });
    await expect(clock(ctx, 'CLOCK_IN')).rejects.toMatchObject({ code: 'conflict' });
  });

  it('two concurrent clock calls produce exactly one entry', async () => {
    const { org } = await createTenant('pointage', 'STARTER');
    const { ctx, employee } = await linked(org.id);
    const results = await Promise.allSettled([clock(ctx, 'CLOCK_IN'), clock(ctx, 'CLOCK_IN'), clock(ctx, 'CLOCK_IN')]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(await db.ptTimeEntry.count({ where: { employeeId: employee.id } })).toBe(1);
    // different actions racing: the state machine still yields a valid sequence
    await db.ptTimeEntry.updateMany({ where: { employeeId: employee.id }, data: { at: new Date(Date.now() - 3600_000) } });
    const race = await Promise.allSettled([clock(ctx, 'CLOCK_OUT'), clock(ctx, 'BREAK_START'), clock(ctx, 'CLOCK_OUT')]);
    expect(race.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const all = await db.ptTimeEntry.findMany({ where: { employeeId: employee.id }, orderBy: [{ at: 'asc' }, { createdAt: 'asc' }] });
    expect(validateSequence('OUT', all).ok).toBe(true);
  });

  it('requires a linked, active employee record', async () => {
    const { org, ctx: owner } = await createTenant('pointage', 'STARTER');
    const { ctx: unlinked } = await addMember(org.id, 'MEMBER', 'pointage');
    expect(await resolveActor(unlinked)).toMatchObject({ role: 'NONE', employee: null });
    await expect(clock(unlinked, 'CLOCK_IN')).rejects.toMatchObject({ code: 'forbidden' });
    await expect(clock(owner, 'CLOCK_IN')).rejects.toMatchObject({ code: 'forbidden' }); // owner without employee record
    expect(await getClockView(owner)).toBeNull();
    const { ctx, employee } = await linked(org.id);
    await db.ptEmployee.update({ where: { id: employee.id }, data: { active: false } });
    await expect(clock(ctx, 'CLOCK_IN')).rejects.toMatchObject({ code: 'forbidden' });
    expect(await db.ptTimeEntry.count({ where: { organizationId: org.id } })).toBe(0);
  });
});

// ───────────────────────────── Roles ─────────────────────────────

async function company(plan: 'STARTER' | 'BUSINESS' | 'PRO' = 'BUSINESS') {
  const { org, ctx: admin, user } = await createTenant('pointage', plan);
  const d1 = await db.ptDepartment.create({ data: { organizationId: org.id, name: `Atelier ${uid()}` } });
  const d2 = await db.ptDepartment.create({ data: { organizationId: org.id, name: `Bureau ${uid()}` } });
  const manager = await linked(org.id, 'MANAGER', d1.id);
  await db.ptDepartment.update({ where: { id: d1.id }, data: { managerId: manager.employee.id } });
  const e1 = await linked(org.id, 'EMPLOYEE', d1.id);
  const e2 = await linked(org.id, 'EMPLOYEE', d2.id);
  return { org, admin, adminUser: user, d1, d2, manager, e1, e2 };
}

describe('pointage · roles', () => {
  it('resolves the effective role', async () => {
    const c = await company();
    expect(await resolveActor(c.admin)).toMatchObject({ role: 'ADMIN', employee: null });
    expect(await resolveActor(c.manager.ctx)).toMatchObject({ role: 'MANAGER', managedDepartmentIds: [c.d1.id] });
    expect(await resolveActor(c.e1.ctx)).toMatchObject({ role: 'EMPLOYEE', managedDepartmentIds: [] });
    const ptAdmin = await linked(c.org.id, 'ADMIN');
    expect((await resolveActor(ptAdmin.ctx)).role).toBe('ADMIN');
    const orgManager = await addMember(c.org.id, 'MANAGER', 'pointage');
    expect(await resolveActor(orgManager.ctx)).toMatchObject({ role: 'MANAGER', managedDepartmentIds: [] });
    expect(await listEmployees(orgManager.ctx)).toEqual([]);
  });

  it('an employee only sees and does their own things', async () => {
    const c = await company();
    const day = yesterday();
    await insert(c.org.id, c.e1.employee.id, 'CLOCK_IN', at(day, '08:00'));
    await insert(c.org.id, c.e1.employee.id, 'CLOCK_OUT', at(day, '16:00'));
    const other = await insert(c.org.id, c.e2.employee.id, 'CLOCK_IN', at(day, '09:00'));
    const ctx = c.e1.ctx;
    const range = { from: addDays(day, -6), to: day };

    const own = await getTimesheet(ctx, range);
    expect(own.employee.id).toBe(c.e1.employee.id);
    expect(own.days).toHaveLength(1);
    expect(own.days[0].workedMinutes).toBe(480);
    await expect(getTimesheet(ctx, { ...range, employeeId: c.e2.employee.id })).rejects.toMatchObject({ code: 'forbidden' });
    await expect(getEmployee(ctx, c.e2.employee.id)).rejects.toMatchObject({ code: 'forbidden' });
    await expect(getDayDetail(ctx, c.e2.employee.id, day)).rejects.toMatchObject({ code: 'forbidden' });
    await expect(listEmployees(ctx)).rejects.toMatchObject({ code: 'forbidden' });
    await expect(getTeamStatus(ctx)).rejects.toMatchObject({ code: 'forbidden' });
    await expect(listTeamAbsences(ctx)).rejects.toMatchObject({ code: 'forbidden' });
    await expect(listEntries(ctx, { employeeId: c.e2.employee.id })).rejects.toMatchObject({ code: 'forbidden' });
    const entries = await listEntries(ctx);
    expect(entries.total).toBe(2);
    expect(entries.items.every((x) => x.employeeId === c.e1.employee.id)).toBe(true);
    // corrections are refused, on their own entries as well as on others'
    await expect(addManualEntry(ctx, { employeeId: c.e1.employee.id, type: 'CLOCK_IN', date: day, time: '18:00', reason: 'oubli' })).rejects.toMatchObject({ code: 'forbidden' });
    await expect(voidEntry(ctx, { entryId: other.id, reason: 'test' })).rejects.toMatchObject({ code: 'forbidden' });
    // management
    await expect(createEmployee(ctx, { firstName: 'A', lastName: 'B' })).rejects.toMatchObject({ code: 'forbidden' });
    await expect(updateEmployee(ctx, c.e1.employee.id, { firstName: 'A', lastName: 'B', role: 'ADMIN' })).rejects.toMatchObject({ code: 'forbidden' });
    await expect(updateSettings(ctx, { ...DEFAULT_SETTINGS, timezone: 'UTC' })).rejects.toMatchObject({ code: 'forbidden' });
    await expect(listAudit(ctx)).rejects.toMatchObject({ code: 'forbidden' });
    // report: only their own row, whatever is asked
    const report = await getReport(ctx, { ...range, employeeId: c.e2.employee.id });
    expect(report.rows.map((r) => r.employee.id)).toEqual([c.e1.employee.id]);
    const cal = await getCalendar(ctx, { month: day.slice(0, 7) });
    expect(cal.employees.map((x) => x.id)).toEqual([c.e1.employee.id]);
    await expect(getCalendar(ctx, { employeeId: c.e2.employee.id })).rejects.toMatchObject({ code: 'forbidden' });
  });

  it('a manager is limited to the departments they manage', async () => {
    const c = await company();
    const day = yesterday();
    const ctx = c.manager.ctx;
    await insert(c.org.id, c.e1.employee.id, 'CLOCK_IN', at(day, '08:00'));
    const foreign = await insert(c.org.id, c.e2.employee.id, 'CLOCK_IN', at(day, '08:00'));

    expect((await listEmployees(ctx)).map((x) => x.id).sort()).toEqual([c.manager.employee.id, c.e1.employee.id].sort());
    expect((await getTeamStatus(ctx)).members.map((x) => x.employee.id).sort()).toEqual([c.manager.employee.id, c.e1.employee.id].sort());
    await expect(getTimesheet(ctx, { from: day, to: day, employeeId: c.e1.employee.id })).resolves.toBeTruthy();
    await expect(getTimesheet(ctx, { from: day, to: day, employeeId: c.e2.employee.id })).rejects.toMatchObject({ code: 'forbidden' });
    // corrections: own team yes, other department no, themselves no
    await expect(addManualEntry(ctx, { employeeId: c.e1.employee.id, type: 'CLOCK_OUT', date: day, time: '17:00', reason: 'Oubli de sortie' })).resolves.toMatchObject({ source: 'manual' });
    await expect(addManualEntry(ctx, { employeeId: c.e2.employee.id, type: 'CLOCK_OUT', date: day, time: '17:00', reason: 'Oubli de sortie' })).rejects.toMatchObject({ code: 'forbidden' });
    await expect(voidEntry(ctx, { entryId: foreign.id, reason: 'Erreur' })).rejects.toMatchObject({ code: 'forbidden' });
    await expect(addManualEntry(ctx, { employeeId: c.manager.employee.id, type: 'CLOCK_IN', date: day, time: '08:00', reason: 'Pour moi' })).rejects.toMatchObject({ code: 'forbidden' });
    // report scope
    const report = await getReport(ctx, { from: day, to: day });
    expect(report.rows.map((r) => r.employee.id).sort()).toEqual([c.manager.employee.id, c.e1.employee.id].sort());
    await expect(getReport(ctx, { from: day, to: day, employeeId: c.e2.employee.id })).rejects.toMatchObject({ code: 'forbidden' });
    await expect(getReport(ctx, { from: day, to: day, departmentId: c.d2.id })).rejects.toMatchObject({ code: 'not_found' });
    // no settings, no employee management, no audit trail
    await expect(updateSettings(ctx, { ...DEFAULT_SETTINGS, timezone: 'UTC' })).rejects.toMatchObject({ code: 'forbidden' });
    await expect(applyJurisdictionPreset(ctx, 'CH')).rejects.toMatchObject({ code: 'forbidden' });
    await expect(createEmployee(ctx, { firstName: 'A', lastName: 'B' })).rejects.toMatchObject({ code: 'forbidden' });
    await expect(setEmployeeActive(ctx, c.e1.employee.id, false)).rejects.toMatchObject({ code: 'forbidden' });
    await expect(createDepartment(ctx, { name: 'X dept' })).rejects.toMatchObject({ code: 'forbidden' });
    await expect(listAudit(ctx)).rejects.toMatchObject({ code: 'forbidden' });
  });

  it('an admin has full access', async () => {
    const c = await company('PRO');
    const day = yesterday();
    expect(await listEmployees(c.admin)).toHaveLength(3);
    await expect(addManualEntry(c.admin, { employeeId: c.e2.employee.id, type: 'CLOCK_IN', date: day, time: '08:00', reason: 'Saisie admin' })).resolves.toBeTruthy();
    await expect(getTimesheet(c.admin, { from: day, to: day, employeeId: c.e2.employee.id })).resolves.toBeTruthy();
    expect((await getReport(c.admin, { from: day, to: day })).rows).toHaveLength(3);
    expect((await listAudit(c.admin, { scope: 'corrections' })).total).toBe(1);
    const status = await getTeamStatus(c.admin);
    expect(status.members).toHaveLength(3);
    expect(status.members.find((x) => x.employee.id === c.e2.employee.id)).toMatchObject({ status: 'IN' });
    // department & schedule management
    const schedule = await createSchedule(c.admin, { name: 'Temps partiel', days: [{ day: 1, start: '08:00', end: '12:00', breakMinutes: 0 }, { day: 2, start: '08:00', end: '17:00', breakMinutes: 60 }] });
    expect(schedule.weeklyMinutes).toBe(720);
    await expect(createSchedule(c.admin, { name: 'Faux', days: [{ day: 1, start: '12:00', end: '08:00', breakMinutes: 0 }] })).rejects.toMatchObject({ code: 'invalid' });
    await updateEmployee(c.admin, c.e2.employee.id, { firstName: 'Eve', lastName: 'Deux', scheduleId: schedule.id, departmentId: c.d2.id, role: 'EMPLOYEE', vacationDays: 25 });
    expect(await db.ptEmployee.findUnique({ where: { id: c.e2.employee.id } })).toMatchObject({ firstName: 'Eve', scheduleId: schedule.id, vacationDays: 25 });
    // naming a manager promotes them; demoting removes the department
    await updateDepartment(c.admin, c.d2.id, { name: c.d2.name, managerId: c.e2.employee.id });
    expect((await resolveActor(c.e2.ctx))).toMatchObject({ role: 'MANAGER', managedDepartmentIds: [c.d2.id] });
    await updateEmployee(c.admin, c.e2.employee.id, { firstName: 'Eve', lastName: 'Deux', role: 'EMPLOYEE', departmentId: c.d2.id });
    expect((await resolveActor(c.e2.ctx))).toMatchObject({ role: 'EMPLOYEE', managedDepartmentIds: [] });
  });

  it('settings: admin only, validated timezone, geolocation and biometrics stay off', async () => {
    const c = await company();
    await expect(updateSettings(c.admin, { ...DEFAULT_SETTINGS, timezone: 'Mars/Olympus' })).rejects.toBeTruthy();
    await updateSettings(c.admin, { ...DEFAULT_SETTINGS, jurisdiction: 'FR', timezone: 'Europe/Paris', retentionMonths: 36, geolocation: true, biometrics: true } as never);
    await db.organization.update({ where: { id: c.org.id }, data: { settings: { ...(await db.organization.findUniqueOrThrow({ where: { id: c.org.id } })).settings as object, crm: { keep: true } } } });
    await applyJurisdictionPreset(c.admin, 'CH');
    const s = await getSettings(c.e1.ctx);
    expect(s.timezone).toBe('Europe/Paris');
    expect(s.settings).toMatchObject({ jurisdiction: 'CH', ...JURISDICTION_PRESETS.CH, geolocation: false, biometrics: false });
    const raw = (await db.organization.findUniqueOrThrow({ where: { id: c.org.id } })).settings as { crm: unknown; pointage: { geolocation: boolean; biometrics: boolean } };
    expect(raw.crm).toEqual({ keep: true }); // other products' settings are preserved
    expect(raw.pointage).toMatchObject({ geolocation: false, biometrics: false });
  });
});

// ───────────────────────────── Corrections ─────────────────────────────

describe('pointage · corrections', () => {
  it('converts local date-time, keeps the day consistent, voids instead of deleting and audits everything', async () => {
    const c = await company();
    const day = yesterday();
    const ctx = c.manager.ctx;
    const emp = c.e1.employee.id;
    const cin = await insert(c.org.id, emp, 'CLOCK_IN', at(day, '08:00'));

    // mandatory reason
    await expect(addManualEntry(ctx, { employeeId: emp, type: 'CLOCK_OUT', date: day, time: '17:00', reason: ' ' })).rejects.toBeTruthy();
    // inconsistent sequences are refused
    await expect(addManualEntry(ctx, { employeeId: emp, type: 'BREAK_END', date: day, time: '12:00', reason: 'Pause oubliée' })).rejects.toMatchObject({ code: 'conflict' });
    await expect(addManualEntry(ctx, { employeeId: emp, type: 'CLOCK_IN', date: day, time: '09:00', reason: 'Doublon' })).rejects.toMatchObject({ code: 'conflict' });
    await expect(addManualEntry(ctx, { employeeId: emp, type: 'CLOCK_OUT', date: day, time: '07:00', reason: 'Avant entrée' })).rejects.toMatchObject({ code: 'conflict' });
    // no entry in the future
    await expect(addManualEntry(ctx, { employeeId: emp, type: 'CLOCK_OUT', date: addDays(day, 3), time: '17:00', reason: 'Futur' })).rejects.toMatchObject({ code: 'invalid' });

    const out = await addManualEntry(ctx, { employeeId: emp, type: 'CLOCK_OUT', date: day, time: '17:00', reason: 'Oubli de sortie' });
    expect(out.at.toISOString()).toBe(at(day, '17:00').toISOString());
    expect(out).toMatchObject({ source: 'manual', note: 'Oubli de sortie', createdById: c.manager.user.id, organizationId: c.org.id });
    const added = await db.auditLog.findFirstOrThrow({ where: { organizationId: c.org.id, action: 'pointage.entry.added', entityId: out.id } });
    expect(added.actorId).toBe(c.manager.user.id);
    expect(added.meta).toMatchObject({ employeeId: emp, reason: 'Oubli de sortie', before: [{ id: cin.id, type: 'CLOCK_IN' }], after: [{ id: cin.id }, { id: out.id, type: 'CLOCK_OUT' }] });

    // a break inside the day is fine
    await expect(addManualEntry(ctx, { employeeId: emp, type: 'BREAK_START', date: day, time: '12:00', reason: 'Pause oubliée' })).rejects.toMatchObject({ code: 'conflict' });
    const [bs] = await addManualEntries(ctx, { employeeId: emp, date: day, reason: 'Pause oubliée', entries: [{ type: 'BREAK_START', time: '12:00' }, { type: 'BREAK_END', time: '12:30' }] });
    expect((await getTimesheet(ctx, { from: day, to: day, employeeId: emp })).days[0]).toMatchObject({ workedMinutes: 510, breakMinutes: 30 });

    // voiding: reason mandatory, sequence must stay valid, row is kept
    await expect(voidEntry(ctx, { entryId: out.id, reason: '' })).rejects.toBeTruthy();
    await expect(voidEntry(ctx, { entryId: bs.id, reason: 'Erreur de saisie' })).rejects.toMatchObject({ code: 'conflict' });
    await expect(voidEntry(ctx, { entryId: cin.id, reason: 'Erreur de saisie' })).rejects.toMatchObject({ code: 'conflict' });
    const total = await db.ptTimeEntry.count({ where: { employeeId: emp } });
    await voidEntry(ctx, { entryId: out.id, reason: 'Mauvaise heure' });
    expect(await db.ptTimeEntry.count({ where: { employeeId: emp } })).toBe(total);
    const voided = await db.ptTimeEntry.findUniqueOrThrow({ where: { id: out.id } });
    expect(voided.voidedAt).toBeInstanceOf(Date);
    expect(voided.voidedById).toBe(c.manager.user.id);
    expect(voided.at.toISOString()).toBe(out.at.toISOString()); // never edited in place
    const audited = await db.auditLog.findFirstOrThrow({ where: { organizationId: c.org.id, action: 'pointage.entry.voided', entityId: out.id } });
    expect(audited.meta).toMatchObject({ reason: 'Mauvaise heure', voided: { type: 'CLOCK_OUT' } });
    expect((audited.meta as { before: unknown[]; after: unknown[] }).before).toHaveLength(4);
    expect((audited.meta as { before: unknown[]; after: unknown[] }).after).toHaveLength(3);
    await expect(voidEntry(ctx, { entryId: out.id, reason: 'Encore' })).rejects.toMatchObject({ code: 'conflict' });
    // void + re-create is how a time is corrected
    await addManualEntry(ctx, { employeeId: emp, type: 'CLOCK_OUT', date: day, time: '16:30', reason: 'Heure corrigée' });
    const detail = await getDayDetail(ctx, emp, day);
    expect(detail.entries).toHaveLength(5);
    expect(detail.entries.filter((x) => x.voidedAt)).toHaveLength(1);
    expect(detail.summary).toMatchObject({ workedMinutes: 480, anomalies: [] });
    expect(detail.canCorrect).toBe(true);
    expect((await listEntries(ctx, { employeeId: emp })).total).toBe(4);
    expect((await listEntries(ctx, { employeeId: emp, includeVoided: true })).total).toBe(5);
    expect(await db.auditLog.count({ where: { organizationId: c.org.id, action: { in: ['pointage.entry.added', 'pointage.entry.voided'] } } })).toBe(5);
  });

  it('handles DST when converting a manual entry and refuses a non-existent local time', async () => {
    const c = await company();
    const emp = c.e1.employee.id;
    await expect(addManualEntry(c.admin, { employeeId: emp, type: 'CLOCK_IN', date: '2025-03-30', time: '02:30', reason: 'Heure inexistante' })).rejects.toMatchObject({ code: 'invalid' });
    const winter = await addManualEntry(c.admin, { employeeId: emp, type: 'CLOCK_IN', date: '2025-03-29', time: '22:00', reason: 'Nuit du changement' });
    const summer = await addManualEntry(c.admin, { employeeId: emp, type: 'CLOCK_OUT', date: '2025-03-30', time: '06:00', reason: 'Nuit du changement' });
    expect(winter.at.toISOString()).toBe('2025-03-29T21:00:00.000Z');
    expect(summer.at.toISOString()).toBe('2025-03-30T04:00:00.000Z');
    const sheet = await getTimesheet(c.admin, { from: '2025-03-24', to: '2025-03-30', employeeId: emp });
    expect(sheet.days).toHaveLength(1);
    expect(sheet.days[0]).toMatchObject({ date: '2025-03-29', workedMinutes: 420 });
  });

  it('can be disabled in the settings', async () => {
    const c = await company();
    const entry = await insert(c.org.id, c.e1.employee.id, 'CLOCK_IN', at(yesterday(), '08:00'));
    await updateSettings(c.admin, { ...DEFAULT_SETTINGS, timezone: TZ, allowManualCorrections: false });
    await expect(addManualEntry(c.admin, { employeeId: c.e1.employee.id, type: 'CLOCK_OUT', date: yesterday(), time: '17:00', reason: 'Oubli' })).rejects.toMatchObject({ code: 'forbidden' });
    await expect(voidEntry(c.manager.ctx, { entryId: entry.id, reason: 'Erreur' })).rejects.toMatchObject({ code: 'forbidden' });
  });
});

// ───────────────────────────── Tenant isolation ─────────────────────────────

describe('pointage · two independent companies', () => {
  it('tenant A cannot list, read, correct, approve or export anything of tenant B', async () => {
    const a = await company('PRO');
    const b = await company('PRO');
    const day = yesterday();
    const bEmp = b.e1.employee.id;
    const bEntry = await insert(b.org.id, bEmp, 'CLOCK_IN', at(day, '08:00'));
    await insert(a.org.id, a.e1.employee.id, 'CLOCK_IN', at(day, '08:00'));
    const bAbsence = await requestAbsence(b.e1.ctx, { type: 'SICK', startDate: day, endDate: day });
    const bSchedule = await createSchedule(b.admin, { name: 'Horaire B', days: [{ day: 1, start: '08:00', end: '12:00', breakMinutes: 0 }] });
    const range = { from: addDays(day, -3), to: day };

    for (const ctx of [a.admin, a.manager.ctx, a.e1.ctx]) {
      await expect(getEmployee(ctx, bEmp)).rejects.toMatchObject({ code: 'not_found' });
      await expect(getTimesheet(ctx, { ...range, employeeId: bEmp })).rejects.toMatchObject({ code: 'not_found' });
      await expect(getDayDetail(ctx, bEmp, day)).rejects.toMatchObject({ code: 'not_found' });
      await expect(listEntries(ctx, { employeeId: bEmp })).rejects.toMatchObject({ code: 'not_found' });
      await expect(vacationBalance(ctx, bEmp)).rejects.toMatchObject({ code: 'not_found' });
      await expect(getCalendar(ctx, { employeeId: bEmp })).rejects.toMatchObject({ code: 'not_found' });
    }
    // lists
    const employees = await listEmployees(a.admin, { includeInactive: true });
    expect(employees).toHaveLength(3);
    expect(employees.every((x) => x.organizationId === a.org.id)).toBe(true);
    const entries = await listEntries(a.admin, { includeVoided: true });
    expect(entries.total).toBe(1);
    expect(entries.items.every((x) => x.organizationId === a.org.id)).toBe(true);
    expect((await getTeamStatus(a.admin)).members.some((x) => x.employee.organizationId !== a.org.id)).toBe(false);
    const absences = await listTeamAbsences(a.admin);
    expect([...absences.pending, ...absences.decided]).toHaveLength(0);
    // corrections
    await expect(addManualEntry(a.admin, { employeeId: bEmp, type: 'CLOCK_OUT', date: day, time: '17:00', reason: 'Intrusion' })).rejects.toMatchObject({ code: 'not_found' });
    await expect(voidEntry(a.admin, { entryId: bEntry.id, reason: 'Intrusion' })).rejects.toMatchObject({ code: 'not_found' });
    expect((await db.ptTimeEntry.findUniqueOrThrow({ where: { id: bEntry.id } })).voidedAt).toBeNull();
    expect(await db.ptTimeEntry.count({ where: { employeeId: bEmp } })).toBe(1);
    // approvals
    await expect(decideAbsence(a.admin, bAbsence.id, 'APPROVED')).rejects.toMatchObject({ code: 'not_found' });
    await expect(cancelAbsence(a.e1.ctx, bAbsence.id)).rejects.toMatchObject({ code: 'not_found' });
    await expect(requestAbsence(a.admin, { employeeId: bEmp, type: 'SICK', startDate: day, endDate: day })).rejects.toMatchObject({ code: 'not_found' });
    expect((await db.ptAbsence.findUniqueOrThrow({ where: { id: bAbsence.id } })).status).toBe('PENDING');
    // management with foreign ids
    await expect(updateEmployee(a.admin, bEmp, { firstName: 'Hack', lastName: 'Hack' })).rejects.toMatchObject({ code: 'not_found' });
    await expect(setEmployeeActive(a.admin, bEmp, false)).rejects.toMatchObject({ code: 'not_found' });
    await expect(inviteEmployee(a.admin, bEmp)).rejects.toMatchObject({ code: 'not_found' });
    await expect(createEmployee(a.admin, { firstName: 'X', lastName: 'Y', departmentId: b.d1.id })).rejects.toMatchObject({ code: 'not_found' });
    await expect(createEmployee(a.admin, { firstName: 'X', lastName: 'Y', scheduleId: bSchedule.id })).rejects.toMatchObject({ code: 'not_found' });
    await expect(updateDepartment(a.admin, b.d1.id, { name: 'Volé' })).rejects.toMatchObject({ code: 'not_found' });
    await expect(updateDepartment(a.admin, a.d1.id, { name: a.d1.name, managerId: bEmp })).rejects.toMatchObject({ code: 'not_found' });
    expect(await db.ptEmployee.findUniqueOrThrow({ where: { id: bEmp } })).toMatchObject({ firstName: 'Emp', active: true });
    expect(await db.ptEmployee.count({ where: { organizationId: a.org.id } })).toBe(3);
    // reports & exports
    await expect(getReport(a.admin, { ...range, employeeId: bEmp })).rejects.toMatchObject({ code: 'not_found' });
    await expect(getReport(a.admin, { ...range, departmentId: b.d1.id })).rejects.toMatchObject({ code: 'not_found' });
    await expect(exportReport(a.admin, { ...range, employeeId: bEmp, format: 'csv' }, i18n)).rejects.toMatchObject({ code: 'not_found' });
    await expect(exportReport(a.admin, { ...range, departmentId: b.d1.id, format: 'pdf' }, i18n)).rejects.toMatchObject({ code: 'not_found' });
    const report = await getReport(a.admin, range);
    expect(report.rows.map((r) => r.employee.id).sort()).toEqual([a.manager.employee.id, a.e1.employee.id, a.e2.employee.id].sort());
    const csv = new TextDecoder().decode((await exportReport(a.admin, { ...range, format: 'csv' }, i18n)).body);
    expect(csv).toContain(a.e1.employee.lastName);
    expect(csv).not.toContain(b.e1.employee.lastName);
    expect(csv).not.toContain(b.org.name);
    // audit trail
    const trail = await listAudit(a.admin);
    expect(trail.total).toBeGreaterThan(0);
    const ids = (await db.auditLog.findMany({ where: { organizationId: b.org.id }, select: { id: true } })).map((x) => x.id);
    expect(trail.items.some((x) => ids.includes(x.id))).toBe(false);
    // the same user in both companies gets each company's data separately
    await db.membership.create({ data: { userId: a.adminUser.id, organizationId: b.org.id, role: 'MEMBER' } });
    const asMemberOfB = await loadTenantCtx(a.adminUser.id, b.org.id, 'pointage');
    expect((await resolveActor(asMemberOfB)).role).toBe('NONE');
    await expect(listEmployees(asMemberOfB)).rejects.toMatchObject({ code: 'forbidden' });
  });
});

// ───────────────────────────── Absences ─────────────────────────────

describe('pointage · absences', () => {
  it('overlap check, approval scope and vacation balance', async () => {
    const c = await company();
    const year = Number(localDateKey(new Date(), TZ).slice(0, 4));
    const monday = addDays(weekStart(`${year}-03-10`), 0);
    const friday = addDays(monday, 4);
    const req = await requestAbsence(c.e1.ctx, { type: 'VACATION', startDate: monday, endDate: addDays(monday, 6), note: 'Semaine de ski' });
    expect(req).toMatchObject({ status: 'PENDING', employeeId: c.e1.employee.id, organizationId: c.org.id });
    // overlapping requests are refused (pending or approved)
    await expect(requestAbsence(c.e1.ctx, { type: 'SICK', startDate: friday, endDate: addDays(friday, 5) })).rejects.toMatchObject({ code: 'conflict' });
    await expect(requestAbsence(c.e1.ctx, { type: 'VACATION', startDate: addDays(monday, -2), endDate: monday })).rejects.toMatchObject({ code: 'conflict' });
    await expect(requestAbsence(c.e1.ctx, { type: 'VACATION', startDate: friday, endDate: monday })).rejects.toMatchObject({ code: 'invalid' });
    await expect(requestAbsence(c.e1.ctx, { type: 'VACATION', startDate: addDays(monday, 5), endDate: addDays(monday, 6) })).rejects.toBeTruthy(); // week-end only
    // an employee cannot request for someone else
    await expect(requestAbsence(c.e1.ctx, { employeeId: c.e2.employee.id, type: 'SICK', startDate: monday, endDate: monday })).rejects.toMatchObject({ code: 'forbidden' });

    let mine = await listMyAbsences(c.e1.ctx);
    expect(mine!.balance).toEqual({ year, entitled: 20, taken: 0, pending: 5, remaining: 20 });
    expect(mine!.absences[0]).toMatchObject({ workingDays: 5, start: monday });

    // approval scope
    const other = await requestAbsence(c.e2.ctx, { type: 'VACATION', startDate: monday, endDate: monday });
    const own = await requestAbsence(c.manager.ctx, { type: 'VACATION', startDate: monday, endDate: monday });
    await expect(decideAbsence(c.e1.ctx, req.id, 'APPROVED')).rejects.toMatchObject({ code: 'forbidden' });
    await expect(decideAbsence(c.manager.ctx, other.id, 'APPROVED')).rejects.toMatchObject({ code: 'forbidden' });
    await expect(decideAbsence(c.manager.ctx, own.id, 'APPROVED')).rejects.toMatchObject({ code: 'forbidden' });
    const queue = await listTeamAbsences(c.manager.ctx);
    expect(queue.pending.map((x) => x.id).sort()).toEqual([req.id, own.id].sort());
    expect(queue.pending.find((x) => x.id === own.id)!.canDecide).toBe(false);

    await decideAbsence(c.manager.ctx, req.id, 'APPROVED');
    expect(await db.ptAbsence.findUniqueOrThrow({ where: { id: req.id } })).toMatchObject({ status: 'APPROVED', decidedById: c.manager.user.id });
    await expect(decideAbsence(c.manager.ctx, req.id, 'REJECTED')).rejects.toMatchObject({ code: 'conflict' });
    await decideAbsence(c.admin, other.id, 'REJECTED');
    await decideAbsence(c.admin, own.id, 'APPROVED');

    mine = await listMyAbsences(c.e1.ctx);
    expect(mine!.balance).toEqual({ year, entitled: 20, taken: 5, pending: 0, remaining: 15 });
    expect(await vacationBalance(c.manager.ctx, c.e1.employee.id)).toMatchObject({ taken: 5, remaining: 15 });
    expect(await vacationBalance(c.e2.ctx)).toMatchObject({ taken: 0, remaining: 20 }); // rejected does not count
    // a rejected request no longer blocks the dates; sick leave does not touch the vacation balance
    await expect(requestAbsence(c.e2.ctx, { type: 'SICK', startDate: monday, endDate: friday })).resolves.toBeTruthy();
    expect(await vacationBalance(c.e2.ctx)).toMatchObject({ taken: 0, pending: 0 });
    // the employee is notified of the decision
    expect(await db.notification.count({ where: { userId: c.e1.user.id, type: 'pointage' } })).toBe(1);

    // scheduled days are used instead of Monday–Friday when the employee has a schedule
    const schedule = await createSchedule(c.admin, { name: '3 jours', days: [1, 2, 3].map((day) => ({ day, start: '08:00', end: '16:00', breakMinutes: 0 })) });
    await db.ptEmployee.update({ where: { id: c.e2.employee.id }, data: { scheduleId: schedule.id } });
    const nextMonday = addDays(monday, 14);
    const part = await requestAbsence(c.admin, { employeeId: c.e2.employee.id, type: 'VACATION', startDate: nextMonday, endDate: addDays(nextMonday, 6) });
    await decideAbsence(c.admin, part.id, 'APPROVED');
    expect(await vacationBalance(c.e2.ctx)).toMatchObject({ taken: 3, remaining: 17 });

    // cancel: own pending only
    const pending = await requestAbsence(c.e1.ctx, { type: 'UNPAID', startDate: addDays(monday, 28), endDate: addDays(monday, 28) });
    await expect(cancelAbsence(c.e2.ctx, pending.id)).rejects.toMatchObject({ code: 'not_found' });
    await expect(cancelAbsence(c.e1.ctx, req.id)).rejects.toMatchObject({ code: 'conflict' });
    await cancelAbsence(c.e1.ctx, pending.id);
    expect(await db.ptAbsence.findUnique({ where: { id: pending.id } })).toBeNull();

    // calendar & report reflect approved absences
    const cal = await getCalendar(c.admin, { month: monday.slice(0, 7) });
    expect(cal.days.find((d) => d.date === monday)!.absences.map((x) => x.employeeId)).toContain(c.e1.employee.id);
    const report = await getReport(c.admin, { from: monday, to: addDays(monday, 6), employeeId: c.e1.employee.id });
    expect(report.rows[0].absences).toEqual({ VACATION: 5, SICK: 0, UNPAID: 0, OTHER: 0 });
    expect(report.rows[0].scheduledMinutes).toBe(0);
  });
});

// ───────────────────────────── Plan limits, seats, features ─────────────────────────────

const tempPlans: string[] = [];
afterAll(async () => {
  for (const planId of tempPlans) {
    const starter = await db.plan.findUniqueOrThrow({ where: { saasProductKey_key: { saasProductKey: 'pointage', key: 'STARTER' } } });
    await db.subscription.updateMany({ where: { planId }, data: { planId: starter.id } });
    await db.plan.delete({ where: { id: planId } });
  }
});

describe('pointage · plan limits and seats', () => {
  it('enforces limits.employees and keeps Subscription.seats equal to the active employees', async () => {
    const { org, user } = await createTenant('pointage', 'STARTER');
    const starter = await db.plan.findUniqueOrThrow({ where: { saasProductKey_key: { saasProductKey: 'pointage', key: 'STARTER' } } });
    const small = await db.plan.create({ data: { saasProductKey: 'pointage', key: `TEST_${uid()}`, name: 'Starter (test)', prices: starter.prices as object, limits: { employees: 2 }, features: starter.features as string[], includedSeats: 2, active: false } });
    tempPlans.push(small.id);
    await db.subscription.update({ where: { organizationId_saasProductKey: { organizationId: org.id, saasProductKey: 'pointage' } }, data: { planId: small.id } });
    const ctx: TenantCtx = await loadTenantCtx(user.id, org.id, 'pointage');
    const seats = async () => (await db.subscription.findUniqueOrThrow({ where: { organizationId_saasProductKey: { organizationId: org.id, saasProductKey: 'pointage' } } })).seats;

    const one = await createEmployee(ctx, { firstName: 'Ana', lastName: 'Un', email: `ana-${uid()}@example.test`, vacationDays: '25' });
    expect(one).toMatchObject({ organizationId: org.id, active: true, role: 'EMPLOYEE', vacationDays: 25, userId: null });
    expect(await seats()).toBe(1);
    const two = await createEmployee(ctx, { firstName: 'Bia', lastName: 'Deux' });
    expect(await seats()).toBe(2);
    await expect(createEmployee(ctx, { firstName: 'Caio', lastName: 'Trois' })).rejects.toMatchObject({ code: 'limit' });
    expect(await db.ptEmployee.count({ where: { organizationId: org.id } })).toBe(2);
    // concurrent creations cannot exceed the limit either
    await setEmployeeActive(ctx, two.id, false);
    expect(await seats()).toBe(1);
    const race = await Promise.allSettled([createEmployee(ctx, { firstName: 'R', lastName: 'Un' }), createEmployee(ctx, { firstName: 'R', lastName: 'Deux' }), createEmployee(ctx, { firstName: 'R', lastName: 'Trois' })]);
    expect(race.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(await db.ptEmployee.count({ where: { organizationId: org.id, active: true } })).toBe(2);
    expect(await seats()).toBe(2);
    // reactivation is subject to the limit; deactivation frees a seat
    await expect(setEmployeeActive(ctx, two.id, true)).rejects.toMatchObject({ code: 'limit' });
    await setEmployeeActive(ctx, one.id, false);
    expect(await seats()).toBe(1);
    await setEmployeeActive(ctx, two.id, true);
    expect(await seats()).toBe(2);
    // duplicate e-mail and invalid input
    await expect(updateEmployee(ctx, two.id, { firstName: 'Bia', lastName: 'Deux', email: one.email })).rejects.toMatchObject({ code: 'conflict' });
    await expect(updateEmployee(ctx, two.id, { firstName: '', lastName: 'Deux' })).rejects.toBeTruthy();
  });

  it('invites an employee to log in and links the account', async () => {
    const { org, ctx } = await createTenant('pointage', 'BUSINESS');
    const email = `invite-${uid()}@example.test`;
    const employee = await createEmployee(ctx, { firstName: 'Iris', lastName: 'Invitée', email, invite: true });
    expect(employee.userId).toBeTruthy();
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    expect(employee.userId).toBe(user.id);
    const membership = await db.membership.findUniqueOrThrow({ where: { userId_organizationId: { userId: user.id, organizationId: org.id } } });
    expect(membership.role).toBe('MEMBER');
    const invited = await loadTenantCtx(user.id, org.id, 'pointage');
    expect(await resolveActor(invited)).toMatchObject({ role: 'EMPLOYEE', employee: { id: employee.id } });
    await expect(clock(invited, 'CLOCK_IN')).resolves.toMatchObject({ employeeId: employee.id });
    await expect(inviteEmployee(ctx, employee.id)).rejects.toMatchObject({ code: 'conflict' });
    await expect(createEmployee(ctx, { firstName: 'Sans', lastName: 'Mail', invite: true })).rejects.toMatchObject({ code: 'invalid' });
    // a Pointage admin who is a plain organization member can invite too
    const ptAdmin = await linked(org.id, 'ADMIN');
    const second = await createEmployee(ptAdmin.ctx, { firstName: 'Léo', lastName: 'Second', email: `invite-${uid()}@example.test` });
    await inviteEmployee(ptAdmin.ctx, second.id);
    expect((await db.ptEmployee.findUniqueOrThrow({ where: { id: second.id } })).userId).toBeTruthy();
  });

  it('gates reports, exports, departments and the audit trail by plan feature', async () => {
    const starter = await company('STARTER');
    const day = yesterday();
    const range = { from: addDays(day, -6), to: day };
    await insert(starter.org.id, starter.e1.employee.id, 'CLOCK_IN', at(day, '08:00'));
    await insert(starter.org.id, starter.e1.employee.id, 'CLOCK_OUT', at(day, '16:30'));
    await expect(getReport(starter.admin, range)).rejects.toMatchObject({ code: 'limit' });
    await expect(getReport(starter.manager.ctx, range)).rejects.toMatchObject({ code: 'limit' });
    await expect(exportReport(starter.admin, { ...range, format: 'csv' }, i18n)).rejects.toMatchObject({ code: 'limit' });
    await expect(exportReport(starter.e1.ctx, { ...range, format: 'pdf' }, i18n)).rejects.toMatchObject({ code: 'limit' });
    await expect(createDepartment(starter.admin, { name: 'Nouveau' })).rejects.toMatchObject({ code: 'limit' });
    await expect(listAudit(starter.admin)).rejects.toMatchObject({ code: 'limit' });
    // employees always see their own summary, and corrections are logged whatever the plan
    expect((await getReport(starter.e1.ctx, range)).rows[0]).toMatchObject({ daysWorked: 1, workedMinutes: 510 });
    expect(await getMySummary(starter.e1.ctx, range.from, range.to)).toMatchObject({ workedMinutes: 510 });
    expect(await getMySummary(starter.admin, range.from, range.to)).toBeNull();
    await addManualEntry(starter.admin, { employeeId: starter.e2.employee.id, type: 'CLOCK_IN', date: day, time: '09:00', reason: 'Saisie' });
    expect(await db.auditLog.count({ where: { organizationId: starter.org.id, action: 'pointage.entry.added' } })).toBe(1);

    const business = await company('BUSINESS');
    await insert(business.org.id, business.e1.employee.id, 'CLOCK_IN', at(day, '08:00'));
    await insert(business.org.id, business.e1.employee.id, 'CLOCK_OUT', at(day, '18:45'));
    await db.ptEmployee.update({ where: { id: business.e1.employee.id }, data: { firstName: '=HYPERLINK("x")', lastName: 'Zoé;Ω' } });
    const report = await getReport(business.admin, range);
    expect(report.rows).toHaveLength(3);
    const row = report.rows.find((r) => r.employee.id === business.e1.employee.id)!;
    expect(row).toMatchObject({ daysWorked: 1, workedMinutes: 645 });
    expect(row.anomalies.map((x) => x.anomaly).sort()).toEqual(['EXCEEDS_MAX_DAILY', 'INSUFFICIENT_BREAK']);
    await expect(getReport(business.admin, { from: day, to: addDays(day, -1) })).rejects.toMatchObject({ code: 'invalid' });
    await expect(getReport(business.admin, { from: '2020-01-01', to: '2023-01-01' })).rejects.toMatchObject({ code: 'invalid' });
    await expect(exportReport(business.admin, { ...range, format: 'xlsx' }, i18n)).rejects.toBeTruthy();

    const csv = await exportReport(business.admin, { ...range, format: 'csv' }, i18n);
    expect(csv.contentType).toContain('text/csv');
    expect(csv.filename).toBe(`pointage_${range.from}_${range.to}.csv`);
    expect([...csv.body.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const text = new TextDecoder().decode(csv.body);
    expect(text).toContain(`"'=HYPERLINK(""x"") Zoé;Ω"`);
    expect(text).toContain(`;${day};08:00;18:45;0;645;10.75;`);
    const pdf = await exportReport(business.admin, { ...range, format: 'pdf' }, i18n);
    expect(pdf.contentType).toBe('application/pdf');
    expect(Buffer.from(pdf.body.slice(0, 5)).toString()).toBe('%PDF-');
    // manager export is limited to their scope, employee export to themselves
    const managerCsv = new TextDecoder().decode((await exportReport(business.manager.ctx, { ...range, format: 'csv' }, i18n)).body);
    expect(managerCsv).not.toContain(business.e2.employee.lastName);
    await expect(exportReport(business.manager.ctx, { ...range, employeeId: business.e2.employee.id, format: 'csv' }, i18n)).rejects.toMatchObject({ code: 'forbidden' });
    const ownCsv = new TextDecoder().decode((await exportReport(business.e2.ctx, { ...range, employeeId: business.e1.employee.id, format: 'csv' }, i18n)).body);
    expect(ownCsv).toContain(business.e2.employee.lastName);
    expect(ownCsv).not.toContain('HYPERLINK');
    expect(await db.auditLog.count({ where: { organizationId: business.org.id, action: 'pointage.export' } })).toBe(4);
    await expect(createDepartment(business.admin, { name: 'Logistique' })).resolves.toBeTruthy();
    await expect(createDepartment(business.admin, { name: 'logistique' })).rejects.toMatchObject({ code: 'conflict' });
    await expect(listAudit(business.admin)).rejects.toMatchObject({ code: 'limit' }); // audit trail page is a PRO feature
  });
});

// ───────────────────────────── Retention ─────────────────────────────

describe('pointage · retention', () => {
  it('purges entries and decided absences older than the retention period and audits the counts', async () => {
    const c = await company();
    const d = await company();
    const now = new Date();
    const months = (n: number) => { const x = new Date(now); x.setUTCMonth(x.getUTCMonth() - n); return x; };
    const day = (n: number) => new Date(Date.UTC(months(n).getUTCFullYear(), months(n).getUTCMonth(), months(n).getUTCDate()));
    const emp = c.e1.employee.id;
    await insert(c.org.id, emp, 'CLOCK_IN', months(30));
    await insert(c.org.id, emp, 'CLOCK_OUT', new Date(months(30).getTime() + 8 * 3600_000));
    const voidedOld = await insert(c.org.id, emp, 'CLOCK_IN', months(26));
    await db.ptTimeEntry.update({ where: { id: voidedOld.id }, data: { voidedAt: now } });
    const recent = await insert(c.org.id, emp, 'CLOCK_IN', months(23));
    const absence = (status: 'PENDING' | 'APPROVED' | 'REJECTED', n: number) => db.ptAbsence.create({ data: { organizationId: c.org.id, employeeId: emp, type: 'VACATION', startDate: day(n), endDate: day(n), status } });
    const oldApproved = await absence('APPROVED', 30);
    const oldRejected = await absence('REJECTED', 28);
    const oldPending = await absence('PENDING', 30);
    const recentApproved = await absence('APPROVED', 5);
    // another company with old data and a longer retention
    const foreign = await insert(d.org.id, d.e1.employee.id, 'CLOCK_IN', months(30));
    await updateSettings(d.admin, { ...DEFAULT_SETTINGS, timezone: TZ, retentionMonths: 60 });

    expect((await getSettings(c.admin)).settings.retentionMonths).toBe(24);
    const res = await purgeExpired(c.org.id, now);
    expect(res).toMatchObject({ entries: 3, absences: 2 });
    expect((await db.ptTimeEntry.findMany({ where: { employeeId: emp } })).map((x) => x.id)).toEqual([recent.id]);
    expect((await db.ptAbsence.findMany({ where: { employeeId: emp }, orderBy: { startDate: 'asc' } })).map((x) => x.id)).toEqual([oldPending.id, recentApproved.id]);
    expect(await db.ptAbsence.count({ where: { id: { in: [oldApproved.id, oldRejected.id] } } })).toBe(0);
    const logs = await db.auditLog.findMany({ where: { organizationId: c.org.id, action: 'pointage.retention.purged' } });
    expect(logs).toHaveLength(1);
    expect(logs[0].meta).toMatchObject({ entries: 3, absences: 2, retentionMonths: 24 });
    // nothing left to purge: no new audit row, other tenants untouched
    expect(await purgeExpired(c.org.id, now)).toMatchObject({ entries: 0, absences: 0 });
    expect(await db.auditLog.count({ where: { organizationId: c.org.id, action: 'pointage.retention.purged' } })).toBe(1);
    expect(await db.ptTimeEntry.findUnique({ where: { id: foreign.id } })).not.toBeNull();

    // the daily job walks every organization with a pointage subscription and respects each retention
    const summary = await runPointageRetention(now);
    expect(summary.organizations).toBeGreaterThanOrEqual(2);
    expect(summary.failed).toBe(0);
    expect(await db.ptTimeEntry.findUnique({ where: { id: foreign.id } })).not.toBeNull();
    await updateSettings(d.admin, { ...DEFAULT_SETTINGS, timezone: TZ, retentionMonths: 12 });
    await runPointageRetention(now);
    expect(await db.ptTimeEntry.findUnique({ where: { id: foreign.id } })).toBeNull();
    expect(await db.auditLog.count({ where: { organizationId: d.org.id, action: 'pointage.retention.purged' } })).toBe(1);
  });
});
