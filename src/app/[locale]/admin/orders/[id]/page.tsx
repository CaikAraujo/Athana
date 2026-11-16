import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDateTime, formatMoney } from '@/i18n/translate';
import { can } from '@/modules/auth/rbac';
import { requireStaff } from '@/modules/auth/session';
import { Card, DefList, PageHeader } from '@/components/ui';
import { OrderBadge, PaymentBadge, ProjectBadge } from '@/components/app/status';
import { Totals } from '@/components/site/OrderSummary';
import { CancelOrder, OrderNote, RefundForm } from '../../AdminForms';

export default async function AdminOrder({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: l, id } = await params;
  const locale = assertLocale(l);
  const staff = await requireStaff(locale, 'orders.view');
  const order = await db.order.findUnique({ where: { id }, include: { user: true, coupon: true, items: { include: { project: true } }, payments: { include: { refunds: true }, orderBy: { createdAt: 'desc' } }, invoices: true } });
  if (!order) notFound();
  const t = await getT(locale);
  const b = order.billing as Record<string, string>;
  const manage = can(staff.platformRole, 'orders.manage');
  const finance = can(staff.platformRole, 'finance.manage');
  return (
    <>
      <PageHeader title={t('Commande {n}', { n: order.number })} subtitle={`${formatDateTime(order.createdAt, locale)} · ${order.market}`} actions={<><OrderBadge status={order.status} t={t} />{manage && (order.status === 'PENDING_PAYMENT' || order.status === 'PAYMENT_FAILED') && <CancelOrder orderId={order.id} />}</>} />
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="space-y-5">
          <Card title={t('Articles et projets')}>
            <ul className="divide-y divide-line">
              {order.items.map((i) => (
                <li key={i.id} className="py-3">
                  <div className="flex justify-between gap-3"><span className="font-medium">{i.name} <span className="muted">· {i.tier}</span></span><span>{formatMoney(i.total, order.currency, locale)}</span></div>
                  {(i.addons as { name: string; amount: number }[]).map((a) => <p key={a.name} className="muted text-sm">+ {a.name} ({formatMoney(a.amount, order.currency, locale)})</p>)}
                  {i.project && <p className="mt-2 flex items-center gap-3 text-sm"><ProjectBadge status={i.project.status} t={t} /><a className="underline hover:text-gold-300" href={localePath(locale, `/admin/projects/${i.project.id}`)}>{i.project.reference}</a></p>}
                </li>
              ))}
            </ul>
          </Card>
          <Card title={t('Paiements')}>
            {order.payments.length === 0 ? <p className="muted text-sm">{t('Aucun paiement enregistré.')}</p> : (
              <ul className="divide-y divide-line text-sm">
                {order.payments.map((pm) => (
                  <li key={pm.id} className="py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span>{formatDateTime(pm.createdAt, locale)} · {pm.provider}{pm.method ? ` / ${pm.method}` : ''}</span>
                      <span>{formatMoney(pm.amount, pm.currency, locale)}</span>
                      <PaymentBadge status={pm.status} t={t} />
                      {finance && (pm.status === 'SUCCEEDED' || pm.status === 'PARTIALLY_REFUNDED') && <RefundForm paymentId={pm.id} max={pm.amount - pm.refundedAmount} currency={pm.currency} />}
                    </div>
                    <p className="muted break-all text-xs">{pm.providerRef}{pm.failureReason ? ` — ${pm.failureReason}` : ''}</p>
                    {pm.refunds.map((r) => <p key={r.id} className="muted text-xs">↩ {formatMoney(r.amount, pm.currency, locale)} · {formatDateTime(r.createdAt, locale)}{r.reason ? ` · ${r.reason}` : ''}</p>)}
                  </li>
                ))}
              </ul>
            )}
          </Card>
          {manage && <Card title={t('Notes internes')}><OrderNote orderId={order.id} value={order.internalNotes ?? ''} /></Card>}
        </div>
        <div className="space-y-5">
          <Card title={t('Récapitulatif')}><Totals cart={{ ...order, couponCode: order.coupon?.code }} locale={locale} t={t} /></Card>
          <Card title={t('Client')}>
            <DefList items={[[t('Compte'), <a key="c" className="underline" href={localePath(locale, `/admin/customers/${order.userId}`)}>{order.user.name}</a>], [t('E-mail'), order.user.email], [t('Facturé à'), b.company || b.fullName], [t('Adresse'), `${b.address}, ${b.postalCode} ${b.city}, ${b.country}`], [t('Téléphone'), b.phone], [t('N° TVA'), b.vatNumber]]} />
            {order.invoices.map((inv) => <a key={inv.id} className="btn btn-outline btn-sm mt-4" href={localePath(locale, `/admin/finance/invoice/${inv.id}`)}>{t('Facture {n}', { n: inv.number })}</a>)}
          </Card>
        </div>
      </div>
    </>
  );
}
