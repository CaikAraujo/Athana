import { db } from '@/lib/db';
import { assertFeature, planHasFeature, planLimit } from '@/modules/tenancy/context';
import { startOfUtcDay, startOfUtcMonth } from './dates';
import { storageUsedBytes } from './files';
import { getDefaultPipeline, weightedValue } from './pipeline';
import { like, requirePipeline, userNames, words, type TenantCtx } from './shared';

// ───────────────────────────── Global search ─────────────────────────────
export async function globalSearch(ctx: TenantCtx, query: string, limit = 20) {
  const ws = words(query);
  if (!ws.length || ws.join('').length < 2) return { query: query.trim(), contacts: [], companies: [], deals: [], total: 0 };
  const organizationId = ctx.organizationId;
  const [contacts, companies, deals] = await Promise.all([
    db.crmContact.findMany({
      where: { organizationId, AND: ws.map((w) => ({ OR: [{ firstName: like(w) }, { lastName: like(w) }, { email: like(w) }, { phone: like(w) }] })) },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }], take: limit, include: { company: { select: { id: true, name: true } } },
    }),
    db.crmCompany.findMany({ where: { organizationId, AND: ws.map((w) => ({ OR: [{ name: like(w) }, { email: like(w) }, { phone: like(w) }, { city: like(w) }] })) }, orderBy: { name: 'asc' }, take: limit }),
    db.crmDeal.findMany({ where: { organizationId, AND: ws.map((w) => ({ title: like(w) })) }, orderBy: { createdAt: 'desc' }, take: limit, include: { stage: true } }),
  ]);
  return { query: query.trim(), contacts, companies, deals, total: contacts.length + companies.length + deals.length };
}

// ───────────────────────────── Dashboard ─────────────────────────────
/** Amounts are sums of minor units in the tenant currency (deals are created in that currency by default). */
export async function dashboardKpis(ctx: TenantCtx) {
  const organizationId = ctx.organizationId;
  const now = new Date();
  const monthStart = startOfUtcMonth(now);
  const tomorrow = new Date(startOfUtcDay(now).getTime() + 86400_000);
  const since90 = new Date(now.getTime() - 90 * 86400_000);
  const since30 = new Date(now.getTime() - 30 * 86400_000);
  const [openByStage, stages, wonMonth, won90, lost90, tasksDue, newLeads] = await Promise.all([
    db.crmDeal.groupBy({ by: ['stageId'], where: { organizationId, status: 'OPEN' }, _sum: { value: true }, _count: { _all: true } }),
    db.crmStage.findMany({ where: { pipeline: { organizationId } }, select: { id: true, probability: true } }),
    db.crmDeal.aggregate({ where: { organizationId, status: 'WON', closedAt: { gte: monthStart } }, _sum: { value: true }, _count: { _all: true } }),
    db.crmDeal.count({ where: { organizationId, status: 'WON', closedAt: { gte: since90 } } }),
    db.crmDeal.count({ where: { organizationId, status: 'LOST', closedAt: { gte: since90 } } }),
    db.crmTask.count({ where: { organizationId, assigneeId: ctx.userId, doneAt: null, dueAt: { lt: tomorrow } } }),
    db.crmContact.count({ where: { organizationId, lifecycle: 'LEAD', createdAt: { gte: since30 } } }),
  ]);
  const prob = Object.fromEntries(stages.map((s) => [s.id, s.probability]));
  let openValue = 0, openCount = 0, forecast = 0;
  for (const g of openByStage) {
    const sum = g._sum.value ?? 0;
    openValue += sum; openCount += g._count._all; forecast += weightedValue(sum, prob[g.stageId] ?? 0);
  }
  const closed = won90 + lost90;
  return {
    openValue, openCount, forecast,
    wonThisMonth: wonMonth._sum.value ?? 0, wonThisMonthCount: wonMonth._count._all,
    /** Won / (won + lost) over the last 90 days, in percent; null when nothing was closed. */
    conversionRate: closed ? Math.round((won90 / closed) * 100) : null,
    tasksDue, newLeads,
  };
}

