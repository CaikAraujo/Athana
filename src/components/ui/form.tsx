'use client';

import { createContext, useActionState, useContext, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { ActionState } from '@/lib/action';

type Action = (prev: ActionState, fd: FormData) => Promise<ActionState>;
const FormCtx = createContext<ActionState>(null);

/**
 * Standard form wired to a server action: pending state, field errors, success / error message.
 * `onSuccess="reset"` clears the form; `successMessage` overrides the default confirmation.
 */
export function ActionForm({ action, children, className, successMessage, resetOnSuccess, onDone, id }: {
  action: Action; children: React.ReactNode; className?: string; successMessage?: string; resetOnSuccess?: boolean; onDone?: (s: NonNullable<ActionState>) => void; id?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) {
      if (resetOnSuccess) ref.current?.reset();
      onDone?.(state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
  return (
    <FormCtx.Provider value={state}>
      <form ref={ref} id={id} action={formAction} className={className} noValidate={false}>
        {children}
        {state && !state.ok && state.message && <p role="alert" className="alert alert-danger mt-4">{state.message}</p>}
        {state?.ok && (state.message || successMessage) && <p role="status" className="alert alert-ok mt-4">{state.message || successMessage}</p>}
      </form>
    </FormCtx.Provider>
  );
}

export function useFieldError(name: string) {
  return useContext(FormCtx)?.fieldErrors?.[name];
}

export function Field({ label, name, hint, required, children }: { label: string; name: string; hint?: string; required?: boolean; children?: React.ReactNode }) {
  const error = useFieldError(name);
  return (
    <div>
      <label className="label" htmlFor={`f-${name}`}>{label}{required && <span aria-hidden className="text-accent-600"> *</span>}</label>
      {children}
      {hint && !error && <p className="field-hint">{hint}</p>}
      {error && <p className="field-error" id={`e-${name}`}>{error}</p>}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string; hint?: string };
export function Input({ label, name, hint, required, className, ...rest }: InputProps) {
  const error = useFieldError(name);
  return (
    <Field label={label} name={name} hint={hint} required={required}>
      <input id={`f-${name}`} name={name} required={required} aria-invalid={error ? true : undefined} aria-describedby={error ? `e-${name}` : undefined} className={`input ${className ?? ''}`} {...rest} />
    </Field>
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; name: string; hint?: string };
export function Textarea({ label, name, hint, required, className, ...rest }: TextareaProps) {
  const error = useFieldError(name);
  return (
    <Field label={label} name={name} hint={hint} required={required}>
      <textarea id={`f-${name}`} name={name} required={required} aria-invalid={error ? true : undefined} className={`textarea ${className ?? ''}`} {...rest} />
    </Field>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; name: string; hint?: string; options: { value: string; label: string }[] };
export function Select({ label, name, hint, required, options, className, ...rest }: SelectProps) {
  const error = useFieldError(name);
  return (
    <Field label={label} name={name} hint={hint} required={required}>
      <select id={`f-${name}`} name={name} required={required} aria-invalid={error ? true : undefined} className={`select ${className ?? ''}`} {...rest}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

export function Checkbox({ label, name, defaultChecked, required, value }: { label: React.ReactNode; name: string; defaultChecked?: boolean; required?: boolean; value?: string }) {
  const error = useFieldError(name);
  return (
    <div>
      <label className="flex items-start gap-3 text-sm text-fg-soft cursor-pointer">
        <input type="checkbox" name={name} value={value ?? 'on'} defaultChecked={defaultChecked} required={required} className="check mt-0.5" />
        <span>{label}</span>
      </label>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export function Submit({ children, className = 'btn btn-primary', name, value }: { children: React.ReactNode; className?: string; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending} name={name} value={value}>
      {pending && <span className="spinner" aria-hidden />}
      {children}
    </button>
  );
}

/** One-click server action button (status changes, deletes…) with optional confirmation and inline error. */
export function ActionButton({ action, fields, children, className = 'btn btn-outline btn-sm', confirm }: {
  action: Action; fields?: Record<string, string>; children: React.ReactNode; className?: string; confirm?: string;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className="inline-flex flex-col items-start gap-1" onSubmit={(e) => { if (confirm && !window.confirm(confirm)) e.preventDefault(); }}>
      {fields && Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <Submit className={className}>{children}</Submit>
      {state && !state.ok && state.message && <span role="alert" className="field-error">{state.message}</span>}
    </form>
  );
}

/** Accessible modal built on the native <dialog>. */
export function Modal({ trigger, triggerClassName = 'btn btn-primary btn-sm', title, children }: { trigger: React.ReactNode; triggerClassName?: string; title: string; children: React.ReactNode | ((close: () => void) => React.ReactNode) }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => { ref.current?.close(); setOpen(false); };
  return (
    <>
      <button type="button" className={triggerClassName} onClick={() => { setOpen(true); ref.current?.showModal(); }}>{trigger}</button>
      <dialog ref={ref} onClose={() => setOpen(false)} onClick={(e) => { if (e.target === ref.current) close(); }} className="m-auto w-[min(92vw,560px)] rounded-2xl border border-line-strong bg-ink-850 p-0 text-fg">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button type="button" onClick={close} className="btn btn-ghost btn-sm" aria-label="×">✕</button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{open && (typeof children === 'function' ? children(close) : children)}</div>
      </dialog>
    </>
  );
}
