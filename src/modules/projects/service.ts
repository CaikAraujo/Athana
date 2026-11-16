import type { Prisma, ProjectStatus, User } from '@prisma/client';
import { z } from 'zod';
import { db } from '@/lib/db';
import { AppError, forbidden } from '@/lib/errors';
import { audit } from '@/lib/audit';
import { m } from '@/i18n/translate';
import { can } from '@/modules/auth/rbac';
import { emit } from '@/modules/automation/events';

export const PROJECT_FLOW: ProjectStatus[] = [
  'PAYMENT_PENDING', 'PAID', 'BRIEFING_PENDING', 'BRIEFING_SUBMITTED', 'PROJECT_QUEUED', 'IN_DEVELOPMENT',
  'INTERNAL_REVIEW', 'CLIENT_REVIEW', 'REVISION_REQUESTED', 'APPROVED', 'DEPLOYMENT_PENDING', 'COMPLETED', 'MAINTENANCE',
];

/** Client-facing progress (0-100) derived from the status. */
export function projectProgress(status: ProjectStatus): number {
  const map: Record<ProjectStatus, number> = {
    PAYMENT_PENDING: 0, PAID: 8, BRIEFING_PENDING: 10, BRIEFING_SUBMITTED: 20, PROJECT_QUEUED: 25, IN_DEVELOPMENT: 50,
    INTERNAL_REVIEW: 65, CLIENT_REVIEW: 75, REVISION_REQUESTED: 70, APPROVED: 88, DEPLOYMENT_PENDING: 94, COMPLETED: 100, MAINTENANCE: 100,
  };
  return map[status];
}

type Actor = Pick<User, 'id' | 'platformRole'>;
const isStaff = (a: Actor) => can(a.platformRole, 'projects.view');

/** Loads a project the actor is allowed to see: its owner, or staff with projects.view. */
export async function getProjectFor(actor: Actor, projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { briefing: { include: { files: true } }, orderItem: { include: { order: true, product: true, package: true } }, user: true, assignee: true },
  });
  if (!project) throw new AppError(m('Projet introuvable.'), 'not_found');
  if (project.userId !== actor.id && !isStaff(actor)) throw new AppError(m('Projet introuvable.'), 'not_found');
  return project;
}

async function transition(projectId: string, to: ProjectStatus, actorId: string | null, note?: string, tx: Prisma.TransactionClient | typeof db = db) {
  const project = await tx.project.findUniqueOrThrow({ where: { id: projectId } });
  if (project.status === to) return project;
  await tx.project.update({ where: { id: projectId }, data: { status: to } });
  await tx.projectEvent.create({ data: { projectId, type: 'status_change', fromStatus: project.status, toStatus: to, actorId, note } });
  return project;
}

/** Staff status change. Unpaid projects cannot be moved forward manually. */
export async function setProjectStatus(actor: Actor, projectId: string, to: ProjectStatus, note?: string) {
  if (!can(actor.platformRole, 'projects.work')) throw forbidden();
  const project = await db.project.findUnique({ where: { id: projectId } });
  if (!project) throw new AppError(m('Projet introuvable.'), 'not_found');
  if (!PROJECT_FLOW.includes(to)) throw new AppError(m('Statut invalide.'));
  if (project.status === 'PAYMENT_PENDING' || to === 'PAYMENT_PENDING' || to === 'PAID') {
    throw new AppError(m('Le statut de paiement est piloté par le prestataire de paiement et ne peut pas être modifié manuellement.'));
  }
  // Developers work on projects assigned to them; managers can move any project.
  if (!can(actor.platformRole, 'projects.manage') && project.assigneeId !== actor.id) throw forbidden();
  const before = await transition(projectId, to, actor.id, note);
  await audit({ actorId: actor.id, action: 'project.status', entity: 'Project', entityId: projectId, meta: { from: before.status, to } });
  if (before.status !== to) await emit({ type: 'project.status_changed', projectId, from: before.status, to });
}

