import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { AppError, notFoundError } from '@/lib/errors';
import { audit } from '@/lib/audit';
import { m } from '@/i18n/translate';
import { hasOrgRole } from '@/modules/tenancy/context';
import { ACTIVITY_TYPES } from './labels';
import { dayKey, startOfUtcDay } from './dates';
import { assertMember, optDate, optId, optText, paged, pageParams, reqText, requireCompany, requireContact, requireDeal, userNames, type TenantCtx } from './shared';

// ───────────────────────────── Activities (communication history) ─────────────────────────────
const activitySchema = z.object({
  type: z.enum(ACTIVITY_TYPES, { error: m('Type d’activité invalide.') }),
  body: reqText(5000), occurredAt: optDate, contactId: optId, companyId: optId, dealId: optId,
});
export type ActivityInput = z.input<typeof activitySchema>;

/**
 * Logs a note / call / e-mail / meeting against a contact, a company and/or a deal (all tenant-validated).
 * Missing links are completed from the record itself (deal → contact & company, contact → company) so that
 * the entry shows up on every related timeline.
 */
export async function logActivity(ctx: TenantCtx, input: ActivityInput) {
  const data = activitySchema.parse(input);
  let { contactId, companyId } = data;
  const dealId = data.dealId ?? null;
  if (!contactId && !companyId && !dealId) throw new AppError(m('Une activité doit être liée à un contact, une entreprise ou une affaire.'), 'invalid');
  if (dealId) {
    const deal = await requireDeal(ctx, dealId);
    contactId ??= deal.contactId; companyId ??= deal.companyId;
  }
  if (contactId) {
    const contact = await requireContact(ctx, contactId);
    companyId ??= contact.companyId;
  }
  if (companyId) await requireCompany(ctx, companyId);
  return db.crmActivity.create({
    data: { organizationId: ctx.organizationId, userId: ctx.userId, type: data.type, body: data.body, occurredAt: data.occurredAt ?? new Date(), contactId: contactId ?? null, companyId: companyId ?? null, dealId },
  });
}

/** The author or a MANAGER+ may delete an activity. */
export async function deleteActivity(ctx: TenantCtx, id: string) {
  const activity = await db.crmActivity.findFirst({ where: { id, organizationId: ctx.organizationId } });
  if (!activity) throw notFoundError(m('Activité introuvable.'));
  if (activity.userId !== ctx.userId && !hasOrgRole(ctx, 'MANAGER')) throw new AppError(m('Accès refusé.'), 'forbidden');
  await db.crmActivity.deleteMany({ where: { id, organizationId: ctx.organizationId } });
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'crm.activity.deleted', entity: 'CrmActivity', entityId: id, meta: { type: activity.type } });
}

const activityInclude = {
  contact: { select: { id: true, firstName: true, lastName: true } }, company: { select: { id: true, name: true } }, deal: { select: { id: true, title: true } },
} satisfies Prisma.CrmActivityInclude;

/** Timeline of one record, or the tenant's recent activity when no filter is given. */
export async function listTimeline(ctx: TenantCtx, filter: { contactId?: string; companyId?: string; dealId?: string; limit?: number } = {}) {
  const rows = await db.crmActivity.findMany({
    where: {
      organizationId: ctx.organizationId,
      ...(filter.contactId ? { contactId: filter.contactId } : {}), ...(filter.companyId ? { companyId: filter.companyId } : {}), ...(filter.dealId ? { dealId: filter.dealId } : {}),
    },
    orderBy: [{ occurredAt: 'desc' }, { createdAt: 'desc' }], take: Math.min(Math.max(filter.limit ?? 50, 1), 200), include: activityInclude,
  });
  const names = await userNames(rows.map((r) => r.userId));
  return rows.map((r) => ({ ...r, userName: names[r.userId] ?? null, canDelete: r.userId === ctx.userId || hasOrgRole(ctx, 'MANAGER') }));
}

export const recentActivity = (ctx: TenantCtx, limit = 10) => listTimeline(ctx, { limit });

