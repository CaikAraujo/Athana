import type { ReactNode } from 'react';
import { Reveal } from './Consent';

export function Section({ eyebrow, title, lead, children, id, className = '', center }: { eyebrow?: string; title?: string; lead?: string; children?: ReactNode; id?: string; className?: string; center?: boolean }) {
  return (
    <section id={id} className={`py-14 md:py-20 ${className}`}>
      <div className="container-page">
        {(eyebrow || title) && (
          <Reveal className={`mb-10 md:mb-12 ${center ? 'mx-auto max-w-2xl text-center' : 'grid gap-4 md:grid-cols-[1.4fr_1fr] md:items-end md:gap-12'}`}>
            <div>
              {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
              {title && <h2 className="h-section">{title}</h2>}
            </div>
            {lead && <p className={`lead ${center ? 'mt-4' : ''}`}>{lead}</p>}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

export function PageHero({ eyebrow, title, lead, children }: { eyebrow?: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <section className="border-b border-line-strong">
      <div className="container-page grid gap-8 py-12 md:grid-cols-[1.5fr_1fr] md:items-end md:py-16">
        <div>
          {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
          <h1 className="h-display" style={{ fontSize: 'clamp(2.3rem, 5.2vw, 4.2rem)' }}>{title}</h1>
        </div>
        <div>
          {lead && <p className="lead">{lead}</p>}
          {children && <div className="mt-6 flex flex-wrap gap-3">{children}</div>}
        </div>
      </div>
    </section>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="mx-auto max-w-3xl rule-list border-0 bg-transparent">
      {items.map((f) => (
        <details key={f.q} className="group py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-medium">
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
      <div className="section-dark grid gap-8 rounded-xl px-6 py-10 md:grid-cols-[1.5fr_auto] md:items-end md:px-12 md:py-14">
        <div>
          <h2 className="h-section max-w-2xl">{title}</h2>
          {lead && <p className="lead mt-4 max-w-xl">{lead}</p>}
        </div>
        <div className="flex flex-wrap gap-3">{children}</div>
      </div>
    </section>
  );
}
