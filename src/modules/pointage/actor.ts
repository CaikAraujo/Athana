import type { Prisma, PtEmployee } from '@prisma/client';
import { db } from '@/lib/db';
import { AppError, forbidden, notFoundError } from '@/lib/errors';
import { m } from '@/i18n/translate';
import { hasOrgRole, type TenantCtx } from '@/modules/tenancy/context';

export type PtActorRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'NONE';

export type Actor = {
  /** Effective Pointage role of the signed-in user in the active organization. */
  role: PtActorRole;
  /** Active employee record linked to the user, if any. */
  employee: PtEmployee | null;
  /** Departments whose manager is the actor's employee record. */
  managedDepartmentIds: string[];
};

/**
 * Single source of truth for Pointage permissions:
 * - ADMIN: organization OWNER/ADMIN, or linked employee with role ADMIN;
 * - MANAGER: linked employee with role MANAGER (or organization role MANAGER), limited to the departments they manage;
 * - EMPLOYEE: linked employee with role EMPLOYEE;
 * - NONE: no employee record and no admin role.
 */
export async function resolveActor(ctx: TenantCtx): Promise<Actor> {
  const employee = await db.ptEmployee.findFirst({ where: { organizationId: ctx.organizationId, userId: ctx.userId, active: true } });
  let role: PtActorRole = 'NONE';
  if (hasOrgRole(ctx, 'ADMIN') || employee?.role === 'ADMIN') role = 'ADMIN';
  else if (employee?.role === 'MANAGER' || ctx.role === 'MANAGER') role = 'MANAGER';
  else if (employee) role = 'EMPLOYEE';
  const managedDepartmentIds = employee && role !== 'EMPLOYEE'
    ? (await db.ptDepartment.findMany({ where: { organizationId: ctx.organizationId, managerId: employee.id }, select: { id: true } })).map((d) => d.id)
    : [];
  return { role, employee, managedDepartmentIds };
}

export const NOT_LINKED = m('Votre compte n’est pas lié à une fiche employé.');

export function assertAdmin(actor: Actor) {
  if (actor.role !== 'ADMIN') throw forbidden();
}

export function assertManager(actor: Actor) {
  if (actor.role !== 'ADMIN' && actor.role !== 'MANAGER') throw forbidden();
}

/** The actor's own employee record, required for self-service operations. */
export function selfEmployee(actor: Actor): PtEmployee {
  if (!actor.employee) throw new AppError(NOT_LINKED, 'forbidden');
  return actor.employee;
}

/** Employees the actor may SEE: everyone (admin), their departments + themselves (manager), themselves (employee). */
export function visibleEmployeesWhere(ctx: TenantCtx, actor: Actor): Prisma.PtEmployeeWhereInput {
  const base = { organizationId: ctx.organizationId };
  if (actor.role === 'ADMIN') return base;
  const self = actor.employee?.id ?? '__none__';
  if (actor.role === 'MANAGER') return { ...base, OR: [{ id: self }, { departmentId: { in: actor.managedDepartmentIds } }] };
  if (actor.role === 'EMPLOYEE') return { ...base, id: self };
  return { ...base, id: '__none__' };
}

/** Employees the actor may MANAGE (correct entries, decide absences): a manager never manages themselves. */
export function canManage(actor: Actor, employee: Pick<PtEmployee, 'id' | 'departmentId'>): boolean {
  if (actor.role === 'ADMIN') return true;
  if (actor.role !== 'MANAGER') return false;
  return employee.id !== actor.employee?.id && !!employee.departmentId && actor.managedDepartmentIds.includes(employee.departmentId);
}

export function canView(actor: Actor, employee: Pick<PtEmployee, 'id' | 'departmentId'>): boolean {
  return employee.id === actor.employee?.id || canManage(actor, employee);
}

/**
 * Loads an employee by id inside the tenant and checks the actor's scope. An id from another tenant
 * and an id outside the actor's scope both answer "not found" so that nothing leaks.
 */
export async function loadEmployee(ctx: TenantCtx, actor: Actor, employeeId: string, mode: 'view' | 'manage') {
  const employee = typeof employeeId === 'string' && employeeId
    ? await db.ptEmployee.findFirst({ where: { id: employeeId, organizationId: ctx.organizationId }, include: { schedule: true, department: true } })
    : null;
  if (!employee) throw notFoundError(m('Employé introuvable.'));
  if (!(mode === 'view' ? canView(actor, employee) : canManage(actor, employee))) throw forbidden();
  return employee;
}
