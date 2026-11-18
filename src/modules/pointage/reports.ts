import { z } from 'zod';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import { db } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { audit } from '@/lib/audit';
import { m, formatDate, formatDateTime, type TFn } from '@/i18n/translate';
import type { Locale } from '@/i18n/config';
import { assertFeature, type TenantCtx } from '@/modules/tenancy/context';
import { loadEmployee, resolveActor, visibleEmployeesWhere, NOT_LINKED, type Actor } from './actor';
import { loadOrgSettings } from './settings';
import { fullName, timesheets } from './service';
import { ABSENCE_LABELS, ANOMALY_LABELS } from './labels';
import { countWorkingDays, dateToDateKey, diffDays, formatDuration, isDateKey, localTimeKey, parseScheduleDays, type Anomaly, type DaySummary } from './time';

const reportSchema = z.object({
  from: z.string().refine(isDateKey, m('Date invalide.')),
  to: z.string().refine(isDateKey, m('Date invalide.')),
  employeeId: z.string().nullish().transform((v) => (v && v.trim() ? v.trim() : null)),
  departmentId: z.string().nullish().transform((v) => (v && v.trim() ? v.trim() : null)),
});
export type ReportInput = z.input<typeof reportSchema>;

type AbsenceType = keyof typeof ABSENCE_LABELS;
export type ReportRow = {
  employee: { id: string; name: string; department: string | null };
  daysWorked: number;
  workedMinutes: number;
  scheduledMinutes: number;
  overtimeMinutes: number;
  balanceMinutes: number;
  /** Approved absence working days inside the period, by type. */
  absences: Record<AbsenceType, number>;
  anomalies: { date: string; anomaly: Anomaly }[];
  days: DaySummary[];
};
export type Report = {
  organization: string; timezone: string; from: string; to: string; rows: ReportRow[];
  totals: { daysWorked: number; workedMinutes: number; overtimeMinutes: number; anomalies: number };
};

/** Builds the report for the employees of the actor's scope. Callers have checked the plan feature. */
async function computeReport(ctx: TenantCtx, actor: Actor, input: ReportInput): Promise<Report> {
  const f = reportSchema.parse(input);
  if (f.to < f.from) throw new AppError(m('La date de fin doit être après la date de début.'), 'invalid', { to: m('La date de fin doit être après la date de début.') });
  if (diffDays(f.from, f.to) > 366) throw new AppError(m('La période ne peut pas dépasser un an.'), 'invalid', { to: m('La période ne peut pas dépasser un an.') });
  // Ids from the client are validated against the tenant and the actor's scope.
  if (f.employeeId) await loadEmployee(ctx, actor, f.employeeId, 'view');
  if (f.departmentId) {
    const department = await db.ptDepartment.findFirst({ where: { id: f.departmentId, organizationId: ctx.organizationId } });
    if (!department || (actor.role !== 'ADMIN' && !actor.managedDepartmentIds.includes(department.id))) throw new AppError(m('Département introuvable.'), 'not_found');
  }
  const org = await loadOrgSettings(ctx.organizationId);
  const employees = await db.ptEmployee.findMany({
    where: { AND: [visibleEmployeesWhere(ctx, actor), f.employeeId ? { id: f.employeeId } : {}, f.departmentId ? { departmentId: f.departmentId } : {}] },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }], include: { schedule: true, department: true },
  });
  const sheets = await timesheets(ctx.organizationId, employees, f.from, f.to, org);
  const rows: ReportRow[] = [];
  for (const sheet of sheets) {
    const e = sheet.employee as (typeof employees)[number];
    const schedule = e.schedule ? parseScheduleDays(e.schedule.days) : null;
    const absences: ReportRow['absences'] = { VACATION: 0, SICK: 0, UNPAID: 0, OTHER: 0 };
    for (const a of sheet.absences) {
      if (a.status !== 'APPROVED') continue;
      const start = dateToDateKey(a.startDate) < f.from ? f.from : dateToDateKey(a.startDate);
      const end = dateToDateKey(a.endDate) > f.to ? f.to : dateToDateKey(a.endDate);
      if (start <= end) absences[a.type] += countWorkingDays(start, end, schedule);
    }
    const absent = Object.values(absences).some((n) => n > 0);
    // Inactive employees only appear when they have something in the period.
    if (!e.active && !sheet.days.length && !absent) continue;
    rows.push({
      employee: { id: e.id, name: fullName(e), department: e.department?.name ?? null },
      daysWorked: sheet.days.filter((d) => d.workedMinutes > 0 || d.firstIn).length,
      workedMinutes: sheet.days.reduce((s, d) => s + d.workedMinutes, 0),
      scheduledMinutes: sheet.weeks.reduce((s, w) => s + w.scheduledMinutes, 0),
      overtimeMinutes: sheet.weeks.reduce((s, w) => s + w.overtimeMinutes, 0),
      balanceMinutes: sheet.weeks.reduce((s, w) => s + w.balanceMinutes, 0),
      absences, anomalies: sheet.days.flatMap((d) => d.anomalies.map((anomaly) => ({ date: d.date, anomaly }))), days: sheet.days,
    });
  }
  return {
    organization: org.name, timezone: org.timezone, from: f.from, to: f.to, rows,
    totals: {
      daysWorked: rows.reduce((s, r) => s + r.daysWorked, 0), workedMinutes: rows.reduce((s, r) => s + r.workedMinutes, 0),
      overtimeMinutes: rows.reduce((s, r) => s + r.overtimeMinutes, 0), anomalies: rows.reduce((s, r) => s + r.anomalies.length, 0),
    },
  };
}

