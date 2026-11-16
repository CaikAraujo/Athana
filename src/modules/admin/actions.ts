'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { PlatformRole, Prisma, ProjectStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { run, formObject, type ActionState } from '@/lib/action';
import { AppError } from '@/lib/errors';
import { audit } from '@/lib/audit';
import { hashPassword, randomToken } from '@/lib/crypto';
import { env } from '@/lib/env';
import { parseAmount } from '@/lib/money';
import { setSetting, SETTING_DEFAULTS, type SettingKey } from '@/lib/settings';
import { m } from '@/i18n/translate';
import { DEFAULT_LOCALE, isLocale, localePath, type Locale } from '@/i18n/config';
import { assertPermission } from '@/modules/auth/session';
import { createPasswordReset } from '@/modules/auth/service';
import { sendEmail } from '@/modules/email/service';
import { cancelOrder } from '@/modules/orders/service';
import { refundPayment } from '@/modules/payments/service';
import { assignProject, postMessage, setProjectStatus } from '@/modules/projects/service';
import { slugify } from '@/modules/tenancy/context';
import { storage } from '@/modules/storage/service';

const refresh = () => revalidatePath('/', 'layout');
const loc = (v: unknown): Locale => (isLocale(String(v)) ? (String(v) as Locale) : DEFAULT_LOCALE);
const LANGS = ['fr', 'pt-PT', 'pt-BR'] as const;
type F = Record<string, unknown>;

/** Reads "<name>.fr / <name>.pt-PT / <name>.pt-BR" form fields into a localised Json value. */
function i18n(f: F, name: string, required = false): Prisma.InputJsonValue {
  const out: Record<string, string> = {};
  for (const l of LANGS) { const v = String(f[`${name}.${l}`] ?? '').trim(); if (v) out[l] = v.slice(0, 5000); }
  if (required && !out.fr) throw new AppError(m('Le texte français est obligatoire.'), 'invalid', { [`${name}.fr`]: m('Champ obligatoire.') });
  return out;
}
/** Reads "<name>.CHF / <name>.EUR…" decimal fields into a minor-unit price map; empty = not sold in that currency. */
function prices(f: F, name: string): Prisma.InputJsonValue {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(f)) {
    if (!k.startsWith(`${name}.`) || String(v).trim() === '') continue;
    const cur = k.slice(name.length + 1);
    if (!/^[A-Z]{3}$/.test(cur)) continue;
    try { out[cur] = parseAmount(String(v)); } catch { throw new AppError(m('Montant invalide.'), 'invalid', { [k]: m('Montant invalide.') }); }
  }
  return out;
}
const lines = (v: unknown) => String(v ?? '').split('\n').map((s) => s.trim()).filter(Boolean);
/** One feature per line, same line index across the three language textareas. */
function i18nLines(f: F, name: string): Prisma.InputJsonValue {
  const fr = lines(f[`${name}.fr`]), pt = lines(f[`${name}.pt-PT`]), br = lines(f[`${name}.pt-BR`]);
  return fr.map((x, i) => ({ fr: x, ...(pt[i] ? { 'pt-PT': pt[i] } : {}), ...(br[i] ? { 'pt-BR': br[i] } : {}) }));
}
const int = (v: unknown, min = 0, max = 100000) => { const n = Number(v); if (!Number.isInteger(n) || n < min || n > max) throw new AppError(m('Valeur numérique invalide.')); return n; };
const optDate = (v: unknown) => (String(v ?? '').trim() ? new Date(String(v)) : null);

// ── Catalogue ───────────────────────────────────────────────────────────────

export async function saveCategoryAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('catalog.manage');
    const f = formObject(fd);
    const data = { name: i18n(f, 'name', true), sortOrder: int(f.sortOrder || 0), published: f.published === 'on' };
    if (f.id) await db.category.update({ where: { id: String(f.id) }, data });
    else {
      const slug = slugify(String(f.slug || (data.name as Record<string, string>).fr));
      if (await db.category.findUnique({ where: { slug } })) throw new AppError(m('Ce slug existe déjà.'), 'conflict');
      await db.category.create({ data: { ...data, slug } });
    }
    await audit({ actorId: actor.id, action: 'category.save', entity: 'Category', entityId: String(f.id ?? '') });
    refresh();
  });
}

