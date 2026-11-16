import { z } from 'zod';
import type { Prisma, PtAbsence, PtEmployee, PtSchedule, PtTimeEntry } from '@prisma/client';
import { db } from '@/lib/db';
import { AppError, notFoundError } from '@/lib/errors';
import { audit } from '@/lib/audit';
import { m } from '@/i18n/translate';
import { assertFeature, assertWithinLimit, planHasFeature, planLimit, type TenantCtx } from '@/modules/tenancy/context';
import { inviteMember } from '@/modules/tenancy/members';
import { assertAdmin, assertManager, canManage, loadEmployee, resolveActor, selfEmployee, visibleEmployeesWhere, NOT_LINKED, type Actor } from './actor';
import { loadOrgSettings, type PointageSettings } from './settings';
import {
  addDays, computeDays, computeWeeks, countWorkingDays, dateKeyToDate, dateRange, dateToDateKey, dayBounds, diffDays, isDateKey, isWorkingDay,
  localDateKey, nextActions, parseScheduleDays, scheduledMinutesOn, scheduleDayMinutes, scheduleWeeklyMinutes, stateAfter, transition, validateSequence,
  weekStart, zonedToUtc, TIME_KEY_RE,
  type ClockState, type DaySummary, type EntryType, type ScheduleDay, type WeekSummary,
} from './time';

type Tx = Prisma.TransactionClient;

const ENTRY_TYPE = z.enum(['CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END'], { message: m('Type de pointage invalide.') });
const dateKey = z.string().refine(isDateKey, m('Date invalide.'));
const optionalId = z.string().nullish().transform((v) => (v && v.trim() ? v.trim() : null));
const id = z.string({ message: m('Identifiant invalide.') }).min(1, m('Identifiant invalide.')).max(64, m('Identifiant invalide.'));

/** Serialises every clock operation of one employee (released at the end of the transaction). */
async function lockEmployee(tx: Tx, employeeId: string) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${employeeId}))::text AS locked`;
}
async function lockOrganization(tx: Tx, organizationId: string) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${'pt-org:' + organizationId}))::text AS locked`;
}

function assertLinked(actor: Actor) {
  if (actor.role === 'NONE') throw new AppError(NOT_LINKED, 'forbidden');
}

export const fullName = (e: Pick<PtEmployee, 'firstName' | 'lastName'>) => `${e.firstName} ${e.lastName}`.trim();

/** Unread notifications badge of the shell. */
export async function unreadNotifications(ctx: TenantCtx): Promise<number> {
  return db.notification.count({ where: { userId: ctx.userId, readAt: null } });
}

async function notify(userId: string | null | undefined, title: string, body: string, link: string) {
  if (!userId) return;
  await db.notification.create({ data: { userId, type: 'pointage', title, body, link } }).catch(() => undefined);
}

// ───────────────────────────── Departments ─────────────────────────────

const departmentSchema = z.object({
  name: z.string().trim().min(2, m('Nom requis (2 caractères minimum).')).max(80, m('Nom trop long.')),
  managerId: optionalId,
});

/** Admin: every department. Manager: the departments they manage. */
export async function listDepartments(ctx: TenantCtx) {
  const actor = await resolveActor(ctx);
  assertManager(actor);
  const departments = await db.ptDepartment.findMany({
    where: { organizationId: ctx.organizationId, ...(actor.role === 'ADMIN' ? {} : { id: { in: actor.managedDepartmentIds } }) },
    orderBy: { name: 'asc' },
    include: { _count: { select: { employees: { where: { active: true } } } } },
  });
  const managers = await db.ptEmployee.findMany({ where: { organizationId: ctx.organizationId, id: { in: departments.map((d) => d.managerId).filter((v): v is string => !!v) } } });
  return departments.map((d) => ({ id: d.id, name: d.name, managerId: d.managerId, manager: managers.find((e) => e.id === d.managerId) ?? null, employeeCount: d._count.employees }));
}

async function resolveManager(ctx: TenantCtx, managerId: string | null) {
  if (!managerId) return null;
  const manager = await db.ptEmployee.findFirst({ where: { id: managerId, organizationId: ctx.organizationId, active: true } });
  if (!manager) throw new AppError(m('Responsable introuvable.'), 'not_found', { managerId: m('Responsable introuvable.') });
  return manager;
}

async function assertDepartmentNameFree(ctx: TenantCtx, name: string, exceptId?: string) {
  const clash = await db.ptDepartment.findFirst({ where: { organizationId: ctx.organizationId, name: { equals: name, mode: 'insensitive' }, ...(exceptId ? { id: { not: exceptId } } : {}) } });
  if (clash) throw new AppError(m('Un département porte déjà ce nom.'), 'conflict', { name: m('Un département porte déjà ce nom.') });
}

/** Naming a manager gives them the MANAGER role if they were a plain employee. */
async function promoteManager(ctx: TenantCtx, manager: PtEmployee | null) {
  if (manager?.role === 'EMPLOYEE') await db.ptEmployee.updateMany({ where: { id: manager.id, organizationId: ctx.organizationId }, data: { role: 'MANAGER' } });
}

export async function createDepartment(ctx: TenantCtx, input: z.input<typeof departmentSchema>) {
  assertAdmin(await resolveActor(ctx));
  assertFeature(ctx, 'departments');
  const data = departmentSchema.parse(input);
  await assertDepartmentNameFree(ctx, data.name);
  const manager = await resolveManager(ctx, data.managerId);
  const department = await db.ptDepartment.create({ data: { organizationId: ctx.organizationId, name: data.name, managerId: manager?.id ?? null } });
  await promoteManager(ctx, manager);
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'pointage.department.created', entity: 'PtDepartment', entityId: department.id, meta: { name: data.name, managerId: manager?.id ?? null } });
  return department;
}

export async function updateDepartment(ctx: TenantCtx, departmentId: string, input: z.input<typeof departmentSchema>) {
  assertAdmin(await resolveActor(ctx));
  assertFeature(ctx, 'departments');
  const data = departmentSchema.parse(input);
  const existing = await db.ptDepartment.findFirst({ where: { id: id.parse(departmentId), organizationId: ctx.organizationId } });
  if (!existing) throw notFoundError(m('Département introuvable.'));
  await assertDepartmentNameFree(ctx, data.name, existing.id);
  const manager = await resolveManager(ctx, data.managerId);
  await db.ptDepartment.updateMany({ where: { id: existing.id, organizationId: ctx.organizationId }, data: { name: data.name, managerId: manager?.id ?? null } });
  await promoteManager(ctx, manager);
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'pointage.department.updated', entity: 'PtDepartment', entityId: existing.id, meta: { before: { name: existing.name, managerId: existing.managerId }, after: { name: data.name, managerId: manager?.id ?? null } } });
}

/** Employees of a deleted department stay in the organization without a department. */
export async function deleteDepartment(ctx: TenantCtx, departmentId: string) {
  assertAdmin(await resolveActor(ctx));
  const existing = await db.ptDepartment.findFirst({ where: { id: id.parse(departmentId), organizationId: ctx.organizationId } });
  if (!existing) throw notFoundError(m('Département introuvable.'));
  await db.ptDepartment.deleteMany({ where: { id: existing.id, organizationId: ctx.organizationId } });
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'pointage.department.deleted', entity: 'PtDepartment', entityId: existing.id, meta: { name: existing.name } });
}

