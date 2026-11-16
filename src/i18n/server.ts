import 'server-only';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { DICTIONARIES, type Dictionary } from './dictionaries';
import { LANGUAGE_FALLBACK, LOCALE_META, isLocale, type Language, type Locale } from './config';
import { makeT, pick, type TFn } from './translate';
import clientKeys from './generated/client-keys.json';

/** Dictionary for a language = JSON file + fallbacks + admin overrides from the database. */
export const getDictionary = cache(async (language: Language): Promise<Dictionary> => {
  const base: Dictionary = {};
  for (const l of [...LANGUAGE_FALLBACK[language]].reverse()) Object.assign(base, DICTIONARIES[l]);
  Object.assign(base, DICTIONARIES[language]);
  try {
    const overrides = await db.translationOverride.findMany({ where: { language } });
    for (const o of overrides) base[o.source] = o.value;
  } catch {
    // The database may be unavailable at build time; JSON dictionaries are enough.
  }
  return base;
});

export function assertLocale(value: string): Locale {
  if (!isLocale(value)) notFound();
  return value;
}

export async function getT(locale: Locale): Promise<TFn> {
  return makeT(await getDictionary(LOCALE_META[locale].language));
}

/** Only the strings used by client components are shipped to the browser. */
export async function getClientDictionary(locale: Locale): Promise<Dictionary> {
  const dict = await getDictionary(LOCALE_META[locale].language);
  const out: Dictionary = {};
  for (const k of clientKeys as string[]) if (dict[k]) out[k] = dict[k];
  return out;
}

export function lang(locale: Locale): Language {
  return LOCALE_META[locale].language;
}

/** Shorthand to resolve localised DB content. */
export function L(value: unknown, locale: Locale): string {
  return pick(value, LOCALE_META[locale].language);
}
