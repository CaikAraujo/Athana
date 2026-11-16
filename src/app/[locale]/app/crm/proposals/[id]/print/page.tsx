import { Link } from '@/i18n/client';
import { formatDate, formatMoney } from '@/i18n/translate';
import { PageHeader } from '@/components/ui';
import { getProposal, lineTotal, organizationProfile, PROPOSAL_STATUS_LABELS, type ProposalStatus } from '@/modules/crm/service';
import { crmPage, orNotFound } from '../../../_ui/page';
import { UpgradeNotice, day } from '../../../_ui/parts';
import { PrintButton } from './PrintButton';

/** Print-friendly proposal: light "paper" sheet on screen, clean black-on-white output on paper (the shell is .no-print). */
export default async function ProposalPrintPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = await params;
  const { locale, ctx, t, has } = await crmPage(params);
  if (!has('proposals')) return <><PageHeader title={t('Propositions')} /><UpgradeNotice t={t} title={t('Propositions commerciales')} /></>;
  const [proposal, org] = await Promise.all([orNotFound(getProposal(ctx, id)), organizationProfile(ctx)]);
  const money = (v: number) => formatMoney(v, proposal.currency, locale);
  return (
    <>
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href={`/app/crm/proposals/${id}`} className="muted text-sm underline">← {t('Retour à la proposition')}</Link>
        <PrintButton label={t('Imprimer / Enregistrer en PDF')} />
      </div>
      <article className="mx-auto max-w-[820px] rounded-lg bg-white p-5 text-[15px] leading-relaxed text-neutral-900 shadow-lg sm:p-10 print:max-w-none print:rounded-none print:p-0 print:shadow-none" style={{ colorScheme: 'light' }}>
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-neutral-300 pb-6">
          <div className="min-w-0">
            <p className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>{org.name}</p>
            <address className="mt-1 text-sm not-italic text-neutral-600">
              {org.address && <span className="block">{org.address}</span>}
              {(org.postalCode || org.city) && <span className="block">{[org.postalCode, org.city].filter(Boolean).join(' ')}</span>}
              {org.vatNumber && <span className="block">{t('N° TVA')} : {org.vatNumber}</span>}
            </address>
          </div>
          <div className="text-sm sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{t('Proposition commerciale')}</p>
            <p className="mt-1 text-lg font-bold">{proposal.number}</p>
            <p className="text-neutral-600">{t('Date')} : {formatDate(proposal.createdAt, locale)}</p>
            {proposal.validUntil && <p className="text-neutral-600">{t('Valable jusqu’au')} : {day(proposal.validUntil, locale)}</p>}
            <p className="no-print mt-1 text-xs text-neutral-500">{t('Statut')} : {t(PROPOSAL_STATUS_LABELS[proposal.status as ProposalStatus] ?? PROPOSAL_STATUS_LABELS.draft)}</p>
          </div>
        </header>

        {proposal.recipient && (
          <section className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{t('Destinataire')}</p>
            <p className="mt-1 whitespace-pre-wrap font-medium">{proposal.recipient}</p>
          </section>
        )}

        <h1 className="mt-8 text-2xl font-bold text-neutral-900">{proposal.title}</h1>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-neutral-800 text-left">
                <th scope="col" className="py-2 pr-3 font-semibold">{t('Désignation')}</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">{t('Quantité')}</th>
                <th scope="col" className="px-3 py-2 text-right font-semibold">{t('Prix unitaire')}</th>
                <th scope="col" className="py-2 pl-3 text-right font-semibold">{t('Total')}</th>
              </tr>
            </thead>
            <tbody>
              {proposal.lines.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-neutral-500">{t('Aucune ligne.')}</td></tr>}
              {proposal.lines.map((l, i) => (
                <tr key={i} className="border-b border-neutral-200 align-top" style={{ breakInside: 'avoid' }}>
                  <td className="py-2.5 pr-3">{l.description}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right">{l.quantity}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right">{money(l.unitAmount)}</td>
                  <td className="whitespace-nowrap py-2.5 pl-3 text-right font-medium">{money(lineTotal(l))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="pt-4 pr-3 text-right text-base font-bold">{t('Total')}</td>
                <td className="whitespace-nowrap pt-4 pl-3 text-right text-base font-bold">{money(proposal.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {proposal.notes && (
          <section className="mt-8" style={{ breakInside: 'avoid' }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">{t('Conditions et remarques')}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-700">{proposal.notes}</p>
          </section>
        )}

        <section className="mt-12 grid grid-cols-2 gap-8 text-sm" style={{ breakInside: 'avoid' }}>
          <div><p className="text-neutral-600">{t('Pour {name}', { name: org.name })}</p><div className="mt-10 border-t border-neutral-400 pt-1 text-xs text-neutral-500">{t('Date et signature')}</div></div>
          <div><p className="text-neutral-600">{t('Bon pour accord')}</p><div className="mt-10 border-t border-neutral-400 pt-1 text-xs text-neutral-500">{t('Date et signature')}</div></div>
        </section>
      </article>
    </>
  );
}
