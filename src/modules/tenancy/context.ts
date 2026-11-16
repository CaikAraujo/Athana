import type { OrgRole, Subscription, Plan } from '@prisma/client';
import { db } from '@/lib/db';
import { AppError, forbidden } from '@/lib/errors';

/**
 * Tenant context. Every CRM / Pointage service takes a TenantCtx as first argument and
 * scopes all reads and writes by ctx.organizationId — a record id from another tenant
 * is never trusted on its own.
 */
export type TenantCtx = {
  userId: string;
  organizationId: string;
  role: OrgRole;
  subscription: (Subscription & { plan: Plan }) | null;
};

const ROLE_RANK: Record<OrgRole, number> = { MEMBER: 1, MANAGER: 2, ADMIN: 3, OWNER: 4 };

export function hasOrgRole(ctx: TenantCtx, min: OrgRole) {
  return ROLE_RANK[ctx.role] >= ROLE_RANK[min];
}

export function assertOrgRole(ctx: TenantCtx, min: OrgRole) {
  if (!hasOrgRole(ctx, min)) throw forbidden();
}

/** Builds the tenant context from the database (never from client input alone). */
export async function loadTenantCtx(userId: string, organizationId: string, productKey?: string): Promise<TenantCtx> {
  const membership = await db.membership.findUnique({ where: { userId_organizationId: { userId, organizationId } } });
  if (!membership) throw forbidden();
  const subscription = productKey
    ? await db.subscription.findUnique({ where: { organizationId_saasProductKey: { organizationId, saasProductKey: productKey } }, include: { plan: true } })
    : null;
  return { userId, organizationId, role: membership.role, subscription };
}

export function subscriptionIsUsable(sub: TenantCtx['subscription']): boolean {
  if (!sub) return false;
  if (sub.status === 'ACTIVE' || sub.status === 'TRIALING' || sub.status === 'PAST_DUE') return sub.currentPeriodEnd > new Date() || sub.status !== 'TRIALING';
  // A cancelled subscription stays usable until the end of the paid period.
  return sub.status === 'CANCELED' && sub.currentPeriodEnd > new Date();
}

export function assertSubscription(ctx: TenantCtx) {
  if (!subscriptionIsUsable(ctx.subscription)) throw new AppError('Aucun abonnement actif pour ce produit.', 'forbidden');
}

export function planLimit(ctx: TenantCtx, key: string): number | null {
  const v = (ctx.subscription?.plan.limits as Record<string, number> | undefined)?.[key];
  return typeof v === 'number' && v >= 0 ? v : null; // null = unlimited
}

export function planHasFeature(ctx: TenantCtx, feature: string): boolean {
  return ((ctx.subscription?.plan.features as string[] | undefined) ?? []).includes(feature);
}

export function assertFeature(ctx: TenantCtx, feature: string) {
  if (!planHasFeature(ctx, feature)) throw new AppError('Cette fonctionnalité n’est pas incluse dans votre plan.', 'limit');
}

export async function assertWithinLimit(ctx: TenantCtx, key: string, currentCount: () => Promise<number>) {
  const limit = planLimit(ctx, key);
  if (limit === null) return;
  if ((await currentCount()) >= limit) throw new AppError('Limite de votre plan atteinte. Passez à un plan supérieur pour continuer.', 'limit');
}

export function slugify(input: string): string {
  return input.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'org';
}

export async function createOrganization(userId: string, data: { name: string; country?: string; timezone?: string; vatNumber?: string; address?: string; city?: string; postalCode?: string }) {
  const name = data.name.trim();
  if (name.length < 2) throw new AppError('Nom de l’entreprise requis.', 'invalid');
  let slug = slugify(name);
  for (let i = 2; await db.organization.findUnique({ where: { slug } }); i++) slug = `${slugify(name)}-${i}`;
  return db.organization.create({
    data: { ...data, name, slug, memberships: { create: { userId, role: 'OWNER' } } },
  });
}