export async function deleteCategoryAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('catalog.manage');
    const id = String(fd.get('id'));
    if (await db.product.count({ where: { categoryId: id, deletedAt: null } })) throw new AppError(m('Cette catégorie contient encore des produits.'));
    await db.category.update({ where: { id }, data: { deletedAt: new Date(), published: false } });
    await audit({ actorId: actor.id, action: 'category.delete', entity: 'Category', entityId: id });
    refresh();
  });
}

export async function saveAddonAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('catalog.manage');
    const f = formObject(fd);
    const data = { name: i18n(f, 'name', true), description: i18n(f, 'description'), prices: prices(f, 'prices'), active: f.active === 'on', global: f.global === 'on', sortOrder: int(f.sortOrder || 0) };
    if (f.id) await db.addon.update({ where: { id: String(f.id) }, data });
    else {
      const slug = slugify(String(f.slug || (data.name as Record<string, string>).fr));
      if (await db.addon.findUnique({ where: { slug } })) throw new AppError(m('Ce slug existe déjà.'), 'conflict');
      await db.addon.create({ data: { ...data, slug } });
    }
    await audit({ actorId: actor.id, action: 'addon.save', entity: 'Addon', entityId: String(f.id ?? '') });
    refresh();
  });
}

export async function saveProductAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const f = formObject(fd, ['related', 'addons']);
  const locale = loc(f.locale);
  return run(async () => {
    const actor = await assertPermission('catalog.manage');
    const name = String(f.name ?? '').trim();
    if (name.length < 2) throw new AppError(m('Nom requis.'), 'invalid', { name: m('Nom requis.') });
    const category = await db.category.findFirst({ where: { id: String(f.categoryId), deletedAt: null } });
    if (!category) throw new AppError(m('Catégorie invalide.'));
    const demoUrl = String(f.demoUrl ?? '').trim();
    if (demoUrl && !/^https:\/\//.test(demoUrl)) throw new AppError(m('L’URL de démonstration doit commencer par https://'));
    const imgs = (v: unknown) => lines(v).filter((x) => /^(\/images\/|https:\/\/)/.test(x));
    const data = {
      name, categoryId: category.id, tagline: i18n(f, 'tagline', true), description: i18n(f, 'description', true), features: i18nLines(f, 'features'),
      technologies: String(f.technologies ?? '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 15),
      languages: String(f.languages ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean).slice(0, 10),
      demoSlug: String(f.demoSlug ?? '').trim() || null, demoUrl: demoUrl || null, coverImage: imgs(f.coverImage)[0] ?? null, gallery: imgs(f.gallery).slice(0, 12),
      startingPrices: prices(f, 'startingPrices'), deliveryDays: int(f.deliveryDays || 10, 1, 365), featured: f.featured === 'on', sortOrder: int(f.sortOrder || 0),
      seoTitle: i18n(f, 'seoTitle'), seoDescription: i18n(f, 'seoDescription'),
    };
    const relatedIds = (f.related as string[]).filter((x) => x !== f.id);
    const addonIds = f.addons as string[];
    let id = String(f.id ?? '');
    if (id) {
      await db.product.update({ where: { id }, data: { ...data, related: { set: relatedIds.map((x) => ({ id: x })) }, addons: { set: addonIds.map((x) => ({ id: x })) } } });
    } else {
      const slug = slugify(String(f.slug || name));
      if (await db.product.findUnique({ where: { slug } })) throw new AppError(m('Ce slug existe déjà.'), 'conflict', { slug: m('Ce slug existe déjà.') });
      const created = await db.product.create({
        data: {
          ...data, slug, status: 'DRAFT', related: { connect: relatedIds.map((x) => ({ id: x })) }, addons: { connect: addonIds.map((x) => ({ id: x })) },
          // Three empty packages: the product cannot be sold until their prices are filled in.
          packages: { create: (['BASIC', 'BUSINESS', 'PREMIUM'] as const).map((tier) => ({ tier, name: { fr: tier[0] + tier.slice(1).toLowerCase() }, description: {}, prices: {}, deliveryDays: 10 })) },
        },
      });
      id = created.id;
    }
    await audit({ actorId: actor.id, action: 'product.save', entity: 'Product', entityId: id });
    refresh();
    if (!f.id) redirect(localePath(locale, `/admin/products/${id}`));
  }, locale);
}

export async function savePackageAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('catalog.manage');
    const f = formObject(fd);
    await db.package.update({
      where: { id: String(f.id) },
      data: { name: i18n(f, 'name', true), description: i18n(f, 'description'), features: i18nLines(f, 'features'), prices: prices(f, 'prices'), deliveryDays: int(f.deliveryDays, 1, 365), pagesIncluded: int(f.pagesIncluded, 1, 500), revisions: int(f.revisions, 0, 50), active: f.active === 'on' },
    });
    await audit({ actorId: actor.id, action: 'package.save', entity: 'Package', entityId: String(f.id) });
    refresh();
  });
}

