import { getT } from '@/i18n/server';
import { localePath, type Locale } from '@/i18n/config';
import { getSetting } from '@/lib/settings';
import { Logo } from './Logo';
import { LanguageSwitcher } from './HeaderClient';
import { ConsentSettingsButton } from './Consent';

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getT(locale);
  const company = await getSetting('company');
  const p = (path: string) => localePath(locale, path);
  const cols: { title: string; links: [string, string][] }[] = [
    { title: 'ATHANA Web', links: [[t('Modèles de sites'), '/templates'], [t('Sites web'), '/websites'], [t('E-commerce'), '/ecommerce'], [t('Réalisations'), '/work']] },
    { title: 'ATHANA Software', links: [[t('Tous les logiciels'), '/software'], ['ATHANA CRM', '/software/crm'], ['ATHANA Pointage', '/software/pointage']] },
    { title: t('Services'), links: [[t('Automatisation & IA'), '/automation'], [t('Développement sur mesure'), '/custom'], [t('Demander un devis'), '/quote'], [t('Blog'), '/blog']] },
    { title: t('Entreprise'), links: [[t('Contact'), '/contact'], [t('Mentions légales'), '/legal/mentions-legales'], [t('Confidentialité'), '/legal/confidentialite'], [t('Conditions générales'), '/legal/cgv'], [t('Cookies'), '/legal/cookies']] },
  ];
  return (
    <footer className="no-print mt-24 border-t border-line bg-ink-900">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.3fr_repeat(4,1fr)]">
        <div>
          <Logo />
          <p className="muted mt-4 max-w-xs text-sm">{t('Sites web, boutiques en ligne, logiciels et applications professionnelles. Conçu en Suisse, livré à l’international.')}</p>
          <address className="muted mt-4 text-sm not-italic">
            {company.address && <>{company.address}<br />{company.postalCode} {company.city}<br /></>}
            <a className="hover:text-gold-300" href={`mailto:${company.email}`}>{company.email}</a>
            {company.phone && <><br /><a className="hover:text-gold-300" href={`tel:${company.phone.replace(/\s/g, '')}`}>{company.phone}</a></>}
          </address>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="mb-3 font-sans text-sm font-semibold tracking-normal text-fg">{c.title}</h2>
            <ul className="space-y-2 text-sm">
              {c.links.map(([label, href]) => <li key={href}><a className="muted no-underline transition-colors hover:text-gold-300" href={p(href)}>{label}</a></li>)}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-5 text-sm">
          <p className="muted">© {new Date().getFullYear()} {company.legalName}. {t('Tous droits réservés.')}</p>
          <div className="flex items-center gap-5">
            <ConsentSettingsButton />
            {company.linkedin && <a className="muted hover:text-gold-300" href={company.linkedin} rel="noopener noreferrer" target="_blank">LinkedIn</a>}
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </footer>
  );
}
