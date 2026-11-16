import type { ReactNode } from 'react';

/** Server-safe presentational primitives of the design system. */

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold md:text-[1.75rem]">{title}</h1>
        {subtitle && <p className="muted mt-1 text-sm">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, actions, children, className = '' }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`panel p-5 ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="panel stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {hint && <div className="muted mt-1 text-xs">{hint}</div>}
    </div>
  );
}

export function Badge({ tone = 'neutral', children }: { tone?: 'neutral' | 'gold' | 'ok' | 'warn' | 'danger' | 'info'; children: ReactNode }) {
  return <span className={`badge ${tone === 'neutral' ? '' : `badge-${tone}`}`}>{children}</span>;
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <p className="font-medium text-fg-soft">{title}</p>
      {children && <div className="mt-3 text-sm">{children}</div>}
    </div>
  );
}

export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Table({ head, children, empty }: { head: ReactNode[]; children: ReactNode; empty?: ReactNode }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr>{head.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
      {empty}
    </div>
  );
}

export function DefList({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-[minmax(120px,max-content)_1fr]">
      {items.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="muted">{k}</dt>
          <dd className="min-w-0 break-words">{v || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Skeleton({ className = 'h-24 w-full' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-busy="true">
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-4 md:grid-cols-3"><Skeleton /><Skeleton /><Skeleton /></div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
