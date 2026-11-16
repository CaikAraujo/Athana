import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { LOCALE_META } from '@/i18n/config';
import { formatDate } from '@/i18n/translate';
import { countryOptions } from '@/lib/countries';
import { requireUser } from '@/modules/auth/session';
import { Badge, Card, PageHeader } from '@/components/ui';
import { DataRequestForm, PasswordForm, ProfileForm } from '../AccountForms';

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const user = await requireUser(locale);
  const t = await getT(locale);
  const requests = await db.dataRequest.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 5 });
  return (
    <>
      <PageHeader title={t('Mes données')} subtitle={t('Vos informations personnelles, votre mot de passe et vos droits sur vos données.')} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title={t('Informations personnelles')}><ProfileForm user={{ name: user.name, email: user.email, phone: user.phone ?? '', country: user.country ?? '', locale: user.locale }} countries={countryOptions(LOCALE_META[locale].intl)} /></Card>
        <Card title={t('Mot de passe')}><PasswordForm /></Card>
        <Card title={t('Exporter mes données')}>
          <p className="muted mb-4 text-sm">{t('Téléchargez immédiatement une copie de vos données (compte, commandes, projets, messages) au format JSON.')}</p>
          <a className="btn btn-primary btn-sm" href="/api/account/export">{t('Télécharger mes données')}</a>
          <div className="divider my-5" />
          <DataRequestForm type="EXPORT" />
        </Card>
        <Card title={t('Supprimer mes données')}>
          <p className="muted mb-4 text-sm">{t('Votre demande est traitée par notre équipe. Certaines données (factures, par exemple) doivent être conservées pendant la durée légale.')}</p>
          <DataRequestForm type="DELETE" />
        </Card>
      </div>
      {requests.length > 0 && (
        <Card title={t('Mes demandes')} className="mt-5">
          <ul className="divide-y divide-line text-sm">
            {requests.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                <span>{r.type === 'EXPORT' ? t('Export') : t('Suppression')} · <span className="muted">{formatDate(r.createdAt, locale)}</span></span>
                <Badge tone={r.status === 'COMPLETED' ? 'ok' : r.status === 'REJECTED' ? 'danger' : 'warn'}>{r.status === 'COMPLETED' ? t('Traitée') : r.status === 'REJECTED' ? t('Refusée') : t('En cours')}</Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
