import frFR from './messages/fr-FR.json';
import ptPT from './messages/pt-PT.json';
import ptBR from './messages/pt-BR.json';
import en from './messages/en.json';
import type { Language } from './config';

export type Dictionary = Record<string, string>;

export const DICTIONARIES: Record<Language, Dictionary> = {
  fr: {},
  'fr-FR': frFR as Dictionary,
  'pt-PT': ptPT as Dictionary,
  'pt-BR': ptBR as Dictionary,
  en: en as Dictionary,
};