// ───────────────────────────── Reports (feature `reports`) ─────────────────────────────
export async function reports(ctx: TenantCtx, opts: { months?: number; pipelineId?: string | null } = {}) {
  assertFeature(ctx, 'reports');
  const organizationId = ctx.organizationId;
  const months = Math.min(Math.max(opts.months ?? 6, 1), 24);
  const from = startOfUtcMonth(new Date(), -(months - 1));
  const since30 = new Date(Date.now() - 30 * 86400_000);
  const pipeline = opts.pipelineId ? await requirePipeline(ctx, opts.pipelineId) : await getDefaultPipeline(ctx);
  const [closed, openByStage, activities, sources] = await Promise.all([
    db.crmDeal.findMany({ where: { organizationId, status: { in: ['WON', 'LOST'] }, closedAt: { gte: from } }, select: { status: true, value: true, closedAt: true } }),
    db.crmDeal.groupBy({ by: ['stageId'], where: { organizationId, pipelineId: pipeline.id, status: 'OPEN' }, _sum: { value: true }, _count: { _all: true } }),
    db.crmActivity.groupBy({ by: ['userId', 'type'], where: { organizationId, occurredAt: { gte: since30 } }, _count: { _all: true } }),
    db.crmContact.groupBy({ by: ['source'], where: { organizationId }, _count: { _all: true } }),
  ]);

  const wonLostByMonth = Array.from({ length: months }, (_, i) => {
    const d = startOfUtcMonth(from, i);
    return { month: d.toISOString().slice(0, 7), date: d, won: 0, lost: 0, wonValue: 0, lostValue: 0 };
  });
  for (const deal of closed) {
    const row = wonLostByMonth.find((r) => r.month === deal.closedAt!.toISOString().slice(0, 7));
    if (!row) continue;
    if (deal.status === 'WON') { row.won++; row.wonValue += deal.value; } else { row.lost++; row.lostValue += deal.value; }
  }

  const pipelineByStage = pipeline.stages.map((s) => {
    const g = openByStage.find((x) => x.stageId === s.id);
    const value = g?._sum.value ?? 0;
    return { stageId: s.id, name: s.name, probability: s.probability, count: g?._count._all ?? 0, value, weighted: weightedValue(value, s.probability) };
  });

  const names = await userNames(activities.map((a) => a.userId));
  const perUser = new Map<string, { userId: string; name: string; total: number; byType: Record<string, number> }>();
  for (const a of activities) {
    const row = perUser.get(a.userId) ?? { userId: a.userId, name: names[a.userId] ?? '—', total: 0, byType: {} };
    row.total += a._count._all; row.byType[a.type] = (row.byType[a.type] ?? 0) + a._count._all;
    perUser.set(a.userId, row);
  }

  const bySource = new Map<string, number>();
  for (const s of sources) { const key = s.source?.trim() || ''; bySource.set(key, (bySource.get(key) ?? 0) + s._count._all); }

  return {
    pipeline: { id: pipeline.id, name: pipeline.name },
    wonLostByMonth, pipelineByStage,
    activityPerUser: [...perUser.values()].sort((a, b) => b.total - a.total),
    /** source '' = not specified */
    leadSources: [...bySource.entries()].map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count),
  };
}

// ───────────────────────────── Plan usage ─────────────────────────────
export async function planUsage(ctx: TenantCtx) {
  const where = { organizationId: ctx.organizationId };
  const [users, contacts, companies, bytes, pipelines] = await Promise.all([
    db.membership.count({ where }), db.crmContact.count({ where }), db.crmCompany.count({ where }), storageUsedBytes(ctx), db.crmPipeline.count({ where }),
  ]);
  return {
    planName: ctx.subscription?.plan.name ?? null,
    usage: [
      { key: 'users', used: users, limit: planLimit(ctx, 'users') },
      { key: 'contacts', used: contacts, limit: planLimit(ctx, 'contacts') },
      { key: 'companies', used: companies, limit: planLimit(ctx, 'companies') },
      { key: 'storageMb', used: Math.ceil((bytes / (1024 * 1024)) * 10) / 10, limit: planLimit(ctx, 'storageMb') },
    ],
    pipelines,
    features: Object.fromEntries(['pipeline', 'tasks', 'multiPipelines', 'proposals', 'export', 'reports'].map((f) => [f, planHasFeature(ctx, f)])) as Record<string, boolean>,
  };
}
