import type { ReactNode } from 'react';
import { CheckCircle2, Circle, FileText, Lock, Mail, MessageSquare, Phone, Users } from 'lucide-react';
import { Link } from '@/i18n/client';
import type { Locale } from '@/i18n/config';
import { formatDate, formatDateTime, type TFn } from '@/i18n/translate';
import { Badge, Card, Empty } from '@/components/ui';
import { ActionButton, ActionForm, Input, Modal, Select, Submit, Textarea } from '@/components/ui/form';
import {
  createTaskAction, deleteActivityAction, deleteAttachmentAction, deleteTaskAction, logActivityAction, toggleTaskAction, uploadAttachmentAction,
} from '@/modules/crm/actions';
import { toLocalInput } from '@/modules/crm/dates';
import {
  ACTIVITY_LABELS, ACTIVITY_TYPES, LIFECYCLE_LABELS, LIFECYCLE_TONES, DEAL_STATUS_LABELS, DEAL_STATUS_TONES, PROPOSAL_STATUS_LABELS, PROPOSAL_STATUS_TONES,
  type ActivityType, type AttachmentEntity, type Lifecycle, type ProposalStatus,
} from '@/modules/crm/labels';
import type * as crm from '@/modules/crm/service';
import { fullName, qs } from './page';

type Timeline = Awaited<ReturnType<typeof crm.listTimeline>>;
type Tasks = Awaited<ReturnType<typeof crm.tasksFor>>;
type Files = Awaited<ReturnType<typeof crm.listAttachments>>;
type Members = Awaited<ReturnType<typeof crm.listMembers>>;
type Link3 = { contactId?: string; companyId?: string; dealId?: string };

/** Date-only values (due dates, validity) are stored at 12:00 UTC and always shown as that calendar day. */
export const day = (d: Date, locale: Locale) => formatDate(d, locale, { timeZone: 'UTC' });

export function LifecycleBadge({ value, t }: { value: Lifecycle; t: TFn }) {
  return <Badge tone={LIFECYCLE_TONES[value]}>{t(LIFECYCLE_LABELS[value])}</Badge>;
}
export function DealStatusBadge({ value, t }: { value: keyof typeof DEAL_STATUS_LABELS; t: TFn }) {
  return <Badge tone={DEAL_STATUS_TONES[value]}>{t(DEAL_STATUS_LABELS[value])}</Badge>;
}
export function ProposalStatusBadge({ value, t }: { value: string; t: TFn }) {
  const s = (value in PROPOSAL_STATUS_LABELS ? value : 'draft') as ProposalStatus;
  return <Badge tone={PROPOSAL_STATUS_TONES[s]}>{t(PROPOSAL_STATUS_LABELS[s])}</Badge>;
}

export function UpgradeNotice({ t, title, children }: { t: TFn; title: string; children?: ReactNode }) {
  return (
    <div className="panel mx-auto max-w-xl p-6 text-center md:p-8">
      <Lock size={28} className="mx-auto text-gold-400" aria-hidden />
      <h2 className="mt-3 text-lg font-semibold">{title}</h2>
      <p className="muted mt-2 text-sm">{children ?? t('Cette fonctionnalité n’est pas incluse dans votre plan actuel.')}</p>
      <Link href="/account/subscriptions?product=crm" className="btn btn-primary mt-5">{t('Voir les plans')}</Link>
    </div>
  );
}

export function Pagination({ t, path, params, page, pages, total }: { t: TFn; path: string; params: Record<string, string | number | undefined>; page: number; pages: number; total: number }) {
  if (pages <= 1) return <p className="muted mt-3 text-sm">{t('{count} résultat(s)', { count: total })}</p>;
  return (
    <nav className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm" aria-label={t('Pagination')}>
      <span className="muted">{t('{count} résultat(s)', { count: total })} · {t('Page {page} sur {pages}', { page, pages })}</span>
      <span className="flex gap-2">
        {page > 1 ? <Link className="btn btn-outline btn-sm" href={path + qs({ ...params, page: page - 1 })} rel="prev">{t('Précédent')}</Link> : <span className="btn btn-outline btn-sm" aria-disabled="true">{t('Précédent')}</span>}
        {page < pages ? <Link className="btn btn-outline btn-sm" href={path + qs({ ...params, page: page + 1 })} rel="next">{t('Suivant')}</Link> : <span className="btn btn-outline btn-sm" aria-disabled="true">{t('Suivant')}</span>}
      </span>
    </nav>
  );
}

/** Sortable column header: toggles the direction when the column is already active. */
export function SortLink({ label, column, path, params }: { label: string; column: string; path: string; params: Record<string, string | number | undefined> }) {
  const active = params.sort === column;
  const dir = active && params.dir !== 'desc' ? 'desc' : 'asc';
  return (
    <Link href={path + qs({ ...params, sort: column, dir, page: undefined })} className="inline-flex items-center gap-1 no-underline hover:text-gold-300" aria-label={label}>
      {label}{active && <span aria-hidden>{params.dir === 'desc' ? '↓' : '↑'}</span>}
    </Link>
  );
}

