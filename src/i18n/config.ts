/**
 * Routing locales (URL segment) and their language / formatting.
 * Commercial parameters (currency, taxes) live in the Market table and are admin-editable;
 * the values below are only the bootstrap defaults used by the seed.
 */
export const LOCALES = ['fr-ch', 'fr-fr', 'pt-pt', 'pt-br'] as const;
/** Prepared but not routed yet. Add 'en' to LOCALES and provide en.json to enable. */
export const PREPARED_LOCALES = ['en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'fr-ch';

export type Language = 'fr' | 'fr-FR' | 'pt-PT' | 'pt-BR' | 'en';

export const LOCALE_META: Record<Locale, {
  language: Language; intl: string; hreflang: string; label: string; country: string;
  currency: string; timezone: string; taxRateBps: number; taxLabel: string;
}> = {
  'fr-ch': { language: 'fr', intl: 'fr-CH', hreflang: 'fr-CH', label: 'Suisse · Français', country: 'CH', currency: 'CHF', timezone: 'Europe/Zurich', taxRateBps: 0, taxLabel: 'TVA' },
  'fr-fr': { language: 'fr-FR', intl: 'fr-FR', hreflang: 'fr-FR', label: 'France · Français', country: 'FR', currency: 'EUR', timezone: 'Europe/Paris', taxRateBps: 0, taxLabel: 'TVA' },
  'pt-pt': { language: 'pt-PT', intl: 'pt-PT', hreflang: 'pt-PT', label: 'Portugal · Português', country: 'PT', currency: 'EUR', timezone: 'Europe/Lisbon', taxRateBps: 0, taxLabel: 'IVA' },
  'pt-br': { language: 'pt-BR', intl: 'pt-BR', hreflang: 'pt-BR', label: 'Brasil · Português', country: 'BR', currency: 'BRL', timezone: 'America/Sao_Paulo', taxRateBps: 0, taxLabel: 'Impostos' },
};

export function isLocale(v: string | undefined | null): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

/** Dictionary fallback chain; 'fr' is the source language (keys are French). */
export const LANGUAGE_FALLBACK: Record<Language, Language[]> = {
  fr: [],
  'fr-FR': [],
  'pt-PT': [],
  'pt-BR': ['pt-PT'],
  en: [],
};

/**
 * Localised URL segments. Internal routes use the English key; visitors see the
 * translated segment. Only the first path segment after the locale is translated.
 */
type Seg = Record<'fr' | 'pt-PT' | 'pt-BR', string>;
export const SEGMENTS: Record<string, Seg> = {
  templates: { fr: 'modeles', 'pt-PT': 'modelos', 'pt-BR': 'modelos' },
  websites: { fr: 'sites-web', 'pt-PT': 'sites', 'pt-BR': 'sites' },
  ecommerce: { fr: 'e-commerce', 'pt-PT': 'lojas-online', 'pt-BR': 'lojas-virtuais' },
  software: { fr: 'logiciels', 'pt-PT': 'software', 'pt-BR': 'software' },
  automation: { fr: 'automatisation', 'pt-PT': 'automacao', 'pt-BR': 'automacao' },
  custom: { fr: 'sur-mesure', 'pt-PT': 'sob-medida', 'pt-BR': 'sob-medida' },
  work: { fr: 'realisations', 'pt-PT': 'projetos', 'pt-BR': 'projetos' },
  contact: { fr: 'contact', 'pt-PT': 'contacto', 'pt-BR': 'contato' },
  quote: { fr: 'devis', 'pt-PT': 'orcamento', 'pt-BR': 'orcamento' },
  blog: { fr: 'blog', 'pt-PT': 'blog', 'pt-BR': 'blog' },
  cart: { fr: 'panier', 'pt-PT': 'carrinho', 'pt-BR': 'carrinho' },
  checkout: { fr: 'commande', 'pt-PT': 'checkout', 'pt-BR': 'checkout' },
  account: { fr: 'compte', 'pt-PT': 'conta', 'pt-BR': 'conta' },
  login: { fr: 'connexion', 'pt-PT': 'entrar', 'pt-BR': 'entrar' },
  register: { fr: 'inscription', 'pt-PT': 'registo', 'pt-BR': 'cadastro' },
  'forgot-password': { fr: 'mot-de-passe-oublie', 'pt-PT': 'recuperar-password', 'pt-BR': 'recuperar-senha' },
  'reset-password': { fr: 'nouveau-mot-de-passe', 'pt-PT': 'nova-password', 'pt-BR': 'nova-senha' },
  legal: { fr: 'legal', 'pt-PT': 'legal', 'pt-BR': 'legal' },
  lp: { fr: 'offres', 'pt-PT': 'ofertas', 'pt-BR': 'ofertas' },
  admin: { fr: 'admin', 'pt-PT': 'admin', 'pt-BR': 'admin' },
  app: { fr: 'app', 'pt-PT': 'app', 'pt-BR': 'app' },
};

function segLang(locale: Locale): 'fr' | 'pt-PT' | 'pt-BR' {
  const l = LOCALE_META[locale].language;
  return l === 'pt-PT' || l === 'pt-BR' ? l : 'fr';
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
