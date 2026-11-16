'use client';

import { useId, useState, type FormEvent } from 'react';

export type Field = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'number' | 'select' | 'textarea' | 'chips' | 'checkbox';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  hint?: string;
  /** Takes half the width on wide screens. */
  half?: boolean;
  min?: number;
  max?: number;
};

const T = {
  label: 'font-display text-xs font-semibold uppercase tracking-[0.12em] text-[#15171c]',
  input:
    'w-full rounded-none border border-[#15171c]/25 bg-white px-4 py-3 text-base text-[#15171c] placeholder:text-[#15171c]/45 focus:border-[#15171c] focus:outline-none focus:shadow-[inset_0_-3px_0_#d52b1e] aria-[invalid=true]:border-[#b3201a]',
  hint: 'text-xs text-[#15171c]/65',
  error: 'text-sm font-medium text-[#b3201a]',
  chip: 'cursor-pointer border border-[#15171c]/25 bg-white px-4 py-2.5 text-sm font-medium text-[#15171c] peer-checked:border-[#15171c] peer-checked:bg-[#15171c] peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#d52b1e]',
  check: 'mt-0.5 size-5 shrink-0 accent-[#d52b1e]',
  button:
    'inline-flex w-full items-center justify-center bg-[#d52b1e] px-8 py-4 font-display text-sm font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-[#15171c] sm:w-auto',
  success: 'border-l-4 border-[#d52b1e] bg-[#f3f1ec] p-6 text-[#15171c]',
  successTitle: 'font-display text-2xl font-bold',
  reset: 'mt-4 text-sm font-semibold underline underline-offset-4',
};

function check(f: Field, raw: string): string | null {
  const v = raw.trim();
  if (f.type === 'checkbox') return f.required && v !== 'oui' ? 'Veuillez cocher cette case pour continuer.' : null;
  if (!v) return f.required ? 'Ce champ est obligatoire.' : null;
  if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Veuillez saisir une adresse e-mail valide.';
  if (f.type === 'tel' && !/^\+?[\d\s().-]{7,}$/.test(v)) return 'Veuillez saisir un numéro de téléphone valide.';
  if (f.type === 'date') {
    const d = new Date(`${v}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(d.getTime())) return 'Veuillez saisir une date valide.';
    if (d < today) return 'Veuillez choisir une date à venir.';
  }
  if (f.type === 'number') {
    const n = Number(v.replace(/['\s]/g, ''));
    if (!Number.isFinite(n)) return 'Veuillez saisir un nombre.';
    if (f.min !== undefined && n < f.min) return `La valeur minimale est ${f.min}.`;
    if (f.max !== undefined && n > f.max) return `La valeur maximale est ${f.max}.`;
  }
  if (f.type === 'textarea' && v.length < 10) return 'Merci de préciser votre demande (10 caractères minimum).';
  return null;
}

export default function DemoForm({ fields, submitLabel, title }: { fields: Field[]; submitLabel: string; title: string }) {
  const uid = useId();
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const set = (f: Field, v: string) => {
    setValues((s) => ({ ...s, [f.name]: v }));
    if (errors[f.name]) {
      const msg = check(f, v);
      setErrors((s) => {
        const next = { ...s };
        if (msg) next[f.name] = msg;
        else delete next[f.name];
        return next;
      });
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    for (const f of fields) {
      const msg = check(f, values[f.name] ?? '');
      if (msg) next[f.name] = msg;
    }
    setErrors(next);
    const first = fields.find((f) => next[f.name]);
    if (first) {
      e.currentTarget.querySelector<HTMLElement>(`[name="${first.name}"]`)?.focus();
      return;
    }
    setSent(true); // Demo only: nothing is sent anywhere.
  };

  if (sent) {
    return (
      <div role="status" className={T.success}>
        <p className={T.successTitle}>Merci !</p>
        <p className="mt-2">Ceci est une démonstration : aucune donnée n&apos;a été envoyée.</p>
        <button
          type="button"
          className={T.reset}
          onClick={() => {
            setValues({});
            setErrors({});
            setSent(false);
          }}
        >
          Remplir un nouveau formulaire
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label={title} className="grid gap-5 sm:grid-cols-2">
      {fields.map((f) => {
        const id = `${uid}-${f.name}`;
        const err = errors[f.name];
        const v = values[f.name] ?? '';
        const described = [err ? `${id}-err` : '', f.hint ? `${id}-hint` : ''].filter(Boolean).join(' ') || undefined;
        const common = {
          id,
          name: f.name,
          value: v,
          'aria-invalid': err ? true : undefined,
          'aria-describedby': described,
          'aria-required': f.required || undefined,
          className: T.input,
        };
        const errorEl = err ? (
          <p id={`${id}-err`} className={T.error}>
            {err}
          </p>
        ) : null;
        const hintEl = f.hint ? (
          <p id={`${id}-hint`} className={T.hint}>
            {f.hint}
          </p>
        ) : null;
        const star = f.required ? <span aria-hidden="true"> *</span> : null;
        const span = f.half ? '' : 'sm:col-span-2';

        if (f.type === 'chips') {
          return (
            <fieldset key={f.name} className={`grid min-w-0 gap-2 ${span}`} aria-describedby={described}>
              <legend className={`${T.label} mb-2`}>
                {f.label}
                {star}
              </legend>
              <div className="flex flex-wrap gap-2">
                {(f.options ?? []).map((o) => (
                  <span key={o} className="relative">
                    <input
                      type="radio"
                      id={`${id}-${o}`}
                      name={f.name}
                      value={o}
                      checked={v === o}
                      onChange={() => set(f, o)}
                      className="peer absolute inset-0 size-full cursor-pointer opacity-0"
                    />
                    <label htmlFor={`${id}-${o}`} className={`block ${T.chip}`}>
                      {o}
                    </label>
                  </span>
                ))}
              </div>
              {hintEl}
              {errorEl}
            </fieldset>
          );
        }
        if (f.type === 'checkbox') {
          return (
            <div key={f.name} className={`grid gap-2 ${span}`}>
              <label htmlFor={id} className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  id={id}
                  name={f.name}
                  checked={v === 'oui'}
                  onChange={(e) => set(f, e.target.checked ? 'oui' : '')}
                  aria-invalid={err ? true : undefined}
                  aria-describedby={described}
                  className={T.check}
                />
                <span>
                  {f.label}
                  {star}
                </span>
              </label>
              {errorEl}
            </div>
          );
        }
        return (
          <div key={f.name} className={`grid content-start gap-2 ${span}`}>
            <label htmlFor={id} className={T.label}>
              {f.label}
              {star}
            </label>
            {f.type === 'select' ? (
              <select {...common} onChange={(e) => set(f, e.target.value)}>
                <option value="">{f.placeholder ?? 'Sélectionner…'}</option>
                {(f.options ?? []).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : f.type === 'textarea' ? (
              <textarea {...common} rows={4} placeholder={f.placeholder} onChange={(e) => set(f, e.target.value)} />
            ) : (
              <input
                {...common}
                type={f.type === 'number' ? 'text' : f.type}
                inputMode={f.type === 'number' ? 'numeric' : undefined}
                placeholder={f.placeholder}
                autoComplete={f.type === 'email' ? 'email' : f.type === 'tel' ? 'tel' : undefined}
                onChange={(e) => set(f, e.target.value)}
              />
            )}
            {hintEl}
            {errorEl}
          </div>
        );
      })}
      <div className="sm:col-span-2">
        <button type="submit" className={T.button}>
          {submitLabel}
        </button>
        <p className={`${T.hint} mt-3`}>* Champs obligatoires</p>
      </div>
    </form>
  );
}
