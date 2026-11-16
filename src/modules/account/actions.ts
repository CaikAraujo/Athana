'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { run, formObject, type ActionState } from '@/lib/action';
import { AppError } from '@/lib/errors';
import { audit } from '@/lib/audit';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getMarket } from '@/lib/settings';
import { m } from '@/i18n/translate';
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from '@/i18n/config';
import { assertUser } from '@/modules/auth/session';
import { changePassword } from '@/modules/auth/service';
import { createOrganization } from '@/modules/tenancy/context';
import { switchOrganization } from '@/modules/tenancy/guard';
import { cancelSubscription, changePlan, resumeSubscription, startSubscriptionCheckout, startTrial } from '@/modules/billing/service';
import { approveProject, confirmBriefing, postMessage, requestRevision, saveBriefing, submitBriefing } from '@/modules/projects/service';
import { storage, storeUpload } from '@/modules/storage/service';

const loc = (v: unknown): Locale => (isLocale(String(v)) ? (String(v) as Locale) : DEFAULT_LOCALE);
const refresh = () => revalidatePath('/', 'layout');

export async function updateProfileAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await assertUser();
    const data = z.object({
      name: z.string().trim().min(2, m('Veuillez indiquer votre nom.')).max(120),
      phone: z.string().trim().max(40).optional(),
      country: z.string().trim().max(2).optional(),
      locale: z.string().refine(isLocale, m('Langue invalide.')),
    }).parse(formObject(fd));
    await db.user.update({ where: { id: user.id }, data: { name: data.name, phone: data.phone || null, country: data.country || null, locale: data.locale } });
    refresh();
  });
}

export async function changePasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await assertUser();
    await enforceRateLimit(`pwd:${user.id}`, 8, 3600);
    await changePassword(user.id, String(fd.get('current')), String(fd.get('password')));
  });
}

/** RGPD / nLPD: the request is recorded and handled by staff (deletion may be limited by legal retention duties). */
export async function requestDataAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await assertUser();
    const type = fd.get('type') === 'DELETE' ? 'DELETE' : 'EXPORT';
    if (await db.dataRequest.findFirst({ where: { userId: user.id, type, status: 'PENDING' } })) throw new AppError(m('Une demande identique est déjà en cours de traitement.'));
    const req = await db.dataRequest.create({ data: { userId: user.id, type, note: String(fd.get('note') ?? '').slice(0, 1000) || null } });
    await db.task.create({ data: { type: 'data_request', title: `Demande RGPD (${type}) — ${user.email}`, dueAt: new Date(Date.now() + 25 * 86400_000) } });
    await audit({ actorId: user.id, action: 'data_request.created', entity: 'DataRequest', entityId: req.id, meta: { type } });
    refresh();
  });
}

export async function createCompanyAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await assertUser();
    const f = formObject(fd);
    if ((await db.membership.count({ where: { userId: user.id, role: 'OWNER' } })) >= 10) throw new AppError(m('Nombre maximal d’entreprises atteint.'));
    const tz = String(f.timezone || 'Europe/Zurich');
    if (!Intl.supportedValuesOf('timeZone').includes(tz) && tz !== 'UTC') throw new AppError(m('Fuseau horaire invalide.'));
    const org = await createOrganization(user.id, { name: String(f.name ?? ''), country: String(f.country || '') || undefined, vatNumber: String(f.vatNumber || '') || undefined, address: String(f.address || '') || undefined, city: String(f.city || '') || undefined, postalCode: String(f.postalCode || '') || undefined, timezone: tz });
    await switchOrganization(org.id);
    refresh();
  });
}

export async function switchCompanyAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => { await switchOrganization(String(fd.get('organizationId'))); refresh(); });
}

// ── Subscriptions ───────────────────────────────────────────────────────────

export async function startTrialAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const locale = loc(fd.get('locale'));
  return run(async () => {
    const user = await assertUser();
    const market = await getMarket(locale);
    const sub = await startTrial(user.id, String(fd.get('organizationId')), String(fd.get('planId')), market?.currency ?? 'EUR');
    await switchOrganization(sub.organizationId);
    redirect(localePath(locale, `/app/${sub.saasProductKey}`));
  }, locale);
}

export async function activateSubscriptionAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const locale = loc(fd.get('locale'));
  return run(async () => {
    const user = await assertUser();
    const back = `${env.appUrl}${localePath(locale, '/account/subscriptions')}`;
    const session = await startSubscriptionCheckout(user.id, String(fd.get('subscriptionId')), locale, `${back}?activated=1`, back);
    redirect(session.url);
  }, locale);
}

export async function changePlanAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => { const user = await assertUser(); await changePlan(user.id, String(fd.get('subscriptionId')), String(fd.get('planId'))); refresh(); });
}
export async function cancelSubscriptionAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => { const user = await assertUser(); await cancelSubscription(user.id, String(fd.get('subscriptionId'))); refresh(); });
}
export async function resumeSubscriptionAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => { const user = await assertUser(); await resumeSubscription(user.id, String(fd.get('subscriptionId'))); refresh(); });
}

