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
  label: 'text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#6b4a57]',
  input:
    'w-full rounded-full border border-[#3d2330]/25 bg-[#fffaf7] px-5 py-3 text-base text-[#3d2330] placeholder:text-[#3d2330]/45 focus:border-[#a4533c] focus:outline-none focus:ring-4 focus:ring-[#a4533c]/15 aria-[invalid=true]:border-[#b0263a] [textarea&]:rounded-3xl',
  hint: 'text-xs text-[#6b4a57]',
  error: 'text-sm font-medium text-[#a51f33]',
  chip: 'cursor-pointer rounded-full border border-[#3d2330]/25 bg-[#fffaf7] px-4 py-2 text-sm text-[#3d2330] peer-checked:border-[#3d2330] peer-checked:bg-[#3d2330] peer-checked:text-[#fbeee8] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#a4533c]',
  check: 'mt-0.5 size-5 shrink-0 accent-[#a4533c]',
  button:
    'inline-flex w-full items-center justify-center rounded-full bg-[#3d2330] px-9 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#fbeee8] transition hover:bg-[#a4533c] sm:w-auto',
  success: 'rounded-[2rem] bg-[#3d2330] p-8 text-[#fbeee8]',
  successTitle: 'font-[family-name:var(--serif)] text-3xl italic',
  reset: 'mt-5 text-xs uppercase tracking-[0.2em] underline underline-offset-4',
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