// ───────────────────────────── Schedules ─────────────────────────────

const time = z.string().regex(TIME_KEY_RE, m('Heure invalide (HH:MM).'));
const scheduleSchema = z.object({
  name: z.string().trim().min(2, m('Nom requis (2 caractères minimum).')).max(80, m('Nom trop long.')),
  days: z.array(z.object({
    day: z.coerce.number().int().min(1).max(7),
    start: time, end: time,
    breakMinutes: z.coerce.number({ message: m('Nombre invalide.') }).int(m('Nombre entier requis.')).min(0, m('Valeur trop petite.')).max(600, m('Valeur trop grande.')),
  })).min(1, m('Sélectionnez au moins un jour travaillé.')).max(7),
});
export type ScheduleInput = z.input<typeof scheduleSchema>;

function normaliseSchedule(input: ScheduleInput) {
  const data = scheduleSchema.parse(input);
  const seen = new Set<number>();
  for (const d of data.days) {
    if (seen.has(d.day)) throw new AppError(m('Chaque jour ne peut apparaître qu’une fois dans un horaire.'), 'invalid', { days: m('Chaque jour ne peut apparaître qu’une fois dans un horaire.') });
    seen.add(d.day);
    if (d.end <= d.start) throw new AppError(m('L’heure de fin doit être après l’heure de début.'), 'invalid', { days: m('L’heure de fin doit être après l’heure de début.') });
    if (scheduleDayMinutes(d) <= 0) throw new AppError(m('La pause ne peut pas couvrir toute la journée.'), 'invalid', { days: m('La pause ne peut pas couvrir toute la journée.') });
  }
  const days: ScheduleDay[] = [...data.days].sort((a, b) => a.day - b.day);
  return { name: data.name, days, weeklyMinutes: scheduleWeeklyMinutes(days) };
}

export async function listSchedules(ctx: TenantCtx) {
  assertAdmin(await resolveActor(ctx));
  const rows = await db.ptSchedule.findMany({ where: { organizationId: ctx.organizationId }, orderBy: { name: 'asc' }, include: { _count: { select: { employees: { where: { active: true } } } } } });
  return rows.map((s) => ({ id: s.id, name: s.name, weeklyMinutes: s.weeklyMinutes, days: parseScheduleDays(s.days), employeeCount: s._count.employees }));
}

export async function createSchedule(ctx: TenantCtx, input: ScheduleInput) {
  assertAdmin(await resolveActor(ctx));
  const data = normaliseSchedule(input);
  const schedule = await db.ptSchedule.create({ data: { organizationId: ctx.organizationId, name: data.name, days: data.days as unknown as Prisma.InputJsonValue, weeklyMinutes: data.weeklyMinutes } });
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'pointage.schedule.created', entity: 'PtSchedule', entityId: schedule.id, meta: { name: data.name, weeklyMinutes: data.weeklyMinutes } });
  return schedule;
}

export async function updateSchedule(ctx: TenantCtx, scheduleId: string, input: ScheduleInput) {
  assertAdmin(await resolveActor(ctx));
  const data = normaliseSchedule(input);
  const existing = await db.ptSchedule.findFirst({ where: { id: id.parse(scheduleId), organizationId: ctx.organizationId } });
  if (!existing) throw notFoundError(m('Horaire introuvable.'));
  await db.ptSchedule.updateMany({ where: { id: existing.id, organizationId: ctx.organizationId }, data: { name: data.name, days: data.days as unknown as Prisma.InputJsonValue, weeklyMinutes: data.weeklyMinutes } });
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'pointage.schedule.updated', entity: 'PtSchedule', entityId: existing.id, meta: { before: { name: existing.name, weeklyMinutes: existing.weeklyMinutes }, after: { name: data.name, weeklyMinutes: data.weeklyMinutes } } });
}

export async function deleteSchedule(ctx: TenantCtx, scheduleId: string) {
  assertAdmin(await resolveActor(ctx));
  const existing = await db.ptSchedule.findFirst({ where: { id: id.parse(scheduleId), organizationId: ctx.organizationId } });
  if (!existing) throw notFoundError(m('Horaire introuvable.'));
  await db.ptSchedule.deleteMany({ where: { id: existing.id, organizationId: ctx.organizationId } });
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'pointage.schedule.deleted', entity: 'PtSchedule', entityId: existing.id, meta: { name: existing.name } });
}

// ───────────────────────────── Employees ─────────────────────────────

const employeeSchema = z.object({
  firstName: z.string().trim().min(1, m('Prénom requis.')).max(80, m('Texte trop long.')),
  lastName: z.string().trim().min(1, m('Nom requis.')).max(80, m('Texte trop long.')),
  email: z.string().nullish().transform((v) => (v && v.trim() ? v.trim().toLowerCase() : null))
    .refine((v) => v === null || (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) && v.length <= 200), m('Adresse e-mail invalide.')),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE'], { message: m('Rôle invalide.') }).default('EMPLOYEE'),
  departmentId: optionalId,
  scheduleId: optionalId,
  vacationDays: z.coerce.number({ message: m('Nombre invalide.') }).int(m('Nombre entier requis.')).min(0, m('Valeur trop petite.')).max(365, m('Valeur trop grande.')).default(20),
  invite: z.boolean().optional().default(false),
});
export type EmployeeInput = z.input<typeof employeeSchema>;

export const countActiveEmployees = (organizationId: string, client: Tx | typeof db = db) => client.ptEmployee.count({ where: { organizationId, active: true } });

/** Seat-based billing: the subscription always carries the number of active employees (at least one seat). */
export async function syncSeats(ctx: TenantCtx): Promise<number> {
  const seats = Math.max(1, await countActiveEmployees(ctx.organizationId));
  await db.subscription.updateMany({ where: { organizationId: ctx.organizationId, saasProductKey: 'pointage' }, data: { seats } });
  return seats;
}

async function validateEmployeeRelations(ctx: TenantCtx, data: { departmentId: string | null; scheduleId: string | null; email: string | null }, exceptId?: string) {
  if (data.departmentId && !(await db.ptDepartment.findFirst({ where: { id: data.departmentId, organizationId: ctx.organizationId } }))) throw new AppError(m('Département introuvable.'), 'not_found', { departmentId: m('Département introuvable.') });
  if (data.scheduleId && !(await db.ptSchedule.findFirst({ where: { id: data.scheduleId, organizationId: ctx.organizationId } }))) throw new AppError(m('Horaire introuvable.'), 'not_found', { scheduleId: m('Horaire introuvable.') });
  if (data.email) {
    const clash = await db.ptEmployee.findFirst({ where: { organizationId: ctx.organizationId, email: data.email, ...(exceptId ? { id: { not: exceptId } } : {}) } });
    if (clash) throw new AppError(m('Un employé utilise déjà cette adresse e-mail.'), 'conflict', { email: m('Un employé utilise déjà cette adresse e-mail.') });
  }
}

/**
 * Gives an employee a login: invites the person into the organization (existing account linked or new account
 * created with an invitation e-mail) and links the employee record to the user.
 */
