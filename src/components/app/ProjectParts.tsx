import type { FileAsset, Message, ProjectEvent, ProjectStatus } from '@prisma/client';
import { Check } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import { formatDateTime, type TFn } from '@/i18n/translate';
import { PROJECT_STATUS_LABEL } from '@/modules/automation/events';

/** Simplified client-facing milestones mapped from the 13 internal statuses. */
const MILESTONES: { label: string; reached: ProjectStatus[] }[] = [
  { label: 'Paiement', reached: ['PAID', 'BRIEFING_PENDING'] },
  { label: 'Briefing', reached: ['BRIEFING_SUBMITTED', 'PROJECT_QUEUED'] },
  { label: 'Réalisation', reached: ['IN_DEVELOPMENT', 'INTERNAL_REVIEW'] },
  { label: 'Validation', reached: ['CLIENT_REVIEW', 'REVISION_REQUESTED', 'APPROVED'] },
  { label: 'Mise en ligne', reached: ['DEPLOYMENT_PENDING', 'COMPLETED', 'MAINTENANCE'] },
];
const ORDER: ProjectStatus[] = ['PAYMENT_PENDING', 'PAID', 'BRIEFING_PENDING', 'BRIEFING_SUBMITTED', 'PROJECT_QUEUED', 'IN_DEVELOPMENT', 'INTERNAL_REVIEW', 'REVISION_REQUESTED', 'CLIENT_REVIEW', 'APPROVED', 'DEPLOYMENT_PENDING', 'COMPLETED', 'MAINTENANCE'];

export function Milestones({ status, t }: { status: ProjectStatus; t: TFn }) {
  const idx = ORDER.indexOf(status);
  const labels = [t('Paiement'), t('Briefing'), t('Réalisation'), t('Validation'), t('Mise en ligne')];
  return (
    <ol className="grid grid-cols-5 gap-1 text-center text-[0.7rem] sm:text-xs">
      {MILESTONES.map((ms, i) => {
        const first = ORDER.indexOf(ms.reached[0]);
        const last = Math.max(...ms.reached.map((s) => ORDER.indexOf(s)));
        const done = idx > last || status === 'COMPLETED' || status === 'MAINTENANCE';
        const current = !done && idx >= first;
        return (
          <li key={ms.label} className="flex flex-col items-center gap-2" aria-current={current ? 'step' : undefined}>
            <span className={`grid h-8 w-8 place-items-center rounded-full border text-xs font-semibold ${done ? 'border-gold-500 bg-gold-500 text-black' : current ? 'border-gold-500 text-gold-300' : 'border-line-strong text-fg-muted'}`}>{done ? <Check size={15} aria-hidden /> : i + 1}</span>
            <span className={done || current ? 'text-fg' : 'muted'}>{labels[i]}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function Timeline({ events, locale, t }: { events: ProjectEvent[]; locale: Locale; t: TFn }) {
  if (!events.length) return <p className="muted text-sm">{t('Aucun événement pour le moment.')}</p>;
  return (
    <ol className="space-y-3 border-l border-line pl-4 text-sm">
      {events.map((e) => (
        <li key={e.id} className="relative">
          <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-gold-500" aria-hidden />
          <p>{e.toStatus ? t(PROJECT_STATUS_LABEL[e.toStatus]) : e.note}</p>
          {e.toStatus && e.note && <p className="muted">{e.note}</p>}
          <p className="muted text-xs">{formatDateTime(e.createdAt, locale)}</p>
        </li>
      ))}
    </ol>
  );
}

export function Thread({ messages, viewerIsStaff, locale, t }: { messages: Message[]; viewerIsStaff: boolean; locale: Locale; t: TFn }) {
  if (!messages.length) return <p className="muted text-sm">{t('Aucun message. Écrivez-nous ici pour toute question sur ce projet.')}</p>;
  return (
    <ul className="space-y-3">
      {messages.map((msg) => {
        const mine = msg.fromStaff === viewerIsStaff;
        return (
          <li key={msg.id} className={`max-w-[88%] rounded-xl border p-3 text-sm ${msg.internal ? 'border-warn/40 bg-warn/5' : mine ? 'ml-auto border-gold-500/30 bg-gold-500/5' : 'border-line bg-ink-800'}`}>
            <p className="muted mb-1 text-xs">{msg.internal ? t('Note interne') : msg.fromStaff ? 'ATHANA' : t('Client')} · {formatDateTime(msg.createdAt, locale)}</p>
            <p className="whitespace-pre-wrap break-words">{msg.body}</p>
          </li>
        );
      })}
    </ul>
  );
}

export function FileList({ files, t, action }: { files: FileAsset[]; t: TFn; action?: (f: FileAsset) => React.ReactNode }) {
  if (!files.length) return <p className="muted text-sm">{t('Aucun fichier.')}</p>;
  return (
    <ul className="divide-y divide-line text-sm">
      {files.map((f) => (
        <li key={f.id} className="flex items-center justify-between gap-3 py-2">
          <a className="min-w-0 truncate underline hover:text-gold-300" href={`/api/files/${f.id}`}>{f.originalName}</a>
          <span className="flex shrink-0 items-center gap-2"><span className="muted text-xs">{(f.size / 1024).toFixed(0)} Ko</span>{action?.(f)}</span>
        </li>
      ))}
    </ul>
  );
}
