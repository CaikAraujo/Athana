import type { DemoModule } from './types';

/** Template demos, lazily loaded. Add a line here when a new demo folder is created. */
export const DEMOS: Record<string, () => Promise<DemoModule>> = {
  atelier: () => import('./atelier'),
  'maison-lumiere': () => import('./maison-lumiere'),
  'clinique-alba': () => import('./clinique-alba'),
  'helvetia-immo': () => import('./helvetia-immo'),
  'studio-eclat': () => import('./studio-eclat'),
  batipro: () => import('./batipro'),
  'alpina-voyages': () => import('./alpina-voyages'),
  'boutique-nord': () => import('./boutique-nord'),
  'cabinet-meridien': () => import('./cabinet-meridien'),
  'portfolio-lena': () => import('./portfolio-lena'),
};
