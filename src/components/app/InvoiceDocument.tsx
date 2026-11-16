import type { Invoice } from '@prisma/client';
import type { Locale } from '@/i18n/config';
import { LOCALE_META } from '@/i18n/config';
import { formatDate, formatMoney, type TFn } from '@/i18n/translate';
import { PrintButton } from './PrintButton';

/** Printable commercial document (browser "Print → Save as PDF"). Light theme on purpose. */
export function InvoiceDocument({ invoice, locale, t }: { invoice: Invoice; locale: Locale; t: TFn }) {
  const seller = invoice.seller as Record<string, string>;
  const b = invoice.billing as Record<string, string>;
  const lines = invoice.lines as { description: string; quantity: number; unitAmount: number; total: number }[];
  const f = (n: number) => formatMoney(n, invoice.currency, locale);
  return (
    <div>
      <div className="no-print mb-4 flex justify-end"><PrintButton /></div>
      <article className="mx-auto max-w-3xl rounded-xl bg-white p-8 text-[13px] leading-relaxed text-neutral-900 md:p-12 print:p-0">
        <header className="flex flex-wrap justify-between gap-6 border-b border-neutral-200 pb-6">
          <div>
            <p className="font-display text-xl font-bold tracking-[0.2em]">{seller.legalName}</p>
            <p className="mt-2 text-neutral-600">{seller.address}<br />{seller.postalCode} {seller.city}<br />{seller.email}{seller.vatNumber && <><br />{t('N° TVA')} : {seller.vatNumber}</>}</p>
          </div>
          <div className="text-right">
            <h1 className="font-display text-2xl font-semibold tracking-normal">{t('Facture')}</h1>
            <p className="mt-1 font-medium">{invoice.number}</p>
            <p className="text-neutral-600">{formatDate(invoice.issuedAt, locale, { dateStyle: 'long' })}</p>
          </div>
        </header>
        <section className="py-6">
          <p className="text-xs uppercase tracking-wider text-neutral-500">{t('Facturé à')}</p>
          <p className="mt-1 font-medium">{b.company || b.fullName}</p>
          <p className="text-neutral-600">{b.company && <>{b.fullName}<br /></>}{b.address}<br />{b.postalCode} {b.city}, {b.country}{b.vatNumber && <><br />{t('N° TVA')} : {b.vatNumber}</>}</p>
        </section>
        <table className="w-full border-collapse">
          <thead><tr className="border-b border-neutral-300 text-left text-xs uppercase tracking-wider text-neutral-500"><th className="py-2 font-medium">{t('Description')}</th><th className="py-2 text-right font-medium">{t('Qté')}</th><th className="py-2 text-right font-medium">{t('Prix unitaire')}</th><th className="py-2 text-right font-medium">{t('Montant')}</th></tr></thead>
          <tbody>{lines.map((ln, i) => <tr key={i} className="border-b border-neutral-100"><td className="py-2 pr-3">{ln.description}</td><td className="py-2 text-right">{ln.quantity}</td><td className="py-2 text-right">{f(ln.unitAmount)}</td><td className="py-2 text-right">{f(ln.total)}</td></tr>)}</tbody>
        </table>
        <dl className="ml-auto mt-6 w-full max-w-xs space-y-1.5">
          <div className="flex justify-between"><dt className="text-neutral-600">{t('Sous-total')}</dt><dd>{f(invoice.subtotal)}</dd></div>
          {invoice.discount > 0 && <div className="flex justify-between"><dt className="text-neutral-600">{t('Remise')}</dt><dd>− {f(invoice.discount)}</dd></div>}
          {invoice.taxRateBps > 0 && <div className="flex justify-between"><dt className="text-neutral-600">{invoice.taxLabel} {(invoice.taxRateBps / 100).toLocaleString(LOCALE_META[locale].intl)} %</dt><dd>{f(invoice.tax)}</dd></div>}
          <div className="flex justify-between border-t border-neutral-300 pt-2 text-base font-semibold"><dt>{t('Total')}</dt><dd>{f(invoice.total)}</dd></div>
          <div className="flex justify-between text-neutral-600"><dt>{t('Statut')}</dt><dd>{t('Payée')}</dd></div>
        </dl>
        {invoice.taxRateBps === 0 && <p className="mt-8 text-xs text-neutral-500">{t('Aucune taxe n’est appliquée sur ce document.')}</p>}
      </article>
    </div>
  );
}