async function linkLogin(ctx: TenantCtx, employee: PtEmployee) {
  if (!employee.email) throw new AppError(m('Une adresse e-mail est nécessaire pour inviter un employé.'), 'invalid', { email: m('Une adresse e-mail est nécessaire pour inviter un employé.') });
  // inviteMember requires the organization ADMIN role; a Pointage admin (already verified by the caller)
  // is allowed to invite plain members only.
  const { user } = await inviteMember({ ...ctx, role: ctx.role === 'OWNER' ? 'OWNER' : 'ADMIN' }, { email: employee.email, name: fullName(employee), role: 'MEMBER' });
  const taken = await db.ptEmployee.findFirst({ where: { organizationId: ctx.organizationId, userId: user.id, id: { not: employee.id } } });
  if (taken) throw new AppError(m('Ce compte est déjà lié à une autre fiche employé.'), 'conflict');
  await db.ptEmployee.updateMany({ where: { id: employee.id, organizationId: ctx.organizationId }, data: { userId: user.id } });
  return user;
}

export async function listEmployees(ctx: TenantCtx, opts: { includeInactive?: boolean } = {}) {
  const actor = await resolveActor(ctx);
  assertManager(actor);
  return db.ptEmployee.findMany({
    where: { ...visibleEmployeesWhere(ctx, actor), ...(opts.includeInactive ? {} : { active: true }) },
    orderBy: [{ active: 'desc' }, { lastName: 'asc' }, { firstName: 'asc' }],
    include: { department: true, schedule: true },
  });
}

export async function getEmployee(ctx: TenantCtx, employeeId: string) {
  const actor = await resolveActor(ctx);
  assertLinked(actor);
  return loadEmployee(ctx, actor, employeeId, 'view');
}

/** Plan usage shown on the employees page. */
export async function employeeUsage(ctx: TenantCtx) {
  assertManager(await resolveActor(ctx));
  return { active: await countActiveEmployees(ctx.organizationId), limit: planLimit(ctx, 'employees'), includedSeats: ctx.subscription?.plan.includedSeats ?? 0 };
}

export async function createEmployee(ctx: TenantCtx, input: EmployeeInput) {
  assertAdmin(await resolveActor(ctx));
  const data = employeeSchema.parse(input);
  await validateEmployeeRelations(ctx, data);
  if (data.invite && !data.email) throw new AppError(m('Une adresse e-mail est nécessaire pour inviter un employé.'), 'invalid', { email: m('Une adresse e-mail est nécessaire pour inviter un employé.') });
  const employee = await db.$transaction(async (tx) => {
    // Two simultaneous creations must not both pass the plan limit.
    await lockOrganization(tx, ctx.organizationId);
    await assertWithinLimit(ctx, 'employees', () => countActiveEmployees(ctx.organizationId, tx));
    return tx.ptEmployee.create({
      data: { organizationId: ctx.organizationId, firstName: data.firstName, lastName: data.lastName, email: data.email, role: data.role, departmentId: data.departmentId, scheduleId: data.scheduleId, vacationDays: data.vacationDays },
    });
  });
  await syncSeats(ctx);
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'pointage.employee.created', entity: 'PtEmployee', entityId: employee.id, meta: { role: employee.role, departmentId: employee.departmentId } });
  if (data.invite) await linkLogin(ctx, employee);
  return db.ptEmployee.findFirstOrThrow({ where: { id: employee.id, organizationId: ctx.organizationId } });
}

export async function updateEmployee(ctx: TenantCtx, employeeId: string, input: EmployeeInput) {
  assertAdmin(await resolveActor(ctx));
  const data = employeeSchema.parse(input);
  const existing = await db.ptEmployee.findFirst({ where: { id: id.parse(employeeId), organizationId: ctx.organizationId } });
  if (!existing) throw notFoundError(m('Employé introuvable.'));
  await validateEmployeeRelations(ctx, data, existing.id);
  await db.$transaction(async (tx) => {
    await tx.ptEmployee.updateMany({
      where: { id: existing.id, organizationId: ctx.organizationId },
      data: { firstName: data.firstName, lastName: data.lastName, email: data.email, role: data.role, departmentId: data.departmentId, scheduleId: data.scheduleId, vacationDays: data.vacationDays },
    });
    // A plain employee cannot remain the manager of a department.
    if (data.role === 'EMPLOYEE') await tx.ptDepartment.updateMany({ where: { organizationId: ctx.organizationId, managerId: existing.id }, data: { managerId: null } });
  });
  await audit({
    actorId: ctx.userId, organizationId: ctx.organizationId, action: 'pointage.employee.updated', entity: 'PtEmployee', entityId: existing.id,
    meta: { before: { role: existing.role, departmentId: existing.departmentId, scheduleId: existing.scheduleId, vacationDays: existing.vacationDays }, after: { role: data.role, departmentId: data.departmentId, scheduleId: data.scheduleId, vacationDays: data.vacationDays } },
  });
}

/** Deactivating keeps the history; reactivating is subject to the plan limit. Seats follow in both cases. */
export async function setEmployeeActive(ctx: TenantCtx, employeeId: string, active: boolean) {
  assertAdmin(await resolveActor(ctx));
  const existing = await db.ptEmployee.findFirst({ where: { id: id.parse(employeeId), organizationId: ctx.organizationId } });
  if (!existing) throw notFoundError(m('Employé introuvable.'));
  if (existing.active !== active) {
    await db.$transaction(async (tx) => {
      await lockOrganization(tx, ctx.organizationId);
      if (active) await assertWithinLimit(ctx, 'employees', () => countActiveEmployees(ctx.organizationId, tx));
      await tx.ptEmployee.updateMany({ where: { id: existing.id, organizationId: ctx.organizationId }, data: { active } });
      if (!active) await tx.ptDepartment.updateMany({ where: { organizationId: ctx.organizationId, managerId: existing.id }, data: { managerId: null } });
    });
    await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: active ? 'pointage.employee.reactivated' : 'pointage.employee.deactivated', entity: 'PtEmployee', entityId: existing.id });
  }
  await syncSeats(ctx);
}

export async function inviteEmployee(ctx: TenantCtx, employeeId: string) {
  assertAdmin(await resolveActor(ctx));
  const existing = await db.ptEmployee.findFirst({ where: { id: id.parse(employeeId), organizationId: ctx.organizationId } });
  if (!existing) throw notFoundError(m('Employé introuvable.'));
  if (!existing.active) throw new AppError(m('Cet employé est désactivé.'), 'conflict');
  if (existing.userId) throw new AppError(m('Cet employé a déjà un accès.'), 'conflict');
  await linkLogin(ctx, existing);
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'pointage.employee.invited', entity: 'PtEmployee', entityId: existing.id });
}

// ───────────────────────────── Clocking ─────────────────────────────

const lastEntry = (client: Tx | typeof db, organizationId: string, employeeId: string, before?: Date) =>
  client.ptTimeEntry.findFirst({ where: { organizationId, employeeId, voidedAt: null, ...(before ? { at: { lt: before } } : {}) }, orderBy: [{ at: 'desc' }, { createdAt: 'desc' }] });

