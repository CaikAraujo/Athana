'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { run, formObject, type ActionState } from '@/lib/action';
import { AppError } from '@/lib/errors';
import { parseAmount } from '@/lib/money';
import { m } from '@/i18n/translate';
import { isLocale, localePath } from '@/i18n/config';
import { tenantFromSession } from '@/modules/tenancy/guard';
import type { TenantCtx } from '@/modules/tenancy/context';
import { zonedToUtc } from './dates';
import * as crm from './service';

type Form = Record<string, unknown>;
type Handler = (ctx: TenantCtx, f: Form, fd: FormData) => Promise<ActionState | void>;

/**
 * Common shape of every CRM action: the tenant comes from the server-side session (never from the form),
 * the service does the work and enforces permissions, then the CRM section is revalidated.
 * When the form carries `locale` and the handler returns `data.redirect`, the user is sent to that CRM page.
 */
async function crmAction(fd: FormData, handler: Handler, multi: string[] = []): Promise<ActionState> {
  const f = formObject(fd, multi);
  return run(async () => {
    const ctx = await tenantFromSession('crm');
    const result = await handler(ctx, f, fd);
    revalidatePath('/[locale]/app/crm', 'layout');
    const to = (result?.data as { redirect?: string } | undefined)?.redirect;
    if (to && isLocale(String(f.locale))) redirect(localePath(String(f.locale) as Parameters<typeof localePath>[0], to));
    return result;
  }, typeof f.locale === 'string' ? f.locale : undefined);
}

const str = (v: unknown) => (typeof v === 'string' ? v : '');
/** undefined when the field is absent from the form (= leave unchanged), otherwise the string ('' clears). */
const opt = (v: unknown) => (typeof v === 'string' ? v : undefined);
const id = (v: unknown) => {
  const s = str(v).trim();
  if (!s) throw new AppError(m('Élément introuvable.'), 'not_found');
  return s;
};

/** "1 490,50" → 149050 minor units, with a field error instead of a crash. */
function amount(v: unknown, field: string): number {
  const s = str(v).trim();
  if (!s) return 0;
  try {
    return parseAmount(s);
  } catch {
    throw new AppError(m('Veuillez corriger les champs signalés.'), 'invalid', { [field]: m('Montant invalide.') });
  }
}

/** <input type="datetime-local"> values are typed in the organization's time zone. */
async function localDateTime(ctx: TenantCtx, v: unknown): Promise<Date | string | undefined> {
  const s = str(v).trim();
  if (!s) return undefined;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(s)) return zonedToUtc(s, await crm.organizationTimezone(ctx)) ?? s;
  return s;
}

const contactFields = (f: Form) => ({
  firstName: opt(f.firstName), lastName: opt(f.lastName), email: opt(f.email), phone: opt(f.phone), jobTitle: opt(f.jobTitle),
  lifecycle: (opt(f.lifecycle) || undefined) as crm.Lifecycle | undefined, source: opt(f.source), companyId: opt(f.companyId), ownerId: opt(f.ownerId), notes: opt(f.notes),
});
const companyFields = (f: Form) => ({
  name: opt(f.name), website: opt(f.website), industry: opt(f.industry), phone: opt(f.phone), email: opt(f.email),
  address: opt(f.address), city: opt(f.city), country: opt(f.country), notes: opt(f.notes),
});

// ───────────────────────────── Contacts & leads ─────────────────────────────
export async function createContactAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    const contact = await crm.createContact(ctx, { ...contactFields(f), firstName: str(f.firstName) });
    return { ok: true, data: { id: contact.id } };
  });
}

export async function updateContactAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.updateContact(ctx, id(f.id), contactFields(f));
  });
}

export async function deleteContactAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.deleteContact(ctx, id(f.id));
    return { ok: true, data: { redirect: f.back === 'leads' ? '/app/crm/leads' : '/app/crm/contacts' } };
  });
}

export async function convertLeadAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    const to = str(f.to);
    await crm.convertLead(ctx, id(f.id), to === 'PROSPECT' || to === 'CUSTOMER' ? to : undefined);
  });
}

// ───────────────────────────── Companies ─────────────────────────────
export async function createCompanyAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    const company = await crm.createCompany(ctx, { ...companyFields(f), name: str(f.name) });
    return { ok: true, data: { id: company.id } };
  });
}

export async function updateCompanyAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.updateCompany(ctx, id(f.id), companyFields(f));
  });
}

export async function deleteCompanyAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.deleteCompany(ctx, id(f.id));
    return { ok: true, data: { redirect: '/app/crm/companies' } };
  });
}

// ───────────────────────────── Deals ─────────────────────────────
export async function createDealAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    const deal = await crm.createDeal(ctx, {
      title: str(f.title), value: amount(f.value, 'value'), pipelineId: opt(f.pipelineId), stageId: opt(f.stageId),
      contactId: opt(f.contactId), companyId: opt(f.companyId) || undefined, ownerId: opt(f.ownerId) || undefined, expectedCloseAt: opt(f.expectedCloseAt),
    });
    return { ok: true, data: { id: deal.id } };
  });
}

export async function updateDealAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.updateDeal(ctx, id(f.id), {
      title: opt(f.title), value: f.value === undefined ? undefined : amount(f.value, 'value'),
      contactId: opt(f.contactId), companyId: opt(f.companyId), ownerId: opt(f.ownerId), expectedCloseAt: opt(f.expectedCloseAt),
    });
  });
}