export async function setProductStatusAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('catalog.manage');
    const id = String(fd.get('id'));
    const op = String(fd.get('op'));
    if (op === 'publish') {
      const product = await db.product.findUniqueOrThrow({ where: { id }, include: { packages: { where: { active: true } } } });
      if (!product.packages.some((p) => Object.keys(p.prices as object).length > 0)) throw new AppError(m('Ajoutez au moins un pack actif avec un prix avant de publier.'));
      if (!product.demoSlug && !product.demoUrl) throw new AppError(m('Une démonstration est requise avant de publier un modèle.'));
      await db.product.update({ where: { id }, data: { status: 'PUBLISHED' } });
    } else if (op === 'unpublish') await db.product.update({ where: { id }, data: { status: 'DRAFT' } });
    else if (op === 'delete') await db.product.update({ where: { id }, data: { status: 'ARCHIVED', deletedAt: new Date() } }); // logical deletion: order history keeps its references
    else if (op === 'restore') await db.product.update({ where: { id }, data: { status: 'DRAFT', deletedAt: null } });
    else throw new AppError(m('Opération inconnue.'));
    await audit({ actorId: actor.id, action: `product.${op}`, entity: 'Product', entityId: id });
    refresh();
  });
}

// ── Orders, projects, finance ───────────────────────────────────────────────

export async function orderNoteAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    await assertPermission('orders.manage');
    await db.order.update({ where: { id: String(fd.get('orderId')) }, data: { internalNotes: String(fd.get('internalNotes') ?? '').slice(0, 5000) } });
    refresh();
  });
}

export async function adminCancelOrderAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('orders.manage');
    await cancelOrder(String(fd.get('orderId')), { id: actor.id, staff: true }, String(fd.get('reason') ?? ''));
    await audit({ actorId: actor.id, action: 'order.cancel', entity: 'Order', entityId: String(fd.get('orderId')) });
    refresh();
  });
}

export async function refundAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('finance.manage');
    await refundPayment(String(fd.get('paymentId')), parseAmount(String(fd.get('amount'))), actor.id, String(fd.get('reason') ?? '').slice(0, 300));
    refresh();
  });
}

export async function projectStatusAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('projects.work');
    await setProjectStatus(actor, String(fd.get('projectId')), String(fd.get('status')) as ProjectStatus, String(fd.get('note') ?? '').slice(0, 1000) || undefined);
    refresh();
  });
}

export async function projectAssignAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('projects.manage');
    const f = formObject(fd);
    await assignProject(actor, String(f.projectId), String(f.assigneeId || '') || null, optDate(f.dueAt));
    const url = (v: unknown) => { const s = String(v ?? '').trim(); if (s && !/^https:\/\//.test(s)) throw new AppError(m('Les URL doivent commencer par https://')); return s || null; };
    await db.project.update({ where: { id: String(f.projectId) }, data: { previewUrl: url(f.previewUrl), liveUrl: url(f.liveUrl) } });
    refresh();
  });
}

export async function staffMessageAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('projects.work');
    await postMessage(actor, String(fd.get('projectId')), String(fd.get('body') ?? ''), fd.get('internal') === 'on');
    refresh();
  });
}

export async function revisionAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('projects.work');
    const status = z.enum(['OPEN', 'IN_PROGRESS', 'DONE', 'REJECTED']).parse(fd.get('status'));
    await db.revision.update({ where: { id: String(fd.get('revisionId')) }, data: { status, response: String(fd.get('response') ?? '').slice(0, 2000) || null, resolvedAt: status === 'DONE' || status === 'REJECTED' ? new Date() : null } });
    await audit({ actorId: actor.id, action: 'revision.update', entity: 'Revision', entityId: String(fd.get('revisionId')), meta: { status } });
    refresh();
  });
}

export async function taskDoneAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    await assertPermission('dashboard.view');
    await db.task.update({ where: { id: String(fd.get('taskId')) }, data: { status: 'DONE', doneAt: new Date() } });
    refresh();
  });
}