// ── Projects, briefing, files ───────────────────────────────────────────────

export async function briefingAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const locale = loc(fd.get('locale'));
  return run(async () => {
    const user = await assertUser();
    const f = formObject(fd);
    const projectId = String(f.projectId);
    const intent = String(f.intent);
    const aiConsent = f.aiConsent === 'on';
    if (intent === 'confirm') { await confirmBriefing(user.id, projectId); refresh(); return { ok: true, message: 'confirmed' }; }
    if (intent === 'submit') { await submitBriefing(user.id, projectId, f, aiConsent); refresh(); return { ok: true, message: 'submitted' }; }
    await saveBriefing(user.id, projectId, f, aiConsent);
    refresh();
    return { ok: true, message: 'saved' };
  }, locale);
}

export async function uploadProjectFileAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await assertUser();
    await enforceRateLimit(`upload:${user.id}`, 60, 3600);
    const projectId = String(fd.get('projectId'));
    const project = await db.project.findFirst({ where: { id: projectId, userId: user.id }, include: { briefing: true, _count: { select: { files: true } } } });
    if (!project) throw new AppError(m('Projet introuvable.'), 'not_found');
    if (project.status === 'PAYMENT_PENDING') throw new AppError(m('Les fichiers pourront être ajoutés après le paiement.'));
    if (project._count.files >= 60) throw new AppError(m('Nombre maximal de fichiers atteint pour ce projet.'));
    const file = fd.get('file');
    if (!(file instanceof File)) throw new AppError(m('Veuillez sélectionner un fichier.'));
    const stored = await storeUpload('projects', file);
    const kind = ['logo', 'image', 'document'].includes(String(fd.get('kind'))) ? String(fd.get('kind')) : 'document';
    await db.fileAsset.create({ data: { ...stored, ownerId: user.id, projectId, briefingId: fd.get('briefing') === '1' ? project.briefing?.id : null, kind } });
    refresh();
  });
}

export async function deleteProjectFileAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await assertUser();
    const file = await db.fileAsset.findFirst({ where: { id: String(fd.get('fileId')), ownerId: user.id, projectId: { not: null } } });
    if (!file) throw new AppError(m('Fichier introuvable.'), 'not_found');
    await db.fileAsset.delete({ where: { id: file.id } });
    await storage.remove(file.storageKey);
    refresh();
  });
}

export async function postMessageAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await assertUser();
    await enforceRateLimit(`msg:${user.id}`, 60, 3600);
    await postMessage(user, String(fd.get('projectId')), String(fd.get('body') ?? ''), fd.get('internal') === 'on');
    refresh();
  });
}

export async function requestRevisionAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => { const user = await assertUser(); await requestRevision(user.id, String(fd.get('projectId')), String(fd.get('description') ?? '')); refresh(); });
}
export async function approveProjectAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => { const user = await assertUser(); await approveProject(user.id, String(fd.get('projectId'))); refresh(); });
}

// ── Support & notifications ─────────────────────────────────────────────────

export async function createTicketAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await assertUser();
    await enforceRateLimit(`ticket:${user.id}`, 10, 3600);
    const data = z.object({ subject: z.string().trim().min(3, m('Sujet requis.')).max(160), body: z.string().trim().min(10, m('Votre message est trop court.')).max(5000) }).parse(formObject(fd));
    const ticket = await db.ticket.create({ data: { userId: user.id, subject: data.subject, messages: { create: { senderId: user.id, body: data.body } } } });
    const staff = await db.user.findMany({ where: { platformRole: { in: ['SUPER_ADMIN', 'ADMIN', 'SUPPORT'] }, disabledAt: null }, select: { id: true } });
    if (staff.length) await db.notification.createMany({ data: staff.map((s) => ({ userId: s.id, type: 'support', title: `Nouveau ticket : ${data.subject}`, link: `/admin/support/${ticket.id}` })) });
    refresh();
  });
}

export async function replyTicketAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await assertUser();
    const ticket = await db.ticket.findFirst({ where: { id: String(fd.get('ticketId')), userId: user.id } });
    if (!ticket) throw new AppError(m('Ticket introuvable.'), 'not_found');
    const body = String(fd.get('body') ?? '').trim();
    if (body.length < 1 || body.length > 5000) throw new AppError(m('Message vide ou trop long.'));
    await db.$transaction([
      db.message.create({ data: { ticketId: ticket.id, senderId: user.id, body } }),
      db.ticket.update({ where: { id: ticket.id }, data: { status: 'OPEN' } }),
    ]);
    refresh();
  });
}

export async function markNotificationsReadAction(_: ActionState, _fd: FormData): Promise<ActionState> {
  return run(async () => {
    const user = await assertUser();
    await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
    refresh();
  });
}
