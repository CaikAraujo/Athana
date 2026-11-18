import { Link } from '@/i18n/client';
import { formatDate, formatMoney } from '@/i18n/translate';
import { Card, DefList, PageHeader, Table } from '@/components/ui';
import { ActionButton } from '@/components/ui/form';
import { deleteProposalAction, setProposalStatusAction } from '@/modules/crm/actions';
import { toDateInput } from '@/modules/crm/dates';
import { dealOptions, getProposal, lineTotal, proposalTransitions, type ProposalStatus } from '@/modules/crm/service';
import { crmPage, orNotFound } from '../../_ui/page';
import { ProposalStatusBadge, UpgradeNotice, day } from '../../_ui/parts';
import { ProposalEditor } from './ProposalEditor';

export default async function ProposalPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = await params;
  const { locale, ctx, t, can, has } = await crmPage(params);
  if (!has('proposals')) return <><PageHeader title={t('Propositions')} /><UpgradeNotice t={t} title={t('Propositions commerciales')} /></>;
  const [proposal, deals] = await Promise.all([orNotFound(getProposal(ctx, id)), dealOptions(ctx)]);
  const money = (v: number) => formatMoney(v, proposal.currency, locale);
  const next = proposalTransitions(proposal.status);
  const actionLabel: Record<ProposalStatus, string> = { sent: t('Marquer comme envoyée'), accepted: t('Marquer comme acceptée'), rejected: t('Marquer comme refusée'), draft: t('Repasser en brouillon') };
  const draft = proposal.status === 'draft';
  return (
    <>
      <p className="mb-3 text-sm"><Link href="/app/crm/proposals" className="muted underline">← {t('Propositions')}</Link></p>
      <PageHeader
        title={`${proposal.number} — ${proposal.title}`}
        subtitle={<span className="flex flex-wrap items-center gap-2"><ProposalStatusBadge value={proposal.status} t={t} /><span className="font-semibold text-fg">{money(proposal.total)}</span>{proposal.expired && <span className="badge badge-warn">{t('Validité dépassée')}</span>}</span>}
        actions={
          <>
            {next.map((s) => <ActionButton key={s} action={setProposalStatusAction} fields={{ id, status: s }} className={`btn btn-sm ${s === 'sent' || s === 'accepted' ? 'btn-primary' : 'btn-outline'}`}>{actionLabel[s]}</ActionButton>)}
            <Link href={`/app/crm/proposals/${id}/print`} className="btn btn-outline btn-sm">{t('Aperçu / Imprimer')}</Link>
            {can.remove && <ActionButton action={deleteProposalAction} fields={{ id, locale }} className="btn btn-danger btn-sm" confirm={t('Supprimer définitivement cette proposition ?')}>{t('Supprimer')}</ActionButton>}
          </>
        }
      />
      {draft ? (
        <Card title={t('Rédaction')}>
          <ProposalEditor
            proposal={{ id, title: proposal.title, recipient: proposal.recipient ?? '', dealId: proposal.dealId ?? '', validUntil: toDateInput(proposal.validUntil), notes: proposal.notes ?? '', currency: proposal.currency, lines: proposal.lines }}
            deals={[{ value: '', label: t('— Aucune —') }, ...deals.map((d) => ({ value: d.id, label: d.title }))]}
            labels={{
              title: t('Objet de la proposition'), recipient: t('Destinataire'), deal: t('Affaire liée'), validUntil: t('Valable jusqu’au'), notes: t('Conditions et remarques'),
              notesHint: t('Affichées en bas de la proposition imprimée.'), lines: t('Lignes de la proposition'), description: t('Désignation'), quantity: t('Quantité'), unitPrice: t('Prix unitaire'),
              lineTotal: t('Total ligne'), addLine: t('Ajouter une ligne'), removeLine: t('Supprimer la ligne'), total: t('Total'), save: t('Enregistrer la proposition'), saved: t('Proposition enregistrée.'), noLines: t('Aucune ligne.'),
            }}
          />
        </Card>
      ) : (
        <div className="space-y-6">
          <p className="alert alert-info">{t('Cette proposition n’est plus un brouillon : son contenu est verrouillé.')}{next.includes('draft') && ` ${t('Repassez-la en brouillon pour la modifier.')}`}</p>
          <Card title={t('Détails')}>
            <DefList items={[
              [t('Destinataire'), proposal.recipient],
              [t('Affaire liée'), proposal.deal && <Link href={`/app/crm/deals/${proposal.deal.id}`} className="underline">{proposal.deal.title}</Link>],
              [t('Valable jusqu’au'), proposal.validUntil && day(proposal.validUntil, locale)],
              [t('Créée le'), formatDate(proposal.createdAt, locale)],
              [t('Conditions et remarques'), proposal.notes && <span className="whitespace-pre-wrap">{proposal.notes}</span>],
            ]} />
          </Card>
          <Table head={[t('Désignation'), t('Quantité'), t('Prix unitaire'), t('Total ligne')]}>
            {proposal.lines.map((l, i) => (
              <tr key={i}><td>{l.description}</td><td>{l.quantity}</td><td className="whitespace-nowrap">{money(l.unitAmount)}</td><td className="whitespace-nowrap font-semibold">{money(lineTotal(l))}</td></tr>
            ))}
            <tr><td colSpan={3} className="text-right font-semibold">{t('Total')}</td><td className="whitespace-nowrap font-semibold text-accent-700">{money(proposal.total)}</td></tr>
          </Table>
        </div>
      )}
    </>
  );
}