export async function saveCouponAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('marketing.manage');
    const f = formObject(fd);
    const type = f.type === 'FIXED' ? 'FIXED' : 'PERCENT';
    const code = String(f.code ?? '').trim().toUpperCase();
    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) throw new AppError(m('Code invalide (3 à 30 lettres, chiffres, tirets).'), 'invalid', { code: m('Code invalide (3 à 30 lettres, chiffres, tirets).') });
    const value = type === 'PERCENT' ? int(f.value, 1, 100) : parseAmount(String(f.value));
    const currency = type === 'FIXED' ? String(f.currency ?? '').toUpperCase() : null;
    if (type === 'FIXED' && !/^[A-Z]{3}$/.test(currency ?? '')) throw new AppError(m('Devise requise pour une remise fixe.'));
    const data = { type, value, currency, campaign: String(f.campaign ?? '').trim() || null, maxRedemptions: f.maxRedemptions ? int(f.maxRedemptions, 1) : null, minSubtotal: f.minSubtotal ? parseAmount(String(f.minSubtotal)) : null, startsAt: optDate(f.startsAt), endsAt: optDate(f.endsAt), active: f.active === 'on' } as const;
    if (f.id) await db.coupon.update({ where: { id: String(f.id) }, data });
    else {
      if (await db.coupon.findUnique({ where: { code } })) throw new AppError(m('Ce code existe déjà.'), 'conflict', { code: m('Ce code existe déjà.') });
      await db.coupon.create({ data: { ...data, code } });
    }
    await audit({ actorId: actor.id, action: 'coupon.save', entity: 'Coupon', entityId: code });
    refresh();
  });
}

export async function savePlanAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('saas.manage');
    const f = formObject(fd);
    let limits: Prisma.InputJsonValue;
    try {
      const parsed = JSON.parse(String(f.limits || '{}'));
      limits = z.record(z.string().regex(/^[a-zA-Z]+$/), z.number().int().min(0)).parse(parsed);
    } catch { throw new AppError(m('Limites invalides : objet JSON de nombres entiers attendu.'), 'invalid', { limits: m('Limites invalides : objet JSON de nombres entiers attendu.') }); }
    await db.plan.update({
      where: { id: String(f.id) },
      data: { name: String(f.name).trim().slice(0, 60), prices: prices(f, 'prices'), seatPrices: prices(f, 'seatPrices'), includedSeats: int(f.includedSeats, 0), trialDays: int(f.trialDays, 0, 90), limits, features: String(f.features ?? '').split(',').map((s) => s.trim()).filter(Boolean), active: f.active === 'on' },
    });
    await audit({ actorId: actor.id, action: 'plan.save', entity: 'Plan', entityId: String(f.id) });
    refresh();
  });
}

// ── Leads, support, data requests ───────────────────────────────────────────

export async function leadStatusAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    await assertPermission('leads.view');
    await db.lead.update({ where: { id: String(fd.get('leadId')) }, data: { status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSED']).parse(fd.get('status')) } });
    refresh();
  });
}

export async function ticketReplyAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('support.manage');
    const ticket = await db.ticket.findUnique({ where: { id: String(fd.get('ticketId')) } });
    if (!ticket) throw new AppError(m('Ticket introuvable.'), 'not_found');
    const body = String(fd.get('body') ?? '').trim();
    const close = fd.get('close') === 'on';
    const internal = fd.get('internal') === 'on';
    if (!body && !close) throw new AppError(m('Message vide ou trop long.'));
    if (body) await db.message.create({ data: { ticketId: ticket.id, senderId: actor.id, body: body.slice(0, 5000), fromStaff: true, internal } });
    await db.ticket.update({ where: { id: ticket.id }, data: { status: close ? 'CLOSED' : internal ? ticket.status : 'ANSWERED' } });
    if (body && !internal) await db.notification.create({ data: { userId: ticket.userId, type: 'support', title: `Support : ${ticket.subject}`, link: `/account/support/${ticket.id}` } });
    refresh();
  });
}

/**
 * Data-subject requests. Deletion anonymises the account and removes briefing content and files,
 * while orders, payments and invoices are kept for the legal accounting retention period.
 */
