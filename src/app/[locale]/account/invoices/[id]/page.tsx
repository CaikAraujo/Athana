import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { requireUser } from '@/modules/auth/session';
import { InvoiceDocument } from '@/components/app/InvoiceDocument';

export default async function InvoicePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: l, id } = await params;
  const locale = assertLocale(l);
  const user = await requireUser(locale);
  const invoice = await db.invoice.findFirst({ where: { id, userId: user.id } });
  if (!invoice) notFound();
  return <InvoiceDocument invoice={invoice} locale={locale} t={await getT(locale)} />;
}
