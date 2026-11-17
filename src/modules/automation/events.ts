import type { ProjectStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { adminBaseUrl } from '@/lib/admin-host';
import { getSetting } from '@/lib/settings';
import { sendEmail, languageOf } from '@/modules/email/service';
import { localePath, isLocale, DEFAULT_LOCALE, LOCALE_META, type Locale } from '@/i18n/config';
import { DICTIONARIES } from '@/i18n/dictionaries';
import { makeT, m, formatMoney } from '@/i18n/translate';

/**
 * Business automations. Services call emit() after their transaction commits;
 * handlers create tasks, notifications and e-mails. Handlers never throw to the caller.
 */
export type DomainEvent =
  | { type: 'order.paid'; orderId: string }
  | { type: 'order.payment_failed'; orderId: string }
  | { type: 'order.refunded'; orderId: string; amount: number }
  | { type: 'briefing.submitted'; projectId: string }
  | { type: 'project.status_changed'; projectId: string; from: ProjectStatus; to: ProjectStatus }
  | { type: 'project.message'; projectId: string; fromStaff: boolean }
  | { type: 'subscription.activated' | 'subscription.payment_failed' | 'subscription.canceled' | 'subscription.renewal_notice' | 'subscription.cancel_scheduled'; subscriptionId: string }
  | { type: 'user.registered'; userId: string }
  | { type: 'lead.created'; leadId: string };

const url = (locale: string, path: string) => env.appUrl + localePath(isLocale(locale) ? locale : DEFAULT_LOCALE, path);
const adminUrl = (path: string) => adminBaseUrl(env.appUrl) + localePath(DEFAULT_LOCALE, path);
const loc = (l: string): Locale => (isLocale(l) ? l : DEFAULT_LOCALE);

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  PAYMENT_PENDING: m('Paiement en attente'), PAID: m('Payé'), BRIEFING_PENDING: m('Briefing à remplir'),
  BRIEFING_SUBMITTED: m('Briefing envoyé'), PROJECT_QUEUED: m('En file d’attente'), IN_DEVELOPMENT: m('En développement'),
  INTERNAL_REVIEW: m('Revue interne'), CLIENT_REVIEW: m('À valider par vous'), REVISION_REQUESTED: m('Révision demandée'),
  APPROVED: m('Approuvé'), DEPLOYMENT_PENDING: m('Mise en ligne en préparation'), COMPLETED: m('Terminé'), MAINTENANCE: m('Maintenance'),
};

async function notify(userId: string, type: string, title: string, body?: string, link?: string) {
  await db.notification.create({ data: { userId, type, title, body, link } });
}

async function notifyStaff(permissionRoles: string[], type: string, title: string, link: string) {
  const staff = await db.user.findMany({ where: { platformRole: { in: permissionRoles as never[] }, disabledAt: null, deletedAt: null }, select: { id: true } });
  if (staff.length) await db.notification.createMany({ data: staff.map((s) => ({ userId: s.id, type, title, link })) });
}