function invalidTransition(state: ClockState, action: EntryType): AppError {
  const message = action === 'CLOCK_IN'
    ? m('Vous avez déjà pointé votre entrée. Pointez votre sortie avant une nouvelle entrée.')
    : action === 'CLOCK_OUT'
      ? (state === 'BREAK' ? m('Terminez votre pause avant de pointer votre sortie.') : m('Vous n’avez pas pointé votre entrée.'))
      : action === 'BREAK_START'
        ? (state === 'BREAK' ? m('Une pause est déjà en cours.') : m('Pointez votre entrée avant de commencer une pause.'))
        : m('Aucune pause n’est en cours.');
  return new AppError(message, 'conflict');
}

/** Two identical actions closer than this are one accidental double tap. */
export const DUPLICATE_WINDOW_MS = 60_000;

/**
 * Records a clock action for the signed-in employee. The timestamp is the server clock: there is deliberately
 * no parameter for the time or for the employee.
 */
export async function clock(ctx: TenantCtx, action: EntryType, opts: { source?: 'web' | 'mobile' } = {}): Promise<PtTimeEntry> {
  const type = ENTRY_TYPE.parse(action);
  assertFeature(ctx, 'clock');
  const me = selfEmployee(await resolveActor(ctx));
  const source = opts.source === 'mobile' ? 'mobile' : 'web';
  const entry = await db.$transaction(async (tx) => {
    await lockEmployee(tx, me.id);
    // Everything below is re-read under the lock, so concurrent requests are evaluated one after the other.
    const employee = await tx.ptEmployee.findFirst({ where: { id: me.id, organizationId: ctx.organizationId, active: true } });
    if (!employee) throw new AppError(NOT_LINKED, 'forbidden');
    const now = new Date();
    const duplicate = await tx.ptTimeEntry.findFirst({ where: { organizationId: ctx.organizationId, employeeId: employee.id, voidedAt: null, type, at: { gt: new Date(now.getTime() - DUPLICATE_WINDOW_MS) } } });
    if (duplicate) throw new AppError(m('Ce pointage vient déjà d’être enregistré.'), 'conflict');
    const last = await lastEntry(tx, ctx.organizationId, employee.id);
    const state = stateAfter(last?.type);
    if (!transition(state, type)) throw invalidTransition(state, type);
    return tx.ptTimeEntry.create({ data: { organizationId: ctx.organizationId, employeeId: employee.id, type, at: now, source } });
  }, { timeout: 15_000, maxWait: 15_000 });
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'pointage.clock', entity: 'PtTimeEntry', entityId: entry.id, meta: { employeeId: me.id, type, at: entry.at.toISOString(), source } });
  return entry;
}

export type TodayView = { state: ClockState; actions: EntryType[]; today: DaySummary | null; entries: PtTimeEntry[]; week: WeekSummary | null };

/** Clock screen of the signed-in employee: state, valid next actions, today's entries and totals. */
export async function getClockView(ctx: TenantCtx): Promise<(TodayView & { employee: PtEmployee; timezone: string; date: string }) | null> {
  const actor = await resolveActor(ctx);
  if (!actor.employee) return null;
  const me = await db.ptEmployee.findFirstOrThrow({ where: { id: actor.employee.id, organizationId: ctx.organizationId }, include: { schedule: true } });
  const org = await loadOrgSettings(ctx.organizationId);
  const now = new Date();
  const date = localDateKey(now, org.timezone);
  const [sheet] = await timesheets(ctx.organizationId, [me], addDays(weekStart(date), -1), date, org, now);
  const last = await lastEntry(db, ctx.organizationId, me.id);
  const state = stateAfter(last?.type);
  const { start, end } = dayBounds(date, org.timezone);
  // A night shift started yesterday is still the running session: show it from its clock-in.
  const openedAt = state === 'OUT' ? null : (await db.ptTimeEntry.findFirst({ where: { organizationId: ctx.organizationId, employeeId: me.id, voidedAt: null, type: 'CLOCK_IN' }, orderBy: { at: 'desc' } }))?.at ?? null;
  const from = openedAt && openedAt < start && start.getTime() - openedAt.getTime() < 24 * 3600_000 ? openedAt : start;
  const entries = await db.ptTimeEntry.findMany({ where: { organizationId: ctx.organizationId, employeeId: me.id, voidedAt: null, at: { gte: from, lt: end } }, orderBy: [{ at: 'asc' }, { createdAt: 'asc' }] });
  const today = sheet.days.find((d) => d.date === date) ?? (from < start ? sheet.days.find((d) => d.open) ?? null : null);
  return { employee: me, timezone: org.timezone, date, state, actions: nextActions(state), today, entries, week: sheet.weeks.find((w) => w.start === weekStart(date)) ?? null };
}

// ───────────────────────────── Timesheets (shared by history, team, calendar, reports) ─────────────────────────────

type EmployeeWithSchedule = PtEmployee & { schedule: PtSchedule | null };
export type Timesheet = { employee: EmployeeWithSchedule; days: DaySummary[]; weeks: WeekSummary[]; absences: PtAbsence[]; absentDates: Set<string> };
type OrgInfo = { timezone: string; settings: PointageSettings };

/**
 * Computes days and ISO weeks of several employees between two local dates (inclusive).
 * Entries are loaded one day wider on each side so that sessions crossing midnight are complete,
 * then days outside the range are dropped. Internal: callers have already checked the scope.
 */
export async function timesheets(organizationId: string, employees: EmployeeWithSchedule[], from: string, to: string, org: OrgInfo, now = new Date()): Promise<Timesheet[]> {
  if (!employees.length) return [];
  const ids = employees.map((e) => e.id);
  const today = localDateKey(now, org.timezone);
  const [entries, absences] = await Promise.all([
    db.ptTimeEntry.findMany({
      where: { organizationId, employeeId: { in: ids }, voidedAt: null, at: { gte: dayBounds(addDays(from, -1), org.timezone).start, lt: dayBounds(addDays(to, 1), org.timezone).end } },
      orderBy: [{ at: 'asc' }, { createdAt: 'asc' }], select: { employeeId: true, type: true, at: true },
    }),
    db.ptAbsence.findMany({ where: { organizationId, employeeId: { in: ids }, startDate: { lte: dateKeyToDate(to) }, endDate: { gte: dateKeyToDate(from) } }, orderBy: { startDate: 'asc' } }),
  ]);
  const byEmployee = new Map<string, { type: EntryType; at: Date }[]>();
  for (const e of entries) byEmployee.set(e.employeeId, [...(byEmployee.get(e.employeeId) ?? []), e]);
  return employees.map((employee) => {
    const schedule = employee.schedule ? parseScheduleDays(employee.schedule.days) : null;
    const days = computeDays(byEmployee.get(employee.id) ?? [], org.timezone, { now, maxDailyMinutes: org.settings.maxDailyMinutes, minBreakMinutesAfter6h: org.settings.minBreakMinutesAfter6h })
      .filter((d) => d.date >= from && d.date <= to);
    const mine = absences.filter((a) => a.employeeId === employee.id);
    const absentDates = new Set<string>();
    for (const a of mine) if (a.status === 'APPROVED') for (const k of dateRange(dateToDateKey(a.startDate), dateToDateKey(a.endDate))) absentDates.add(k);
    const weeks = computeWeeks(days, {
      overtimeAfterMinutes: employee.schedule?.weeklyMinutes ?? org.settings.weeklyOvertimeAfterMinutes,
      scheduledFor: (k) => scheduledMinutesOn(k, schedule, org.settings.dailyTargetMinutes),
      from, to: to < today ? to : today, absentDates,
    });
    return { employee, days, weeks, absences: mine, absentDates };
  });
}

