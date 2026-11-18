'use client';

import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { ActionForm, Submit } from '@/components/ui/form';
import { useLocale, useT } from '@/i18n/client';
import { formatMoney } from '@/i18n/translate';
import { track } from '@/modules/analytics/track';
import { addToCartAction } from '@/modules/orders/actions';

export type ConfigPackage = { id: string; tier: string; name: string; description: string; features: string[]; price: number; deliveryDays: number; pagesIncluded: number; revisions: number };
export type ConfigAddon = { id: string; name: string; description: string; price: number };

/** Package + add-on selector. Prices shown here are informative: the server re-prices everything in the cart. */
export function Configurator({ productId, productName, currency, packages, addons }: { productId: string; productName: string; currency: string; packages: ConfigPackage[]; addons: ConfigAddon[] }) {
  const t = useT();
  const locale = useLocale();
  const [pkg, setPkg] = useState(packages[Math.min(1, packages.length - 1)]?.id ?? '');
  const [selected, setSelected] = useState<string[]>([]);
  const current = packages.find((p) => p.id === pkg);
  const total = useMemo(() => (current?.price ?? 0) + addons.filter((a) => selected.includes(a.id)).reduce((s, a) => s + a.price, 0), [current, addons, selected]);
  if (!packages.length) return <p className="alert alert-warn">{t('Ce modèle n’est pas encore disponible à la vente dans votre pays.')}</p>;
  return (
    <ActionForm action={addToCartAction} id="configurer">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="productId" value={productId} />
      <fieldset>
        <legend className="mb-3 text-lg font-semibold">{t('1. Choisissez votre pack')}</legend>
        <div className="grid gap-4 lg:grid-cols-3">
          {packages.map((p) => {
            const active = p.id === pkg;
            return (
              <label key={p.id} className={`card relative flex cursor-pointer flex-col p-5 transition-colors ${active ? 'border-accent-600! bg-accent-500/8 ring-1 ring-accent-600' : 'hover:border-line-strong'}`}>
                <input type="radio" name="packageId" value={p.id} checked={active} onChange={() => setPkg(p.id)} className="sr-only" />
                <span className="flex items-center justify-between gap-2">
                  <span className="font-display text-lg font-semibold">{p.name}</span>
                  <span aria-hidden className={`grid h-5 w-5 place-items-center rounded-full border ${active ? 'border-accent-500 bg-accent-600 text-white' : 'border-line-strong'}`}>{active && <Check size={13} />}</span>
                </span>
                <span className="mt-2 font-display text-2xl font-semibold">{formatMoney(p.price, currency, locale)}</span>
                <span className="muted mt-2 text-sm">{p.description}</span>
                <ul className="mt-4 space-y-1.5 text-sm text-fg-soft">
                  {p.features.map((f) => <li key={f} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-accent-600" aria-hidden />{f}</li>)}
                </ul>
                <span className="muted mt-4 border-t border-line pt-3 text-xs">
                  {t('Jusqu’à {n} pages', { n: p.pagesIncluded })} · {t('{n} cycle(s) de révision', { n: p.revisions })} · {t('env. {n} jours ouvrés', { n: p.deliveryDays })}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      {addons.length > 0 && (
        <fieldset className="mt-8">
          <legend className="mb-3 text-lg font-semibold">{t('2. Ajoutez des options (facultatif)')}</legend>
          <div className="grid gap-3 md:grid-cols-2">
            {addons.map((a) => {
              const on = selected.includes(a.id);
              return (
                <label key={a.id} className={`panel flex cursor-pointer items-start gap-3 p-4 transition-colors ${on ? 'border-accent-600! bg-accent-500/8 ring-1 ring-accent-600' : ''}`}>
                  <input type="checkbox" name="addonIds" value={a.id} checked={on} onChange={(e) => setSelected((s) => (e.target.checked ? [...s, a.id] : s.filter((x) => x !== a.id)))} className="check mt-1" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3"><span className="font-medium">{a.name}</span><span className="shrink-0 text-sm text-fg-soft">+ {formatMoney(a.price, currency, locale)}</span></span>
                    <span className="muted block text-sm">{a.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
      <div className="sticky bottom-3 z-20 mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line-strong bg-ink-850/95 p-4 shadow-[0_18px_40px_-18px_rgb(15_23_42/0.35)] backdrop-blur-md">
        <div>
          <p className="muted text-xs uppercase tracking-wider">{t('Total estimé')}</p>
          <p className="font-display text-2xl font-semibold" aria-live="polite">{formatMoney(total, currency, locale)}</p>
        </div>
        <span onClick={() => track('add_to_cart', { item_id: productId, item_name: productName, value: total / 100, currency })}>
          <Submit className="btn btn-primary btn-lg">{t('Acheter maintenant')}</Submit>
        </span>
      </div>
    </ActionForm>
  );
}
