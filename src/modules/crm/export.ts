import { db } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { audit } from '@/lib/audit';
import { m } from '@/i18n/translate';
import { assertFeature } from '@/modules/tenancy/context';
import { DEAL_STATUS_LABELS, EXPORT_TYPES, LIFECYCLE_LABELS, type ExportType } from './labels';
import { assertCanExport, type TenantCtx } from './shared';

const SEP = ';'; // what spreadsheet software expects in fr-CH / fr-FR / pt-PT / pt-BR

/**
 * One CSV cell: values starting with = + - @ (or tab / CR) get a leading single quote so a spreadsheet never
 * evaluates them as a formula; cells containing the separator, a comma, quotes or line breaks are quoted.
 */
export function csvCell(value: unknown): string {
  let s = value == null ? '' : value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[";,\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** UTF-8 BOM + CRLF rows. */
export function toCsv(header: string[], rows: unknown[][]): string {
  return '﻿' + [header, ...rows].map((r) => r.map(csvCell).join(SEP)).join('\r\n') + '\r\n';
}

const major = (minor: number) => (minor / 100).toFixed(2);

/** CSV export of contacts, companies or deals: feature `export`, MANAGER+ only, audited. `t` translates the headers and labels. */
export async function exportCsv(ctx: TenantCtx, type: string, t: (s: string) => string = (s) => s): Promise<{ filename: string; csv: string; rows: number }> {
  assertFeature(ctx, 'export');
  assertCanExport(ctx);
  if (!(EXPORT_TYPES as readonly string[]).includes(type)) throw new AppError(m('Type d’export inconnu.'), 'not_found');
  const kind = type as ExportType;
  const organizationId = ctx.organizationId;
  let header: string[];
  let rows: unknown[][];
  if (kind === 'contacts') {
    const data = await db.crmContact.findMany({ where: { organizationId }, orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }], include: { company: { select: { name: true } } } });
    header = [m('Prénom'), m('Nom'), m('E-mail'), m('Téléphone'), m('Fonction'), m('Statut'), m('Source'), m('Entreprise'), m('Notes'), m('Créé le')];
    rows = data.map((c) => [c.firstName, c.lastName, c.email, c.phone, c.jobTitle, t(LIFECYCLE_LABELS[c.lifecycle]), c.source, c.company?.name, c.notes, c.createdAt]);
  } else if (kind === 'companies') {
    const data = await db.crmCompany.findMany({ where: { organizationId }, orderBy: { name: 'asc' } });
    header = [m('Nom'), m('Site web'), m('Secteur'), m('Téléphone'), m('E-mail'), m('Adresse'), m('Ville'), m('Pays'), m('Notes'), m('Créé le')];
    rows = data.map((c) => [c.name, c.website, c.industry, c.phone, c.email, c.address, c.city, c.country, c.notes, c.createdAt]);
  } else {
    const data = await db.crmDeal.findMany({
      where: { organizationId }, orderBy: { createdAt: 'desc' },
      include: { stage: { select: { name: true } }, pipeline: { select: { name: true } }, contact: { select: { firstName: true, lastName: true } }, company: { select: { name: true } } },
    });
    header = [m('Titre'), m('Montant'), m('Devise'), m('Statut'), m('Pipeline'), m('Étape'), m('Contact'), m('Entreprise'), m('Clôture prévue'), m('Clôturée le'), m('Motif de perte'), m('Créé le')];
    rows = data.map((d) => [d.title, major(d.value), d.currency, t(DEAL_STATUS_LABELS[d.status]), d.pipeline.name, d.stage.name, d.contact ? `${d.contact.firstName} ${d.contact.lastName}`.trim() : '', d.company?.name, d.expectedCloseAt, d.closedAt, d.lostReason, d.createdAt]);
  }
  await audit({ actorId: ctx.userId, organizationId, action: 'crm.export', entity: kind, meta: { rows: rows.length } });
  return { filename: `crm-${kind}-${new Date().toISOString().slice(0, 10)}.csv`, csv: toCsv(header.map(t), rows), rows: rows.length };
}
