import type { ReactNode } from 'react';
import { Reveal } from './Consent';

export function Section({ eyebrow, title, lead, children, id, className = '', center }: { eyebrow?: string; title?: string; lead?: string; children?: ReactNode; id?: string; className?: string; center?: boolean }) {
  return (
    <section id={id} className={`py-14 md:py-20 ${className}`}>
      <div className="container-page">
        {(eyebrow || title) && (
          <Reveal className={`mb-10 max-w-2xl md:mb-14 ${center ? 'mx-auto text-center' : ''}`}>
            {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
            {title && <h2 className="h-section">{title}</h2>}
            {lead && <p className="lead mt-4">{lead}</p>}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

export function PageHero({ eyebrow, title, lead, children }: { eyebrow?: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-ink-900">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" aria-hidden />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent-500/15 blur-3xl" aria-hidden />
      <div className="container-page relative py-14 md:py-20">
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h1 className="h-display max-w-4xl" style={{ fontSize: 'clamp(2.1rem, 5vw, 3.6rem)' }}>{title}</h1>
        {lead && <p className="lead mt-5 max-w-2xl">{lead}</p>}
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-line rounded-2xl border border-line bg-ink-850 shadow-[var(--shadow-card)]">
      {items.map((f) => (
        <details key={f.q} className="group px-5 py-4 md:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
            {f.q}
            <span aria-hidden className="text-xl leading-none text-accent-600 transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="muted mt-3 text-[0.95rem]">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function CtaBand({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <section className="container-page py-12 md:py-16">
      <div className="section-dark bg-grid relative overflow-hidden rounded-[28px] px-6 py-12 text-center md:px-12 md:py-16">
        <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-56 w-[60%] rounded-full bg-accent-500/25 blur-3xl" aria-hidden />
        <h2 className="h-section relative mx-auto max-w-2xl">{title}</h2>
        {lead && <p className="lead relative mx-auto mt-4 max-w-xl">{lead}</p>}
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">{children}</div>
      </div>
    </section>
  );
}
