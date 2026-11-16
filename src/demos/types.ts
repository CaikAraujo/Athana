import type { ComponentType } from 'react';

export type DemoMeta = {
  slug: string;
  name: string;
  /** Language of the demo content. */
  language: 'fr' | 'pt';
  /** In-demo pages. key '' is the home page; others are reachable at /demo/<slug>/<key>. */
  pages: { key: string; label: string }[];
};

export type DemoModule = { meta: DemoMeta; default: ComponentType<{ page: string }> };
