import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './i18n/routing';
import { resources } from './i18n/resources';

if (!i18n.isInitialized) {
    i18n
        .use(LanguageDetector)
        .use(initReactI18next)
        .init({
            resources,
            fallbackLng: DEFAULT_LOCALE,
            supportedLngs: SUPPORTED_LOCALES,
            interpolation: {
                escapeValue: false,
            },
            detection: {
                order: ['path', 'localStorage', 'navigator'],
                lookupFromPathIndex: 0,
                caches: ['localStorage'],
            },
        });
}

export default i18n;
