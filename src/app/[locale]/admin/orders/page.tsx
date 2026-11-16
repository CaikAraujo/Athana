import type { OrderStatus } from '@prisma/client';
import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDate, formatMoney } from '@/i18n/translate';
import { requireStaff } from '@/modules/auth/session';
import { Empty, PageHeader, Table } from '@/components/ui';
import { ORDER_STATUS, OrderBadge } from '@/components/app/status';

export default async function AdminOrders({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ status?: string; q?: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'orders.view');
  const t = await getT(locale);
  const { status, q } = await searchParams;
  const st = status && status in ORDER_STATUS ? (status as OrderStatus) : undefined;
  const orders = await db.order.findMany({
    where: { ...(st ? { status: st } : {}), ...(q ? { OR: [{ number: { contains: q, mode: 'insensitive' } }, { user: { email: { contains: q, mode: 'insensitive' } } }, { user: { name: { contains: q, mode: 'insensitive' } } }] } : {}) },
    include: { user: { select: { name: true, email: true } }, items: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 200,
  });
  const base = localePath(locale, '/admin/orders');
  return (
    <>
      <PageHeader title={t('Commandes')} />
      <form method="get" action={base} className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder={t('Numéro, client, e-mail…')} className="input max-w-xs" aria-label={t('Rechercher')} />
        <select name="status" defaultValue={st ?? ''} className="select max-w-[220px]" aria-label={t('Statut')}>
          <option value="">{t('Tous les statuts')}</option>
          {Object.entries(ORDER_STATUS).map(([k, [label]]) => <option key={k} value={k}>{t(label)}</option>)}
        </select>
        <button className="btn btn-outline" type="submit">{t('Filtrer')}</button>
      </form>
      {orders.length === 0 ? <Empty title={t('Aucune commande.')} /> : (
        <Table head={[t('Numéro'), t('Date'), t('Client'), t('Articles'), t('Total'), t('Statut')]}>
          {orders.map((o) => (
            <tr key={o.id}>
              <td><a className="row-link" href={localePath(locale, `/admin/orders/${o.id}`)}>{o.number}</a></td>
              <td className="whitespace-nowrap">{formatDate(o.createdAt, locale)}</td>
              <td>{o.user.name}<br /><span className="muted text-xs">{o.user.email}</span></td>
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