export async function assignProject(actor: Actor, projectId: string, assigneeId: string | null, dueAt?: Date | null) {
  if (!can(actor.platformRole, 'projects.manage')) throw forbidden();
  if (assigneeId) {
    const assignee = await db.user.findFirst({ where: { id: assigneeId, platformRole: { not: null }, disabledAt: null } });
    if (!assignee) throw new AppError(m('Responsable invalide.'));
  }
  await db.project.update({ where: { id: projectId }, data: { assigneeId, ...(dueAt !== undefined ? { dueAt } : {}) } });
  await audit({ actorId: actor.id, action: 'project.assign', entity: 'Project', entityId: projectId, meta: { assigneeId } });
}

export async function postMessage(actor: Actor, projectId: string, body: string, internal = false) {
  const project = await getProjectFor(actor, projectId);
  const text = body.trim();
  if (text.length < 1 || text.length > 5000) throw new AppError(m('Message vide ou trop long.'));
  const fromStaff = project.userId !== actor.id;
  if (internal && !fromStaff) throw forbidden();
  const message = await db.message.create({ data: { projectId, senderId: actor.id, body: text, fromStaff, internal } });
  if (!internal) await emit({ type: 'project.message', projectId, fromStaff });
  return message;
}

// ── Briefing ────────────────────────────────────────────────────────────────

const str = (max = 500) => z.string().trim().max(max).optional().default('');
export const briefingSchema = z.object({
  companyName: str(160), sector: str(120), contactName: str(120), email: str(254), phone: str(40),
  address: str(300), country: str(60), projectLanguage: str(60), domain: str(120), colors: str(300),
  references: str(1500), goal: str(2000), audience: str(2000), pages: str(2000), features: str(2000),
  socials: str(1000), texts: str(20000), products: str(5000), extra: str(5000),
  ownWords: str(20000),
});
export type BriefingData = z.infer<typeof briefingSchema>;
export const BRIEFING_REQUIRED: (keyof BriefingData)[] = ['companyName', 'contactName', 'email', 'goal', 'ownWords'];

async function ownedBriefing(userId: string, projectId: string) {
  const project = await db.project.findFirst({ where: { id: projectId, userId }, include: { briefing: true } });
  if (!project || !project.briefing) throw new AppError(m('Briefing introuvable.'), 'not_found');
  if (project.status === 'PAYMENT_PENDING') throw new AppError(m('Le briefing sera disponible après le paiement.'));
  return { project, briefing: project.briefing };
}

/** Saves a draft. Editing stays possible until the client gives the final confirmation. */
export async function saveBriefing(userId: string, projectId: string, input: unknown, aiConsent?: boolean) {
  const { briefing } = await ownedBriefing(userId, projectId);
  if (briefing.status === 'CONFIRMED') throw new AppError(m('Ce briefing a été confirmé et ne peut plus être modifié. Contactez-nous via la messagerie du projet.'));
  const data = briefingSchema.parse(input);
  return db.briefing.update({ where: { id: briefing.id }, data: { data, ...(aiConsent !== undefined ? { aiConsent } : {}) } });
}

export async function submitBriefing(userId: string, projectId: string, input: unknown, aiConsent: boolean) {
  const saved = await saveBriefing(userId, projectId, input, aiConsent);
  const data = saved.data as BriefingData;
  const missing = BRIEFING_REQUIRED.filter((k) => !data[k]);
  if (missing.length) {
    throw new AppError(m('Veuillez compléter les champs obligatoires avant d’envoyer le briefing.'), 'invalid', Object.fromEntries(missing.map((k) => [k, m('Champ obligatoire.')])));
  }
  const first = saved.status === 'DRAFT';
  await db.$transaction(async (tx) => {
    await tx.briefing.update({ where: { id: saved.id }, data: { status: 'SUBMITTED', submittedAt: new Date() } });
    const project = await tx.project.findUniqueOrThrow({ where: { id: projectId } });
    if (project.status === 'BRIEFING_PENDING') await transition(projectId, 'BRIEFING_SUBMITTED', userId, undefined, tx);
  });
  if (first) await emit({ type: 'briefing.submitted', projectId });
}