const ACTIVITY_ICONS: Record<ActivityType, ReactNode> = {
  note: <MessageSquare size={16} aria-hidden />, call: <Phone size={16} aria-hidden />, email: <Mail size={16} aria-hidden />, meeting: <Users size={16} aria-hidden />,
};

export function TimelineList({ items, t, locale, tz, showLinks = false }: { items: Timeline; t: TFn; locale: Locale; tz: string; showLinks?: boolean }) {
  if (!items.length) return <Empty title={t('Aucune activité pour le moment.')} />;
  return (
    <ol className="space-y-3">
      {items.map((a) => {
        const type = ((ACTIVITY_TYPES as readonly string[]).includes(a.type) ? a.type : 'note') as ActivityType;
        return (
          <li key={a.id} className="flex gap-3 rounded-xl border border-line p-3">
            <span className="mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-full bg-ink-700 text-gold-300">{ACTIVITY_ICONS[type]}</span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                <span className="font-semibold text-fg">{t(ACTIVITY_LABELS[type])}</span>
                <span className="muted">{formatDateTime(a.occurredAt, locale, tz)}</span>
                {a.userName && <span className="muted">· {a.userName}</span>}
              </div>
              <p className="mt-1 whitespace-pre-wrap break-words text-sm text-fg-soft">{a.body}</p>
              {showLinks && (a.contact || a.company || a.deal) && (
                <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  {a.contact && <Link className="muted underline" href={`/app/crm/contacts/${a.contact.id}`}>{fullName(a.contact)}</Link>}
                  {a.company && <Link className="muted underline" href={`/app/crm/companies/${a.company.id}`}>{a.company.name}</Link>}
                  {a.deal && <Link className="muted underline" href={`/app/crm/deals/${a.deal.id}`}>{a.deal.title}</Link>}
                </p>
              )}
            </div>
            {a.canDelete && <ActionButton action={deleteActivityAction} fields={{ id: a.id }} className="btn btn-ghost btn-sm" confirm={t('Supprimer cette activité ?')}><span aria-hidden>✕</span><span className="sr-only">{t('Supprimer')}</span></ActionButton>}
          </li>
        );
      })}
    </ol>
  );
}

export function ActivityForm({ t, link, tz }: { t: TFn; link: Link3; tz: string }) {
  return (
    <ActionForm action={logActivityAction} className="space-y-3" resetOnSuccess>
      {Object.entries(link).map(([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />)}
      <div className="grid gap-3 sm:grid-cols-2">
        <Select label={t('Type')} name="type" options={ACTIVITY_TYPES.map((v) => ({ value: v, label: t(ACTIVITY_LABELS[v]) }))} />
        <Input label={t('Date et heure')} name="occurredAt" type="datetime-local" defaultValue={toLocalInput(new Date(), tz)} />
      </div>
      <Textarea label={t('Compte rendu')} name="body" required maxLength={5000} placeholder={t('Ce qui a été dit, décidé, envoyé…')} />
      <Submit className="btn btn-primary btn-sm">{t('Enregistrer l’activité')}</Submit>
    </ActionForm>
  );
}

export function memberOptions(members: Members, t: TFn, empty = true) {
  return [...(empty ? [{ value: '', label: t('— Personne —') }] : []), ...members.map((mb) => ({ value: mb.userId, label: mb.name }))];
}

export function TaskModal({ t, members, link, userId, trigger }: { t: TFn; members: Members; link?: { contactId?: string; dealId?: string }; userId: string; trigger?: string }) {
  return (
    <Modal trigger={trigger ?? t('Nouvelle tâche')} title={t('Nouvelle tâche')} triggerClassName="btn btn-outline btn-sm">
      <ActionForm action={createTaskAction} className="space-y-4" resetOnSuccess successMessage={t('Tâche créée.')}>
        {link?.contactId && <input type="hidden" name="contactId" value={link.contactId} />}
        {link?.dealId && <input type="hidden" name="dealId" value={link.dealId} />}
        <Input label={t('Titre')} name="title" required maxLength={200} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('Échéance')} name="dueAt" type="date" />
          <Select label={t('Assignée à')} name="assigneeId" options={memberOptions(members, t, false)} defaultValue={userId} />
        </div>
        <Textarea label={t('Description')} name="description" maxLength={2000} />
        <Submit>{t('Créer la tâche')}</Submit>
      </ActionForm>
    </Modal>
  );
}

export function TaskList({ tasks, t, locale, showLinks = false }: { tasks: Tasks; t: TFn; locale: Locale; showLinks?: boolean }) {
  if (!tasks.length) return <Empty title={t('Aucune tâche.')} />;
  return (
    <ul className="divide-y divide-line">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-start gap-3 py-3">
          <ActionButton action={toggleTaskAction} fields={{ id: task.id, done: task.doneAt ? '0' : '1' }} className="btn btn-ghost btn-sm px-1.5">
            {task.doneAt ? <CheckCircle2 size={18} className="text-ok" aria-hidden /> : <Circle size={18} aria-hidden />}
            <span className="sr-only">{task.doneAt ? t('Rouvrir la tâche') : t('Marquer comme terminée')}</span>
          </ActionButton>
          <div className="min-w-0 flex-1">
            <p className={`break-words text-sm font-medium ${task.doneAt ? 'muted line-through' : ''}`}>{task.title}</p>
            {task.description && <p className="muted mt-0.5 whitespace-pre-wrap break-words text-xs">{task.description}</p>}
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {task.dueAt && (task.overdue ? <Badge tone="danger">{t('En retard')} · {day(task.dueAt, locale)}</Badge> : <span className="muted">{t('Échéance')} : {day(task.dueAt, locale)}</span>)}
              {task.assigneeName && <span className="muted">{task.assigneeName}</span>}
              {showLinks && task.contact && <Link className="muted underline" href={`/app/crm/contacts/${task.contact.id}`}>{fullName(task.contact)}</Link>}
              {showLinks && task.deal && <Link className="muted underline" href={`/app/crm/deals/${task.deal.id}`}>{task.deal.title}</Link>}
            </p>
          </div>
          <ActionButton action={deleteTaskAction} fields={{ id: task.id }} className="btn btn-ghost btn-sm" confirm={t('Supprimer cette tâche ?')}><span aria-hidden>✕</span><span className="sr-only">{t('Supprimer')}</span></ActionButton>
        </li>
      ))}
    </ul>
  );
}

