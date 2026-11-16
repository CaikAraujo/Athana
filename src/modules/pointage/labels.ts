import { m } from '@/i18n/translate';
import type { Anomaly, EntryType } from './time';

/** French source labels, translated at display time with `t(label)`. */
export const ENTRY_LABELS: Record<EntryType, string> = {
  CLOCK_IN: m('Entrée'), CLOCK_OUT: m('Sortie'), BREAK_START: m('Début de pause'), BREAK_END: m('Fin de pause'),
};
export const ACTION_LABELS: Record<EntryType, string> = {
  CLOCK_IN: m('Pointer l’entrée'), CLOCK_OUT: m('Pointer la sortie'), BREAK_START: m('Commencer la pause'), BREAK_END: m('Terminer la pause'),
};
export const STATE_LABELS: Record<'IN' | 'BREAK' | 'OUT' | 'ABSENT', string> = {
  IN: m('Au travail'), BREAK: m('En pause'), OUT: m('Hors service'), ABSENT: m('Absent'),
};
export const ANOMALY_LABELS: Record<Anomaly, string> = {
  MISSING_CLOCK_OUT: m('Sortie non pointée'), BREAK_NOT_ENDED: m('Pause non terminée'), EXCEEDS_MAX_DAILY: m('Durée maximale journalière dépassée'),
  INSUFFICIENT_BREAK: m('Pause insuffisante'), ORPHAN_ENTRY: m('Pointage isolé'),
};
export const ABSENCE_LABELS: Record<'VACATION' | 'SICK' | 'UNPAID' | 'OTHER', string> = {
  VACATION: m('Vacances'), SICK: m('Maladie'), UNPAID: m('Congé non payé'), OTHER: m('Autre'),
};
export const ABSENCE_STATUS_LABELS: Record<'PENDING' | 'APPROVED' | 'REJECTED', string> = {
  PENDING: m('En attente'), APPROVED: m('Approuvée'), REJECTED: m('Refusée'),
};
export const ROLE_LABELS: Record<'ADMIN' | 'MANAGER' | 'EMPLOYEE', string> = {
  ADMIN: m('Administrateur'), MANAGER: m('Responsable'), EMPLOYEE: m('Employé'),
};
export const SOURCE_LABELS: Record<string, string> = { web: m('Web'), mobile: m('Mobile'), manual: m('Correction manuelle') };
export const WEEKDAY_LABELS: Record<number, string> = {
  1: m('Lundi'), 2: m('Mardi'), 3: m('Mercredi'), 4: m('Jeudi'), 5: m('Vendredi'), 6: m('Samedi'), 7: m('Dimanche'),
};
export const JURISDICTION_LABELS: Record<'CH' | 'FR' | 'PT' | 'BR' | 'OTHER', string> = {
  CH: m('Suisse'), FR: m('France'), PT: m('Portugal'), BR: m('Brésil'), OTHER: m('Autre'),
};
export const AUDIT_LABELS: Record<string, string> = {
  'pointage.clock': m('Pointage'),
  'pointage.entry.added': m('Pointage ajouté manuellement'),
  'pointage.entry.voided': m('Pointage annulé'),
  'pointage.absence.requested': m('Absence demandée'),
  'pointage.absence.cancelled': m('Demande d’absence retirée'),
  'pointage.absence.approved': m('Absence approuvée'),
  'pointage.absence.rejected': m('Absence refusée'),
  'pointage.employee.created': m('Employé créé'),
  'pointage.employee.updated': m('Employé modifié'),
  'pointage.employee.deactivated': m('Employé désactivé'),
  'pointage.employee.reactivated': m('Employé réactivé'),
  'pointage.employee.invited': m('Employé invité'),
  'pointage.department.created': m('Département créé'),
  'pointage.department.updated': m('Département modifié'),
  'pointage.department.deleted': m('Département supprimé'),
  'pointage.schedule.created': m('Horaire créé'),
  'pointage.schedule.updated': m('Horaire modifié'),
  'pointage.schedule.deleted': m('Horaire supprimé'),
  'pointage.settings.updated': m('Paramètres modifiés'),
  'pointage.settings.preset_applied': m('Valeurs indicatives appliquées'),
  'pointage.retention.purged': m('Purge des données expirées'),
  'pointage.export': m('Export généré'),
  'member.invited': m('Membre invité'),
  'member.role_changed': m('Rôle d’un membre modifié'),
  'member.removed': m('Membre retiré'),
};
