'use client';

import { ActionButton, ActionForm, Checkbox, Input, Modal, Select, Submit, Textarea } from '@/components/ui/form';
import { useT } from '@/i18n/client';
import * as A from '@/modules/admin/actions';

type Opt = { value: string; label: string };

export function OrderNote({ orderId, value }: { orderId: string; value: string }) {
  const t = useT();
  return (
    <ActionForm action={A.orderNoteAction} className="space-y-3" successMessage={t('Note enregistrée.')}>
      <input type="hidden" name="orderId" value={orderId} />
      <Textarea label={t('Notes internes (invisibles pour le client)')} name="internalNotes" defaultValue={value} rows={4} />
      <Submit className="btn btn-outline btn-sm">{t('Enregistrer')}</Submit>
    </ActionForm>
  );
}

export function CancelOrder({ orderId }: { orderId: string }) {
  const t = useT();
  return (
    <Modal trigger={t('Annuler la commande')} triggerClassName="btn btn-danger btn-sm" title={t('Annuler la commande')}>
      <ActionForm action={A.adminCancelOrderAction} className="space-y-3">
        <input type="hidden" name="orderId" value={orderId} />
        <Textarea label={t('Motif')} name="reason" rows={3} />
        <Submit className="btn btn-danger">{t('Confirmer l’annulation')}</Submit>
      </ActionForm>
    </Modal>
  );
}

export function RefundForm({ paymentId, max, currency }: { paymentId: string; max: number; currency: string }) {
  const t = useT();
  return (
    <Modal trigger={t('Rembourser')} triggerClassName="btn btn-outline btn-sm" title={t('Remboursement')}>
      <ActionForm action={A.refundAction} className="space-y-3" successMessage={t('Remboursement enregistré.')}>
        <input type="hidden" name="paymentId" value={paymentId} />
        <Input label={`${t('Montant')} (${currency})`} name="amount" defaultValue={(max / 100).toString()} inputMode="decimal" required hint={t('Maximum remboursable : {max}', { max: (max / 100).toFixed(2) })} />
        <Textarea label={t('Motif')} name="reason" rows={2} />
        <Submit className="btn btn-danger">{t('Confirmer le remboursement')}</Submit>
      </ActionForm>
    </Modal>
  );
}

export function ProjectStatusForm({ projectId, status, options }: { projectId: string; status: string; options: Opt[] }) {
  const t = useT();
  return (
    <ActionForm action={A.projectStatusAction} className="space-y-3" successMessage={t('Statut mis à jour.')}>
      <input type="hidden" name="projectId" value={projectId} />
      <Select label={t('Statut du projet')} name="status" defaultValue={status} options={options} />
      <Input label={t('Commentaire visible par le client (facultatif)')} name="note" />
      <Submit className="btn btn-primary btn-sm">{t('Mettre à jour le statut')}</Submit>
    </ActionForm>
  );
}

export function ProjectAssignForm({ project, staff }: { project: { id: string; assigneeId: string; dueAt: string; previewUrl: string; liveUrl: string }; staff: Opt[] }) {
  const t = useT();
  return (
    <ActionForm action={A.projectAssignAction} className="space-y-3" successMessage={t('Projet mis à jour.')}>
      <input type="hidden" name="projectId" value={project.id} />
      <Select label={t('Responsable')} name="assigneeId" defaultValue={project.assigneeId} options={[{ value: '', label: t('Non attribué') }, ...staff]} />
      <Input label={t('Échéance')} name="dueAt" type="date" defaultValue={project.dueAt} />
      <Input label={t('URL d’aperçu (client)')} name="previewUrl" type="url" defaultValue={project.previewUrl} placeholder="https://" />
      <Input label={t('URL du site en ligne')} name="liveUrl" type="url" defaultValue={project.liveUrl} placeholder="https://" />
      <Submit className="btn btn-outline btn-sm">{t('Enregistrer')}</Submit>
    </ActionForm>
  );
}

export function StaffMessage({ projectId }: { projectId: string }) {
  const t = useT();
  return (
    <ActionForm action={A.staffMessageAction} className="space-y-3" resetOnSuccess>
      <input type="hidden" name="projectId" value={projectId} />
      <Textarea label={t('Message')} name="body" rows={3} required />
      <Checkbox name="internal" label={t('Note interne (invisible pour le client)')} />
      <Submit className="btn btn-primary btn-sm">{t('Envoyer')}</Submit>
    </ActionForm>
  );
}

