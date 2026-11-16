import { Link } from '@/i18n/client';
import { formatMoney } from '@/i18n/translate';
import { PageHeader, Stat } from '@/components/ui';
import { ActionForm, Modal, Submit } from '@/components/ui/form';
import { createDealAction } from '@/modules/crm/actions';
import { companyOptions, contactOptions, getBoard, listMembers, listPipelines } from '@/modules/crm/service';
import { DealFields } from '../_ui/forms';
import { crmPage, fullName, one, orNotFound, type SearchParams } from '../_ui/page';
import { day } from '../_ui/parts';
import { Board, type BoardStage } from './Board';

export default async function PipelinePage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, ctx, t, currency, can } = await crmPage(params);
  const pipelineId = one((await searchParams).pipeline);
  const [board, pipelines, contacts, companies, members] = await Promise.all([
    orNotFound(getBoard(ctx, pipelineId)), listPipelines(ctx), contactOptions(ctx), companyOptions(ctx), listMembers(ctx),
  ]);
  const money = (v: number) => formatMoney(v, currency, locale);
  const stages: BoardStage[] = board.stages.map((s) => ({
    id: s.id, name: s.name, probability: s.probability,
    summary: t('{count} affaire(s) · {total}', { count: s.count, total: money(s.total) }),
    deals: s.deals.map((d) => ({
      id: d.id, title: d.title, value: formatMoney(d.value, d.currency, locale), won: d.status === 'WON',
      subtitle: [d.contact ? fullName(d.contact) : null, d.company?.name].filter(Boolean).join(' · '),
      owner: d.ownerName, due: d.expectedCloseAt ? day(d.expectedCloseAt, locale) : null,
    })),
  }));
  return (
    <>
      <PageHeader
        title={t('Pipeline')} subtitle={board.pipeline.name}
        actions={
          <>
            {can.configure && <Link href="/app/crm/settings" className="btn btn-ghost btn-sm">{t('Configurer les étapes')}</Link>}
            <Modal trigger={t('Nouvelle affaire')} title={t('Nouvelle affaire')}>
              <ActionForm action={createDealAction} className="space-y-4" resetOnSuccess successMessage={t('Affaire créée.')}>
                <DealFields t={t} currency={currency} contacts={contacts} companies={companies} members={members} userId={ctx.userId} stages={board.stages} />
                <Submit>{t('Créer l’affaire')}</Submit>
              </ActionForm>
            </Modal>
          </>
        }
      />
      {pipelines.length > 1 && (
        <nav aria-label={t('Pipelines')} className="mb-4 flex flex-wrap gap-2">
          {pipelines.map((p) => (
            <Link key={p.id} href={`/app/crm/pipeline?pipeline=${p.id}`} className={`btn btn-sm ${p.id === board.pipeline.id ? 'btn-secondary' : 'btn-outline'}`} aria-current={p.id === board.pipeline.id ? 'page' : undefined}>{p.name}</Link>
          ))}
        </nav>
      )}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label={t('Affaires ouvertes')} value={board.totals.count} />
        <Stat label={t('Valeur totale')} value={money(board.totals.value)} />
        <Stat label={t('Prévision pondérée')} value={money(board.totals.weighted)} hint={t('Montant × probabilité de l’étape')} />
      </div>
      <p className="muted mb-3 text-xs">{t('Glissez une carte vers une autre colonne, ou utilisez le sélecteur d’étape de la carte.')}</p>
      <Board
        stages={stages}
        labels={{ moveTo: t('Déplacer vers l’étape'), empty: t('Aucune affaire'), won: t('Gagnée'), dropHere: t('Déposer ici'), moving: t('Déplacement en cours…') }}
      />
    </>
  );
}
