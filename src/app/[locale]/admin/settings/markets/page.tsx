import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { requireStaff } from '@/modules/auth/session';
import { Card, PageHeader } from '@/components/ui';
import { MarketForm } from '../../ContentForms';

export default async function AdminMarkets({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'settings.manage');
  const t = await getT(locale);
  const markets = await db.market.findMany({ orderBy: { sortOrder: 'asc' } });
  return (
    <>
      <PageHeader title={t('Marchés, devises et taxes')} subtitle={t('Chaque marché correspond à une adresse du site (par exemple /fr-ch). Les taux de taxe doivent être validés par votre fiduciaire avant la mise en production.')} />
      {markets.some((mk) => mk.taxRateBps === 0) && <p className="alert alert-warn mb-5">{t('Au moins un marché a un taux de taxe à 0 %. Vérifiez votre assujettissement à la TVA avant de vendre.')}</p>}
      <div className="grid gap-5 xl:grid-cols-2">{markets.map((mk) => <Card key={mk.code} title={`/${mk.code} — ${mk.country}`}><MarketForm market={JSON.parse(JSON.stringify(mk))} /></Card>)}</div>
    </>
  );
}
