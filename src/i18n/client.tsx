'use client';

import { createContext, useContext, useMemo } from 'react';
import NextLink from 'next/link';
import type { ComponentProps } from 'react';
import { localePath, type Locale } from './config';
import { makeT, type TFn } from './translate';
import type { Dictionary } from './dictionaries';

const Ctx = createContext<{ locale: Locale; t: TFn }>({ locale: 'fr-ch', t: (s) => s });

export function I18nProvider({ locale, dict, children }: { locale: Locale; dict: Dictionary; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, t: makeT(dict) }), [locale, dict]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useT = () => useContext(Ctx).t;
export const useLocale = () => useContext(Ctx).locale;

/** Locale-aware link: href is the internal path ("/templates"), rendered as the localised URL. */
export function Link({ href, ...props }: Omit<ComponentProps<typeof NextLink>, 'href'> & { href: string }) {
  const locale = useLocale();
  return <NextLink href={localePath(locale, href)} {...props} />;
}
