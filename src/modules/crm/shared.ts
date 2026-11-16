import { z } from 'zod';
import { db } from '@/lib/db';
import { AppError, notFoundError } from '@/lib/errors';
import { m } from '@/i18n/translate';
import { assertOrgRole, type TenantCtx } from '@/modules/tenancy/context';
import { parseDateString } from './dates';

export type { TenantCtx };

/** Role rules inside the CRM: MEMBER creates/edits, MANAGER+ deletes and exports, ADMIN+ configures. */
export const assertCanDelete = (ctx: TenantCtx) => assertOrgRole(ctx, 'MANAGER');
export const assertCanExport = (ctx: TenantCtx) => assertOrgRole(ctx, 'MANAGER');
export const assertCanConfigure = (ctx: TenantCtx) => assertOrgRole(ctx, 'ADMIN');

// ── zod building blocks ───────────────────────────────────────────────────────
const blank = <T,>(v: T | null | undefined) => (v === undefined ? undefined : v || null);

export const reqText = (max: number) => z.string({ error: m('Ce champ est requis.') }).trim().min(1, m('Ce champ est requis.')).max(max, m('Texte trop long.'));
/** Optional text: undefined = "leave unchanged" (updates), '' / null = clear. */
export const optText = (max: number) => z.string().trim().max(max, m('Texte trop long.')).nullish().transform(blank);
export const optId = z.string().trim().max(40).nullish().transform(blank);
export const optEmail = z.string().trim().toLowerCase().max(200, m('Texte trop long.'))
  .refine((v) => v === '' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), m('Adresse e-mail invalide.')).nullish().transform(blank);
export const optDate = z.union([z.date(), z.string()]).nullish().transform((v, c) => {
  if (v === undefined) return undefined;
  if (v === null || v === '') return null;
  const d = v instanceof Date ? v : parseDateString(v);
  if (!d || Number.isNaN(d.getTime())) { c.addIssue({ code: 'custom', message: m('Date invalide.') }); return z.NEVER; }
  return d;
});
export const minorAmount = z.coerce.number({ error: m('Montant invalide.') }).int(m('Montant invalide.')).min(0, m('Montant invalide.')).max(2_000_000_000, m('Montant invalide.'));

export const pageParams = z.object({
  page: z.coerce.number().int().min(1).catch(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).catch(25).default(25),
  dir: z.enum(['asc', 'desc']).catch('asc').default('asc'),
});

export type Paged<T> = { items: T[]; total: number; page: number; pageSize: number; pages: number };
export function paged<T>(items: T[], total: number, page: number, pageSize: number): Paged<T> {
  return { items, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

/** Free-text query → list of words (max 5) for AND-of-OR `contains` filters. */
export function words(q: string | null | undefined): string[] {
  return (q ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 5).map((w) => w.slice(0, 80));
}
export const like = (w: string) => ({ contains: w, mode: 'insensitive' as const });

// ── tenant-validated lookups ──────────────────────────────────────────────────
/** A user id received from the client must be a member of the tenant. */
export async function assertMember(ctx: TenantCtx, userId: string) {
  const membership = await db.membership.findUnique({ where: { userId_organizationId: { userId, organizationId: ctx.organizationId } } });
  if (!membership) throw new AppError(m('Cet utilisateur ne fait pas partie de votre entreprise.'), 'invalid');
  return membership;
}

export async function requireCompany(ctx: TenantCtx, id: string) {
  const row = await db.crmCompany.findFirst({ where: { id, organizationId: ctx.organizationId } });
  if (!row) throw notFoundError(m('Entreprise introuvable.'));
  return row;
}

export async function requireContact(ctx: TenantCtx, id: string) {
  const row = await db.crmContact.findFirst({ where: { id, organizationId: ctx.organizationId } });
  if (!row) throw notFoundError(m('Contact introuvable.'));
  return row;
}

export async function requireDeal(ctx: TenantCtx, id: string) {
  const row = await db.crmDeal.findFirst({ where: { id, organizationId: ctx.organizationId }, include: { stage: true } });
  if (!row) throw notFoundError(m('Affaire introuvable.'));
  return row;
}

/** Stages carry no organizationId: they are always resolved through their pipeline's tenant. */
export async function requireStage(ctx: TenantCtx, id: string) {
  const row = await db.crmStage.findFirst({ where: { id, pipeline: { organizationId: ctx.organizationId } }, include: { pipeline: true } });
  if (!row) throw notFoundError(m('Étape introuvable.'));
  return row;
}

export async function requirePipeline(ctx: TenantCtx, id: string) {
  const row = await db.crmPipeline.findFirst({ where: { id, organizationId: ctx.organizationId }, include: { stages: { orderBy: { position: 'asc' } } } });
  if (!row) throw notFoundError(m('Pipeline introuvable.'));
  return row;
}

/** Display names for user ids stored on tenant records (owner, assignee, author). */
export async function userNames(ids: (string | null | undefined)[]): Promise<Record<string, string>> {
  const unique = [...new Set(ids.filter((x): x is string => !!x))];
  if (!unique.length) return {};
  const users = await db.user.findMany({ where: { id: { in: unique } }, select: { id: true, name: true } });
  return Object.fromEntries(users.map((u) => [u.id, u.name]));
}

export function tenantCurrency(ctx: TenantCtx): string {
  return ctx.subscription?.currency ?? 'EUR';
}
