/**
 * ATHANA CRM — business logic. Every function takes the tenant context first and scopes all reads and
 * writes by ctx.organizationId. No Next.js imports: everything here is callable from tests.
 */
export * from './labels';
export { assertCanConfigure, assertCanDelete, assertCanExport, tenantCurrency, type Paged } from './shared';
export * from './onboarding';
export * from './contacts';
export * from './pipeline';
export * from './engagement';
export * from './proposals';
export * from './files';
export * from './insights';
export * from './export';
export * from './team';

import { db } from '@/lib/db';
import type { TenantCtx } from './shared';

/** Time zone used to read date-times typed by the tenant's users and to group the calendar. */
export async function organizationTimezone(ctx: TenantCtx): Promise<string> {
  const org = await db.organization.findFirst({ where: { id: ctx.organizationId }, select: { timezone: true } });
  return org?.timezone || 'UTC';
}

/** Sender block of printed proposals. */
export async function organizationProfile(ctx: TenantCtx) {
  return db.organization.findFirstOrThrow({
    where: { id: ctx.organizationId }, select: { name: true, address: true, postalCode: true, city: true, country: true, vatNumber: true, timezone: true },
  });
}
