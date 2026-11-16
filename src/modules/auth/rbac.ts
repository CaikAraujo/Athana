import type { PlatformRole } from '@prisma/client';

/** Backend permissions for ATHANA staff. Checked in every admin page, action and API route. */
export const PERMISSIONS = [
  'dashboard.view',
  'catalog.manage',
  'orders.view', 'orders.manage',
  'projects.view', 'projects.work', 'projects.manage',
  'customers.view', 'customers.manage',
  'finance.view', 'finance.manage',
  'marketing.manage',
  'content.manage',
  'leads.view',
  'support.manage',
  'saas.manage',
  'settings.manage',
  'users.manage',
  'audit.view',
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const ALL = [...PERMISSIONS];

export const ROLE_PERMISSIONS: Record<PlatformRole, readonly Permission[]> = {
  SUPER_ADMIN: ALL,
  ADMIN: ALL.filter((p) => p !== 'users.manage'),
  PROJECT_MANAGER: ['dashboard.view', 'orders.view', 'projects.view', 'projects.work', 'projects.manage', 'customers.view', 'support.manage', 'leads.view'],
  DEVELOPER: ['dashboard.view', 'projects.view', 'projects.work'],
  SUPPORT: ['dashboard.view', 'orders.view', 'projects.view', 'customers.view', 'support.manage', 'leads.view'],
  FINANCE: ['dashboard.view', 'orders.view', 'customers.view', 'finance.view', 'finance.manage', 'saas.manage'],
  MARKETING: ['dashboard.view', 'catalog.manage', 'marketing.manage', 'content.manage', 'leads.view'],
};

export function can(role: PlatformRole | null | undefined, permission: Permission): boolean {
  return !!role && ROLE_PERMISSIONS[role].includes(permission);
}
