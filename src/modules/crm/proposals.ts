import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { AppError, notFoundError } from '@/lib/errors';
import { audit } from '@/lib/audit';
import { m } from '@/i18n/translate';
import { assertFeature } from '@/modules/tenancy/context';
import { PROPOSAL_STATUSES, type ProposalStatus } from './labels';
import { assertCanDelete, minorAmount, optDate, optId, optText, paged, pageParams, reqText, requireDeal, tenantCurrency, type TenantCtx } from './shared';

const lineSchema = z.object({
  description: reqText(300),
  quantity: z.coerce.number({ error: m('Quantité invalide.') }).positive(m('Quantité invalide.')).max(1_000_000, m('Quantité invalide.')).transform((q) => Math.round(q * 100) / 100),
  unitAmount: minorAmount,
});
export type ProposalLine = z.infer<typeof lineSchema>;

const proposalSchema = z.object({
  title: reqText(200), recipient: optText(300), dealId: optId, validUntil: optDate, notes: optText(5000),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, m('Devise invalide.')).optional(),
  lines: z.array(lineSchema).max(100, m('Trop de lignes.')).default([]),
});
export type ProposalInput = z.input<typeof proposalSchema>;

export const lineTotal = (line: { quantity: number; unitAmount: number }) => Math.round(line.quantity * line.unitAmount);
export const proposalTotal = (lines: { quantity: number; unitAmount: number }[]) => lines.reduce((sum, l) => sum + lineTotal(l), 0);

/** Lines as stored in the Json column, defensively re-read. */
export function readLines(value: unknown): ProposalLine[] {
  const parsed = z.array(lineSchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}

async function requireProposal(ctx: TenantCtx, id: string) {
  const proposal = await db.crmProposal.findFirst({ where: { id, organizationId: ctx.organizationId } });
  if (!proposal) throw notFoundError(m('Proposition introuvable.'));
  return proposal;
}

/** Numbers are sequential per tenant (P-0001, P-0002…): a per-tenant advisory lock serialises concurrent creations. */
export async function createProposal(ctx: TenantCtx, input: ProposalInput) {
  assertFeature(ctx, 'proposals');
  const data = proposalSchema.parse(input);
  const deal = data.dealId ? await requireDeal(ctx, data.dealId) : null;
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'crm-proposal:' + ctx.organizationId}))`;
    const rows = await tx.$queryRaw<{ max: number | null }[]>`
      SELECT MAX(CAST(SUBSTRING("number" FROM 3) AS INTEGER)) AS max FROM "CrmProposal"
      WHERE "organizationId" = ${ctx.organizationId} AND "number" ~ '^P-[0-9]{1,9}$'`;
    const next = Number(rows[0]?.max ?? 0) + 1;
    return tx.crmProposal.create({
      data: {
        organizationId: ctx.organizationId, number: `P-${String(next).padStart(4, '0')}`, title: data.title, recipient: data.recipient ?? null, dealId: deal?.id ?? null,
        validUntil: data.validUntil ?? null, notes: data.notes ?? null, currency: data.currency ?? deal?.currency ?? tenantCurrency(ctx),
        lines: data.lines as unknown as Prisma.InputJsonValue, total: proposalTotal(data.lines),
      },
    });
  });
}

/** Content can only be edited while the proposal is a draft. */
export async function updateProposal(ctx: TenantCtx, id: string, input: Partial<ProposalInput>) {
  assertFeature(ctx, 'proposals');
  const data = proposalSchema.partial().parse(input);
  const proposal = await requireProposal(ctx, id);
  if (proposal.status !== 'draft') throw new AppError(m('Seule une proposition en brouillon peut être modifiée.'), 'conflict');
  if (data.dealId) await requireDeal(ctx, data.dealId);
  const { lines, ...rest } = data;
  return db.crmProposal.update({
    where: { id, organizationId: ctx.organizationId },
    data: { ...rest, ...(input.lines !== undefined && lines ? { lines: lines as unknown as Prisma.InputJsonValue, total: proposalTotal(lines) } : {}) },
  });
}

const TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = { draft: ['sent'], sent: ['accepted', 'rejected', 'draft'], accepted: [], rejected: ['draft'] };
export const proposalTransitions = (status: string): ProposalStatus[] => TRANSITIONS[status as ProposalStatus] ?? [];

/** draft → sent → accepted / rejected (a sent or rejected proposal can go back to draft to be revised). */
export async function setProposalStatus(ctx: TenantCtx, id: string, status: string) {
  assertFeature(ctx, 'proposals');
  const next = z.enum(PROPOSAL_STATUSES, { error: m('Statut invalide.') }).parse(status);
  const proposal = await requireProposal(ctx, id);
  if (!proposalTransitions(proposal.status).includes(next)) throw new AppError(m('Ce changement de statut n’est pas possible.'), 'conflict');
  if (next === 'sent' && readLines(proposal.lines).length === 0) throw new AppError(m('Ajoutez au moins une ligne avant d’envoyer la proposition.'), 'invalid');
  return db.crmProposal.update({ where: { id, organizationId: ctx.organizationId }, data: { status: next } });
}

export async function deleteProposal(ctx: TenantCtx, id: string) {
  assertFeature(ctx, 'proposals');
  assertCanDelete(ctx);
  const proposal = await requireProposal(ctx, id);
  await db.crmProposal.deleteMany({ where: { id, organizationId: ctx.organizationId } });
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'crm.proposal.deleted', entity: 'CrmProposal', entityId: id, meta: { number: proposal.number } });
}

export async function getProposal(ctx: TenantCtx, id: string) {
  assertFeature(ctx, 'proposals');
  await requireProposal(ctx, id);
  const proposal = await db.crmProposal.findFirstOrThrow({ where: { id, organizationId: ctx.organizationId }, include: { deal: { select: { id: true, title: true } } } });
  const lines = readLines(proposal.lines);
  return { ...proposal, lines, expired: proposal.status === 'sent' && !!proposal.validUntil && proposal.validUntil < new Date(Date.now() - 86400_000) };
}

const listSchema = pageParams.extend({ status: z.enum(PROPOSAL_STATUSES).optional().catch(undefined), dealId: z.string().optional() });

export async function listProposals(ctx: TenantCtx, params: z.input<typeof listSchema> = {}) {
  assertFeature(ctx, 'proposals');
  const p = listSchema.parse(params);
  const where: Prisma.CrmProposalWhereInput = { organizationId: ctx.organizationId, ...(p.status ? { status: p.status } : {}), ...(p.dealId ? { dealId: p.dealId } : {}) };
  const [items, total] = await Promise.all([
    db.crmProposal.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (p.page - 1) * p.pageSize, take: p.pageSize, include: { deal: { select: { id: true, title: true } } } }),
    db.crmProposal.count({ where }),
  ]);
  return paged(items, total, p.page, p.pageSize);
}
