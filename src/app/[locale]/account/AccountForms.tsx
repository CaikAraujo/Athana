'use client';

import { ActionButton, ActionForm, Checkbox, Input, Modal, Select, Submit, Textarea } from '@/components/ui/form';
import { useLocale, useT } from '@/i18n/client';
import { LOCALES, LOCALE_META } from '@/i18n/config';
import { track } from '@/modules/analytics/track';
import * as A from '@/modules/account/actions';
import { cancelOrderAction, retryPaymentAction } from '@/modules/orders/actions';

export function ProfileForm({ user, countries }: { user: { name: string; phone: string; country: string; locale: string; email: string }; countries: { value: string; label: string }[] }) {
  const t = useT();
  return (
    <ActionForm action={A.updateProfileAction} className="space-y-4" successMessage={t('Profil mis à jour.')}>
      <Input label={t('Nom complet')} name="name" defaultValue={user.name} required />
      <Input label={t('Adresse e-mail')} name="email_ro" defaultValue={user.email} disabled hint={t('Pour changer d’adresse e-mail, contactez le support.')} />
      <Input label={t('Téléphone')} name="phone" type="tel" defaultValue={user.phone} />
      <Select label={t('Pays')} name="country" defaultValue={user.country} options={[{ value: '', label: '—' }, ...countries]} />
      <Select label={t('Langue et pays du site')} name="locale" defaultValue={user.locale} options={LOCALES.map((l) => ({ value: l, label: LOCALE_META[l].label }))} />
      <Submit>{t('Enregistrer')}</Submit>
    </ActionForm>
  );
}

export function PasswordForm() {
  const t = useT();
  return (
    <ActionForm action={A.changePasswordAction} className="space-y-4" resetOnSuccess successMessage={t('Mot de passe modifié.')}>
      <Input label={t('Mot de passe actuel')} name="current" type="password" autoComplete="current-password" required />
      <Input label={t('Nouveau mot de passe')} name="password" type="password" autoComplete="new-password" minLength={10} required hint={t('10 caractères minimum.')} />
      <Submit>{t('Modifier le mot de passe')}</Submit>
    </ActionForm>
  );
}

export function DataRequestForm({ type }: { type: 'EXPORT' | 'DELETE' }) {
  const t = useT();
  return (
    <ActionForm action={A.requestDataAction} className="space-y-3" resetOnSuccess successMessage={t('Votre demande a été enregistrée. Nous la traiterons dans le délai légal.')}>
      <input type="hidden" name="type" value={type} />
      <Textarea label={t('Précisions (facultatif)')} name="note" rows={3} />
      <Submit className={type === 'DELETE' ? 'btn btn-danger' : 'btn btn-outline'}>{type === 'DELETE' ? t('Demander la suppression de mes données') : t('Demander un export complet par l’équipe')}</Submit>
    </ActionForm>
  );
}

export function CompanyForm({ countries, timezones, defaultTz }: { countries: { value: string; label: string }[]; timezones: string[]; defaultTz: string }) {
  const t = useT();
  return (
    <ActionForm action={A.createCompanyAction} className="space-y-4" resetOnSuccess successMessage={t('Entreprise créée.')}>
      <Input label={t('Nom de l’entreprise')} name="name" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label={t('Pays')} name="country" options={[{ value: '', label: '—' }, ...countries]} />
        <Select label={t('Fuseau horaire')} name="timezone" defaultValue={defaultTz} options={timezones.map((z) => ({ value: z, label: z }))} />
        <Input label={t('Adresse')} name="address" />
        <Input label={t('Ville')} name="city" />
        <Input label={t('Code postal')} name="postalCode" />
        <Input label={t('Numéro de TVA')} name="vatNumber" />
      </div>
      <Submit>{t('Créer l’entreprise')}</Submit>
    </ActionForm>
  );
}

export function SwitchCompany({ organizationId }: { organizationId: string }) {
  const t = useT();
  return <ActionButton action={A.switchCompanyAction} fields={{ organizationId }}>{t('Définir comme active')}</ActionButton>;
}

export function OrderActions({ orderId, canPay, canCancel }: { orderId: string; canPay: boolean; canCancel: boolean }) {
  const t = useT();
  const locale = useLocale();
  return (
    <div className="flex flex-wrap gap-2">
      {canPay && <ActionButton action={retryPaymentAction} fields={{ orderId, locale }} className="btn btn-primary btn-sm">{t('Payer maintenant')}</ActionButton>}
      {canCancel && <ActionButton action={cancelOrderAction} fields={{ orderId }} className="btn btn-danger btn-sm" confirm={t('Annuler cette commande ?')}>{t('Annuler la commande')}</ActionButton>}
    </div>
  );
}

export function MessageForm({ projectId, staff }: { projectId: string; staff?: boolean }) {
  const t = useT();
  return (
    <ActionForm action={A.postMessageAction} className="space-y-3" resetOnSuccess>
      <input type="hidden" name="projectId" value={projectId} />
      <Textarea label={t('Votre message')} name="body" rows={3} required maxLength={5000} />
      {staff && <Checkbox name="internal" label={t('Note interne (invisible pour le client)')} />}
      <Submit className="btn btn-primary btn-sm">{t('Envoyer')}</Submit>
    </ActionForm>
  );
}

