import { Card, PageHeader } from '@/components/ui';
import { getSettings } from '@/modules/pointage/settings';
import { PresetForm, SettingsForm } from '../_components/client';
import { Denied, pointagePage } from '../_components/server';

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { ctx, actor, t } = await pointagePage(params);
  if (actor.role !== 'ADMIN') return <Denied t={t} />;
  const { settings, timezone } = await getSettings(ctx);
  const timezones = Intl.supportedValuesOf('timeZone');
  if (!timezones.includes(timezone)) timezones.unshift(timezone);
  if (!timezones.includes('UTC')) timezones.push('UTC');
  return (
    <>
      <PageHeader title={t('Paramètres')} subtitle={t('Règles de temps de travail, fuseau horaire et conservation des données.')} />
      <p className="alert alert-warn mb-6">
        {t('Les valeurs proposées par juridiction sont purement indicatives et ne constituent pas un conseil juridique. Les règles applicables dépendent de votre secteur, de vos conventions collectives et de vos contrats : faites-les valider par un professionnel du droit du travail.')}
      </p>
      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(0,360px)]">
        <Card title={t('Règles de l’entreprise')}>
          <SettingsForm timezones={timezones} value={{ ...settings, timezone }} />
        </Card>
        <div className="grid content-start gap-6">
          <Card title={t('Valeurs indicatives par juridiction')}>
            <p className="muted mb-4 text-sm">{t('Remplace les durées et la conservation ci-contre par des valeurs de départ pour la juridiction choisie. À vérifier et adapter avant utilisation.')}</p>
            <PresetForm jurisdiction={settings.jurisdiction} />
          </Card>
          <Card title={t('Géolocalisation et biométrie')}>
            <fieldset disabled className="space-y-3">
              <label className="flex items-start gap-3 text-sm text-fg-muted"><input type="checkbox" className="check mt-0.5" checked={settings.geolocation} readOnly disabled /><span>{t('Enregistrer la position lors du pointage')}</span></label>
              <label className="flex items-start gap-3 text-sm text-fg-muted"><input type="checkbox" className="check mt-0.5" checked={settings.biometrics} readOnly disabled /><span>{t('Pointage par biométrie')}</span></label>
            </fieldset>
            <p className="muted mt-4 text-sm">{t('Ces options ne sont pas disponibles pour le moment. Leur usage dépend de la législation locale (protection des données, information et consentement des employés, proportionnalité) : aucune donnée de localisation ni donnée biométrique n’est collectée par ATHANA Pointage.')}</p>
          </Card>
        </div>
      </div>
    </>
  );
}