// ───────────────────────────── Tasks ─────────────────────────────
const taskSchema = z.object({ title: reqText(200), description: optText(2000), dueAt: optDate, assigneeId: optId, contactId: optId, dealId: optId });
export type TaskInput = z.input<typeof taskSchema>;

async function checkTaskLinks(ctx: TenantCtx, data: { assigneeId?: string | null; contactId?: string | null; dealId?: string | null }) {
  if (data.assigneeId) await assertMember(ctx, data.assigneeId);
  if (data.contactId) await requireContact(ctx, data.contactId);
  if (data.dealId) await requireDeal(ctx, data.dealId);
}

async function requireTask(ctx: TenantCtx, id: string) {
  const task = await db.crmTask.findFirst({ where: { id, organizationId: ctx.organizationId } });
  if (!task) throw notFoundError(m('Tâche introuvable.'));
  return task;
}

export async function createTask(ctx: TenantCtx, input: TaskInput) {
  const data = taskSchema.parse(input);
  await checkTaskLinks(ctx, data);
  return db.crmTask.create({ data: { ...data, assigneeId: data.assigneeId === undefined ? ctx.userId : data.assigneeId, organizationId: ctx.organizationId } });
}

export async function updateTask(ctx: TenantCtx, id: string, input: Partial<TaskInput>) {
  const data = taskSchema.partial().parse(input);
  await requireTask(ctx, id);
  await checkTaskLinks(ctx, data);
  return db.crmTask.update({ where: { id, organizationId: ctx.organizationId }, data });
}

export async function assignTask(ctx: TenantCtx, id: string, assigneeId: string | null) {
  return updateTask(ctx, id, { assigneeId: assigneeId ?? null });
}

export async function completeTask(ctx: TenantCtx, id: string) {
  const task = await requireTask(ctx, id);
  if (task.doneAt) return task;
  return db.crmTask.update({ where: { id, organizationId: ctx.organizationId }, data: { doneAt: new Date() } });
}

export async function reopenTask(ctx: TenantCtx, id: string) {
  await requireTask(ctx, id);
  return db.crmTask.update({ where: { id, organizationId: ctx.organizationId }, data: { doneAt: null } });
}

/** The assignee or a MANAGER+ may delete a task. */
export async function deleteTask(ctx: TenantCtx, id: string) {
  const task = await requireTask(ctx, id);
  if (task.assigneeId !== ctx.userId && !hasOrgRole(ctx, 'MANAGER')) throw new AppError(m('Accès refusé.'), 'forbidden');
  await db.crmTask.deleteMany({ where: { id, organizationId: ctx.organizationId } });
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'crm.task.deleted', entity: 'CrmTask', entityId: id, meta: { title: task.title } });
}

const taskInclude = { contact: { select: { id: true, firstName: true, lastName: true } }, deal: { select: { id: true, title: true } } } satisfies Prisma.CrmTaskInclude;

const taskListSchema = pageParams.extend({
  filter: z.enum(['mine', 'all', 'overdue', 'done']).catch('mine').default('mine'),
  contactId: z.string().optional(), dealId: z.string().optional(), pageSize: z.coerce.number().int().min(1).max(200).catch(50).default(50),
});
export type TaskFilter = z.infer<typeof taskListSchema>['filter'];

/** A task is overdue when it is open and its due day is before today (UTC day; date-only values are stored at 12:00 UTC). */
export const isOverdue = (task: { dueAt: Date | null; doneAt: Date | null }, now = new Date()) => !task.doneAt && !!task.dueAt && task.dueAt < startOfUtcDay(now);