async function handle(e: DomainEvent) {
  switch (e.type) {
    case 'user.registered': {
      const user = await db.user.findUniqueOrThrow({ where: { id: e.userId } });
      await sendEmail({ to: user.email, templateKey: 'welcome', language: languageOf(user.locale), vars: { name: user.name, accountUrl: url(user.locale, '/account') } });
      break;
    }
    case 'order.paid': {
      const order = await db.order.findUniqueOrThrow({ where: { id: e.orderId }, include: { user: true, items: { include: { project: true } } } });
      const t = makeT(DICTIONARIES[languageOf(order.market)]);
      const first = order.items[0]?.project;
      await sendEmail({
        to: order.user.email, templateKey: 'order_confirmation', language: languageOf(order.market),
        vars: {
          name: order.user.name, orderNumber: order.number, total: formatMoney(order.total, order.currency, loc(order.market)),
          items: order.items.map((i) => `• ${i.name} (${i.tier})`).join('\n'),
          briefingUrl: first ? url(order.market, `/account/projects/${first.id}/briefing`) : url(order.market, '/account'),
          orderUrl: url(order.market, `/account/orders/${order.id}`),
        },
      });
      await notify(order.userId, 'order', t('Paiement reçu — commande {n}', { n: order.number }), t('Remplissez le briefing pour lancer votre projet.'), first ? `/account/projects/${first.id}/briefing` : '/account/orders');
      await db.task.create({ data: { type: 'order_review', title: `Nouvelle commande ${order.number} — vérifier et planifier`, orderId: order.id, dueAt: new Date(Date.now() + 86400_000) } });
      await notifyStaff(['SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER', 'FINANCE'], 'order', `Nouvelle commande payée ${order.number}`, `/admin/orders/${order.id}`);
      await sendEmail({ to: env.adminEmail, templateKey: 'admin_new_order', language: 'fr', vars: { orderNumber: order.number, customer: order.user.name, total: formatMoney(order.total, order.currency, 'fr-ch'), adminUrl: adminUrl(`/admin/orders/${order.id}`) } });
      break;
    }
    case 'order.payment_failed': {
      const order = await db.order.findUniqueOrThrow({ where: { id: e.orderId }, include: { user: true } });
      const t = makeT(DICTIONARIES[languageOf(order.market)]);
      await sendEmail({ to: order.user.email, templateKey: 'payment_failed', language: languageOf(order.market), vars: { name: order.user.name, orderNumber: order.number, orderUrl: url(order.market, `/account/orders/${order.id}`) } });
      await notify(order.userId, 'order', t('Le paiement de la commande {n} a échoué', { n: order.number }), undefined, `/account/orders/${order.id}`);
      break;
    }
    case 'order.refunded': {
      const order = await db.order.findUniqueOrThrow({ where: { id: e.orderId }, include: { user: true } });
      await sendEmail({ to: order.user.email, templateKey: 'refund', language: languageOf(order.market), vars: { name: order.user.name, orderNumber: order.number, amount: formatMoney(e.amount, order.currency, loc(order.market)) } });
      break;
    }
    case 'briefing.submitted': {
      const project = await db.project.findUniqueOrThrow({ where: { id: e.projectId }, include: { user: true } });
      await db.task.create({ data: { type: 'production', title: `Briefing reçu — planifier la production de ${project.reference}`, projectId: project.id, dueAt: new Date(Date.now() + 2 * 86400_000) } });
      await notifyStaff(['SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER'], 'briefing', `Briefing envoyé pour ${project.reference}`, `/admin/projects/${project.id}`);
      await sendEmail({ to: env.adminEmail, templateKey: 'admin_briefing_submitted', language: 'fr', vars: { reference: project.reference, customer: project.user.name, adminUrl: adminUrl(`/admin/projects/${project.id}`) } });
      await sendEmail({ to: project.user.email, templateKey: 'briefing_received', language: languageOf(project.user.locale), vars: { name: project.user.name, reference: project.reference, projectUrl: url(project.user.locale, `/account/projects/${project.id}`) } });
      break;
    }
    case 'project.status_changed': {
      if (e.to === 'INTERNAL_REVIEW' || e.to === 'PAID' || e.to === 'BRIEFING_SUBMITTED') break; // internal or covered elsewhere
      const project = await db.project.findUniqueOrThrow({ where: { id: e.projectId }, include: { user: true } });
      const t = makeT(DICTIONARIES[languageOf(project.user.locale)]);
      const status = t(PROJECT_STATUS_LABEL[e.to]);
      await notify(project.userId, 'project', t('Projet {ref} : {status}', { ref: project.reference, status }), undefined, `/account/projects/${project.id}`);
      await sendEmail({ to: project.user.email, templateKey: 'project_status', language: languageOf(project.user.locale), vars: { name: project.user.name, reference: project.reference, status, projectUrl: url(project.user.locale, `/account/projects/${project.id}`) } });
      if (e.to === 'APPROVED') {
        await db.task.create({ data: { type: 'delivery', title: `Projet ${project.reference} approuvé — préparer la mise en ligne`, projectId: project.id, dueAt: new Date(Date.now() + 2 * 86400_000) } });
        if ((await getSetting('maintenance')).offerEnabled) {
          await db.task.create({ data: { type: 'maintenance_offer', title: `Proposer un contrat de maintenance pour ${project.reference}`, projectId: project.id, dueAt: new Date(Date.now() + 7 * 86400_000) } });
        }
      }
      break;
    }
    case 'project.message': {
      const project = await db.project.findUniqueOrThrow({ where: { id: e.projectId }, include: { user: true } });
      if (e.fromStaff) {
        const t = makeT(DICTIONARIES[languageOf(project.user.locale)]);
        await notify(project.userId, 'message', t('Nouveau message sur le projet {ref}', { ref: project.reference }), undefined, `/account/projects/${project.id}`);
        await sendEmail({ to: project.user.email, templateKey: 'new_message', language: languageOf(project.user.locale), vars: { name: project.user.name, reference: project.reference, projectUrl: url(project.user.locale, `/account/projects/${project.id}`) } });
      } else if (project.assigneeId) {
        await notify(project.assigneeId, 'message', `Message client sur ${project.reference}`, undefined, `/admin/projects/${project.id}`);
      } else {
        await notifyStaff(['SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER', 'SUPPORT'], 'message', `Message client sur ${project.reference}`, `/admin/projects/${project.id}`);
      }
      break;
    }
    case 'subscription.activated':
    case 'subscription.payment_failed':
    case 'subscription.canceled':
    case 'subscription.cancel_scheduled':
    case 'subscription.renewal_notice': {
      const sub = await db.subscription.findUniqueOrThrow({
        where: { id: e.subscriptionId },
        include: { plan: true, saasProduct: true, organization: { include: { memberships: { where: { role: 'OWNER' }, include: { user: true } } } } },
      });
      const key = e.type.replace('subscription.', 'subscription_');
      for (const mb of sub.organization.memberships) {
        const locale = loc(mb.user.locale);
        await sendEmail({
          to: mb.user.email, templateKey: key, language: languageOf(mb.user.locale),
          vars: {
            name: mb.user.name, product: sub.saasProduct.name, plan: sub.plan.name, organization: sub.organization.name,
            periodEnd: new Intl.DateTimeFormat(LOCALE_META[locale].intl, { dateStyle: 'long' }).format(sub.currentPeriodEnd),
            billingUrl: url(locale, '/account/subscriptions'),
          },
        });
        const t = makeT(DICTIONARIES[languageOf(mb.user.locale)]);
        const titles: Record<string, string> = {
          'subscription.activated': t('Abonnement {p} activé', { p: sub.saasProduct.name }),
          'subscription.payment_failed': t('Échec du paiement de votre abonnement {p}', { p: sub.saasProduct.name }),
          'subscription.canceled': t('Abonnement {p} résilié', { p: sub.saasProduct.name }),
          'subscription.cancel_scheduled': t('Résiliation programmée pour {p}', { p: sub.saasProduct.name }),
          'subscription.renewal_notice': t('Votre abonnement {p} sera bientôt renouvelé', { p: sub.saasProduct.name }),
        };
        await notify(mb.userId, 'subscription', titles[e.type], undefined, '/account/subscriptions');
      }
      break;
    }
    case 'lead.created': {
      const lead = await db.lead.findUniqueOrThrow({ where: { id: e.leadId } });
      await notifyStaff(['SUPER_ADMIN', 'ADMIN', 'MARKETING', 'SUPPORT', 'PROJECT_MANAGER'], 'lead', `Nouveau lead : ${lead.name}`, '/admin/leads');
      await sendEmail({ to: env.adminEmail, templateKey: 'admin_new_lead', language: 'fr', vars: { name: lead.name, email: lead.email, company: lead.company ?? '-', phone: lead.phone ?? '-', kind: lead.kind, message: lead.message, adminUrl: adminUrl('/admin/leads') } });
      await sendEmail({ to: lead.email, templateKey: 'lead_ack', language: languageOf(lead.market), vars: { name: lead.name } });
      break;
    }
  }
}

export async function emit(event: DomainEvent) {
  try {
    await handle(event);
  } catch (err) {
    console.error('[automation]', event.type, err);
  }
}