export async function processDataRequestAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('customers.manage');
    const req = await db.dataRequest.findUnique({ where: { id: String(fd.get('requestId')) }, include: { user: true } });
    if (!req || req.status !== 'PENDING') throw new AppError(m('Demande introuvable ou déjà traitée.'));
    const decision = String(fd.get('decision'));
    if (decision === 'reject') {
      await db.dataRequest.update({ where: { id: req.id }, data: { status: 'REJECTED', processedAt: new Date(), processedBy: actor.id, note: String(fd.get('note') ?? '').slice(0, 1000) || req.note } });
    } else if (req.type === 'DELETE') {
      if (req.user.platformRole) throw new AppError(m('Un compte interne ne peut pas être supprimé par cette procédure.'));
      const files = await db.fileAsset.findMany({ where: { ownerId: req.userId } });
      await db.$transaction([
        db.session.deleteMany({ where: { userId: req.userId } }),
        db.fileAsset.deleteMany({ where: { ownerId: req.userId } }),
        db.briefing.updateMany({ where: { project: { userId: req.userId } }, data: { data: {}, aiConsent: false } }),
        db.message.updateMany({ where: { senderId: req.userId }, data: { body: '[supprimé]' } }),
        db.notification.deleteMany({ where: { userId: req.userId } }),
        db.consent.deleteMany({ where: { userId: req.userId } }),
        db.lead.deleteMany({ where: { email: req.user.email } }),
        db.user.update({ where: { id: req.userId }, data: { email: `deleted-${req.userId}@deleted.invalid`, name: 'Compte supprimé', phone: null, country: null, passwordHash: await hashPassword(randomToken()), deletedAt: new Date(), disabledAt: new Date() } }),
        db.dataRequest.update({ where: { id: req.id }, data: { status: 'COMPLETED', processedAt: new Date(), processedBy: actor.id } }),
      ]);
      for (const file of files) await storage.remove(file.storageKey);
    } else {
      await db.dataRequest.update({ where: { id: req.id }, data: { status: 'COMPLETED', processedAt: new Date(), processedBy: actor.id } });
    }
    await audit({ actorId: actor.id, action: `data_request.${decision === 'reject' ? 'rejected' : 'completed'}`, entity: 'DataRequest', entityId: req.id, meta: { type: req.type } });
    refresh();
  });
}

// ── Content ─────────────────────────────────────────────────────────────────

export async function saveContentPageAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('content.manage');
    const f = formObject(fd);
    await db.contentPage.update({ where: { id: String(f.id) }, data: { title: String(f.title).trim().slice(0, 200), body: String(f.body).slice(0, 60000) } });
    await audit({ actorId: actor.id, action: 'content_page.save', entity: 'ContentPage', entityId: String(f.id) });
    refresh();
  });
}

export async function saveBlogPostAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const f = formObject(fd);
  const locale = loc(f.locale);
  return run(async () => {
    const actor = await assertPermission('content.manage');
    const data = z.object({
      title: z.string().trim().min(3, m('Titre requis.')).max(200), excerpt: z.string().trim().min(10, m('Résumé requis.')).max(400), body: z.string().min(50, m('Contenu trop court.')).max(60000),
      language: z.enum(['fr', 'pt-PT', 'pt-BR', 'en']), seoTitle: z.string().trim().max(200).optional(), seoDescription: z.string().trim().max(300).optional(), translationKey: z.string().trim().max(80).optional(),
    }).parse(f);
    const status = f.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
    const slug = slugify(String(f.slug || data.title));
    const clash = await db.blogPost.findUnique({ where: { language_slug: { language: data.language, slug } } });
    if (clash && clash.id !== f.id) throw new AppError(m('Ce slug existe déjà.'), 'conflict', { slug: m('Ce slug existe déjà.') });
    const payload = { ...data, seoTitle: data.seoTitle || null, seoDescription: data.seoDescription || null, translationKey: data.translationKey || null, slug, status } as const;
    let id = String(f.id ?? '');
    if (id) {
      const prev = await db.blogPost.findUniqueOrThrow({ where: { id } });
      await db.blogPost.update({ where: { id }, data: { ...payload, publishedAt: status === 'PUBLISHED' ? prev.publishedAt ?? new Date() : prev.publishedAt } });
    } else id = (await db.blogPost.create({ data: { ...payload, publishedAt: status === 'PUBLISHED' ? new Date() : null } })).id;
    await audit({ actorId: actor.id, action: 'blog.save', entity: 'BlogPost', entityId: id });
    refresh();
    if (!f.id) redirect(localePath(locale, `/admin/content/blog/${id}`));
  }, locale);
}

