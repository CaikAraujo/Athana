import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { audit } from '@/lib/audit';
import { m } from '@/i18n/translate';
import { assertWithinLimit } from '@/modules/tenancy/context';
import { LIFECYCLES, type Lifecycle } from './labels';
import { removeEntityFiles } from './files';
import {
  assertCanDelete, assertMember, like, optEmail, optId, optText, paged, pageParams, reqText, requireCompany, requireContact, userNames, words, type TenantCtx,
} from './shared';

// ───────────────────────────── Companies ─────────────────────────────
const companySchema = z.object({
  name: reqText(160), website: optText(200), industry: optText(120), phone: optText(60), email: optEmail,
  address: optText(200), city: optText(120), country: optText(80), notes: optText(5000),
});
export type CompanyInput = z.input<typeof companySchema>;

export async function createCompany(ctx: TenantCtx, input: CompanyInput) {
  const data = companySchema.parse(input);
  await assertWithinLimit(ctx, 'companies', () => db.crmCompany.count({ where: { organizationId: ctx.organizationId } }));
  return db.crmCompany.create({ data: { ...data, organizationId: ctx.organizationId } });
}

export async function updateCompany(ctx: TenantCtx, id: string, input: Partial<CompanyInput>) {
  const data = companySchema.partial().parse(input);
  await requireCompany(ctx, id);
  return db.crmCompany.update({ where: { id, organizationId: ctx.organizationId }, data });
}

export async function deleteCompany(ctx: TenantCtx, id: string) {
  assertCanDelete(ctx);
  const company = await requireCompany(ctx, id);
  await removeEntityFiles(ctx, 'company', id);
  await db.crmCompany.deleteMany({ where: { id, organizationId: ctx.organizationId } });
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'crm.company.deleted', entity: 'CrmCompany', entityId: id, meta: { name: company.name } });
}

export async function getCompany(ctx: TenantCtx, id: string) {
  await requireCompany(ctx, id);
  return db.crmCompany.findFirstOrThrow({
    where: { id, organizationId: ctx.organizationId },
    include: {
      contacts: { where: { organizationId: ctx.organizationId }, orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }], take: 200 },
      deals: { where: { organizationId: ctx.organizationId }, orderBy: { createdAt: 'desc' }, take: 100, include: { stage: true } },
    },
  });
}

const companyListSchema = pageParams.extend({ q: z.string().optional(), sort: z.enum(['name', 'city', 'createdAt']).catch('name').default('name') });

export async function listCompanies(ctx: TenantCtx, params: z.input<typeof companyListSchema> = {}) {
  const p = companyListSchema.parse(params);
  const where: Prisma.CrmCompanyWhereInput = {
    organizationId: ctx.organizationId,
    AND: words(p.q).map((w) => ({ OR: [{ name: like(w) }, { email: like(w) }, { phone: like(w) }, { city: like(w) }] })),
  };
  const [items, total] = await Promise.all([
    db.crmCompany.findMany({ where, orderBy: [{ [p.sort]: p.dir }, { id: 'asc' }], skip: (p.page - 1) * p.pageSize, take: p.pageSize, include: { _count: { select: { contacts: true, deals: true } } } }),
    db.crmCompany.count({ where }),
  ]);
  return paged(items, total, p.page, p.pageSize);
}

/** Lightweight list for <select> fields. */
export async function companyOptions(ctx: TenantCtx) {
  return db.crmCompany.findMany({ where: { organizationId: ctx.organizationId }, orderBy: { name: 'asc' }, select: { id: true, name: true }, take: 2000 });
}

// ───────────────────────────── Contacts ─────────────────────────────
const contactSchema = z.object({
  firstName: reqText(100), lastName: z.string().trim().max(100, m('Texte trop long.')).optional(),
  email: optEmail, phone: optText(60), jobTitle: optText(120),
  lifecycle: z.enum(LIFECYCLES, { error: m('Statut invalide.') }).optional(),
  source: optText(80), companyId: optId, ownerId: optId, notes: optText(5000),
});
export type ContactInput = z.input<typeof contactSchema>;

async function checkContactLinks(ctx: TenantCtx, data: { companyId?: string | null; ownerId?: string | null }) {
  if (data.companyId) await requireCompany(ctx, data.companyId);
  if (data.ownerId) await assertMember(ctx, data.ownerId);
}

export async function createContact(ctx: TenantCtx, input: ContactInput) {
  const data = contactSchema.parse(input);
  await assertWithinLimit(ctx, 'contacts', () => db.crmContact.count({ where: { organizationId: ctx.organizationId } }));
  await checkContactLinks(ctx, data);
  return db.crmContact.create({ data: { ...data, ownerId: data.ownerId === undefined ? ctx.userId : data.ownerId, organizationId: ctx.organizationId } });
}

export async function updateContact(ctx: TenantCtx, id: string, input: Partial<ContactInput>) {
  const data = contactSchema.partial().parse(input);
  await requireContact(ctx, id);
  await checkContactLinks(ctx, data);
  return db.crmContact.update({ where: { id, organizationId: ctx.organizationId }, data });
}

