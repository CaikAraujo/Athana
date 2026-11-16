export const SUPPORTED_LOCALES = ['fr', 'en', 'de', 'it'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'fr';

export const isLocale = (value: string | undefined): value is AppLocale => {
    return !!value && SUPPORTED_LOCALES.includes(value as AppLocale);
};

export const stripLocalePrefix = (pathname: string) => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length > 0 && isLocale(segments[0])) {
        return '/' + segments.slice(1).join('/');
    }
    return pathname;
};

export const withLocalePath = (locale: string, path: string) => {
    const normalizedLocale = isLocale(locale) ? locale : DEFAULT_LOCALE;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const withoutLocale = stripLocalePrefix(cleanPath);
    const finalPath = withoutLocale === '/' ? '' : withoutLocale;
    return `/${normalizedLocale}${finalPath}`;
};
