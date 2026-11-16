import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { audit } from '@/lib/audit';
import { m } from '@/i18n/translate';
import { assertFeature } from '@/modules/tenancy/context';
import { removeEntityFiles } from './files';
import {
  assertCanConfigure, assertCanDelete, assertMember, like, minorAmount, optDate, optId, optText, paged, pageParams, reqText,
  requireCompany, requireContact, requireDeal, requirePipeline, requireStage, tenantCurrency, userNames, words, type TenantCtx,
} from './shared';

export const DEFAULT_PIPELINE_NAME = m('Pipeline de vente');
export const DEFAULT_STAGES: { name: string; probability: number }[] = [
  { name: m('Nouveau'), probability: 10 },
  { name: m('Qualifié'), probability: 30 },
  { name: m('Proposition'), probability: 60 },
  { name: m('Négociation'), probability: 80 },
  { name: m('Gagné'), probability: 100 },
];

const probability = z.coerce.number({ error: m('Probabilité invalide (0 à 100).') }).int(m('Probabilité invalide (0 à 100).')).min(0, m('Probabilité invalide (0 à 100).')).max(100, m('Probabilité invalide (0 à 100).'));
const stageSchema = z.object({ name: reqText(80), probability: probability.default(50) });
const pipelineSchema = z.object({ name: reqText(80), stages: z.array(stageSchema).min(1).max(20).optional() });

const log = (ctx: TenantCtx, action: string, entity: string, entityId: string, meta?: Prisma.InputJsonValue) =>
  audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action, entity, entityId, meta });

// ───────────────────────────── Pipelines ─────────────────────────────
export async function listPipelines(ctx: TenantCtx) {
  return db.crmPipeline.findMany({
    where: { organizationId: ctx.organizationId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    include: { stages: { orderBy: { position: 'asc' }, include: { _count: { select: { deals: true } } } }, _count: { select: { deals: true } } },
  });
}

export async function getDefaultPipeline(ctx: TenantCtx) {
  const pipeline = await db.crmPipeline.findFirst({
    where: { organizationId: ctx.organizationId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }], include: { stages: { orderBy: { position: 'asc' } } },
  });
  if (!pipeline) throw new AppError(m('Aucun pipeline configuré.'), 'not_found');
  return pipeline;
}

/** A second pipeline requires the `multiPipelines` feature. The first pipeline of a tenant becomes its default. */
export async function createPipeline(ctx: TenantCtx, input: z.input<typeof pipelineSchema>) {
  assertCanConfigure(ctx);
  const data = pipelineSchema.parse(input);
  const existing = await db.crmPipeline.count({ where: { organizationId: ctx.organizationId } });
  if (existing >= 1) assertFeature(ctx, 'multiPipelines');
  const stages = data.stages ?? DEFAULT_STAGES;
  const pipeline = await db.crmPipeline.create({
    data: { organizationId: ctx.organizationId, name: data.name, isDefault: existing === 0, stages: { create: stages.map((s, i) => ({ name: s.name, probability: s.probability, position: i })) } },
    include: { stages: { orderBy: { position: 'asc' } } },
  });
  await log(ctx, 'crm.pipeline.created', 'CrmPipeline', pipeline.id, { name: pipeline.name });
  return pipeline;
}

export async function renamePipeline(ctx: TenantCtx, id: string, name: string) {
  assertCanConfigure(ctx);
  const parsed = reqText(80).parse(name);
  await requirePipeline(ctx, id);
  const pipeline = await db.crmPipeline.update({ where: { id, organizationId: ctx.organizationId }, data: { name: parsed } });
  await log(ctx, 'crm.pipeline.renamed', 'CrmPipeline', id, { name: parsed });
  return pipeline;
}

/** Exactly one default pipeline per tenant. */
export async function setDefaultPipeline(ctx: TenantCtx, id: string) {
  assertCanConfigure(ctx);
  await requirePipeline(ctx, id);
  await db.$transaction([
    db.crmPipeline.updateMany({ where: { organizationId: ctx.organizationId, id: { not: id } }, data: { isDefault: false } }),
    db.crmPipeline.updateMany({ where: { organizationId: ctx.organizationId, id }, data: { isDefault: true } }),
  ]);
  await log(ctx, 'crm.pipeline.default_changed', 'CrmPipeline', id);
}

