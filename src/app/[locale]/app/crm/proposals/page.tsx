import { Link } from '@/i18n/client';
import { formatDate, formatMoney } from '@/i18n/translate';
import { Empty, PageHeader, Table } from '@/components/ui';
import { ActionForm, Input, Modal, Select, Submit } from '@/components/ui/form';
import { createProposalAction } from '@/modules/crm/actions';
import { PROPOSAL_STATUSES, PROPOSAL_STATUS_LABELS, dealOptions, listProposals } from '@/modules/crm/service';
import { crmPage, one, type SearchParams } from '../_ui/page';
import { Pagination, ProposalStatusBadge, UpgradeNotice, day } from '../_ui/parts';

const PATH = '/app/crm/proposals';

export default async function ProposalsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, ctx, t, has } = await crmPage(params);
  if (!has('proposals')) {
    return (
      <>
        <PageHeader title={t('Propositions')} />
        <UpgradeNotice t={t} title={t('Propositions commerciales')}>{t('Créez des offres chiffrées, numérotées et imprimables. Disponible à partir du plan Business.')}</UpgradeNotice>
      </>
    );
  }
  const sp = await searchParams;
  const status = one(sp.status);
  const [list, deals] = await Promise.all([listProposals(ctx, { status: status as never, page: one(sp.page) }), dealOptions(ctx)]);
  return (
    <>
      <PageHeader
        title={t('Propositions')} subtitle={t('Vos offres commerciales, du brouillon à l’acceptation.')}
        actions={
          <Modal trigger={t('Nouvelle proposition')} title={t('Nouvelle proposition')}>
            <ActionForm action={createProposalAction} className="space-y-4">
              <input type="hidden" name="locale" value={locale} />
              <Input label={t('Objet de la proposition')} name="title" required maxLength={200} />
              <Input label={t('Destinataire')} name="recipient" maxLength={300} hint={t('Nom du client ou de l’entreprise')} />
              <Select label={t('Affaire liée')} name="dealId" options={[{ value: '', label: t('— Aucune —') }, ...deals.map((d) => ({ value: d.id, label: d.title }))]} />
              <Input label={t('Valable jusqu’au')} name="validUntil" type="date" />
              <Submit>{t('Créer et rédiger')}</Submit>
            </ActionForm>
          </Modal>
        }
      />
      <nav aria-label={t('Filtres')} className="mb-4 flex flex-wrap gap-2">
        <Link href={PATH} className={`btn btn-sm ${!status ? 'btn-secondary' : 'btn-outline'}`}>{t('Toutes')}</Link>
        {PROPOSAL_STATUSES.map((s) => <Link key={s} href={`${PATH}?status=${s}`} className={`btn btn-sm ${status === s ? 'btn-secondary' : 'btn-outline'}`}>{t(PROPOSAL_STATUS_LABELS[s])}</Link>)}
      </nav>
      {list.total === 0 ? <Empty title={status ? t('Aucune proposition avec ce statut.') : t('Aucune proposition pour le moment.')} /> : (
        <>
          <Table head={[t('Numéro'), t('Objet'), t('Destinataire'), t('Statut'), t('Total'), t('Valable jusqu’au'), t('Créée le')]}>
            {list.items.map((p) => (
              <tr key={p.id}>
                <td><Link href={`${PATH}/${p.id}`} className="row-link whitespace-nowrap">{p.number}</Link></td>
                <td>{p.title}{p.deal && <div className="muted text-xs">{p.deal.title}</div>}</td>
                <td>{p.recipient ?? '—'}</td>
                <td><ProposalStatusBadge value={p.status} t={t} /></td>
                <td className="whitespace-nowrap font-semibold">{formatMoney(p.total, p.currency, locale)}</td>
                <td className="whitespace-nowrap">{p.validUntil ? day(p.validUntil, locale) : '—'}</td>
                <td className="muted whitespace-nowrap">{formatDate(p.createdAt, locale)}</td>
              </tr>
            ))}
          </Table>
          <Pagination t={t} path={PATH} params={{ status }} page={list.page} pages={list.pages} total={list.total} />
        </>
      )}
    </>
  );
}