const rangeSchema = z.object({ from: dateKey, to: dateKey }).refine((r) => r.from <= r.to, m('La date de fin doit être après la date de début.')).refine((r) => diffDays(r.from, r.to) <= 366, m('La période ne peut pas dépasser un an.'));

/** Timesheet of one employee (self by default). Scope: self, managed team or everyone depending on the role. */
export async function getTimesheet(ctx: TenantCtx, input: { employeeId?: string | null; from: string; to: string }) {
  const actor = await resolveActor(ctx);
  assertLinked(actor);
  const range = rangeSchema.parse({ from: input.from, to: input.to });
  const employee = input.employeeId ? await loadEmployee(ctx, actor, input.employeeId, 'view') : await loadEmployee(ctx, actor, selfEmployee(actor).id, 'view');
  const org = await loadOrgSettings(ctx.organizationId);
  const [sheet] = await timesheets(ctx.organizationId, [employee], range.from, range.to, org);
  return { ...sheet, timezone: org.timezone, canManage: canManage(actor, employee) };
}

const historySchema = z.object({
  employeeId: optionalId, from: dateKey.optional(), to: dateKey.optional(),
  type: ENTRY_TYPE.optional(), includeVoided: z.boolean().optional().default(false),
  page: z.coerce.number().int().min(1).max(100000).catch(1).default(1), pageSize: z.number().int().min(1).max(200).default(50),
});

/** Paginated entry history. Without an employee filter it covers every employee the actor may see. */
export async function listEntries(ctx: TenantCtx, input: z.input<typeof historySchema> = {}) {
  const actor = await resolveActor(ctx);
  assertLinked(actor);
  const f = historySchema.parse(input);
  const org = await loadOrgSettings(ctx.organizationId);
  if (f.employeeId) await loadEmployee(ctx, actor, f.employeeId, 'view');
  const where: Prisma.PtTimeEntryWhereInput = {
    organizationId: ctx.organizationId,
    employee: visibleEmployeesWhere(ctx, actor),
    ...(f.employeeId ? { employeeId: f.employeeId } : {}),
    ...(f.type ? { type: f.type } : {}),
    ...(f.includeVoided ? {} : { voidedAt: null }),
    ...(f.from || f.to ? { at: { ...(f.from ? { gte: dayBounds(f.from, org.timezone).start } : {}), ...(f.to ? { lt: dayBounds(f.to, org.timezone).end } : {}) } } : {}),
  };
  const [total, items] = await Promise.all([
    db.ptTimeEntry.count({ where }),
    db.ptTimeEntry.findMany({ where, orderBy: [{ at: 'desc' }, { createdAt: 'desc' }], skip: (f.page - 1) * f.pageSize, take: f.pageSize, include: { employee: { select: { id: true, firstName: true, lastName: true } } } }),
  ]);
  return { items, total, page: f.page, pages: Math.max(1, Math.ceil(total / f.pageSize)), timezone: org.timezone };
}

// ───────────────────────────── Corrections ─────────────────────────────

const snapshot = (entries: Pick<PtTimeEntry, 'id' | 'type' | 'at'>[]) => entries.map((e) => ({ id: e.id, type: e.type, at: e.at.toISOString() }));

async function dayEntries(tx: Tx, organizationId: string, employeeId: string, date: string, timezone: string) {
  const { start, end } = dayBounds(date, timezone);
  const previous = await lastEntry(tx, organizationId, employeeId, start);
  const entries = await tx.ptTimeEntry.findMany({ where: { organizationId, employeeId, voidedAt: null, at: { gte: start, lt: end } }, orderBy: [{ at: 'asc' }, { createdAt: 'asc' }] });
  return { initial: stateAfter(previous?.type), entries };
}

async function assertCorrectionsAllowed(ctx: TenantCtx) {
  const actor = await resolveActor(ctx);
  assertManager(actor);
  const org = await loadOrgSettings(ctx.organizationId);
  if (!org.settings.allowManualCorrections) throw new AppError(m('Les corrections manuelles sont désactivées pour cette entreprise.'), 'forbidden');
  return { actor, org };
}

const reason = z.string({ message: m('Le motif est obligatoire.') }).trim().min(3, m('Le motif est obligatoire (3 caractères minimum).')).max(500, m('Texte trop long.'));
const manualSchema = z.object({
  employeeId: id, date: dateKey, reason,
  entries: z.array(z.object({ type: ENTRY_TYPE, time })).min(1, m('Type de pointage invalide.')).max(4, m('Trop de pointages en une seule correction.')),
});

/**
 * Adds one or several entries (e.g. a forgotten break = start + end) at local times of a date in the organization's
 * timezone, atomically. Manager of the employee's department or admin. The day's sequence must remain a valid
 * state machine sequence. Always audited (one row per created entry) with the day before/after.
 */
export async function addManualEntries(ctx: TenantCtx, input: z.input<typeof manualSchema>) {
  const { actor, org } = await assertCorrectionsAllowed(ctx);
  const data = manualSchema.parse(input);
  const employee = await loadEmployee(ctx, actor, data.employeeId, 'manage');
  const now = new Date();
  const additions = data.entries.map((entry, i) => {
    const at = zonedToUtc(data.date, entry.time, org.timezone, true);
    if (!at) throw new AppError(m('Cette heure n’existe pas ce jour-là (changement d’heure).'), 'invalid', { time: m('Cette heure n’existe pas ce jour-là (changement d’heure).') });
    if (at > now) throw new AppError(m('Un pointage ne peut pas être dans le futur.'), 'invalid', { time: m('Un pointage ne peut pas être dans le futur.') });
    return { id: `new:${i}`, type: entry.type as EntryType, at };
  });
  return db.$transaction(async (tx) => {
    await lockEmployee(tx, employee.id);
    const day = await dayEntries(tx, ctx.organizationId, employee.id, data.date, org.timezone);
    // Stable sort: on equal timestamps existing entries stay first.
    const after = [...day.entries.map((e) => ({ id: e.id, type: e.type as EntryType, at: e.at })), ...additions].sort((a, b) => a.at.getTime() - b.at.getTime());
    if (!validateSequence(day.initial, after).ok) throw new AppError(m('Correction refusée : la séquence des pointages de cette journée ne serait plus cohérente.'), 'conflict');
    const created: PtTimeEntry[] = [];
    for (const a of additions) {
      const entry = await tx.ptTimeEntry.create({ data: { organizationId: ctx.organizationId, employeeId: employee.id, type: a.type, at: a.at, source: 'manual', note: data.reason, createdById: ctx.userId } });
      created.push(entry);
      a.id = entry.id;
    }
    for (const entry of created) {
      await tx.auditLog.create({
        data: {
          actorId: ctx.userId, organizationId: ctx.organizationId, action: 'pointage.entry.added', entity: 'PtTimeEntry', entityId: entry.id,
          meta: { employeeId: employee.id, date: data.date, reason: data.reason, added: { type: entry.type, at: entry.at.toISOString() }, before: snapshot(day.entries), after: snapshot(after) },
        },
      });
    }
    return created;
  }, { timeout: 15_000, maxWait: 15_000 });
}

