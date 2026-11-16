import { randomBytes } from 'node:crypto';
import type { OrgRole, PlatformRole } from '@prisma/client';
import { db } from '@/lib/db';
import { loadTenantCtx } from '@/modules/tenancy/context';
import { seedSaas } from '../prisma/seed-data/saas';

export { db };
const uid = () => randomBytes(5).toString('hex');

/** Fast, deterministic hash placeholder: tests that need real password checks call hashPassword themselves. */
export async function createUser(opts: { role?: PlatformRole; email?: string; locale?: string } = {}) {
  return db.user.create({ data: { email: opts.email ?? `user-${uid()}@example.test`, name: `Test ${uid()}`, passwordHash: 'x', platformRole: opts.role ?? null, locale: opts.locale ?? 'fr-ch' } });
}

/** Organization with an owner and (optionally) an active subscription to a SaaS product. */
export async function createTenant(productKey?: 'crm' | 'pointage', planKey: 'STARTER' | 'BUSINESS' | 'PRO' = 'BUSINESS', role: OrgRole = 'OWNER') {
  await seedSaas(db);
  const user = await createUser();
  const org = await db.organization.create({ data: { name: `Org ${uid()}`, slug: `org-${uid()}`, memberships: { create: { userId: user.id, role } } } });
  if (productKey) {
    const plan = await db.plan.findUniqueOrThrow({ where: { saasProductKey_key: { saasProductKey: productKey, key: planKey } } });
    await db.subscription.create({ data: { organizationId: org.id, saasProductKey: productKey, planId: plan.id, status: 'ACTIVE', currency: 'EUR', currentPeriodEnd: new Date(Date.now() + 30 * 86400_000) } });
  }
  const ctx = await loadTenantCtx(user.id, org.id, productKey);
  return { user, org, ctx };
}

export async function addMember(organizationId: string, role: OrgRole, productKey?: string) {
  const user = await createUser();
  await db.membership.create({ data: { userId: user.id, organizationId, role } });
  return { user, ctx: await loadTenantCtx(user.id, organizationId, productKey) };
}
