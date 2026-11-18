import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDateTime, formatMoney } from '@/i18n/translate';
import { requireUser } from '@/modules/auth/session';
import { Card, DefList, PageHeader } from '@/components/ui';
import { OrderBadge, PaymentBadge, ProjectBadge } from '@/components/app/status';
import { Totals } from '@/components/site/OrderSummary';
import { OrderActions } from '../../AccountForms';

export default async function OrderPage({ params, searchParams }: { params: Promise<{ locale: string; id: string }>; searchParams: Promise<{ failed?: string; cancelled?: string }> }) {
  const { locale: l, id } = await params;
  const locale = assertLocale(l);
  const user = await requireUser(locale);
  const order = await db.order.findFirst({ where: { id, userId: user.id }, include: { items: { include: { project: true } }, payments: { orderBy: { createdAt: 'desc' } }, invoices: true, coupon: true } });
  if (!order) notFound();
  const t = await getT(locale);
  const sp = await searchParams;
  const b = order.billing as Record<string, string>;
  const unpaid = order.status === 'PENDING_PAYMENT' || order.status === 'PAYMENT_FAILED';
  return (
    <>
      <PageHeader title={t('Commande {n}', { n: order.number })} subtitle={formatDateTime(order.createdAt, locale)} actions={<OrderBadge status={order.status} t={t} />} />
      {sp.failed && <p className="alert alert-danger mb-4">{t('Le paiement n’a pas abouti. Aucun montant n’a été débité. Vous pouvez réessayer.')}</p>}
      {sp.cancelled && unpaid && <p className="alert alert-warn mb-4">{t('Le paiement a été interrompu. Votre commande est conservée : vous pouvez la payer plus tard.')}</p>}
      {unpaid && <div className="mb-5"><OrderActions orderId={order.id} canPay canCancel /></div>}
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="space-y-5">
          <Card title={t('Articles')}>
            <ul className="divide-y divide-line">
              {order.items.map((i) => (
                <li key={i.id} className="py-3">
                  <div className="flex justify-between gap-3"><span className="font-medium">{i.name} <span className="muted">· {i.tier}</span></span><span>{formatMoney(i.unitAmount, order.currency, locale)}</span></div>
                  {(i.addons as { name: string; amount: number }[]).map((a) => <div key={a.name} className="muted flex justify-between text-sm"><span>+ {a.name}</span><span>{formatMoney(a.amount, order.currency, locale)}</span></div>)}
                  {i.project && order.status === 'PAID' && (
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                      <ProjectBadge status={i.project.status} t={t} />
                      <a className="underline hover:text-accent-700" href={localePath(locale, `/account/projects/${i.project.id}`)}>{t('Suivre le projet {ref}', { ref: i.project.reference })}</a>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Card>
          <Card title={t('Paiements')}>
            {order.payments.length === 0 ? <p className="muted text-sm">{t('Aucun paiement enregistré.')}</p> : (
              <ul className="divide-y divide-line text-sm">
                {order.payments.map((pm) => (
                  <li key={pm.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                    <span>{formatDateTime(pm.createdAt, locale)}</span>
                    <span>{formatMoney(pm.amount, pm.currency, locale)}{pm.refundedAmount > 0 && <span className="muted"> ({t('remboursé')} {formatMoney(pm.refundedAmount, pm.currency, locale)})</span>}</span>
                    <PaymentBadge status={pm.status} t={t} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <div className="space-y-5">
          <Card title={t('Récapitulatif')}><Totals cart={{ ...order, couponCode: order.coupon?.code }} locale={locale} t={t} /></Card>
          <Card title={t('Facturation')}>
            <DefList items={[[t('Nom'), b.fullName], [t('Entreprise'), b.company], [t('Adresse'), `${b.address}, ${b.postalCode} ${b.city}, ${b.country}`], [t('E-mail'), b.email], [t('N° TVA'), b.vatNumber]]} />
            {order.invoices.map((inv) => <a key={inv.id} className="btn btn-outline btn-sm mt-4" href={localePath(locale, `/account/invoices/${inv.id}`)}>{t('Facture {n}', { n: inv.number })}</a>)}
          </Card>
        </div>
      </div>
    </>
  );
}
