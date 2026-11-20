import { assertLocale, getT } from '@/i18n/server';
import { getSetting } from '@/lib/settings';
import { pageMeta, Breadcrumbs } from '@/lib/seo';
import { PageHero } from '@/components/site/Section';
import { LeadForm } from '@/components/site/LeadForm';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const t = await getT(locale);
  return pageMeta(locale, '/quote', t('Demande de devis — site web, application, logiciel'), t('Demandez un devis gratuit pour la création d’un site internet, d’une boutique en ligne ou d’une application sur mesure.'));
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const t = await getT(locale);
  const company = await getSetting('company');
  return (
    <>
      <PageHero eyebrow={t('Demander un devis')} title={t('Demandez un devis gratuit')} lead={t('Décrivez votre projet en quelques lignes. Nous revenons vers vous avec une proposition claire : périmètre, budget et délai.')} />
      <div className="container-page py-10">
        <Breadcrumbs locale={locale} items={[[t('Accueil'), '/'], [t('Demander un devis'), '/quote']]} />
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div className="card card-pad"><LeadForm kind="quote" /></div>
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