export async function deletePipeline(ctx: TenantCtx, id: string) {
  assertCanConfigure(ctx);
  const pipeline = await requirePipeline(ctx, id);
  const [others, deals] = await Promise.all([
    db.crmPipeline.findMany({ where: { organizationId: ctx.organizationId, id: { not: id } }, orderBy: { createdAt: 'asc' }, select: { id: true } }),
    db.crmDeal.count({ where: { organizationId: ctx.organizationId, pipelineId: id } }),
  ]);
  if (!others.length) throw new AppError(m('Vous devez conserver au moins un pipeline.'), 'conflict');
  if (deals > 0) throw new AppError(m('Ce pipeline contient encore des affaires. Déplacez-les ou supprimez-les d’abord.'), 'conflict');
  await db.$transaction(async (tx) => {
    await tx.crmPipeline.deleteMany({ where: { id, organizationId: ctx.organizationId } });
    if (pipeline.isDefault) await tx.crmPipeline.updateMany({ where: { id: others[0].id, organizationId: ctx.organizationId }, data: { isDefault: true } });
  });
  await log(ctx, 'crm.pipeline.deleted', 'CrmPipeline', id, { name: pipeline.name });
}

// ───────────────────────────── Stages ─────────────────────────────
export async function addStage(ctx: TenantCtx, pipelineId: string, input: z.input<typeof stageSchema>) {
  assertCanConfigure(ctx);
  const data = stageSchema.parse(input);
  const pipeline = await requirePipeline(ctx, pipelineId);
  if (pipeline.stages.length >= 20) throw new AppError(m('Un pipeline ne peut pas dépasser 20 étapes.'), 'limit');
  const position = pipeline.stages.reduce((max, s) => Math.max(max, s.position), -1) + 1;
  const stage = await db.crmStage.create({ data: { pipelineId: pipeline.id, name: data.name, probability: data.probability, position } });
  await log(ctx, 'crm.stage.created', 'CrmStage', stage.id, { name: stage.name, pipelineId });
  return stage;
}

export async function updateStage(ctx: TenantCtx, stageId: string, input: Partial<z.input<typeof stageSchema>>) {
  assertCanConfigure(ctx);
  const data = z.object({ name: reqText(80).optional(), probability: probability.optional() }).parse(input);
  await requireStage(ctx, stageId);
  const stage = await db.crmStage.update({ where: { id: stageId, pipeline: { organizationId: ctx.organizationId } }, data });
  await log(ctx, 'crm.stage.updated', 'CrmStage', stageId, data);
  return stage;
}

/** `orderedIds` must contain exactly the stages of the pipeline. */
export async function reorderStages(ctx: TenantCtx, pipelineId: string, orderedIds: string[]) {
  assertCanConfigure(ctx);
  const pipeline = await requirePipeline(ctx, pipelineId);
  const ids = z.array(z.string()).parse(orderedIds);
  const current = new Set(pipeline.stages.map((s) => s.id));
  if (ids.length !== current.size || new Set(ids).size !== ids.length || ids.some((id) => !current.has(id))) throw new AppError(m('Ordre des étapes invalide.'), 'invalid');
  await db.$transaction(ids.map((id, position) => db.crmStage.updateMany({ where: { id, pipelineId: pipeline.id }, data: { position } })));
  await log(ctx, 'crm.stage.reordered', 'CrmPipeline', pipelineId);
}

export async function moveStage(ctx: TenantCtx, stageId: string, direction: 'up' | 'down') {
  assertCanConfigure(ctx);
  const stage = await requireStage(ctx, stageId);
  const pipeline = await requirePipeline(ctx, stage.pipelineId);
  const ids = pipeline.stages.map((s) => s.id);
  const from = ids.indexOf(stageId);
  const to = direction === 'up' ? from - 1 : from + 1;
  if (to < 0 || to >= ids.length) return;
  [ids[from], ids[to]] = [ids[to], ids[from]];
  await reorderStages(ctx, pipeline.id, ids);
}

export async function deleteStage(ctx: TenantCtx, stageId: string) {
  assertCanConfigure(ctx);
  const stage = await requireStage(ctx, stageId);
  const pipeline = await requirePipeline(ctx, stage.pipelineId);
  if (pipeline.stages.length <= 1) throw new AppError(m('Un pipeline doit conserver au moins une étape.'), 'conflict');
  const deals = await db.crmDeal.count({ where: { stageId } });
  if (deals > 0) throw new AppError(m('Cette étape contient encore des affaires. Déplacez-les d’abord.'), 'conflict');
  await db.$transaction([
    db.crmStage.deleteMany({ where: { id: stageId, pipelineId: pipeline.id } }),
    ...pipeline.stages.filter((s) => s.id !== stageId).map((s, position) => db.crmStage.updateMany({ where: { id: s.id, pipelineId: pipeline.id }, data: { position } })),
  ]);
  await log(ctx, 'crm.stage.deleted', 'CrmStage', stageId, { name: stage.name, pipelineId: pipeline.id });
}