export async function saveFaqAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    await assertPermission('content.manage');
    const f = formObject(fd);
    if (f.delete === '1') { await db.faq.delete({ where: { id: String(f.id) } }); refresh(); return; }
    const data = { question: i18n(f, 'question', true), answer: i18n(f, 'answer', true), scope: String(f.scope || 'home').slice(0, 30), sortOrder: int(f.sortOrder || 0), published: f.published === 'on' };
    if (f.id) await db.faq.update({ where: { id: String(f.id) }, data }); else await db.faq.create({ data });
    refresh();
  });
}

export async function saveBannerAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    await assertPermission('content.manage');
    const f = formObject(fd);
    if (f.delete === '1') { await db.banner.delete({ where: { id: String(f.id) } }); refresh(); return; }
    const link = String(f.linkPath ?? '').trim();
    if (link && !/^\/[a-z0-9\-/]*$/i.test(link)) throw new AppError(m('Le lien doit être un chemin interne, par exemple /templates.'));
    const data = { message: i18n(f, 'message', true), linkPath: link || null, active: f.active === 'on', startsAt: optDate(f.startsAt), endsAt: optDate(f.endsAt) };
    if (f.id) await db.banner.update({ where: { id: String(f.id) }, data }); else await db.banner.create({ data });
    refresh();
  });
}

/** Testimonials are entered by staff from real, attributable customer feedback only. */
export async function saveTestimonialAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('content.manage');
    const f = formObject(fd);
    if (f.delete === '1') { await db.testimonial.delete({ where: { id: String(f.id) } }); refresh(); return; }
    if (f.published === 'on' && f.authentic !== 'on') throw new AppError(m('Confirmez que ce témoignage provient d’un client réel et qu’il a donné son accord.'));
    const data = z.object({ author: z.string().trim().min(2).max(120), role: z.string().trim().max(120).optional(), company: z.string().trim().max(160).optional(), content: z.string().trim().min(10).max(1500), language: z.enum(['fr', 'pt-PT', 'pt-BR', 'en']) }).parse(f);
    const payload = { ...data, role: data.role || null, company: data.company || null, published: f.published === 'on' };
    if (f.id) await db.testimonial.update({ where: { id: String(f.id) }, data: payload }); else await db.testimonial.create({ data: payload });
    await audit({ actorId: actor.id, action: 'testimonial.save', entity: 'Testimonial', entityId: String(f.id ?? '') });
    refresh();
  });
}

export async function saveTranslationAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    await assertPermission('content.manage');
    const f = formObject(fd);
    const language = z.enum(['fr', 'fr-FR', 'pt-PT', 'pt-BR', 'en']).parse(f.language);
    const source = String(f.source ?? '');
    const value = String(f.value ?? '').trim();
    if (!source) throw new AppError(m('Texte source requis.'));
    if (!value) await db.translationOverride.deleteMany({ where: { language, source } });
    else await db.translationOverride.upsert({ where: { language_source: { language, source } }, create: { language, source, value: value.slice(0, 5000) }, update: { value: value.slice(0, 5000) } });
    refresh();
  });
}

// ── Settings & staff ────────────────────────────────────────────────────────

export async function saveSettingAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('settings.manage');
    const f = formObject(fd);
    const key = String(f.key) as SettingKey;
    if (!(key in SETTING_DEFAULTS)) throw new AppError(m('Paramètre inconnu.'));
    const defaults = SETTING_DEFAULTS[key] as Record<string, unknown>;
    const value: Record<string, unknown> = {};
    for (const [k, def] of Object.entries(defaults)) {
      if (typeof def === 'boolean') value[k] = f[k] === 'on';
      else if (!(k in f)) continue;
      else if (typeof def === 'number') value[k] = int(f[k], 0, 100000);
      else if (Array.isArray(def)) value[k] = lines(f[k]);
      else value[k] = String(f[k]).trim().slice(0, 500);
    }
    if (key === 'security' && ((value.passwordMinLength as number) < 10 || (value.sessionDays as number) < 1)) throw new AppError(m('Valeurs de sécurité trop faibles.'));
    await setSetting(key, value as never);
    await audit({ actorId: actor.id, action: 'setting.save', entity: 'Setting', entityId: key });
    refresh();
  });
}

