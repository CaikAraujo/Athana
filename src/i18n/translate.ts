import { LANGUAGE_FALLBACK, LOCALE_META, type Language, type Locale } from './config';
import type { Dictionary } from './dictionaries';

export type TFn = (source: string, vars?: Record<string, string | number>) => string;

/** Marks a French source string for extraction without translating it yet (zod messages, AppError). */
export const m = (s: string) => s;

export function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** gettext-style: the French source string is the key. */
export function makeT(dict: Dictionary): TFn {
  return (source, vars) => interpolate(dict[source] ?? source, vars);
}

export type Localized = Record<string, string> | string | null | undefined;

/** Resolve a localised Json value ({fr, pt-PT, pt-BR, en}) for a language. */
export function pick(value: unknown, language: Language): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  const v = value as Record<string, string>;
  const chain: string[] = [language, ...LANGUAGE_FALLBACK[language], language === 'fr-FR' ? 'fr' : '', 'fr'];
  for (const l of chain) if (l && v[l]) return v[l];
  return Object.values(v)[0] ?? '';
}

export function formatMoney(amountMinor: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_META[locale].intl, {
    style: 'currency', currency, minimumFractionDigits: amountMinor % 100 === 0 ? 0 : 2, maximumFractionDigits: 2,
  }).format(amountMinor / 100);
}

export function formatDate(d: Date | string, locale: Locale, opts?: Intl.DateTimeFormatOptions & { timeZone?: string }): string {
  return new Intl.DateTimeFormat(LOCALE_META[locale].intl, { dateStyle: 'medium', timeZone: LOCALE_META[locale].timezone, ...opts }).format(new Date(d));
}

export function formatDateTime(d: Date | string, locale: Locale, timeZone?: string): string {
  return new Intl.DateTimeFormat(LOCALE_META[locale].intl, { dateStyle: 'medium', timeStyle: 'short', timeZone: timeZone ?? LOCALE_META[locale].timezone }).format(new Date(d));
}

export function formatNumber(n: number, locale: Locale): string {
  return new Intl.NumberFormat(LOCALE_META[locale].intl).format(n);
}
