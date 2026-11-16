import { m } from '@/i18n/translate';

/** Label maps shared by server and client code (translated at display time with t(value)). */
export const LIFECYCLES = ['LEAD', 'PROSPECT', 'CUSTOMER', 'INACTIVE'] as const;
export type Lifecycle = (typeof LIFECYCLES)[number];
export const LIFECYCLE_LABELS: Record<Lifecycle, string> = {
  LEAD: m('Lead'), PROSPECT: m('Prospect'), CUSTOMER: m('Client'), INACTIVE: m('Inactif'),
};
export const LIFECYCLE_TONES: Record<Lifecycle, 'info' | 'gold' | 'ok' | 'neutral'> = { LEAD: 'info', PROSPECT: 'gold', CUSTOMER: 'ok', INACTIVE: 'neutral' };

export const ACTIVITY_TYPES = ['note', 'call', 'email', 'meeting'] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];
export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  note: m('Note'), call: m('Appel'), email: m('E-mail'), meeting: m('Rendez-vous'),
};

export const DEAL_STATUS_LABELS = { OPEN: m('En cours'), WON: m('Gagnée'), LOST: m('Perdue') } as const;
export const DEAL_STATUS_TONES = { OPEN: 'info', WON: 'ok', LOST: 'danger' } as const;

export const PROPOSAL_STATUSES = ['draft', 'sent', 'accepted', 'rejected'] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];
export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  draft: m('Brouillon'), sent: m('Envoyée'), accepted: m('Acceptée'), rejected: m('Refusée'),
};
export const PROPOSAL_STATUS_TONES: Record<ProposalStatus, 'neutral' | 'info' | 'ok' | 'danger'> = { draft: 'neutral', sent: 'info', accepted: 'ok', rejected: 'danger' };

export const ROLE_LABELS = { OWNER: m('Propriétaire'), ADMIN: m('Administrateur'), MANAGER: m('Responsable'), MEMBER: m('Membre') } as const;

export const ATTACHMENT_ENTITIES = ['contact', 'company', 'deal'] as const;
export type AttachmentEntity = (typeof ATTACHMENT_ENTITIES)[number];

export const EXPORT_TYPES = ['contacts', 'companies', 'deals'] as const;
export type ExportType = (typeof EXPORT_TYPES)[number];