export async function confirmBriefing(userId: string, projectId: string) {
  const { briefing } = await ownedBriefing(userId, projectId);
  if (briefing.status !== 'SUBMITTED') throw new AppError(m('Envoyez d’abord le briefing avant de le confirmer.'));
  await db.$transaction(async (tx) => {
    await tx.briefing.update({ where: { id: briefing.id }, data: { status: 'CONFIRMED', confirmedAt: new Date() } });
    const project = await tx.project.findUniqueOrThrow({ where: { id: projectId } });
    if (project.status === 'BRIEFING_SUBMITTED') await transition(projectId, 'PROJECT_QUEUED', userId, undefined, tx);
  });
  await emit({ type: 'project.status_changed', projectId, from: 'BRIEFING_SUBMITTED', to: 'PROJECT_QUEUED' });
}

/**
 * Structured export of an order for the production workflow (including AI-assisted development).
 * Without the client's consent to AI processing, contact details and the free-text fields (which may
 * contain personal data) are redacted, so the file is safe to hand to an AI tool; structured project
 * requirements are always included. Staff can still read the full briefing in the admin.
 */
export async function exportProjectBrief(actor: Actor, projectId: string) {
  if (!can(actor.platformRole, 'projects.view')) throw forbidden();
  const p = await getProjectFor(actor, projectId);
  const data = (p.briefing?.data ?? {}) as Partial<BriefingData>;
  const consent = !!p.briefing?.aiConsent;
  const redact = <T,>(v: T) => (consent ? v : ('[redacted — no AI consent]' as unknown as T));
  return {
    schema: 'athana.project-brief/v1',
    aiProcessingConsent: consent,
    project: { reference: p.reference, status: p.status, dueAt: p.dueAt },
    product: { template: p.orderItem.product.slug, name: p.orderItem.name, tier: p.orderItem.tier, demo: p.orderItem.product.demoSlug ? `/demo/${p.orderItem.product.demoSlug}` : null, technologies: p.orderItem.product.technologies, addons: p.orderItem.addons, pagesIncluded: p.orderItem.package.pagesIncluded, revisions: p.orderItem.package.revisions },
    briefing: {
      status: p.briefing?.status ?? 'DRAFT',
      company: { name: data.companyName, sector: data.sector, country: data.country, address: redact(data.address) },
      contact: { name: redact(data.contactName), email: redact(data.email), phone: redact(data.phone) },
      project: { language: data.projectLanguage, domain: data.domain, colors: data.colors, references: data.references, goal: data.goal, audience: data.audience, pages: data.pages, features: data.features, socials: data.socials, products: data.products },
      content: { texts: redact(data.texts), extra: redact(data.extra), inTheirOwnWords: redact(data.ownWords) },
      files: (p.briefing?.files ?? []).map((f) => ({ id: f.id, kind: f.kind, name: f.originalName, mime: f.mime, size: f.size })),
    },
  };
}

// ── Revisions & approval ────────────────────────────────────────────────────

export async function requestRevision(userId: string, projectId: string, description: string) {
  const project = await db.project.findFirst({ where: { id: projectId, userId }, include: { orderItem: { include: { package: true } }, revisions: true } });
  if (!project) throw new AppError(m('Projet introuvable.'), 'not_found');
  if (project.status !== 'CLIENT_REVIEW') throw new AppError(m('Les révisions sont possibles lorsque le projet est en attente de votre validation.'));
  const text = description.trim();
  if (text.length < 10) throw new AppError(m('Décrivez la révision souhaitée (10 caractères minimum).'));
  await db.revision.create({ data: { projectId, requestedById: userId, description: text.slice(0, 5000) } });
  await transition(projectId, 'REVISION_REQUESTED', userId);
  await emit({ type: 'project.message', projectId, fromStaff: false });
}

export async function approveProject(userId: string, projectId: string) {
  const project = await db.project.findFirst({ where: { id: projectId, userId } });
  if (!project) throw new AppError(m('Projet introuvable.'), 'not_found');
  if (project.status !== 'CLIENT_REVIEW') throw new AppError(m('Ce projet n’est pas en attente de validation.'));
  await transition(projectId, 'APPROVED', userId);
  await emit({ type: 'project.status_changed', projectId, from: 'CLIENT_REVIEW', to: 'APPROVED' });
}