/** Single manual entry (see addManualEntries). */
export async function addManualEntry(ctx: TenantCtx, input: { employeeId: string; type: EntryType; date: string; time: string; reason: string }) {
  const [entry] = await addManualEntries(ctx, { employeeId: input.employeeId, date: input.date, reason: input.reason, entries: [{ type: input.type, time: input.time }] });
  return entry;
}

const voidSchema = z.object({ entryId: id, reason });

/** Voids an entry (never deletes it). Mandatory reason, same scope and consistency rules as a manual entry. */
export async function voidEntry(ctx: TenantCtx, input: z.input<typeof voidSchema>) {
  const { actor, org } = await assertCorrectionsAllowed(ctx);
  const data = voidSchema.parse(input);
  const found = await db.ptTimeEntry.findFirst({ where: { id: data.entryId, organizationId: ctx.organizationId } });
  if (!found) throw notFoundError(m('Pointage introuvable.'));
  const employee = await loadEmployee(ctx, actor, found.employeeId, 'manage');
  return db.$transaction(async (tx) => {
    await lockEmployee(tx, employee.id);
    const entry = await tx.ptTimeEntry.findFirst({ where: { id: found.id, organizationId: ctx.organizationId } });
    if (!entry) throw notFoundError(m('Pointage introuvable.'));
    if (entry.voidedAt) throw new AppError(m('Ce pointage est déjà annulé.'), 'conflict');
    const date = localDateKey(entry.at, org.timezone);
    const day = await dayEntries(tx, ctx.organizationId, employee.id, date, org.timezone);
    const after = day.entries.filter((e) => e.id !== entry.id);
    if (!validateSequence(day.initial, after).ok) throw new AppError(m('Correction refusée : la séquence des pointages de cette journée ne serait plus cohérente.'), 'conflict');
    const voidedAt = new Date();
    await tx.ptTimeEntry.updateMany({ where: { id: entry.id, organizationId: ctx.organizationId, voidedAt: null }, data: { voidedAt, voidedById: ctx.userId } });
    await tx.auditLog.create({
      data: {
        actorId: ctx.userId, organizationId: ctx.organizationId, action: 'pointage.entry.voided', entity: 'PtTimeEntry', entityId: entry.id,
        meta: { employeeId: employee.id, date, reason: data.reason, voided: { type: entry.type, at: entry.at.toISOString(), source: entry.source }, before: snapshot(day.entries), after: snapshot(after) },
      },
    });
    return { ...entry, voidedAt, voidedById: ctx.userId };
  }, { timeout: 15_000, maxWait: 15_000 });
}

/** Day detail of an employee for the team screen: entries (voided included) and the computed summary. */
export async function getDayDetail(ctx: TenantCtx, employeeId: string, date: string) {
  const actor = await resolveActor(ctx);
  assertLinked(actor);
  const day = dateKey.parse(date);
  const employee = await loadEmployee(ctx, actor, employeeId, 'view');
  const org = await loadOrgSettings(ctx.organizationId);
  const { start, end } = dayBounds(day, org.timezone);
  const [entries, [sheet]] = await Promise.all([
    db.ptTimeEntry.findMany({ where: { organizationId: ctx.organizationId, employeeId: employee.id, at: { gte: start, lt: end } }, orderBy: [{ at: 'asc' }, { createdAt: 'asc' }] }),
    timesheets(ctx.organizationId, [employee], day, day, org),
  ]);
  return {
    employee, date: day, timezone: org.timezone, entries, summary: sheet.days[0] ?? null,
    canCorrect: canManage(actor, employee) && org.settings.allowManualCorrections,
    correctionsDisabled: !org.settings.allowManualCorrections,
  };
}

// ───────────────────────────── Absences ─────────────────────────────

const ABSENCE_TYPE = z.enum(['VACATION', 'SICK', 'UNPAID', 'OTHER'], { message: m('Type d’absence invalide.') });
const absenceSchema = z.object({
  employeeId: optionalId,
  type: ABSENCE_TYPE, startDate: dateKey, endDate: dateKey,
  note: z.string().nullish().transform((v) => (v && v.trim() ? v.trim().slice(0, 1000) : null)),
});

const scheduleOf = (e: { schedule: PtSchedule | null }) => (e.schedule ? parseScheduleDays(e.schedule.days) : null);

/**
 * Absence request. Employees request for themselves; a manager/admin may record one for an employee they manage.
 * A request overlapping another pending or approved absence of the same employee is refused.
 */
export async function requestAbsence(ctx: TenantCtx, input: z.input<typeof absenceSchema>) {
  assertFeature(ctx, 'absences');
  const actor = await resolveActor(ctx);
  assertLinked(actor);
  const data = absenceSchema.parse(input);
  if (data.endDate < data.startDate) throw new AppError(m('La date de fin doit être après la date de début.'), 'invalid', { endDate: m('La date de fin doit être après la date de début.') });
  if (diffDays(data.startDate, data.endDate) > 366) throw new AppError(m('La période ne peut pas dépasser un an.'), 'invalid', { endDate: m('La période ne peut pas dépasser un an.') });
  const forOther = !!data.employeeId && data.employeeId !== actor.employee?.id;
  const employee = forOther ? await loadEmployee(ctx, actor, data.employeeId!, 'manage') : await loadEmployee(ctx, actor, selfEmployee(actor).id, 'view');
  if (!employee.active) throw new AppError(m('Cet employé est désactivé.'), 'conflict');
  if (countWorkingDays(data.startDate, data.endDate, scheduleOf(employee)) === 0) throw new AppError(m('Cette période ne contient aucun jour travaillé.'), 'invalid', { startDate: m('Cette période ne contient aucun jour travaillé.') });
  const absence = await db.$transaction(async (tx) => {
    await lockEmployee(tx, employee.id);
    const overlap = await tx.ptAbsence.findFirst({
      where: { organizationId: ctx.organizationId, employeeId: employee.id, status: { in: ['PENDING', 'APPROVED'] }, startDate: { lte: dateKeyToDate(data.endDate) }, endDate: { gte: dateKeyToDate(data.startDate) } },
    });
    if (overlap) throw new AppError(m('Cette période chevauche une autre demande d’absence.'), 'conflict', { startDate: m('Cette période chevauche une autre demande d’absence.') });
    return tx.ptAbsence.create({ data: { organizationId: ctx.organizationId, employeeId: employee.id, type: data.type, startDate: dateKeyToDate(data.startDate), endDate: dateKeyToDate(data.endDate), note: data.note } });
  });
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'pointage.absence.requested', entity: 'PtAbsence', entityId: absence.id, meta: { employeeId: employee.id, type: data.type, startDate: data.startDate, endDate: data.endDate } });
  if (employee.department?.managerId && employee.department.managerId !== employee.id) {
    const manager = await db.ptEmployee.findFirst({ where: { id: employee.department.managerId, organizationId: ctx.organizationId, active: true } });
    await notify(manager?.userId, m('Nouvelle demande d’absence'), fullName(employee), '/app/pointage/approvals');
  }
  return absence;
}

