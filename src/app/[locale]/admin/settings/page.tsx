import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { env } from '@/lib/env';
import { getSetting } from '@/lib/settings';
import { can } from '@/modules/auth/rbac';
import { requireStaff } from '@/modules/auth/session';
import { Badge, Card, PageHeader } from '@/components/ui';
import { SettingForm } from '../ContentForms';

export default async function AdminSettings({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const staff = await requireStaff(locale, 'settings.manage');
  const t = await getT(locale);
  const [company, invoicing, security, uploads, privacy, maintenance] = await Promise.all([getSetting('company'), getSetting('invoicing'), getSetting('security'), getSetting('uploads'), getSetting('privacy'), getSetting('maintenance')]);
  const on = (ok: boolean, label: string) => <li className="flex items-center justify-between gap-3 py-2"><span>{label}</span>{ok ? <Badge tone="ok">{t('Configuré')}</Badge> : <Badge tone="warn">{t('À configurer')}</Badge>}</li>;
  const links: [string, string][] = [['/admin/settings/markets', t('Marchés, devises et taxes')], ['/admin/settings/emails', t('Modèles d’e-mails')], ...(can(staff.platformRole, 'users.manage') ? [['/admin/settings/team', t('Équipe et rôles')] as [string, string]] : [])];
  return (
    <>
      <PageHeader title={t('Paramètres')} actions={links.map(([href, label]) => <a key={href} className="btn btn-outline btn-sm" href={localePath(locale, href)}>{label}</a>)} />
      <div className="grid gap-5 xl:grid-cols-2">
        <Card title={t('Entreprise')}>
          <SettingForm settingKey="company" values={company} fields={[
            { name: 'legalName', label: t('Raison sociale') }, { name: 'email', label: t('E-mail de contact') }, { name: 'address', label: t('Adresse') }, { name: 'postalCode', label: t('Code postal') },
            { name: 'city', label: t('Ville') }, { name: 'country', label: t('Pays (code ISO)') }, { name: 'phone', label: t('Téléphone') }, { name: 'vatNumber', label: t('Numéro de TVA') },
            { name: 'registrationNumber', label: t('Numéro d’entreprise (IDE)') }, { name: 'iban', label: 'IBAN' }, { name: 'linkedin', label: 'LinkedIn' }, { name: 'whatsapp', label: 'WhatsApp' },
          ]} />
        </Card>
        <div className="space-y-5">
          <Card title={t('Intégrations')}>
            <p className="muted mb-2 text-sm">{t('Les identifiants se configurent dans les variables d’environnement du serveur, jamais ici.')}</p>
            <ul className="divide-y divide-line text-sm">
              <li className="flex items-center justify-between gap-3 py-2"><span>{t('Paiements')}</span>{env.paymentsMode === 'stripe' ? <Badge tone="ok">Stripe</Badge> : <Badge tone="warn">{t('Mode test (aucun paiement réel)')}</Badge>}</li>
              {on(!!env.stripeWebhookSecret, t('Webhook Stripe signé'))}
              <li className="flex items-center justify-between gap-3 py-2"><span>{t('E-mails')}</span>{env.emailProvider === 'resend' ? <Badge tone="ok">Resend</Badge> : <Badge tone="warn">{t('Journal uniquement (aucun envoi)')}</Badge>}</li>
              {on(!!env.analytics.ga4 || !!env.analytics.gtm, 'Google Analytics 4 / Tag Manager')}
              {on(!!env.analytics.googleAds, 'Google Ads')}
              {on(!!env.analytics.metaPixel, 'Meta Pixel')}
              {on(!!env.cronSecret, t('Tâche planifiée quotidienne (CRON_SECRET)'))}
              <li className="flex items-center justify-between gap-3 py-2"><span>PayPal</span><Badge>{t('Non implémenté')}</Badge></li>
            </ul>
          </Card>
          <Card title={t('Facturation')}><SettingForm settingKey="invoicing" values={invoicing} fields={[{ name: 'prefix', label: t('Préfixe des numéros de facture') }, { name: 'footerNote', label: t('Mention en pied de facture') }]} /></Card>
          <Card title={t('Sécurité')}><SettingForm settingKey="security" values={security} fields={[{ name: 'sessionDays', label: t('Durée de session (jours)'), type: 'number' }, { name: 'passwordMinLength', label: t('Longueur minimale du mot de passe'), type: 'number' }, { name: 'loginMaxAttempts', label: t('Tentatives de connexion par 15 min'), type: 'number' }]} /></Card>
          <Card title={t('Fichiers')}><SettingForm settingKey="uploads" values={uploads} fields={[{ name: 'maxSizeMb', label: t('Taille maximale (Mo)'), type: 'number' }, { name: 'allowedMime', label: t('Types autorisés (un par ligne)'), type: 'lines' }]} /></Card>
          <Card title={t('Confidentialité et rétention')}><SettingForm settingKey="privacy" values={privacy} fields={[{ name: 'policyVersion', label: t('Version de la politique (redemande le consentement)') }, { name: 'retentionMonthsLeads', label: t('Conservation des leads (mois)'), type: 'number' }]} /></Card>
          <Card title={t('Automatisations')}><SettingForm settingKey="maintenance" values={maintenance} fields={[{ name: 'offerEnabled', label: t('Créer une tâche « proposer la maintenance » quand un projet est approuvé'), type: 'checkbox' }]} /></Card>
        </div>
      </div>
    </>
  );
}