export async function deleteContact(ctx: TenantCtx, id: string) {
  assertCanDelete(ctx);
  const contact = await requireContact(ctx, id);
  await removeEntityFiles(ctx, 'contact', id);
  await db.crmContact.deleteMany({ where: { id, organizationId: ctx.organizationId } });
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'crm.contact.deleted', entity: 'CrmContact', entityId: id, meta: { name: `${contact.firstName} ${contact.lastName}`.trim() } });
}

export async function getContact(ctx: TenantCtx, id: string) {
  await requireContact(ctx, id);
  const contact = await db.crmContact.findFirstOrThrow({
    where: { id, organizationId: ctx.organizationId },
    include: { company: true, deals: { where: { organizationId: ctx.organizationId }, orderBy: { createdAt: 'desc' }, take: 100, include: { stage: true } } },
  });
  const names = await userNames([contact.ownerId]);
  return { ...contact, ownerName: contact.ownerId ? names[contact.ownerId] ?? null : null };
}

const contactListSchema = pageParams.extend({
  q: z.string().optional(),
  lifecycle: z.enum(LIFECYCLES).optional().catch(undefined),
  companyId: z.string().optional(), ownerId: z.string().optional(), source: z.string().optional(),
  sort: z.enum(['name', 'email', 'lifecycle', 'createdAt']).catch('name').default('name'),
});
export type ContactListParams = z.input<typeof contactListSchema>;

export async function listContacts(ctx: TenantCtx, params: ContactListParams = {}) {
  const p = contactListSchema.parse(params);
  const where: Prisma.CrmContactWhereInput = {
    organizationId: ctx.organizationId,
    ...(p.lifecycle ? { lifecycle: p.lifecycle } : {}),
    ...(p.companyId ? { companyId: p.companyId } : {}),
    ...(p.ownerId ? { ownerId: p.ownerId } : {}),
    ...(p.source ? { source: p.source } : {}),
    AND: words(p.q).map((w) => ({ OR: [{ firstName: like(w) }, { lastName: like(w) }, { email: like(w) }, { phone: like(w) }, { company: { is: { name: like(w), organizationId: ctx.organizationId } } }] })),
  };
  const orderBy: Prisma.CrmContactOrderByWithRelationInput[] = p.sort === 'name' ? [{ lastName: p.dir }, { firstName: p.dir }] : [{ [p.sort]: p.dir }];
  const [rows, total] = await Promise.all([
    db.crmContact.findMany({ where, orderBy: [...orderBy, { id: 'asc' }], skip: (p.page - 1) * p.pageSize, take: p.pageSize, include: { company: { select: { id: true, name: true } } } }),
    db.crmContact.count({ where }),
  ]);
  const names = await userNames(rows.map((r) => r.ownerId));
  return paged(rows.map((r) => ({ ...r, ownerName: r.ownerId ? names[r.ownerId] ?? null : null })), total, p.page, p.pageSize);
}

export async function contactOptions(ctx: TenantCtx) {
  return db.crmContact.findMany({ where: { organizationId: ctx.organizationId }, orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }], select: { id: true, firstName: true, lastName: true, companyId: true }, take: 5000 });
}

// ───────────────────────────── Leads ─────────────────────────────
/** A lead is a contact whose lifecycle is LEAD. */
export function listLeads(ctx: TenantCtx, params: Omit<ContactListParams, 'lifecycle'> = {}) {
  return listContacts(ctx, { sort: 'createdAt', dir: 'desc', ...params, lifecycle: 'LEAD' });
}

export function createLead(ctx: TenantCtx, input: Omit<ContactInput, 'lifecycle'>) {
  return createContact(ctx, { ...input, lifecycle: 'LEAD' });
}

const NEXT_LIFECYCLE: Partial<Record<Lifecycle, Lifecycle>> = { LEAD: 'PROSPECT', PROSPECT: 'CUSTOMER' };

/** Conversion LEAD → PROSPECT → CUSTOMER (one step at a time, or straight to `to` when it is further along). */
export async function convertLead(ctx: TenantCtx, id: string, to?: 'PROSPECT' | 'CUSTOMER') {
  const contact = await requireContact(ctx, id);
  const next = NEXT_LIFECYCLE[contact.lifecycle];
  if (!next) throw new AppError(m('Ce contact ne peut plus être converti.'), 'conflict');
  const target = to ?? next;
  if (target !== 'PROSPECT' && target !== 'CUSTOMER') throw new AppError(m('Statut invalide.'), 'invalid');
  if (contact.lifecycle === 'PROSPECT' && target === 'PROSPECT') throw new AppError(m('Ce contact est déjà un prospect.'), 'conflict');
  return db.crmContact.update({ where: { id, organizationId: ctx.organizationId }, data: { lifecycle: target } });
}

export async function leadSourceOptions(ctx: TenantCtx): Promise<string[]> {
  const rows = await db.crmContact.groupBy({ by: ['source'], where: { organizationId: ctx.organizationId, source: { not: null } }, orderBy: { source: 'asc' }, take: 100 });
  return rows.map((r) => r.source!).filter(Boolean);
}
