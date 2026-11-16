import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDate, formatMoney } from '@/i18n/translate';
import { requireUser } from '@/modules/auth/session';
import { Empty, PageHeader, Table } from '@/components/ui';

export default async function InvoicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const user = await requireUser(locale);
  const t = await getT(locale);
  const invoices = await db.invoice.findMany({ where: { userId: user.id }, orderBy: { issuedAt: 'desc' }, include: { order: { select: { number: true } } } });
  return (
    <>
      <PageHeader title={t('Factures')} />
      {invoices.length === 0 ? <Empty title={t('Aucune facture pour le moment.')} /> : (
        <Table head={[t('Numéro'), t('Date'), t('Commande'), t('Total'), '']}>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td className="font-medium">{inv.number}</td>
              <td>{formatDate(inv.issuedAt, locale)}</td>
              <td>{inv.order?.number ?? '—'}</td>
              <td>{formatMoney(inv.total, inv.currency, locale)}</td>
              <td className="text-right"><a className="btn btn-outline btn-sm" href={localePath(locale, `/account/invoices/${inv.id}`)}>{t('Afficher')}</a></td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
