import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { formatDate, formatMoney } from '@/i18n/translate';
import { requireStaff } from '@/modules/auth/session';
import { marketCurrencies } from '@/modules/admin/queries';
import { Badge, Empty, PageHeader, Table } from '@/components/ui';
import { CouponModal } from '../CatalogForms';

export default async function AdminCoupons({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'marketing.manage');
  const t = await getT(locale);
  const [coupons, currencies] = await Promise.all([db.coupon.findMany({ orderBy: { createdAt: 'desc' } }), marketCurrencies()]);
  return (
    <>
      <PageHeader title={t('Coupons et campagnes')} actions={<CouponModal currencies={currencies} />} />
      {coupons.length === 0 ? <Empty title={t('Aucun coupon.')} /> : (
        <Table head={[t('Code'), t('Remise'), t('Campagne'), t('Utilisations'), t('Validité'), t('Statut'), '']}>
          {coupons.map((c) => <tr key={c.id}><td className="font-medium">{c.code}</td><td>{c.type === 'PERCENT' ? `${c.value} %` : formatMoney(c.value, c.currency ?? 'CHF', locale)}</td><td>{c.campaign ?? '—'}</td><td>{c.redeemedCount}{c.maxRedemptions ? ` / ${c.maxRedemptions}` : ''}</td><td className="whitespace-nowrap">{c.startsAt ? formatDate(c.startsAt, locale) : '…'} → {c.endsAt ? formatDate(c.endsAt, locale) : '…'}</td><td>{c.active ? <Badge tone="ok">{t('Actif')}</Badge> : <Badge>{t('Inactif')}</Badge>}</td><td className="text-right"><CouponModal coupon={JSON.parse(JSON.stringify(c))} currencies={currencies} /></td></tr>)}
        </Table>
      )}
    </>
  );
}
