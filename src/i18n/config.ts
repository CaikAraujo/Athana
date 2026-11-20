/**
 * Routing locales (URL segment) and their language / formatting.
 * Commercial parameters (currency, taxes) live in the Market table and are admin-editable;
 * the values below are only the bootstrap defaults used by the seed.
 */
export const LOCALES = ['fr-ch', 'de-ch', 'pt-ch', 'en-ch'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'fr-ch';

/** One market (Switzerland, CHF): the locales only change the language. 'fr-FR' and 'pt-BR' remain as stored-content languages. */
export type Language = 'fr' | 'de' | 'pt-PT' | 'en' | 'fr-FR' | 'pt-BR';

export const LOCALE_META: Record<Locale, {
  language: Language; intl: string; hreflang: string; label: string; country: string;
  currency: string; timezone: string; taxRateBps: number; taxLabel: string;
}> = {
  'fr-ch': { language: 'fr', intl: 'fr-CH', hreflang: 'fr-CH', label: 'Français', country: 'CH', currency: 'CHF', timezone: 'Europe/Zurich', taxRateBps: 0, taxLabel: 'TVA' },
  'de-ch': { language: 'de', intl: 'de-CH', hreflang: 'de-CH', label: 'Deutsch', country: 'CH', currency: 'CHF', timezone: 'Europe/Zurich', taxRateBps: 0, taxLabel: 'MWST' },
  'pt-ch': { language: 'pt-PT', intl: 'pt-PT', hreflang: 'pt-CH', label: 'Português', country: 'CH', currency: 'CHF', timezone: 'Europe/Zurich', taxRateBps: 0, taxLabel: 'IVA' },
  'en-ch': { language: 'en', intl: 'en-CH', hreflang: 'en-CH', label: 'English', country: 'CH', currency: 'CHF', timezone: 'Europe/Zurich', taxRateBps: 0, taxLabel: 'VAT' },
};

/** Locales of the previous multi-country setup, redirected permanently. */
export const LEGACY_LOCALES: Record<string, Locale> = { 'fr-fr': 'fr-ch', 'pt-pt': 'pt-ch', 'pt-br': 'pt-ch' };

export function isLocale(v: string | undefined | null): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

/** Dictionary fallback chain; 'fr' is the source language (keys are French). */
export const LANGUAGE_FALLBACK: Record<Language, Language[]> = {
  fr: [], de: [], 'pt-PT': [], en: [], 'fr-FR': [], 'pt-BR': ['pt-PT'],
};

/**
 * Localised URL segments. Internal routes use the English key; visitors see the
 * translated segment. Only the first path segment after the locale is translated.
 */
type SegLang = 'fr' | 'de' | 'pt-PT' | 'en';
type Seg = Record<SegLang, string>;
export const SEGMENTS: Record<string, Seg> = {
  templates: { fr: 'modeles', de: 'vorlagen', 'pt-PT': 'modelos', en: 'templates' },
  websites: { fr: 'sites-web', de: 'websites', 'pt-PT': 'sites', en: 'websites' },
  ecommerce: { fr: 'e-commerce', de: 'onlineshop', 'pt-PT': 'lojas-online', en: 'online-shop' },
  software: { fr: 'logiciels', de: 'software', 'pt-PT': 'software', en: 'software' },
  automation: { fr: 'automatisation', de: 'automatisierung', 'pt-PT': 'automacao', en: 'automation' },
  custom: { fr: 'sur-mesure', de: 'massgeschneidert', 'pt-PT': 'sob-medida', en: 'custom' },
  work: { fr: 'realisations', de: 'referenzen', 'pt-PT': 'projetos', en: 'work' },
  contact: { fr: 'contact', de: 'kontakt', 'pt-PT': 'contacto', en: 'contact' },
  quote: { fr: 'devis', de: 'offerte', 'pt-PT': 'orcamento', en: 'quote' },
  blog: { fr: 'blog', de: 'blog', 'pt-PT': 'blog', en: 'blog' },
  cart: { fr: 'panier', de: 'warenkorb', 'pt-PT': 'carrinho', en: 'cart' },
  checkout: { fr: 'commande', de: 'bestellung', 'pt-PT': 'checkout', en: 'checkout' },
  account: { fr: 'compte', de: 'konto', 'pt-PT': 'conta', en: 'account' },
  login: { fr: 'connexion', de: 'anmelden', 'pt-PT': 'entrar', en: 'login' },
  register: { fr: 'inscription', de: 'registrieren', 'pt-PT': 'registo', en: 'register' },
  'forgot-password': { fr: 'mot-de-passe-oublie', de: 'passwort-vergessen', 'pt-PT': 'recuperar-password', en: 'forgot-password' },
  'reset-password': { fr: 'nouveau-mot-de-passe', de: 'neues-passwort', 'pt-PT': 'nova-password', en: 'reset-password' },
  legal: { fr: 'legal', de: 'rechtliches', 'pt-PT': 'legal', en: 'legal' },
  lp: { fr: 'offres', de: 'angebote', 'pt-PT': 'ofertas', en: 'offers' },
  admin: { fr: 'admin', de: 'admin', 'pt-PT': 'admin', en: 'admin' },
  app: { fr: 'app', de: 'app', 'pt-PT': 'app', en: 'app' },
};

function segLang(locale: Locale): SegLang {
  const l = LOCALE_META[locale].language;
  return l === 'de' || l === 'pt-PT' || l === 'en' ? l : 'fr';
}

/** Internal path ("/templates/x") → public localised path ("/fr-ch/modeles/x"). */
export function localePath(locale: Locale, path: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const [pathname, rest = ''] = path.split(/(?=[?#])/, 2) as [string, string?];
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length && SEGMENTS[parts[0]]) parts[0] = SEGMENTS[parts[0]][segLang(locale)];
  return `/${locale}${parts.length ? '/' + parts.join('/') : ''}${rest ?? ''}`;
}

/** Public localised first segment → internal key (used by the proxy rewrite). */
export function internalSegment(locale: Locale, segment: string): string | null {
  const lang = segLang(locale);
  for (const [key, map] of Object.entries(SEGMENTS)) if (map[lang] === segment) return key;
  return null;
}

/** Public path in another locale for the same internal page (language switcher, hreflang). */
export function switchLocalePath(publicPath: string, to: Locale): string {
  const parts = publicPath.split('/').filter(Boolean);
  const from = isLocale(parts[0]) ? (parts.shift() as Locale) : DEFAULT_LOCALE;
  if (parts.length) parts[0] = internalSegment(from, parts[0]) ?? parts[0];
  return localePath(to, '/' + parts.join('/'));
}
