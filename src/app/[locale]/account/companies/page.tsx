import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { LOCALE_META, localePath } from '@/i18n/config';
import { countryOptions } from '@/lib/countries';
import { getSession, requireUser } from '@/modules/auth/session';
import { Badge, Card, Empty, PageHeader } from '@/components/ui';
import { CompanyForm, SwitchCompany } from '../AccountForms';

export default async function CompaniesPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ need?: string }> }) {
  const locale = assertLocale((await params).locale);
  const user = await requireUser(locale);
  const t = await getT(locale);
  const session = await getSession();
  const { need } = await searchParams;
  const memberships = await db.membership.findMany({ where: { userId: user.id, organization: { deletedAt: null } }, include: { organization: { include: { subscriptions: { include: { saasProduct: true } }, _count: { select: { memberships: true } } } } }, orderBy: { createdAt: 'asc' } });
  const roles: Record<string, string> = { OWNER: t('Propriétaire'), ADMIN: t('Administrateur'), MANAGER: t('Responsable'), MEMBER: t('Membre') };
  return (
    <>
      <PageHeader title={t('Entreprises')} subtitle={t('Les logiciels ATHANA sont rattachés à une entreprise. Chaque entreprise a ses propres données et ses propres utilisateurs.')} />
      {need && <p className="alert alert-info mb-5">{t('Créez ou sélectionnez une entreprise pour utiliser ce logiciel.')}</p>}
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div className="space-y-4">
          {memberships.length === 0 && <Empty title={t('Vous n’avez pas encore d’entreprise.')} />}
          {memberships.map(({ organization: o, role }) => (
            <Card key={o.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{o.name}</h2>
                  <p className="muted text-sm">{roles[role]} · {t('{n} utilisateur(s)', { n: o._count.memberships })} · {o.timezone}</p>
                </div>
                {session?.activeOrganizationId === o.id ? <Badge tone="gold">{t('Entreprise active')}</Badge> : <SwitchCompany organizationId={o.id} />}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {o.subscriptions.filter((s) => s.status !== 'CANCELED').map((s) => <a key={s.id} className="btn btn-outline btn-sm" href={localePath(locale, `/app/${s.saasProductKey}`)}>{t('Ouvrir {name}', { name: s.saasProduct.name })}</a>)}
                <a className="btn btn-ghost btn-sm" href={localePath(locale, '/account/subscriptions')}>{t('Gérer les abonnements')}</a>
              </div>
            </Card>
          ))}
        </div>
        <Card title={t('Ajouter une entreprise')}><CompanyForm countries={countryOptions(LOCALE_META[locale].intl)} timezones={Intl.supportedValuesOf('timeZone')} defaultTz={LOCALE_META[locale].timezone} /></Card>
      </div>
    </>
  );
}
