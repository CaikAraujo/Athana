import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDateTime, formatMoney } from '@/i18n/translate';
import { requireStaff } from '@/modules/auth/session';
import { mrrByCurrency, revenueByCurrency } from '@/modules/admin/queries';
import { Card, Empty, PageHeader, Stat, Table } from '@/components/ui';
import { PaymentBadge } from '@/components/app/status';

export default async function AdminFinance({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'finance.view');
  const t = await getT(locale);
  const month = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const [payments, revMonth, revAll, mrr, refunds, invoices] = await Promise.all([
    db.payment.findMany({ include: { order: { select: { id: true, number: true } }, subscription: { select: { organization: { select: { name: true } }, saasProduct: { select: { name: true } } } } }, orderBy: { createdAt: 'desc' }, take: 150 }),
    revenueByCurrency(month), revenueByCurrency(), mrrByCurrency(),
    db.refund.groupBy({ by: ['paymentId'], _sum: { amount: true } }).then((r) => r.length),
    db.invoice.findMany({ orderBy: { issuedAt: 'desc' }, take: 20 }),
  ]);
  const money = (map: Record<string, number>) => Object.entries(map).map(([c, v]) => formatMoney(v, c, locale)).join(' · ') || '—';
  const year = new Date().getFullYear();
  return (
    <>
      <PageHeader title={t('Paiements & rapports')} actions={<><a className="btn btn-outline btn-sm" href={`/api/admin/reports?type=payments&year=${year}`}>{t('Export paiements {year} (CSV)', { year })}</a><a className="btn btn-outline btn-sm" href={`/api/admin/reports?type=orders&year=${year}`}>{t('Export commandes {year} (CSV)', { year })}</a></>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={t('Encaissé ce mois (net)')} value={<span className="text-xl">{money(revMonth)}</span>} />
        <Stat label={t('Encaissé au total (net)')} value={<span className="text-xl">{money(revAll)}</span>} />
        <Stat label={t('Revenu récurrent mensuel')} value={<span className="text-xl">{money(mrr)}</span>} />
        <Stat label={t('Paiements remboursés')} value={refunds} />
      </div>
      <div className="grid gap-5 xl:grid-cols-[2fr_1fr] xl:items-start">
        <div>
          {payments.length === 0 ? <Empty title={t('Aucun paiement enregistré.')} /> : (
            <Table head={[t('Date'), t('Objet'), t('Prestataire'), t('Montant'), t('Remboursé'), t('Statut')]}>
              {payments.map((pm) => (
                <tr key={pm.id}>
                  <td className="whitespace-nowrap">{formatDateTime(pm.createdAt, locale)}</td>
                  <td>{pm.order ? <a className="row-link" href={localePath(locale, `/admin/orders/${pm.order.id}`)}>{pm.order.number}</a> : pm.subscription ? `${pm.subscription.saasProduct.name} — ${pm.subscription.organization.name}` : '—'}</td>
                  <td>{pm.provider}</td><td>{formatMoney(pm.amount, pm.currency, locale)}</td><td>{pm.refundedAmount ? formatMoney(pm.refundedAmount, pm.currency, locale) : '—'}</td><td><PaymentBadge status={pm.status} t={t} /></td>
                </tr>
              ))}
            </Table>
          )}
        </div>
        <Card title={t('Dernières factures')}>
          {invoices.length === 0 ? <p className="muted text-sm">{t('Aucune facture pour le moment.')}</p> : <ul className="divide-y divide-line text-sm">{invoices.map((inv) => <li key={inv.id} className="flex justify-between gap-3 py-2"><a className="underline" href={localePath(locale, `/admin/finance/invoice/${inv.id}`)}>{inv.number}</a><span>{formatMoney(inv.total, inv.currency, locale)}</span></li>)}</ul>}
        </Card>
      </div>
    </>
  );
}