/**
 * Report over a period. Employees always get their own summary; the team/company report
 * (manager: their departments, admin: everyone) requires the plan feature `reports`.
 */
export async function getReport(ctx: TenantCtx, input: ReportInput): Promise<Report> {
  const actor = await resolveActor(ctx);
  if (actor.role === 'NONE') throw new AppError(NOT_LINKED, 'forbidden');
  if (actor.role === 'EMPLOYEE') return computeReport(ctx, actor, { from: input.from, to: input.to, employeeId: actor.employee!.id });
  const ownOnly = !!input.employeeId && input.employeeId === actor.employee?.id;
  if (!ownOnly) assertFeature(ctx, 'reports');
  return computeReport(ctx, actor, input);
}

/** Own summary over a period (no plan feature required). */
export async function getMySummary(ctx: TenantCtx, from: string, to: string): Promise<ReportRow | null> {
  const actor = await resolveActor(ctx);
  if (!actor.employee) return null;
  return (await computeReport(ctx, actor, { from, to, employeeId: actor.employee.id })).rows[0] ?? null;
}

// ───────────────────────────── CSV ─────────────────────────────

/** Quotes a cell and neutralises spreadsheet formulas (=, +, -, @, tab, CR at the start of a text cell). */
export function csvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '';
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[";\n\r,]/.test(s) || s !== s.trim() ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: (string | number | null | undefined)[][]): string {
  // BOM so that spreadsheet software reads UTF-8; semicolon separator (FR / PT locales); CRLF line ends.
  return '﻿' + rows.map((r) => r.map(csvCell).join(';')).join('\r\n') + '\r\n';
}

type ExportI18n = { t: TFn; locale: Locale };
const hours = (minutes: number) => Math.round((minutes / 60) * 100) / 100;

export function reportToCsv(report: Report, { t }: ExportI18n): string {
  const rows: (string | number | null)[][] = [
    [t('Rapport de pointage'), report.organization],
    [t('Période'), report.from, report.to],
    [t('Fuseau horaire'), report.timezone],
    [],
    [t('Employé'), t('Département'), t('Jours travaillés'), t('Temps travaillé (min)'), t('Temps travaillé (h)'), t('Temps prévu (min)'), t('Heures supplémentaires (min)'), t('Solde (min)'), t(ABSENCE_LABELS.VACATION), t(ABSENCE_LABELS.SICK), t(ABSENCE_LABELS.UNPAID), t(ABSENCE_LABELS.OTHER), t('Anomalies')],
    ...report.rows.map((r) => [r.employee.name, r.employee.department, r.daysWorked, r.workedMinutes, hours(r.workedMinutes), r.scheduledMinutes, r.overtimeMinutes, r.balanceMinutes, r.absences.VACATION, r.absences.SICK, r.absences.UNPAID, r.absences.OTHER, r.anomalies.length]),
    [],
    [t('Employé'), t('Département'), t('Date'), t('Première entrée'), t('Dernière sortie'), t('Pause (min)'), t('Temps travaillé (min)'), t('Temps travaillé (h)'), t('Anomalies')],
  ];
  for (const r of report.rows) {
    for (const d of r.days) {
      rows.push([r.employee.name, r.employee.department, d.date, d.firstIn ? localTimeKey(d.firstIn, report.timezone) : '', d.lastOut ? localTimeKey(d.lastOut, report.timezone) : '', d.breakMinutes, d.workedMinutes, hours(d.workedMinutes), d.anomalies.map((a) => t(ANOMALY_LABELS[a])).join(', ')]);
    }
  }
  return toCsv(rows);
}

