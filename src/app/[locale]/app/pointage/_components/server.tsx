import type { ReactNode } from 'react';
import { assertLocale, getT } from '@/i18n/server';
import { LOCALE_META, localePath, type Locale } from '@/i18n/config';
import { formatDate, type TFn } from '@/i18n/translate';
import { Link } from '@/i18n/client';
import { Badge, Empty } from '@/components/ui';
import { requireTenant } from '@/modules/tenancy/guard';
import { resolveActor, type Actor, type PtActorRole } from '@/modules/pointage/actor';
import { ANOMALY_LABELS, STATE_LABELS } from '@/modules/pointage/labels';
import type { Anomaly } from '@/modules/pointage/time';

export const BASE = '/app/pointage';

/** Guard + context shared by every Pointage page. */
export async function pointagePage(params: Promise<{ locale: string }>) {
  const locale = assertLocale((await params).locale);
  const ctx = await requireTenant(locale, 'pointage');
  const [actor, t] = await Promise.all([resolveActor(ctx), getT(locale)]);
  return { locale, ctx, actor, t, timezone: ctx.organization.timezone };
}

const RANK: Record<PtActorRole, number> = { NONE: 0, EMPLOYEE: 1, MANAGER: 2, ADMIN: 3 };
export const atLeast = (actor: Actor, role: PtActorRole) => RANK[actor.role] >= RANK[role];

export function Denied({ t }: { t: TFn }) {
  return <Empty title={t('Accès refusé.')}>{t('Votre rôle ne permet pas d’accéder à cette page.')}</Empty>;
}

export function UpgradeNotice({ t, children }: { t: TFn; children: ReactNode }) {
  return (
    <div className="alert alert-warn flex flex-wrap items-center justify-between gap-3">
      <span>{children}</span>
      <Link href="/account/subscriptions" className="btn btn-primary btn-sm no-underline">{t('Voir les plans')}</Link>
    </div>
  );
}

/** Time of day in the organization's timezone. */
export const fmtTime = (d: Date, locale: Locale, timeZone: string) => formatDate(d, locale, { timeZone, dateStyle: undefined, hour: '2-digit', minute: '2-digit' });
/** `YYYY-MM-DD` key → localised date (keys are calendar days, formatted without timezone shift). */
export const fmtDay = (key: string, locale: Locale, long = false) =>
  formatDate(key, locale, long ? { timeZone: 'UTC', dateStyle: 'full' } : { timeZone: 'UTC', dateStyle: undefined, weekday: 'short', day: 'numeric', month: 'short' });
export const fmtMonth = (month: string, locale: Locale) => new Intl.DateTimeFormat(LOCALE_META[locale].intl, { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(new Date(`${month}-01T00:00:00Z`));

export function StatusBadge({ status, t }: { status: keyof typeof STATE_LABELS; t: TFn }) {
  return <Badge tone={status === 'IN' ? 'ok' : status === 'BREAK' ? 'warn' : status === 'ABSENT' ? 'info' : 'neutral'}>{t(STATE_LABELS[status])}</Badge>;
}

export function Anomalies({ list, t }: { list: Anomaly[]; t: TFn }) {
  if (!list.length) return null;
  return <span className="flex flex-wrap gap-1">{list.map((a) => <Badge key={a} tone="danger">{t(ANOMALY_LABELS[a])}</Badge>)}</span>;
}

/** Builds a localised URL of a Pointage page with query parameters (empty values are dropped). */
export function href(locale: Locale, path: string, query: Record<string, string | number | null | undefined> = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== null && v !== undefined && v !== '') qs.set(k, String(v));
  const s = qs.toString();
  return localePath(locale, `${BASE}${path}${s ? `?${s}` : ''}`);
}

export function Pagination({ page, pages, to, t }: { page: number; pages: number; to: (page: number) => string; t: TFn }) {
  if (pages <= 1) return null;
  return (
    <nav className="mt-4 flex items-center justify-between gap-3" aria-label={t('Pagination')}>
      {page > 1 ? <a className="btn btn-outline btn-sm" href={to(page - 1)}>{t('Précédent')}</a> : <span />}
      <span className="muted text-sm">{t('Page {page} sur {pages}', { page, pages })}</span>
      {page < pages ? <a className="btn btn-outline btn-sm" href={to(page + 1)}>{t('Suivant')}</a> : <span />}
    </nav>
  );
}

export const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
export type Search = Promise<Record<string, string | string[] | undefined>>;