// ───────────────────────────── Deals ─────────────────────────────
const dealSchema = z.object({
  title: reqText(160), value: minorAmount.default(0),
  currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/, m('Devise invalide.')).optional(),
  pipelineId: optId, stageId: optId, contactId: optId, companyId: optId, ownerId: optId, expectedCloseAt: optDate,
});
export type DealInput = z.input<typeof dealSchema>;

async function checkDealLinks(ctx: TenantCtx, data: { contactId?: string | null; companyId?: string | null; ownerId?: string | null }) {
  const contact = data.contactId ? await requireContact(ctx, data.contactId) : null;
  if (data.companyId) await requireCompany(ctx, data.companyId);
  if (data.ownerId) await assertMember(ctx, data.ownerId);
  return contact;
}

export async function createDeal(ctx: TenantCtx, input: DealInput) {
  const data = dealSchema.parse(input);
  let pipelineId: string;
  let stageId: string;
  if (data.stageId) {
    const stage = await requireStage(ctx, data.stageId);
    if (data.pipelineId && data.pipelineId !== stage.pipelineId) throw new AppError(m('Cette étape n’appartient pas à ce pipeline.'), 'invalid');
    pipelineId = stage.pipelineId; stageId = stage.id;
  } else {
    const pipeline = data.pipelineId ? await requirePipeline(ctx, data.pipelineId) : await getDefaultPipeline(ctx);
    if (!pipeline.stages.length) throw new AppError(m('Ce pipeline n’a aucune étape.'), 'conflict');
    pipelineId = pipeline.id; stageId = pipeline.stages[0].id;
  }
  const contact = await checkDealLinks(ctx, data);
  return db.crmDeal.create({
    data: {
      organizationId: ctx.organizationId, title: data.title, value: data.value, currency: data.currency ?? tenantCurrency(ctx),
      pipelineId, stageId, contactId: data.contactId ?? null, companyId: data.companyId === undefined ? contact?.companyId ?? null : data.companyId,
      ownerId: data.ownerId === undefined ? ctx.userId : data.ownerId, expectedCloseAt: data.expectedCloseAt ?? null,
    },
  });
}

/** Stage changes go through moveDeal; status changes through markDealWon / markDealLost / reopenDeal. */
export async function updateDeal(ctx: TenantCtx, id: string, input: Partial<Omit<DealInput, 'pipelineId' | 'stageId'>>) {
  const data = dealSchema.omit({ pipelineId: true, stageId: true }).partial().parse(input);
  await requireDeal(ctx, id);
  await checkDealLinks(ctx, data);
  return db.crmDeal.update({ where: { id, organizationId: ctx.organizationId }, data });
}

/** Moves an open deal to another stage of the same pipeline (both ids are tenant-validated). */
export async function moveDeal(ctx: TenantCtx, dealId: string, stageId: string) {
  const deal = await requireDeal(ctx, dealId);
  const stage = await requireStage(ctx, stageId);
  if (stage.pipelineId !== deal.pipelineId) throw new AppError(m('Cette étape n’appartient pas au pipeline de l’affaire.'), 'invalid');
  if (deal.status !== 'OPEN') throw new AppError(m('Rouvrez l’affaire avant de la déplacer.'), 'conflict');
  return db.crmDeal.update({ where: { id: dealId, organizationId: ctx.organizationId }, data: { stageId: stage.id } });
}

/** WON: closedAt is set, the deal moves to the final stage when that stage is a 100 % stage, and the contact becomes a customer. */
export async function markDealWon(ctx: TenantCtx, id: string) {
  const deal = await requireDeal(ctx, id);
  if (deal.status === 'WON') return deal;
  const last = await db.crmStage.findFirst({ where: { pipelineId: deal.pipelineId, pipeline: { organizationId: ctx.organizationId } }, orderBy: { position: 'desc' } });
  const updated = await db.crmDeal.update({
    where: { id, organizationId: ctx.organizationId },
    data: { status: 'WON', closedAt: new Date(), lostReason: null, ...(last && last.probability === 100 ? { stageId: last.id } : {}) },
  });
  if (deal.contactId) await db.crmContact.updateMany({ where: { id: deal.contactId, organizationId: ctx.organizationId, lifecycle: { in: ['LEAD', 'PROSPECT'] } }, data: { lifecycle: 'CUSTOMER' } });
  return updated;
}

export async function markDealLost(ctx: TenantCtx, id: string, reason?: string | null) {
  const lostReason = optText(500).parse(reason) ?? null;
  await requireDeal(ctx, id);
  return db.crmDeal.update({ where: { id, organizationId: ctx.organizationId }, data: { status: 'LOST', closedAt: new Date(), lostReason } });
}

export async function reopenDeal(ctx: TenantCtx, id: string) {
  const deal = await requireDeal(ctx, id);
  if (deal.status === 'OPEN') return deal;
  return db.crmDeal.update({ where: { id, organizationId: ctx.organizationId }, data: { status: 'OPEN', closedAt: null, lostReason: null } });
}