// ───────────────────────────── PDF ─────────────────────────────

const REPLACEMENTS: Record<string, string> = { ' ': ' ', ' ': ' ', ' ': ' ', '−': '-', '→': '->', '‑': '-', '\t': ' ', '\n': ' ', '\r': ' ' };

/** Keeps only characters the standard (WinAnsi) Helvetica can encode, so drawing never throws. */
export function winAnsiSafe(text: string, font: PDFFont): string {
  const supported = new Set(font.getCharacterSet());
  let out = '';
  for (const ch of String(text ?? '').normalize('NFC')) {
    const mapped = REPLACEMENTS[ch] ?? ch;
    for (const c of mapped) {
      const code = c.codePointAt(0)!;
      if (code < 32) continue;
      if (supported.has(code)) { out += c; continue; }
      // Try the unaccented base letter before giving up.
      const base = c.normalize('NFD').replace(/[̀-ͯ]/g, '');
      out += base && [...base].every((b) => supported.has(b.codePointAt(0)!)) ? base : '?';
    }
  }
  return out;
}

/** A4 report: header with organization / period / generation time, one table per employee, totals, page numbers. */
export async function reportToPdf(report: Report, { t, locale }: ExportI18n, generatedAt = new Date()): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const W = 595.28, H = 841.89, M = 40;
  const ink = rgb(0.1, 0.1, 0.1), soft = rgb(0.42, 0.42, 0.42), line = rgb(0.82, 0.82, 0.82), gold = rgb(0.03, 0.57, 0.7);
  const safe = (s: string, f: PDFFont = font) => winAnsiSafe(s, f);
  const fit = (s: string, f: PDFFont, size: number, width: number) => {
    let text = safe(s, f);
    if (f.widthOfTextAtSize(text, size) <= width) return text;
    while (text.length > 1 && f.widthOfTextAtSize(text + '...', size) > width) text = text.slice(0, -1);
    return text + '...';
  };
  const title = t('Rapport de pointage');
  const period = `${formatDate(report.from, locale, { timeZone: 'UTC' })} - ${formatDate(report.to, locale, { timeZone: 'UTC' })}`;
  pdf.setTitle(safe(`${title} - ${report.organization}`));
  pdf.setCreator('ATHANA Pointage');
  pdf.setCreationDate(generatedAt);

  let page!: PDFPage;
  let y = 0;
  const newPage = (first = false) => {
    page = pdf.addPage([W, H]);
    y = H - M;
    if (first) {
      page.drawText(safe(title, bold), { x: M, y: y - 18, size: 20, font: bold, color: ink });
      y -= 40;
      page.drawText(fit(report.organization, bold, 12, W - 2 * M), { x: M, y, size: 12, font: bold, color: ink });
      y -= 16;
      page.drawText(safe(`${t('Période')} : ${period}`), { x: M, y, size: 10, font, color: soft });
      y -= 14;
      page.drawText(safe(`${t('Généré le')} ${formatDateTime(generatedAt, locale, report.timezone)} (${report.timezone})`), { x: M, y, size: 10, font, color: soft });
      y -= 12;
    } else {
      page.drawText(fit(`${title} - ${report.organization} - ${period}`, font, 9, W - 2 * M), { x: M, y: y - 8, size: 9, font, color: soft });
      y -= 18;
    }
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1.2, color: gold });
    y -= 18;
  };
  const ensure = (height: number) => { if (y - height < M + 24) newPage(); };

  const cols = [
    { label: t('Date'), w: 95 }, { label: t('Entrée'), w: 55 }, { label: t('Sortie'), w: 55 }, { label: t('Pause'), w: 60 }, { label: t('Travaillé'), w: 65 }, { label: t('Anomalies'), w: W - 2 * M - 330 },
  ];
  const row = (cells: string[], f: PDFFont, size = 9, color = ink) => {
    let x = M;
    cells.forEach((c, i) => {
      page.drawText(fit(c, f, size, cols[i].w - 6), { x: x + 2, y, size, font: f, color });
      x += cols[i].w;
    });
    y -= 14;
  };
  const rule = () => { page.drawLine({ start: { x: M, y: y + 10 }, end: { x: W - M, y: y + 10 }, thickness: 0.5, color: line }); };

  newPage(true);
  // Company totals
  page.drawText(safe(`${t('Employés')} : ${report.rows.length}    ${t('Temps travaillé')} : ${formatDuration(report.totals.workedMinutes)}    ${t('Heures supplémentaires')} : ${formatDuration(report.totals.overtimeMinutes)}    ${t('Anomalies')} : ${report.totals.anomalies}`), { x: M, y, size: 10, font: bold, color: ink });
  y -= 24;
  if (!report.rows.length) page.drawText(safe(t('Aucune donnée sur cette période.')), { x: M, y, size: 10, font, color: soft });

  for (const r of report.rows) {
    ensure(96);
    page.drawText(fit(r.employee.name, bold, 12, W - 2 * M - 160), { x: M, y, size: 12, font: bold, color: ink });
    if (r.employee.department) {
      const dep = fit(r.employee.department, font, 9, 150);
      page.drawText(dep, { x: W - M - font.widthOfTextAtSize(dep, 9), y, size: 9, font, color: soft });
    }
    y -= 18;
    row(cols.map((c) => c.label), bold, 8, soft);
    rule();
    if (!r.days.length) { row([t('Aucun pointage'), '', '', '', '', ''], font, 9, soft); }
    for (const d of r.days) {
      if (y - 14 < M + 24) { newPage(); page.drawText(fit(`${r.employee.name} (${t('suite')})`, bold, 10, W - 2 * M), { x: M, y, size: 10, font: bold, color: ink }); y -= 16; row(cols.map((c) => c.label), bold, 8, soft); rule(); }
      row([
        formatDate(d.date, locale, { timeZone: 'UTC', dateStyle: undefined, weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }),
        d.firstIn ? localTimeKey(d.firstIn, report.timezone) : '-', d.lastOut ? localTimeKey(d.lastOut, report.timezone) : d.open ? t('en cours') : '-',
        formatDuration(d.breakMinutes), formatDuration(d.workedMinutes), d.anomalies.map((a) => t(ANOMALY_LABELS[a])).join(', '),
      ], font);
    }
    ensure(34);
    rule();
    const absences = (Object.keys(r.absences) as AbsenceType[]).filter((k) => r.absences[k] > 0).map((k) => `${t(ABSENCE_LABELS[k])} ${r.absences[k]} ${t('j')}`).join(', ');
    page.drawText(fit(`${t('Total')} : ${formatDuration(r.workedMinutes)}   ${t('Jours travaillés')} : ${r.daysWorked}   ${t('Heures supplémentaires')} : ${formatDuration(r.overtimeMinutes)}   ${t('Solde')} : ${formatDuration(r.balanceMinutes)}`, bold, 9, W - 2 * M), { x: M + 2, y, size: 9, font: bold, color: ink });
    y -= 13;
    if (absences) { page.drawText(fit(`${t('Absences')} : ${absences}`, font, 9, W - 2 * M), { x: M + 2, y, size: 9, font, color: soft }); y -= 13; }
    y -= 16;
  }

  const pages = pdf.getPages();
  pages.forEach((p, i) => {
    const label = safe(`${t('Page')} ${i + 1} / ${pages.length}`);
    p.drawText(label, { x: W - M - font.widthOfTextAtSize(label, 8), y: 24, size: 8, font, color: soft });
    p.drawText('ATHANA Pointage', { x: M, y: 24, size: 8, font, color: soft });
  });
  return pdf.save();
}

/**
 * Export of the report (feature `export`), limited to the actor's scope like the report itself.
 * Every export is audited.
 */
export async function exportReport(ctx: TenantCtx, input: ReportInput & { format: string }, i18n: ExportI18n): Promise<{ filename: string; contentType: string; body: Uint8Array }> {
  const actor = await resolveActor(ctx);
  if (actor.role === 'NONE') throw new AppError(NOT_LINKED, 'forbidden');
  assertFeature(ctx, 'export');
  const format = z.enum(['csv', 'pdf'], { message: m('Format d’export invalide.') }).parse(input.format);
  const report = await computeReport(ctx, actor, actor.role === 'EMPLOYEE' ? { from: input.from, to: input.to, employeeId: actor.employee!.id } : input);
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'pointage.export', entity: 'Organization', entityId: ctx.organizationId, meta: { format, from: report.from, to: report.to, employees: report.rows.length } });
  const filename = `pointage_${report.from}_${report.to}.${format}`;
  if (format === 'csv') return { filename, contentType: 'text/csv; charset=utf-8', body: new TextEncoder().encode(reportToCsv(report, i18n)) };
  return { filename, contentType: 'application/pdf', body: await reportToPdf(report, i18n) };
}