export function UploadForm({ projectId, briefing }: { projectId: string; briefing?: boolean }) {
  const t = useT();
  return (
    <ActionForm action={A.uploadProjectFileAction} className="space-y-3" resetOnSuccess successMessage={t('Fichier ajouté.')}>
      <input type="hidden" name="projectId" value={projectId} />
      {briefing && <input type="hidden" name="briefing" value="1" />}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="label" htmlFor={`file-${projectId}`}>{t('Fichier (image, PDF, document — 15 Mo max.)')}</label>
          <input id={`file-${projectId}`} type="file" name="file" required className="input py-2" accept=".png,.jpg,.jpeg,.webp,.svg,.pdf,.txt,.docx,.xlsx,.zip" />
        </div>
        <Select label={t('Type')} name="kind" options={[{ value: 'document', label: t('Document') }, { value: 'image', label: t('Image') }, { value: 'logo', label: t('Logo') }]} />
      </div>
      <Submit className="btn btn-outline btn-sm">{t('Envoyer le fichier')}</Submit>
    </ActionForm>
  );
}

export function DeleteFile({ fileId }: { fileId: string }) {
  const t = useT();
  return <ActionButton action={A.deleteProjectFileAction} fields={{ fileId }} className="btn btn-ghost btn-sm" confirm={t('Supprimer ce fichier ?')}>{t('Supprimer')}</ActionButton>;
}

export function ReviewActions({ projectId }: { projectId: string }) {
  const t = useT();
  return (
    <div className="flex flex-wrap gap-3">
      <ActionButton action={A.approveProjectAction} fields={{ projectId }} className="btn btn-primary" confirm={t('Confirmer la validation du projet ?')}>{t('Approuver le projet')}</ActionButton>
      <Modal trigger={t('Demander une révision')} triggerClassName="btn btn-outline" title={t('Demander une révision')}>
        <ActionForm action={A.requestRevisionAction} className="space-y-3" successMessage={t('Demande de révision envoyée.')}>
          <input type="hidden" name="projectId" value={projectId} />
          <Textarea label={t('Décrivez précisément les modifications souhaitées')} name="description" rows={6} required minLength={10} />
          <Submit>{t('Envoyer la demande')}</Submit>
        </ActionForm>
      </Modal>
    </div>
  );
}

export function TicketForm() {
  const t = useT();
  return (
    <ActionForm action={A.createTicketAction} className="space-y-4" resetOnSuccess successMessage={t('Votre demande a été envoyée au support.')}>
      <Input label={t('Sujet')} name="subject" required />
      <Textarea label={t('Votre message')} name="body" rows={5} required minLength={10} />
      <Submit>{t('Envoyer au support')}</Submit>
    </ActionForm>
  );
}

export function TicketReply({ ticketId }: { ticketId: string }) {
  const t = useT();
  return (
    <ActionForm action={A.replyTicketAction} className="space-y-3" resetOnSuccess>
      <input type="hidden" name="ticketId" value={ticketId} />
      <Textarea label={t('Votre réponse')} name="body" rows={3} required />
      <Submit className="btn btn-primary btn-sm">{t('Envoyer')}</Submit>
    </ActionForm>
  );
}

export function MarkRead() {
  const t = useT();
  return <ActionButton action={A.markNotificationsReadAction}>{t('Tout marquer comme lu')}</ActionButton>;
}

export function TrialButton({ organizationId, planId, label }: { organizationId: string; planId: string; label: string }) {
  const locale = useLocale();
  return <span onClick={() => track('subscribe', { plan: planId, step: 'trial' })}><ActionButton action={A.startTrialAction} fields={{ organizationId, planId, locale }} className="btn btn-primary btn-sm btn-block">{label}</ActionButton></span>;
}

export function SubscriptionActions({ sub, plans }: { sub: { id: string; status: string; cancelAtPeriodEnd: boolean; planId: string; hasProvider: boolean }; plans: { value: string; label: string }[] }) {
  const t = useT();
  const locale = useLocale();
  const live = sub.status !== 'CANCELED';
  return (
    <div className="flex flex-wrap items-start gap-2">
      {(sub.status === 'TRIALING' || sub.status === 'PAST_DUE' || sub.status === 'INCOMPLETE' || sub.status === 'CANCELED') && (
        <ActionButton action={A.activateSubscriptionAction} fields={{ subscriptionId: sub.id, locale }} className="btn btn-primary btn-sm">{sub.status === 'CANCELED' ? t('Se réabonner') : sub.status === 'PAST_DUE' ? t('Régulariser le paiement') : t('Activer l’abonnement payant')}</ActionButton>
      )}
      {live && !sub.hasProvider && plans.length > 1 && (
        <Modal trigger={t('Changer de plan')} triggerClassName="btn btn-outline btn-sm" title={t('Changer de plan')}>
          <ActionForm action={A.changePlanAction} className="space-y-4" successMessage={t('Plan modifié.')}>
            <input type="hidden" name="subscriptionId" value={sub.id} />
            <Select label={t('Plan')} name="planId" defaultValue={sub.planId} options={plans} />
            <Submit>{t('Confirmer')}</Submit>
          </ActionForm>
        </Modal>
      )}
      {live && sub.cancelAtPeriodEnd && <ActionButton action={A.resumeSubscriptionAction} fields={{ subscriptionId: sub.id }}>{t('Annuler la résiliation')}</ActionButton>}
      {live && !sub.cancelAtPeriodEnd && (
        <ActionButton action={A.cancelSubscriptionAction} fields={{ subscriptionId: sub.id }} className="btn btn-danger btn-sm" confirm={t('Confirmer la résiliation de cet abonnement ?')}>{t('Résilier')}</ActionButton>
      )}
    </div>
  );
}
