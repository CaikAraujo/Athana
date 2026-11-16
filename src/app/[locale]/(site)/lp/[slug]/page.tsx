import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { pageMeta } from '@/lib/seo';
import { campaign } from '@/modules/content/campaigns';
import { LeadForm } from '@/components/site/LeadForm';
import { UtmCapture } from '@/components/site/UtmCapture';

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale: l, slug } = await params;
  const locale = assertLocale(l);
  const c = campaign(slug, await getT(locale));
  return c ? pageMeta(locale, `/lp/${slug}`, c.title, c.lead, { noindex: true }) : {};
}

export default async function CampaignPage({ params }: Props) {
  const { locale: l, slug } = await params;
  const locale = assertLocale(l);
  const t = await getT(locale);
  const c = campaign(slug, t);
  if (!c) notFound();
  return (
    <section className="relative overflow-hidden">
      <UtmCapture />
      <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" aria-hidden />
      <div className="container-page relative grid gap-10 py-14 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:py-20">
        <div>
          <h1 className="h-display" style={{ fontSize: 'clamp(2rem, 4.6vw, 3.4rem)' }}>{c.title}</h1>
          <p className="lead mt-5">{c.lead}</p>
          <ul className="mt-7 space-y-3 text-fg-soft">{c.bullets.map((b) => <li key={b} className="flex gap-3"><Check size={18} className="mt-1 shrink-0 text-gold-400" aria-hidden />{b}</li>)}</ul>
          <a className="btn btn-primary btn-lg mt-8" href={localePath(locale, c.cta.href)}>{c.cta.label}</a>
        </div>
        <div className="card card-pad">
          <h2 className="mb-4 text-xl font-semibold">{t('Être rappelé ou recevoir une proposition')}</h2>
          <LeadForm kind="campaign" interest={c.interest} compact />
        </div>
      </div>
    </section>
  );
}