export function RevisionForm({ revisionId, status, response }: { revisionId: string; status: string; response: string }) {
  const t = useT();
  return (
    <ActionForm action={A.revisionAction} className="mt-2 grid gap-2 sm:grid-cols-[150px_1fr_auto] sm:items-end">
      <input type="hidden" name="revisionId" value={revisionId} />
      <Select label={t('Statut')} name="status" defaultValue={status} options={[{ value: 'OPEN', label: t('Ouverte') }, { value: 'IN_PROGRESS', label: t('En cours') }, { value: 'DONE', label: t('Traitée') }, { value: 'REJECTED', label: t('Refusée') }]} />
      <Input label={t('Réponse au client')} name="response" defaultValue={response} />
      <Submit className="btn btn-outline btn-sm">{t('OK')}</Submit>
    </ActionForm>
  );
}

export function TaskDone({ taskId }: { taskId: string }) {
  const t = useT();
  return <ActionButton action={A.taskDoneAction} fields={{ taskId }}>{t('Terminer')}</ActionButton>;
}

export function LeadStatus({ leadId, status }: { leadId: string; status: string }) {
  const t = useT();
  const next: Record<string, [string, string] | null> = { NEW: ['CONTACTED', t('Marquer contacté')], CONTACTED: ['QUALIFIED', t('Qualifier')], QUALIFIED: ['CLOSED', t('Clore')], CLOSED: null };
  const n = next[status];
  return n ? <ActionButton action={A.leadStatusAction} fields={{ leadId, status: n[0] }}>{n[1]}</ActionButton> : null;
}

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const t = useT();
  return (
    <ActionForm action={A.ticketReplyAction} className="space-y-3" resetOnSuccess>
      <input type="hidden" name="ticketId" value={ticketId} />
      <Textarea label={t('Réponse')} name="body" rows={4} />
      <div className="flex flex-wrap gap-5"><Checkbox name="internal" label={t('Note interne')} /><Checkbox name="close" label={t('Clore le ticket')} /></div>
      <Submit className="btn btn-primary btn-sm">{t('Envoyer')}</Submit>
    </ActionForm>
  );
}

export function DataRequestButtons({ requestId, type }: { requestId: string; type: string }) {
  const t = useT();
  return (
    <div className="flex flex-wrap gap-2">
      <ActionButton action={A.processDataRequestAction} fields={{ requestId, decision: 'complete' }} className={type === 'DELETE' ? 'btn btn-danger btn-sm' : 'btn btn-primary btn-sm'} confirm={type === 'DELETE' ? t('Anonymiser définitivement ce compte et supprimer ses fichiers ? Cette action est irréversible.') : undefined}>{type === 'DELETE' ? t('Supprimer / anonymiser') : t('Marquer comme traitée')}</ActionButton>
      <ActionButton action={A.processDataRequestAction} fields={{ requestId, decision: 'reject' }}>{t('Refuser')}</ActionButton>
    </div>
  );
}

export function CustomerState({ userId, disabled }: { userId: string; disabled: boolean }) {
  const t = useT();
  return <ActionButton action={A.customerStateAction} fields={{ userId, op: disabled ? 'enable' : 'disable' }} className={disabled ? 'btn btn-outline btn-sm' : 'btn btn-danger btn-sm'} confirm={disabled ? undefined : t('Désactiver ce compte ? Le client ne pourra plus se connecter.')}>{disabled ? t('Réactiver le compte') : t('Désactiver le compte')}</ActionButton>;
}

export function ProductStatusButton({ id, op, label, danger, confirm }: { id: string; op: string; label: string; danger?: boolean; confirm?: string }) {
  return <ActionButton action={A.setProductStatusAction} fields={{ id, op }} className={danger ? 'btn btn-danger btn-sm' : 'btn btn-outline btn-sm'} confirm={confirm}>{label}</ActionButton>;
}

export function DeleteCategory({ id }: { id: string }) {
  const t = useT();
  return <ActionButton action={A.deleteCategoryAction} fields={{ id }} className="btn btn-ghost btn-sm" confirm={t('Supprimer cette catégorie ?')}>{t('Supprimer')}</ActionButton>;
}
