import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { formatDateTime, formatMoney } from '@/i18n/translate';
import { requireUser } from '@/modules/auth/session';
import { Empty, PageHeader, Table } from '@/components/ui';
import { PaymentBadge } from '@/components/app/status';

export default async function PaymentsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const user = await requireUser(locale);
  const t = await getT(locale);
  const payments = await db.payment.findMany({
    where: { OR: [{ order: { userId: user.id } }, { subscription: { organization: { memberships: { some: { userId: user.id, role: { in: ['OWNER', 'ADMIN'] } } } } } }] },
    include: { order: { select: { number: true } }, subscription: { select: { saasProduct: { select: { name: true } }, organization: { select: { name: true } } } } }, orderBy: { createdAt: 'desc' }, take: 100,
  });
  return (
    <>
      <PageHeader title={t('Paiements')} subtitle={t('Historique de vos paiements. Aucune donnée de carte n’est stockée par ATHANA.')} />
      {payments.length === 0 ? <Empty title={t('Aucun paiement enregistré.')} /> : (
        <Table head={[t('Date'), t('Objet'), t('Montant'), t('Remboursé'), t('Statut')]}>
          {payments.map((pm) => (
            <tr key={pm.id}>
              <td className="whitespace-nowrap">{formatDateTime(pm.createdAt, locale)}</td>
              <td>{pm.order ? t('Commande {n}', { n: pm.order.number }) : pm.subscription ? `${pm.subscription.saasProduct.name} — ${pm.subscription.organization.name}` : '—'}</td>
              <td>{formatMoney(pm.amount, pm.currency, locale)}</td>
              <td>{pm.refundedAmount ? formatMoney(pm.refundedAmount, pm.currency, locale) : '—'}</td>
              <td><PaymentBadge status={pm.status} t={t} /></td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