export async function saveMarketAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('settings.manage');
    const f = formObject(fd);
    const rate = Number(String(f.taxRate ?? '0').replace(',', '.'));
    if (!Number.isFinite(rate) || rate < 0 || rate > 40) throw new AppError(m('Taux de taxe invalide.'));
    const currency = String(f.currency ?? '').toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) throw new AppError(m('Devise invalide.'));
    await db.market.update({
      where: { code: String(f.code) },
      data: { currency, taxRateBps: Math.round(rate * 100), taxLabel: String(f.taxLabel || 'TVA').slice(0, 20), pricesIncludeTax: f.pricesIncludeTax === 'on', enabled: f.enabled === 'on', paymentMethods: String(f.paymentMethods ?? '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 12) },
    });
    await audit({ actorId: actor.id, action: 'market.save', entity: 'Market', entityId: String(f.code), meta: { currency, rate } });
    refresh();
  });
}

export async function saveEmailTemplateAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('settings.manage');
    const f = formObject(fd);
    await db.emailTemplate.update({ where: { id: String(f.id) }, data: { subject: String(f.subject).trim().slice(0, 300), body: String(f.body).slice(0, 10000) } });
    await audit({ actorId: actor.id, action: 'email_template.save', entity: 'EmailTemplate', entityId: String(f.id) });
    refresh();
  });
}

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'SUPPORT', 'FINANCE', 'MARKETING'] as const;

/** Creates (or promotes) a staff account. New accounts receive a link to set their own password. */
export async function saveStaffAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('users.manage');
    const f = formObject(fd);
    const role = f.role === 'NONE' ? null : (z.enum(ROLES).parse(f.role) as PlatformRole);
    if (f.id) {
      const target = await db.user.findUniqueOrThrow({ where: { id: String(f.id) } });
      if (target.id === actor.id && role !== 'SUPER_ADMIN') throw new AppError(m('Vous ne pouvez pas retirer votre propre rôle de super administrateur.'));
      if (target.platformRole === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN' && (await db.user.count({ where: { platformRole: 'SUPER_ADMIN', disabledAt: null } })) <= 1) throw new AppError(m('Il doit rester au moins un super administrateur.'));
      await db.user.update({ where: { id: target.id }, data: { platformRole: role, disabledAt: f.disabled === 'on' && target.id !== actor.id ? target.disabledAt ?? new Date() : null } });
      if (f.disabled === 'on' || !role) await db.session.deleteMany({ where: { userId: target.id, NOT: { userId: actor.id } } });
      await audit({ actorId: actor.id, action: 'staff.update', entity: 'User', entityId: target.id, meta: { role } });
    } else {
      const email = z.string().trim().toLowerCase().email(m('Adresse e-mail invalide.')).parse(f.email);
      const existing = await db.user.findUnique({ where: { email } });
      const user = existing
        ? await db.user.update({ where: { id: existing.id }, data: { platformRole: role } })
        : await db.user.create({ data: { email, name: String(f.name || email).trim().slice(0, 120), passwordHash: await hashPassword(randomToken(24)), platformRole: role } });
      if (!existing) {
        const reset = await createPasswordReset(email, 7 * 86400_000);
        await sendEmail({ to: email, templateKey: 'invitation', language: 'fr', vars: { name: user.name, organization: 'ATHANA (administration)', inviteUrl: env.appUrl + localePath(DEFAULT_LOCALE, `/reset-password?token=${reset!.token}`) } });
      }
      await audit({ actorId: actor.id, action: 'staff.create', entity: 'User', entityId: user.id, meta: { role } });
    }
    refresh();
  });
}

export async function customerStateAction(_: ActionState, fd: FormData): Promise<ActionState> {
  return run(async () => {
    const actor = await assertPermission('customers.manage');
    const target = await db.user.findUniqueOrThrow({ where: { id: String(fd.get('userId')) } });
    if (target.platformRole) throw new AppError(m('Les comptes internes se gèrent dans Paramètres → Équipe.'));
    const disable = fd.get('op') === 'disable';
    await db.user.update({ where: { id: target.id }, data: { disabledAt: disable ? new Date() : null } });
    if (disable) await db.session.deleteMany({ where: { userId: target.id } });
    await audit({ actorId: actor.id, action: disable ? 'customer.disable' : 'customer.enable', entity: 'User', entityId: target.id });
    refresh();
  });
}
