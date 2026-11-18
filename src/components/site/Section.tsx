import type { ReactNode } from 'react';
import { Reveal } from './Consent';

/** A section of a public page: heading on the left line, content below; separated from its neighbours by ground or space. */
export function Section({ eyebrow, title, lead, children, id, className = '', action }: { eyebrow?: string; title?: string; lead?: string; children?: ReactNode; id?: string; className?: string; action?: ReactNode }) {
  return (
    <section id={id} className={`screen screen--auto ${className}`}>
      <div className="container-page">
        {(eyebrow || title) && (
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-x-12 gap-y-6 md:mb-14">
            <div className="max-w-3xl">
              {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
              {title && <h2 className="h-section">{title}</h2>}
              {lead && <p className="lead mt-5">{lead}</p>}
            </div>
            {action}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}

/** Opening block of an inner page. */
export function PageHero({ eyebrow, title, lead, children }: { eyebrow?: string; title: string; lead?: string; children?: ReactNode }) {
  return (
    <section className="pb-10 pt-14 md:pb-14 md:pt-24">
      <div className="container-page" data-enter>
        {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
        <h1 className="h-display max-w-[18ch]">{title}</h1>
        {lead && <p className="lead mt-6">{lead}</p>}
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="grid max-w-4xl gap-2">
      {items.map((f) => (
        <details key={f.q} className="faq group rounded-xl bg-ink-900 px-5 py-4 md:px-6 md:py-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium">
            {f.q}
            <span aria-hidden className="text-2xl font-light leading-none text-fg-muted transition-transform duration-300 group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 max-w-3xl text-fg-soft">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function CtaBand({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <section className="section-dark screen screen--auto">
      <div className="container-page">
        <h2 className="h-display max-w-[20ch]">{title}</h2>
        {lead && <p className="lead mt-6">{lead}</p>}
        <div className="mt-9 flex flex-wrap gap-3">{children}</div>
      </div>
    </section>
  );
}
