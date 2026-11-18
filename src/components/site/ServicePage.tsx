import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { localePath, type Locale } from '@/i18n/config';
import type { TFn } from '@/i18n/translate';
import { env } from '@/lib/env';
import { Breadcrumbs, JsonLd } from '@/lib/seo';
import { PageHero, Section, FaqList } from './Section';
import { Reveal } from './Consent';
import { LeadForm } from './LeadForm';

export type ServiceContent = {
  path: string; eyebrow: string; title: string; lead: string; serviceType: string;
  primary: { href: string; label: string }; secondary?: { href: string; label: string };
  featuresTitle: string; features: { title: string; text: string }[];
  includedTitle?: string; included?: string[];
  stepsTitle?: string; steps?: [string, string][];
  faq?: { q: string; a: string }[];
  formTitle: string; interest: string;
};

/** Shared layout of the commercial service pages (hero → features → inclusions → process → FAQ → lead form). */
export function ServicePage({ c, locale, t, children }: { c: ServiceContent; locale: Locale; t: TFn; children?: ReactNode }) {
  const p = (path: string) => localePath(locale, path);
  return (
    <>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Service', name: c.title, description: c.lead, serviceType: c.serviceType, provider: { '@type': 'Organization', name: 'ATHANA', url: env.appUrl }, areaServed: ['CH', 'FR', 'PT', 'BR'], url: env.appUrl + p(c.path) }} />
      <PageHero eyebrow={c.eyebrow} title={c.title} lead={c.lead}>
        <a className="btn btn-primary btn-lg" href={p(c.primary.href)}>{c.primary.label}</a>
        {c.secondary && <a className="btn btn-outline btn-lg" href={c.secondary.href.startsWith('#') ? c.secondary.href : p(c.secondary.href)}>{c.secondary.label}</a>}
      </PageHero>
      <div className="container-page pt-8"><Breadcrumbs locale={locale} items={[[t('Accueil'), '/'], [c.eyebrow, c.path]]} /></div>
      <Section title={c.featuresTitle} className="pt-8!">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {c.features.map((f) => <Reveal key={f.title} className="panel p-6"><h3 className="text-lg font-semibold">{f.title}</h3><p className="muted mt-2 text-sm">{f.text}</p></Reveal>)}
        </div>
      </Section>
      {children}
      {c.included && (
        <Section title={c.includedTitle} className="border-y border-line bg-ink-900">
          <ul className="grid gap-3 sm:grid-cols-2">{c.included.map((x) => <li key={x} className="flex gap-3 text-fg-soft"><Check size={18} className="mt-1 shrink-0 text-accent-600" aria-hidden />{x}</li>)}</ul>
        </Section>
      )}
      {c.steps && (
        <Section title={c.stepsTitle}>
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{c.steps.map(([title, text], i) => <li key={title} className="rounded-2xl border border-line bg-ink-850 p-6"><span className="font-display text-3xl font-semibold text-accent-500">{String(i + 1).padStart(2, '0')}</span><h3 className="mt-2 text-lg font-semibold">{title}</h3><p className="muted mt-2 text-sm">{text}</p></li>)}</ol>
        </Section>
      )}
      {c.faq && c.faq.length > 0 && (
        <Section title={t('Questions fréquentes')} center>
          <FaqList items={c.faq} />
          <JsonLd data={{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: c.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }} />
        </Section>
      )}
      <Section id="contact" title={c.formTitle} className="border-t border-line bg-ink-900">
        <div className="card card-pad max-w-3xl"><LeadForm kind="quote" interest={c.interest} /></div>
      </Section>
    </>
  );
}