const fileSize = (bytes: number, t: TFn) => (bytes >= 1024 * 1024 ? t('{size} Mo', { size: (bytes / 1024 / 1024).toFixed(1) }) : t('{size} Ko', { size: Math.max(1, Math.round(bytes / 1024)) }));

export function Attachments({ files, entityType, entityId, t, locale }: { files: Files; entityType: AttachmentEntity; entityId: string; t: TFn; locale: Locale }) {
  return (
    <Card title={t('Pièces jointes')}>
      {files.length === 0 ? <p className="muted text-sm">{t('Aucun fichier joint.')}</p> : (
        <ul className="divide-y divide-line">
          {files.map((f) => (
            <li key={f.id} className="flex items-center gap-3 py-2.5">
              <FileText size={16} className="flex-none text-gold-300" aria-hidden />
              <div className="min-w-0 flex-1">
                <a href={f.url} className="block truncate text-sm font-medium underline-offset-2 hover:underline" download={f.originalName}>{f.originalName}</a>
                <p className="muted text-xs">{fileSize(f.size, t)} · {formatDate(f.createdAt, locale)}{f.ownerName ? ` · ${f.ownerName}` : ''}</p>
              </div>
              {f.canDelete && <ActionButton action={deleteAttachmentAction} fields={{ id: f.id }} className="btn btn-ghost btn-sm" confirm={t('Supprimer ce fichier ?')}><span aria-hidden>✕</span><span className="sr-only">{t('Supprimer')}</span></ActionButton>}
            </li>
          ))}
        </ul>
      )}
      <ActionForm action={uploadAttachmentAction} className="mt-4 space-y-3" resetOnSuccess>
        <input type="hidden" name="entityType" value={entityType} />
        <input type="hidden" name="entityId" value={entityId} />
        <Input label={t('Ajouter un fichier')} name="file" type="file" required hint={t('PDF, image, document ou texte — 2 Mo maximum.')} className="py-2" />
        <Submit className="btn btn-outline btn-sm">{t('Téléverser')}</Submit>
      </ActionForm>
    </Card>
  );
}

/** GET search / filter form (works without JavaScript). */
export function FilterBar({ action, children, t, reset }: { action: string; children: ReactNode; t: TFn; reset: string }) {
  return (
    <form method="get" action={action} className="panel mb-4 grid grid-cols-1 items-end gap-3 p-4 sm:grid-cols-2 lg:flex lg:flex-wrap">
      {children}
      <div className="flex gap-2">
        <button type="submit" className="btn btn-secondary btn-sm">{t('Filtrer')}</button>
        <Link href={reset} className="btn btn-ghost btn-sm">{t('Réinitialiser')}</Link>
      </div>
    </form>
  );
}

export function FilterField({ label, name, children }: { label: string; name: string; children: ReactNode }) {
  return (
    <div className="min-w-0 lg:w-48">
      <label className="label" htmlFor={`q-${name}`}>{label}</label>
      {children}
    </div>
  );
}
