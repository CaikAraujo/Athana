import { Link } from '@/i18n/client';
import { formatDate, formatDateTime, formatMoney } from '@/i18n/translate';
import { Card, DefList, PageHeader } from '@/components/ui';
import { ActionButton, ActionForm, Input, Modal, Select, Submit, Textarea } from '@/components/ui/form';
import {
  createProposalAction, deleteDealAction, loseDealAction, moveDealAction, reopenDealAction, updateDealAction, winDealAction,
} from '@/modules/crm/actions';
import { companyOptions, contactOptions, getDeal, listAttachments, listMembers, listTimeline, tasksFor } from '@/modules/crm/service';
import { DealFields } from '../../_ui/forms';
import { crmPage, fullName, orNotFound } from '../../_ui/page';
import { ActivityForm, Attachments, DealStatusBadge, ProposalStatusBadge, TaskList, TaskModal, TimelineList, day } from '../../_ui/parts';

export default async function DealPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = await params;
  const { locale, ctx, t, tz, currency, can, has } = await crmPage(params);
  const deal = await orNotFound(getDeal(ctx, id));
  const [timeline, tasks, files, members, companies, contacts] = await Promise.all([
    listTimeline(ctx, { dealId: id }), tasksFor(ctx, { dealId: id }), listAttachments(ctx, 'deal', id), listMembers(ctx), companyOptions(ctx), contactOptions(ctx),
  ]);
  const money = (v: number) => formatMoney(v, deal.currency, locale);
  const open = deal.status === 'OPEN';
  return (
    <>
      <p className="mb-3 text-sm"><Link href={`/app/crm/pipeline?pipeline=${deal.pipelineId}`} className="muted underline">← {deal.pipeline.name}</Link></p>
      <PageHeader
        title={deal.title}
        subtitle={<span className="flex flex-wrap items-center gap-2"><DealStatusBadge value={deal.status} t={t} /><span className="font-semibold text-fg">{money(deal.value)}</span><span>{deal.stage.name} · {deal.stage.probability} %</span></span>}
        actions={
          <>
            {open && <ActionButton action={winDealAction} fields={{ id }} className="btn btn-primary btn-sm">{t('Marquer gagnée')}</ActionButton>}
            {open && (
              <Modal trigger={t('Marquer perdue')} title={t('Affaire perdue')} triggerClassName="btn btn-outline btn-sm">
                <ActionForm action={loseDealAction} className="space-y-4" successMessage={t('Affaire marquée comme perdue.')}>
                  <input type="hidden" name="id" value={id} />
                  <Textarea label={t('Motif de la perte')} name="reason" maxLength={500} placeholder={t('Prix, concurrent, projet abandonné…')} />
                  <Submit className="btn btn-danger">{t('Confirmer la perte')}</Submit>
                </ActionForm>
              </Modal>
            )}
            {!open && <ActionButton action={reopenDealAction} fields={{ id }} className="btn btn-primary btn-sm">{t('Rouvrir l’affaire')}</ActionButton>}
            <Modal trigger={t('Modifier')} title={t('Modifier l’affaire')} triggerClassName="btn btn-outline btn-sm">
              <ActionForm action={updateDealAction} className="space-y-4" successMessage={t('Modifications enregistrées.')}>
                <input type="hidden" name="id" value={id} />
                <DealFields t={t} currency={deal.currency} contacts={contacts} companies={companies} members={members} userId={ctx.userId} value={deal} />
                <Submit>{t('Enregistrer')}</Submit>
              </ActionForm>
            </Modal>
            {can.remove && <ActionButton action={deleteDealAction} fields={{ id, locale }} className="btn btn-danger btn-sm" confirm={t('Supprimer définitivement cette affaire et son historique ?')}>{t('Supprimer')}</ActionButton>}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <Card title={t('Détails')}>
            <DefList items={[
              [t('Montant'), money(deal.value)],
              [t('Prévision pondérée'), open ? money(deal.weighted) : null],
              [t('Contact'), deal.contact && <Link href={`/app/crm/contacts/${deal.contact.id}`} className="underline">{fullName(deal.contact)}</Link>],
              [t('Entreprise'), deal.company && <Link href={`/app/crm/companies/${deal.company.id}`} className="underline">{deal.company.name}</Link>],
              [t('Responsable'), deal.ownerName],
              [t('Clôture prévue'), deal.expectedCloseAt && day(deal.expectedCloseAt, locale)],
              [t('Clôturée le'), deal.closedAt && formatDateTime(deal.closedAt, locale, tz)],
              [t('Motif de la perte'), deal.status === 'LOST' ? deal.lostReason : null],
              [t('Créée le'), formatDate(deal.createdAt, locale)],
            ]} />
          </Card>
          <Card title={t('Étape')}>
            <ol className="mb-4 flex flex-wrap gap-1.5" aria-label={t('Étapes du pipeline')}>
              {deal.pipeline.stages.map((s) => (
                <li key={s.id} className={`badge ${s.id === deal.stageId ? 'badge-gold' : s.position < deal.stage.position ? 'badge-ok' : ''}`} aria-current={s.id === deal.stageId ? 'step' : undefined}>{s.name}</li>
              ))}
            </ol>
            {open ? (
              <ActionForm action={moveDealAction} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="dealId" value={id} />
                <div className="min-w-0 flex-1 basis-48"><Select label={t('Déplacer vers l’étape')} name="stageId" defaultValue={deal.stageId} options={deal.pipeline.stages.map((s) => ({ value: s.id, label: t('{name} ({probability} %)', { name: s.name, probability: s.probability }) }))} /></div>
                <Submit className="btn btn-outline">{t('Déplacer')}</Submit>
              </ActionForm>
            ) : <p className="muted text-sm">{t('Rouvrez l’affaire pour changer son étape.')}</p>}
          </Card>
          <Card title={t('Tâches')} actions={<TaskModal t={t} members={members} userId={ctx.userId} link={{ dealId: id, contactId: deal.contactId ?? undefined }} />}>
            <TaskList tasks={tasks} t={t} locale={locale} />
          </Card>
          <Card title={t('Propositions')} actions={has('proposals') ? (
            <Modal trigger={t('Nouvelle proposition')} title={t('Nouvelle proposition')} triggerClassName="btn btn-outline btn-sm">
              <ActionForm action={createProposalAction} className="space-y-4">
                <input type="hidden" name="locale" value={locale} />
                <input type="hidden" name="dealId" value={id} />
                <Input label={t('Objet de la proposition')} name="title" required maxLength={200} defaultValue={deal.title} />
                <Input label={t('Destinataire')} name="recipient" maxLength={300} defaultValue={deal.company?.name ?? (deal.contact ? fullName(deal.contact) : '')} />
                <Submit>{t('Créer et rédiger')}</Submit>
              </ActionForm>
            </Modal>
          ) : undefined}>
            {!has('proposals') ? (
              <p className="muted text-sm">{t('Les propositions commerciales ne sont pas incluses dans votre plan.')} <Link href="/account/subscriptions?product=crm" className="underline">{t('Voir les plans')}</Link></p>
            ) : deal.proposals.length === 0 ? <p className="muted text-sm">{t('Aucune proposition pour cette affaire.')}</p> : (
              <ul className="divide-y divide-line">
                {deal.proposals.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                    <Link href={`/app/crm/proposals/${p.id}`} className="min-w-0 break-words font-medium underline-offset-2 hover:underline">{p.number} — {p.title}</Link>
                    <span className="flex items-center gap-2"><ProposalStatusBadge value={p.status} t={t} /><span className="font-semibold">{formatMoney(p.total, p.currency, locale)}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Attachments files={files} entityType="deal" entityId={id} t={t} locale={locale} />
        </div>
        <div className="space-y-6">
          <Card title={t('Ajouter une activité')}><ActivityForm t={t} link={{ dealId: id }} tz={tz} /></Card>
          <Card title={t('Historique')}><TimelineList items={timeline} t={t} locale={locale} tz={tz} /></Card>
        </div>
      </div>
    </>
  );
}