/** The employee withdraws their own request while it is still pending. */
export async function cancelAbsence(ctx: TenantCtx, absenceId: string) {
  const me = selfEmployee(await resolveActor(ctx));
  const absence = await db.ptAbsence.findFirst({ where: { id: id.parse(absenceId), organizationId: ctx.organizationId, employeeId: me.id } });
  if (!absence) throw notFoundError(m('Demande introuvable.'));
  if (absence.status !== 'PENDING') throw new AppError(m('Seule une demande en attente peut être retirée.'), 'conflict');
  await db.ptAbsence.deleteMany({ where: { id: absence.id, organizationId: ctx.organizationId, employeeId: me.id, status: 'PENDING' } });
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'pointage.absence.cancelled', entity: 'PtAbsence', entityId: absence.id, meta: { employeeId: me.id, type: absence.type, startDate: dateToDateKey(absence.startDate), endDate: dateToDateKey(absence.endDate) } });
}

/** Approve / reject: admin, or the manager of the employee's department (never one's own request as a manager). */
export async function decideAbsence(ctx: TenantCtx, absenceId: string, decision: 'APPROVED' | 'REJECTED') {
  const actor = await resolveActor(ctx);
  assertManager(actor);
  const status = z.enum(['APPROVED', 'REJECTED'], { message: m('Décision invalide.') }).parse(decision);
  const absence = await db.ptAbsence.findFirst({ where: { id: id.parse(absenceId), organizationId: ctx.organizationId } });
  if (!absence) throw notFoundError(m('Demande introuvable.'));
  const employee = await loadEmployee(ctx, actor, absence.employeeId, 'manage');
  const done = await db.ptAbsence.updateMany({ where: { id: absence.id, organizationId: ctx.organizationId, status: 'PENDING' }, data: { status, decidedById: ctx.userId, decidedAt: new Date() } });
  if (done.count === 0) throw new AppError(m('Cette demande a déjà été traitée.'), 'conflict');
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: status === 'APPROVED' ? 'pointage.absence.approved' : 'pointage.absence.rejected', entity: 'PtAbsence', entityId: absence.id, meta: { employeeId: employee.id, type: absence.type, startDate: dateToDateKey(absence.startDate), endDate: dateToDateKey(absence.endDate) } });
  await notify(employee.userId, status === 'APPROVED' ? m('Votre demande d’absence a été approuvée') : m('Votre demande d’absence a été refusée'), `${dateToDateKey(absence.startDate)} → ${dateToDateKey(absence.endDate)}`, '/app/pointage/absences');
}

export type VacationBalance = { year: number; entitled: number; taken: number; pending: number; remaining: number };

/** Working days (scheduled days, or Monday–Friday) of an absence that fall inside a year. */
function absenceDaysInYear(a: Pick<PtAbsence, 'startDate' | 'endDate'>, year: number, schedule: ScheduleDay[] | null) {
  const from = dateToDateKey(a.startDate) < `${year}-01-01` ? `${year}-01-01` : dateToDateKey(a.startDate);
  const to = dateToDateKey(a.endDate) > `${year}-12-31` ? `${year}-12-31` : dateToDateKey(a.endDate);
  return from <= to ? countWorkingDays(from, to, schedule) : 0;
}

async function computeBalance(organizationId: string, employee: EmployeeWithSchedule, timezone: string, now = new Date()): Promise<VacationBalance> {
  const year = Number(localDateKey(now, timezone).slice(0, 4));
  const rows = await db.ptAbsence.findMany({
    where: { organizationId, employeeId: employee.id, type: 'VACATION', status: { in: ['APPROVED', 'PENDING'] }, startDate: { lte: dateKeyToDate(`${year}-12-31`) }, endDate: { gte: dateKeyToDate(`${year}-01-01`) } },
  });
  const schedule = scheduleOf(employee);
  const sum = (status: string) => rows.filter((a) => a.status === status).reduce((s, a) => s + absenceDaysInYear(a, year, schedule), 0);
  const taken = sum('APPROVED');
  return { year, entitled: employee.vacationDays, taken, pending: sum('PENDING'), remaining: employee.vacationDays - taken };
}

/** Vacation balance of the current year: entitlement − approved vacation working days. */
export async function vacationBalance(ctx: TenantCtx, employeeId?: string | null): Promise<VacationBalance> {
  const actor = await resolveActor(ctx);
  assertLinked(actor);
  const employee = await loadEmployee(ctx, actor, employeeId || selfEmployee(actor).id, 'view');
  return computeBalance(ctx.organizationId, employee, (await loadOrgSettings(ctx.organizationId)).timezone);
}

const withDays = <T extends PtAbsence>(a: T, schedule: ScheduleDay[] | null) => ({ ...a, start: dateToDateKey(a.startDate), end: dateToDateKey(a.endDate), workingDays: countWorkingDays(dateToDateKey(a.startDate), dateToDateKey(a.endDate), schedule) });

/** Own absences (most recent first) with the balance. Returns null when the user has no employee record. */
export async function listMyAbsences(ctx: TenantCtx) {
  const actor = await resolveActor(ctx);
  if (!actor.employee) return null;
  const employee = await loadEmployee(ctx, actor, actor.employee.id, 'view');
  const org = await loadOrgSettings(ctx.organizationId);
  const rows = await db.ptAbsence.findMany({ where: { organizationId: ctx.organizationId, employeeId: employee.id }, orderBy: { startDate: 'desc' }, take: 200 });
  return { employee, absences: rows.map((a) => withDays(a, scheduleOf(employee))), balance: await computeBalance(ctx.organizationId, employee, org.timezone), today: localDateKey(new Date(), org.timezone) };
}

/** Requests of the actor's scope: pending ones to decide, plus the recently decided ones. */
export async function listTeamAbsences(ctx: TenantCtx) {
  const actor = await resolveActor(ctx);
  assertManager(actor);
  const scope: Prisma.PtAbsenceWhereInput = { organizationId: ctx.organizationId, employee: visibleEmployeesWhere(ctx, actor) };
  const include = { employee: { include: { schedule: true, department: true } } } as const;
  const [pending, decided] = await Promise.all([
    db.ptAbsence.findMany({ where: { ...scope, status: 'PENDING' }, orderBy: { startDate: 'asc' }, include }),
    db.ptAbsence.findMany({ where: { ...scope, status: { not: 'PENDING' } }, orderBy: { decidedAt: 'desc' }, take: 30, include }),
  ]);
  const map = (rows: typeof pending) => rows.map((a) => ({ ...withDays(a, scheduleOf(a.employee)), canDecide: canManage(actor, a.employee) }));
  return { pending: map(pending), decided: map(decided) };
}

// ───────────────────────────── Team status & calendar ─────────────────────────────

export type TeamMemberStatus = {
  employee: PtEmployee & { department: { id: string; name: string } | null };
  status: 'IN' | 'BREAK' | 'OUT' | 'ABSENT';
  since: Date | null;
  absenceType: PtAbsence['type'] | null;
  workedMinutes: number;
  anomalies: DaySummary['anomalies'];
};