export async function deleteDeal(ctx: TenantCtx, id: string) {
  assertCanDelete(ctx);
  const deal = await requireDeal(ctx, id);
  await removeEntityFiles(ctx, 'deal', id);
  await db.crmDeal.deleteMany({ where: { id, organizationId: ctx.organizationId } });
  await log(ctx, 'crm.deal.deleted', 'CrmDeal', id, { title: deal.title, value: deal.value });
}

export async function getDeal(ctx: TenantCtx, id: string) {
  await requireDeal(ctx, id);
  const deal = await db.crmDeal.findFirstOrThrow({
    where: { id, organizationId: ctx.organizationId },
    include: {
      stage: true, pipeline: { include: { stages: { orderBy: { position: 'asc' } } } },
      contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } }, company: { select: { id: true, name: true } },
      proposals: { where: { organizationId: ctx.organizationId }, orderBy: { createdAt: 'desc' } },
    },
  });
  const names = await userNames([deal.ownerId]);
  return { ...deal, ownerName: deal.ownerId ? names[deal.ownerId] ?? null : null, weighted: Math.round((deal.value * deal.stage.probability) / 100) };
}

const dealListSchema = pageParams.extend({
  q: z.string().optional(), status: z.enum(['OPEN', 'WON', 'LOST']).optional().catch(undefined), pipelineId: z.string().optional(), ownerId: z.string().optional(),
  sort: z.enum(['title', 'value', 'createdAt', 'expectedCloseAt']).catch('createdAt').default('createdAt'),
});

export async function listDeals(ctx: TenantCtx, params: z.input<typeof dealListSchema> = {}) {
  const p = dealListSchema.parse(params);
  const where: Prisma.CrmDealWhereInput = {
    organizationId: ctx.organizationId,
    ...(p.status ? { status: p.status } : {}), ...(p.pipelineId ? { pipelineId: p.pipelineId } : {}), ...(p.ownerId ? { ownerId: p.ownerId } : {}),
    AND: words(p.q).map((w) => ({ title: like(w) })),
  };
  const [items, total] = await Promise.all([
    db.crmDeal.findMany({ where, orderBy: [{ [p.sort]: p.dir }, { id: 'asc' }], skip: (p.page - 1) * p.pageSize, take: p.pageSize, include: { stage: true, contact: { select: { id: true, firstName: true, lastName: true } }, company: { select: { id: true, name: true } } } }),
    db.crmDeal.count({ where }),
  ]);
  return paged(items, total, p.page, p.pageSize);
}

export async function dealOptions(ctx: TenantCtx) {
  return db.crmDeal.findMany({ where: { organizationId: ctx.organizationId }, orderBy: { createdAt: 'desc' }, select: { id: true, title: true }, take: 2000 });
}

export const weightedValue = (value: number, probabilityPct: number) => Math.round((value * probabilityPct) / 100);

/**
 * Kanban data: stages of one pipeline with their open deals (plus deals won during the last 30 days, shown for context).
 * Totals and the weighted forecast only count OPEN deals.
 */
export async function getBoard(ctx: TenantCtx, pipelineId?: string | null) {
  const pipeline = pipelineId ? await requirePipeline(ctx, pipelineId) : await getDefaultPipeline(ctx);
  const since = new Date(Date.now() - 30 * 86400_000);
  const deals = await db.crmDeal.findMany({
    where: { organizationId: ctx.organizationId, pipelineId: pipeline.id, OR: [{ status: 'OPEN' }, { status: 'WON', closedAt: { gte: since } }] },
    orderBy: [{ updatedAt: 'desc' }], take: 1000,
    include: { contact: { select: { id: true, firstName: true, lastName: true } }, company: { select: { id: true, name: true } } },
  });
  const names = await userNames(deals.map((d) => d.ownerId));
  const stages = pipeline.stages.map((stage) => {
    const own = deals.filter((d) => d.stageId === stage.id).map((d) => ({ ...d, ownerName: d.ownerId ? names[d.ownerId] ?? null : null }));
    const open = own.filter((d) => d.status === 'OPEN');
    const total = open.reduce((sum, d) => sum + d.value, 0);
    return { id: stage.id, name: stage.name, position: stage.position, probability: stage.probability, deals: own, count: open.length, total, weighted: weightedValue(total, stage.probability) };
  });
  return {
    pipeline: { id: pipeline.id, name: pipeline.name, isDefault: pipeline.isDefault },
    stages,
    totals: { count: stages.reduce((s, x) => s + x.count, 0), value: stages.reduce((s, x) => s + x.total, 0), weighted: stages.reduce((s, x) => s + x.weighted, 0) },
  };
}
