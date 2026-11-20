'use client';

import { useFieldError } from '@/components/ui/form';

const LANGS = [['fr', 'FR'], ['de', 'DE'], ['pt-PT', 'PT'], ['en', 'EN']] as const;

/** One input per language for a localised value; submits "<name>.fr", "<name>.pt-PT", "<name>.pt-BR". */
export function I18nInput({ label, name, value, multiline, rows = 3, hint }: { label: string; name: string; value?: unknown; multiline?: boolean; rows?: number; hint?: string }) {
  const v = (value ?? {}) as Record<string, string>;
  const error = useFieldError(`${name}.fr`);
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {LANGS.map(([l, short]) => (
          <label key={l} className="relative block">
            <span className="muted absolute right-2 top-1.5 text-[10px] font-semibold">{short}</span>
            {multiline
              ? <textarea name={`${name}.${l}`} defaultValue={v[l] ?? ''} rows={rows} className="textarea pr-8" aria-label={`${label} (${short})`} />
              : <input name={`${name}.${l}`} defaultValue={v[l] ?? ''} className="input pr-8" aria-label={`${label} (${short})`} />}
          </label>
        ))}
      </div>
      {hint && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error">{error}</p>}
    </fieldset>
  );
}

/** Localised list (one item per line, same line order in each language). */
export function I18nLines({ label, name, value, hint }: { label: string; name: string; value?: unknown; hint?: string }) {
  const items = (Array.isArray(value) ? value : []) as Record<string, string>[];
  const joined = Object.fromEntries(LANGS.map(([l]) => [l, items.map((i) => i[l] ?? '').join('\n').replace(/\n+$/, '')]));
  return <I18nInput label={label} name={name} value={joined} multiline rows={Math.max(4, items.length + 1)} hint={hint} />;
}

/** One decimal input per currency; submits "<name>.CHF"… Empty = not sold in that currency. */
export function PriceInputs({ label, name, value, currencies, hint }: { label: string; name: string; value?: unknown; currencies: string[]; hint?: string }) {
  const v = (value ?? {}) as Record<string, number>;
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {currencies.map((c) => (
          <label key={c} className="relative block w-32">
            <span className="muted absolute right-2 top-3 text-[11px] font-semibold">{c}</span>
            <input name={`${name}.${c}`} defaultValue={v[c] != null ? (v[c] / 100).toString() : ''} inputMode="decimal" className="input pr-11" aria-label={`${label} ${c}`} />
          </label>
        ))}
      </div>
      {hint && <p className="field-hint">{hint}</p>}
    </fieldset>
  );
}