/** Who is in / on break / out / absent right now, limited to the employees the actor manages or is. */
export async function getTeamStatus(ctx: TenantCtx, opts: { departmentId?: string | null } = {}) {
  const actor = await resolveActor(ctx);
  assertManager(actor);
  const org = await loadOrgSettings(ctx.organizationId);
  const now = new Date();
  const date = localDateKey(now, org.timezone);
  const employees = await db.ptEmployee.findMany({
    where: { AND: [visibleEmployeesWhere(ctx, actor), { active: true }, opts.departmentId ? { departmentId: opts.departmentId } : {}] },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }], include: { schedule: true, department: true },
  });
  const ids = employees.map((e) => e.id);
  const [sheets, lasts] = await Promise.all([
    timesheets(ctx.organizationId, employees, addDays(date, -1), date, org, now),
    db.ptTimeEntry.findMany({ where: { organizationId: ctx.organizationId, employeeId: { in: ids }, voidedAt: null }, orderBy: [{ employeeId: 'asc' }, { at: 'desc' }, { createdAt: 'desc' }], distinct: ['employeeId'], select: { employeeId: true, type: true, at: true } }),
  ]);
  const members: TeamMemberStatus[] = employees.map((employee, i) => {
    const sheet = sheets[i];
    const last = lasts.find((l) => l.employeeId === employee.id);
    const state = stateAfter(last?.type as EntryType | undefined);
    const absence = sheet.absences.find((a) => a.status === 'APPROVED' && dateToDateKey(a.startDate) <= date && dateToDateKey(a.endDate) >= date);
    // A session still open from yesterday evening (night shift) is shown on its own day.
    const day = sheet.days.find((d) => d.date === date) ?? (state !== 'OUT' ? sheet.days.find((d) => d.open) : undefined);
    return {
      employee, status: state !== 'OUT' ? state : absence ? 'ABSENT' : 'OUT', since: last?.at ?? null, absenceType: absence?.type ?? null,
      workedMinutes: day?.workedMinutes ?? 0, anomalies: [...new Set(sheet.days.flatMap((d) => d.anomalies))],
    };
  });
  const count = (s: TeamMemberStatus['status']) => members.filter((x) => x.status === s).length;
  return { date, timezone: org.timezone, members, counts: { IN: count('IN'), BREAK: count('BREAK'), OUT: count('OUT'), ABSENT: count('ABSENT') } };
}

const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, m('Mois invalide.'));

/** Month grid: per day the worked minutes and the absences of the employees in the actor's scope. */
export async function getCalendar(ctx: TenantCtx, input: { month?: string | null; employeeId?: string | null; departmentId?: string | null } = {}) {
  const actor = await resolveActor(ctx);
  assertLinked(actor);
  const org = await loadOrgSettings(ctx.organizationId);
  const today = localDateKey(new Date(), org.timezone);
  const month = monthSchema.safeParse(input.month).success ? (input.month as string) : today.slice(0, 7);
  const from = `${month}-01`;
  const [y, mo] = month.split('-').map(Number);
  const last = addDays(mo === 12 ? `${y + 1}-01-01` : `${y}-${String(mo + 1).padStart(2, '0')}-01`, -1);
  if (input.employeeId) await loadEmployee(ctx, actor, input.employeeId, 'view');
  const employees = await db.ptEmployee.findMany({
    where: { AND: [visibleEmployeesWhere(ctx, actor), input.employeeId ? { id: input.employeeId } : { active: true }, input.departmentId ? { departmentId: input.departmentId } : {}] },
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }], include: { schedule: true },
  });
  const sheets = await timesheets(ctx.organizationId, employees, from, last, org);
  const days = dateRange(from, last).map((date) => ({
    date,
    workedMinutes: sheets.reduce((s, sh) => s + (sh.days.find((d) => d.date === date)?.workedMinutes ?? 0), 0),
    present: sheets.filter((sh) => sh.days.some((d) => d.date === date)).length,
    anomalies: sheets.reduce((s, sh) => s + (sh.days.find((d) => d.date === date)?.anomalies.length ?? 0), 0),
    absences: sheets.flatMap((sh) => sh.absences
      .filter((a) => a.status !== 'REJECTED' && dateToDateKey(a.startDate) <= date && dateToDateKey(a.endDate) >= date && isWorkingDay(date, scheduleOf(sh.employee)))
      .map((a) => ({ id: a.id, employeeId: sh.employee.id, name: fullName(sh.employee), type: a.type, status: a.status }))),
  }));
  return { month, from, to: last, today, timezone: org.timezone, days, employees: employees.map((e) => ({ id: e.id, name: fullName(e) })), previous: addDays(from, -1).slice(0, 7), next: addDays(last, 1).slice(0, 7) };
}

/** Filter options (employees / departments) limited to the actor's scope. */
export async function scopeOptions(ctx: TenantCtx) {
  const actor = await resolveActor(ctx);
  assertLinked(actor);
  const employees = await db.ptEmployee.findMany({ where: { ...visibleEmployeesWhere(ctx, actor), active: true }, orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }], select: { id: true, firstName: true, lastName: true, departmentId: true } });
  const departments = actor.role === 'ADMIN' || actor.role === 'MANAGER'
    ? await db.ptDepartment.findMany({ where: { organizationId: ctx.organizationId, ...(actor.role === 'ADMIN' ? {} : { id: { in: actor.managedDepartmentIds } }) }, orderBy: { name: 'asc' }, select: { id: true, name: true } })
    : [];
  return { employees: employees.map((e) => ({ id: e.id, name: fullName(e), departmentId: e.departmentId })), departments };
}

// ───────────────────────────── Audit trail ─────────────────────────────

/** Full audit trail of the organization: admin only, feature `audit`. Corrections are logged whatever the plan. */
export async function listAudit(ctx: TenantCtx, input: { page?: number | string; scope?: string | null } = {}) {
  assertAdmin(await resolveActor(ctx));
  assertFeature(ctx, 'audit');
  const page = z.coerce.number().int().min(1).max(100000).catch(1).parse(input.page ?? 1);
  const pageSize = 50;
  const where: Prisma.AuditLogWhereInput = {
    organizationId: ctx.organizationId,
    ...(input.scope === 'corrections' ? { action: { in: ['pointage.entry.added', 'pointage.entry.voided'] } } : input.scope === 'pointage' ? { action: { startsWith: 'pointage.' } } : {}),
  };
  const [total, items] = await Promise.all([
    db.auditLog.count({ where }),
    db.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  const actors = await db.user.findMany({ where: { id: { in: [...new Set(items.map((i) => i.actorId).filter((v): v is string => !!v))] }, memberships: { some: { organizationId: ctx.organizationId } } }, select: { id: true, name: true } });
  const employeeIds = [...new Set(items.map((i) => (i.meta as { employeeId?: unknown } | null)?.employeeId).filter((v): v is string => typeof v === 'string'))];
  const employees = await db.ptEmployee.findMany({ where: { organizationId: ctx.organizationId, id: { in: employeeIds } }, select: { id: true, firstName: true, lastName: true } });
  return {
    total, page, pages: Math.max(1, Math.ceil(total / pageSize)), timezone: (await loadOrgSettings(ctx.organizationId)).timezone,
    items: items.map((i) => {
      const meta = (i.meta ?? {}) as Record<string, unknown>;
      const employee = employees.find((e) => e.id === meta.employeeId);
      return { id: i.id, createdAt: i.createdAt, action: i.action, actor: actors.find((a) => a.id === i.actorId)?.name ?? null, employee: employee ? fullName(employee) : null, reason: typeof meta.reason === 'string' ? meta.reason : null, meta };
    }),
  };
}

export const hasFeature = (ctx: TenantCtx, feature: string) => planHasFeature(ctx, feature);