/** mine = my open tasks · all = every open task · overdue = open and past due · done = completed. */
export async function listTasks(ctx: TenantCtx, params: z.input<typeof taskListSchema> = {}) {
  const p = taskListSchema.parse(params);
  const where: Prisma.CrmTaskWhereInput = {
    organizationId: ctx.organizationId,
    ...(p.contactId ? { contactId: p.contactId } : {}), ...(p.dealId ? { dealId: p.dealId } : {}),
    ...(p.filter === 'done' ? { doneAt: { not: null } } : { doneAt: null }),
    ...(p.filter === 'mine' ? { assigneeId: ctx.userId } : {}),
    ...(p.filter === 'overdue' ? { dueAt: { lt: startOfUtcDay() } } : {}),
  };
  const [rows, total] = await Promise.all([
    db.crmTask.findMany({
      where, orderBy: p.filter === 'done' ? [{ doneAt: 'desc' }] : [{ dueAt: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
      skip: (p.page - 1) * p.pageSize, take: p.pageSize, include: taskInclude,
    }),
    db.crmTask.count({ where }),
  ]);
  const names = await userNames(rows.map((r) => r.assigneeId));
  return paged(rows.map((r) => ({ ...r, assigneeName: r.assigneeId ? names[r.assigneeId] ?? null : null, overdue: isOverdue(r) })), total, p.page, p.pageSize);
}

/** Every task (open first) of one contact or deal, for the detail pages. */
export async function tasksFor(ctx: TenantCtx, link: { contactId?: string; dealId?: string }) {
  const rows = await db.crmTask.findMany({
    where: { organizationId: ctx.organizationId, ...(link.contactId ? { contactId: link.contactId } : {}), ...(link.dealId ? { dealId: link.dealId } : {}) },
    orderBy: [{ doneAt: { sort: 'desc', nulls: 'first' } }, { dueAt: { sort: 'asc', nulls: 'last' } }], take: 100, include: taskInclude,
  });
  const names = await userNames(rows.map((r) => r.assigneeId));
  return rows.map((r) => ({ ...r, assigneeName: r.assigneeId ? names[r.assigneeId] ?? null : null, overdue: isOverdue(r) }));
}

// ───────────────────────────── Calendar ─────────────────────────────
export type CalendarEntry = { kind: 'task' | 'meeting'; id: string; title: string; at: Date; done: boolean; href: string };

/** Tasks (by due date) and meetings (by date) of one month, grouped by calendar day in `timeZone`. `month` is 1–12. */
export async function calendarMonth(ctx: TenantCtx, year: number, month: number, timeZone = 'UTC') {
  const y = z.coerce.number().int().min(2000).max(2100).parse(year);
  const mo = z.coerce.number().int().min(1).max(12).parse(month);
  const from = new Date(Date.UTC(y, mo - 1, 0));
  const to = new Date(Date.UTC(y, mo, 2));
  const [tasks, meetings] = await Promise.all([
    db.crmTask.findMany({ where: { organizationId: ctx.organizationId, dueAt: { gte: from, lt: to } }, orderBy: { dueAt: 'asc' }, take: 2000 }),
    db.crmActivity.findMany({ where: { organizationId: ctx.organizationId, type: 'meeting', occurredAt: { gte: from, lt: to } }, orderBy: { occurredAt: 'asc' }, take: 2000 }),
  ]);
  const prefix = `${y}-${String(mo).padStart(2, '0')}-`;
  const days: Record<string, CalendarEntry[]> = {};
  const push = (entry: CalendarEntry, zone: string) => {
    const key = dayKey(entry.at, zone);
    if (key.startsWith(prefix)) (days[key] ??= []).push(entry);
  };
  // Due dates are date-only (12:00 UTC): they are grouped by their UTC day so they never shift.
  for (const t of tasks) push({ kind: 'task', id: t.id, title: t.title, at: t.dueAt!, done: !!t.doneAt, href: t.dealId ? `/app/crm/deals/${t.dealId}` : t.contactId ? `/app/crm/contacts/${t.contactId}` : '/app/crm/tasks?filter=all' }, 'UTC');
  for (const a of meetings) push({ kind: 'meeting', id: a.id, title: a.body.slice(0, 80), at: a.occurredAt, done: a.occurredAt < new Date(), href: a.dealId ? `/app/crm/deals/${a.dealId}` : a.contactId ? `/app/crm/contacts/${a.contactId}` : a.companyId ? `/app/crm/companies/${a.companyId}` : '/app/crm' }, timeZone);
  return { year: y, month: mo, daysInMonth: new Date(Date.UTC(y, mo, 0)).getUTCDate(), firstWeekday: (new Date(Date.UTC(y, mo - 1, 1)).getUTCDay() + 6) % 7, days };
}