export async function moveDealAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.moveDeal(ctx, id(f.dealId), id(f.stageId));
  });
}

export async function winDealAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.markDealWon(ctx, id(f.id));
  });
}

export async function loseDealAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.markDealLost(ctx, id(f.id), str(f.reason));
  });
}

export async function reopenDealAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.reopenDeal(ctx, id(f.id));
  });
}

export async function deleteDealAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.deleteDeal(ctx, id(f.id));
    return { ok: true, data: { redirect: '/app/crm/pipeline' } };
  });
}

// ───────────────────────────── Activities ─────────────────────────────
export async function logActivityAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.logActivity(ctx, {
      type: str(f.type) as crm.ActivityType, body: str(f.body), occurredAt: await localDateTime(ctx, f.occurredAt),
      contactId: opt(f.contactId), companyId: opt(f.companyId), dealId: opt(f.dealId),
    });
  });
}

export async function deleteActivityAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.deleteActivity(ctx, id(f.id));
  });
}

// ───────────────────────────── Tasks ─────────────────────────────
export async function createTaskAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.createTask(ctx, {
      title: str(f.title), description: opt(f.description), dueAt: opt(f.dueAt), assigneeId: opt(f.assigneeId) || undefined,
      contactId: opt(f.contactId), dealId: opt(f.dealId),
    });
  });
}

export async function updateTaskAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.updateTask(ctx, id(f.id), { title: opt(f.title), description: opt(f.description), dueAt: opt(f.dueAt), assigneeId: opt(f.assigneeId) });
  });
}

export async function toggleTaskAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    if (f.done === '1') await crm.completeTask(ctx, id(f.id));
    else await crm.reopenTask(ctx, id(f.id));
  });
}

export async function deleteTaskAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.deleteTask(ctx, id(f.id));
  });
}

// ───────────────────────────── Proposals ─────────────────────────────
function proposalLines(f: Form) {
  const descriptions = f.lineDescription as string[];
  const quantities = f.lineQuantity as string[];
  const prices = f.linePrice as string[];
  return descriptions
    .map((description, i) => ({ description, quantity: str(quantities[i]).replace(',', '.'), price: str(prices[i]) }))
    .filter((l) => l.description.trim() || l.price.trim())
    .map((l) => ({ description: l.description, quantity: l.quantity || '1', unitAmount: amount(l.price, 'lines') }));
}
const LINE_FIELDS = ['lineDescription', 'lineQuantity', 'linePrice'];

export async function createProposalAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    const proposal = await crm.createProposal(ctx, { title: str(f.title), recipient: opt(f.recipient), dealId: opt(f.dealId), validUntil: opt(f.validUntil) });
    return { ok: true, data: { id: proposal.id, redirect: `/app/crm/proposals/${proposal.id}` } };
  });
}

export async function updateProposalAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.updateProposal(ctx, id(f.id), {
      title: opt(f.title), recipient: opt(f.recipient), dealId: opt(f.dealId), validUntil: opt(f.validUntil), notes: opt(f.notes), lines: proposalLines(f),
    });
  }, LINE_FIELDS);
}

export async function setProposalStatusAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.setProposalStatus(ctx, id(f.id), str(f.status));
  });
}

export async function deleteProposalAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.deleteProposal(ctx, id(f.id));
    return { ok: true, data: { redirect: '/app/crm/proposals' } };
  });
}

// ───────────────────────────── Attachments ─────────────────────────────
export async function uploadAttachmentAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    const file = fd.get('file');
    if (!(file instanceof File)) throw new AppError(m('Veuillez choisir un fichier.'), 'invalid', { file: m('Veuillez choisir un fichier.') });
    await crm.uploadAttachment(ctx, { entityType: str(f.entityType), entityId: id(f.entityId), file });
  });
}

export async function deleteAttachmentAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.deleteAttachment(ctx, id(f.id));
  });
}

// ───────────────────────────── Pipelines & stages (ADMIN+) ─────────────────────────────
export async function createPipelineAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.createPipeline(ctx, { name: str(f.name) });
  });
}

export async function renamePipelineAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.renamePipeline(ctx, id(f.id), str(f.name));
  });
}

export async function setDefaultPipelineAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.setDefaultPipeline(ctx, id(f.id));
  });
}

export async function deletePipelineAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.deletePipeline(ctx, id(f.id));
  });
}

export async function addStageAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.addStage(ctx, id(f.pipelineId), { name: str(f.name), probability: str(f.probability) || 50 });
  });
}

export async function updateStageAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.updateStage(ctx, id(f.id), { name: str(f.name), probability: str(f.probability) });
  });
}

export async function moveStageAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.moveStage(ctx, id(f.id), f.direction === 'up' ? 'up' : 'down');
  });
}

export async function deleteStageAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.deleteStage(ctx, id(f.id));
  });
}

// ───────────────────────────── Team (ADMIN+) ─────────────────────────────
export async function inviteMemberAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.inviteTeamMember(ctx, { email: str(f.email), name: str(f.name), role: (str(f.role) || 'MEMBER') as 'ADMIN' | 'MANAGER' | 'MEMBER' });
  });
}

export async function changeMemberRoleAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.changeMemberRole(ctx, id(f.userId), str(f.role));
  });
}

export async function removeMemberAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return crmAction(fd, async (ctx, f) => {
    await crm.removeTeamMember(ctx, id(f.userId));
  });
}
