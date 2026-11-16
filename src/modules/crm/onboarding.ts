import { db } from '@/lib/db';
import { m } from '@/i18n/translate';
import { DEFAULT_PIPELINE_NAME, DEFAULT_STAGES } from './pipeline';
import type { TenantCtx } from './shared';

/**
 * First visit of a tenant: creates the default pipeline with its stages and stamps organization.onboardedAt.
 * Idempotent and safe under concurrent requests (per-tenant advisory lock). `names` lets the caller pass
 * translated labels for the tenant's language; French is the fallback.
 */
export async function ensureOnboarded(ctx: TenantCtx, names?: { pipeline?: string; stages?: string[] }) {
  const existing = await db.crmPipeline.findFirst({ where: { organizationId: ctx.organizationId, isDefault: true }, select: { id: true } });
  if (existing) return { created: false };
  return db.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'crm-onboard:' + ctx.organizationId}))`;
    const pipelines = await tx.crmPipeline.findMany({ where: { organizationId: ctx.organizationId }, orderBy: { createdAt: 'asc' }, select: { id: true, isDefault: true } });
    let created = false;
    if (!pipelines.length) {
      await tx.crmPipeline.create({
        data: {
          organizationId: ctx.organizationId, name: names?.pipeline || DEFAULT_PIPELINE_NAME, isDefault: true,
          stages: { create: DEFAULT_STAGES.map((s, i) => ({ name: names?.stages?.[i] || s.name, probability: s.probability, position: i })) },
        },
      });
      created = true;
    } else if (!pipelines.some((p) => p.isDefault)) {
      await tx.crmPipeline.updateMany({ where: { id: pipelines[0].id, organizationId: ctx.organizationId }, data: { isDefault: true } });
    }
    await tx.organization.updateMany({ where: { id: ctx.organizationId, onboardedAt: null }, data: { onboardedAt: new Date() } });
    return { created };
  });
}

/** Getting-started checklist computed from the tenant's data. */
export async function onboardingChecklist(ctx: TenantCtx) {
  const where = { organizationId: ctx.organizationId };
  const [contacts, companies, deals, tasks, members] = await Promise.all([
    db.crmContact.count({ where }), db.crmCompany.count({ where }), db.crmDeal.count({ where }), db.crmTask.count({ where }), db.membership.count({ where }),
  ]);
  const items = [
    { key: 'contact', label: m('Ajouter votre premier contact'), href: '/app/crm/contacts', done: contacts > 0 },
    { key: 'company', label: m('Ajouter une entreprise'), href: '/app/crm/companies', done: companies > 0 },
    { key: 'deal', label: m('Créer une première affaire dans le pipeline'), href: '/app/crm/pipeline', done: deals > 0 },
    { key: 'task', label: m('Planifier une tâche de suivi'), href: '/app/crm/tasks', done: tasks > 0 },
    { key: 'team', label: m('Inviter un collègue'), href: '/app/crm/settings', done: members > 1 },
  ];
  const doneCount = items.filter((i) => i.done).length;
  return { items, doneCount, total: items.length, completed: doneCount === items.length };
}
