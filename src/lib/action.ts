import 'server-only';
import { ZodError } from 'zod';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { AppError } from './errors';
import { DICTIONARIES } from '@/i18n/dictionaries';
import { LANGUAGE_FALLBACK, LOCALE_META, isLocale } from '@/i18n/config';
import { getUser } from '@/modules/auth/session';

export type ActionState = { ok: boolean; message?: string; fieldErrors?: Record<string, string>; data?: unknown } | null;

async function translator() {
  const user = await getUser().catch(() => null);
  const language = isLocale(user?.locale) ? LOCALE_META[user!.locale as keyof typeof LOCALE_META].language : 'fr';
  const dict = Object.assign({}, ...[...LANGUAGE_FALLBACK[language]].reverse().map((l) => DICTIONARIES[l]), DICTIONARIES[language]) as Record<string, string>;
  return (s: string) => dict[s] ?? s;
}

/**
 * Wraps a server action: converts validation / domain errors into a serialisable state,
 * never leaks internal error details, and lets Next.js redirects through.
 */
export async function run(fn: () => Promise<ActionState | void>, locale?: string): Promise<ActionState> {
  try {
    return (await fn()) ?? { ok: true };
  } catch (err) {
    if (isRedirectError(err)) throw err;
    const language = isLocale(locale) ? LOCALE_META[locale].language : null;
    const t = language
      ? ((d) => (s: string) => d[s] ?? s)(Object.assign({}, ...[...LANGUAGE_FALLBACK[language]].reverse().map((l) => DICTIONARIES[l]), DICTIONARIES[language]) as Record<string, string>)
      : await translator();
    if (err instanceof AppError) {
      return { ok: false, message: t(err.message), fieldErrors: err.fieldErrors && Object.fromEntries(Object.entries(err.fieldErrors).map(([k, v]) => [k, t(v)])) };
    }
    if (err instanceof ZodError) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of err.issues) fieldErrors[String(issue.path[0] ?? '_')] ??= t(issue.message);
      return { ok: false, message: t('Veuillez corriger les champs signalés.'), fieldErrors };
    }
    console.error('[action]', err);
    return { ok: false, message: t('Une erreur est survenue. Veuillez réessayer.') };
  }
}

/** FormData → plain object (repeated keys become arrays when listed in `multi`). */
export function formObject(fd: FormData, multi: string[] = []): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of new Set(fd.keys())) {
    if (key.startsWith('$ACTION')) continue;
    out[key] = multi.includes(key) ? fd.getAll(key).map(String) : String(fd.get(key) ?? '');
  }
  for (const k of multi) out[k] ??= [];
  return out;
}
