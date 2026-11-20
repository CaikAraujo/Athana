import { assertLocale, getT } from '@/i18n/server';
import { getSetting } from '@/lib/settings';
import { pageMeta, Breadcrumbs } from '@/lib/seo';
import { PageHero } from '@/components/site/Section';
import { LeadForm } from '@/components/site/LeadForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const t = await getT(locale);
  return pageMeta(locale, '/contact', t('Contact — ATHANA'), t('Contactez ATHANA pour votre site web, votre boutique en ligne, un logiciel ou un développement sur mesure.'));
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const t = await getT(locale);
  const company = await getSetting('company');
  return (
    <>
      <PageHero eyebrow={t('Contact')} title={t('Parlons de votre projet')} lead={t('Une question, un besoin précis ou une idée à valider ? Écrivez-nous : nous répondons rapidement.')} />
      <div className="container-page py-10">
        <Breadcrumbs locale={locale} items={[[t('Accueil'), '/'], [t('Contact'), '/contact']]} />
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="card card-pad"><LeadForm kind="contact" /></div>
          <aside className="space-y-5 text-fg-soft">
            <h2 className="text-xl font-medium text-fg">{t('Nos coordonnées')}</h2>
            <p><a className="hover:text-accent-700" href={`mailto:${company.email}`}>{company.email}</a></p>
            {company.phone && <p><a className="hover:text-accent-700" href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a></p>}
            {company.address && <p><span>{company.address}<br />{company.postalCode} {company.city}</span></p>}
            {company.whatsapp && <a className="btn btn-outline" href={`https://wa.me/${company.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          </aside>
        </div>
      </div>
    </>
  );
}
