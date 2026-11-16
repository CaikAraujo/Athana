import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { requireStaff } from '@/modules/auth/session';
import { InvoiceDocument } from '@/components/app/InvoiceDocument';

export default async function AdminInvoice({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: l, id } = await params;
  const locale = assertLocale(l);
  await requireStaff(locale, 'orders.view');
  const invoice = await db.invoice.findUnique({ where: { id } });
  if (!invoice) notFound();
  return <InvoiceDocument invoice={invoice} locale={locale} t={await getT(locale)} />;
}
