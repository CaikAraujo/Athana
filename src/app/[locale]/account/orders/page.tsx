import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDate, formatMoney } from '@/i18n/translate';
import { requireUser } from '@/modules/auth/session';
import { Empty, PageHeader, Table } from '@/components/ui';
import { OrderBadge } from '@/components/app/status';

export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const user = await requireUser(locale);
  const t = await getT(locale);
  const orders = await db.order.findMany({ where: { userId: user.id }, include: { items: true }, orderBy: { createdAt: 'desc' } });
  return (
    <>
      <PageHeader title={t('Commandes')} />
      {orders.length === 0 ? <Empty title={t('Aucune commande.')}><a className="btn btn-primary btn-sm" href={localePath(locale, '/templates')}>{t('Découvrir les modèles')}</a></Empty> : (
        <Table head={[t('Numéro'), t('Date'), t('Articles'), t('Total'), t('Statut')]}>
          {orders.map((o) => (
            <tr key={o.id}>
              <td><a className="row-link" href={localePath(locale, `/account/orders/${o.id}`)}>{o.number}</a></td>
              <td className="whitespace-nowrap">{formatDate(o.createdAt, locale)}</td>
              <td>{o.items.map((i) => i.name).join(', ')}</td>
              <td className="whitespace-nowrap">{formatMoney(o.total, o.currency, locale)}</td>
              <td><OrderBadge status={o.status} t={t} /></td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
