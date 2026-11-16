import type { TFn } from '@/i18n/translate';
import { Input, Select, Textarea } from '@/components/ui/form';
import { toDateInput } from '@/modules/crm/dates';
import { LIFECYCLES, LIFECYCLE_LABELS } from '@/modules/crm/labels';
import type * as crm from '@/modules/crm/service';
import { fullName } from './page';
import { memberOptions } from './parts';

type Members = Awaited<ReturnType<typeof crm.listMembers>>;
type CompanyOptions = Awaited<ReturnType<typeof crm.companyOptions>>;
type ContactOptions = Awaited<ReturnType<typeof crm.contactOptions>>;

type ContactValues = Partial<{ firstName: string; lastName: string; email: string | null; phone: string | null; jobTitle: string | null; lifecycle: string; source: string | null; companyId: string | null; ownerId: string | null; notes: string | null }>;

export function ContactFields({ t, companies, members, value = {}, userId, lockLifecycle }: { t: TFn; companies: CompanyOptions; members: Members; value?: ContactValues; userId: string; lockLifecycle?: 'LEAD' }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t('Prénom')} name="firstName" required maxLength={100} defaultValue={value.firstName ?? ''} autoComplete="off" />
        <Input label={t('Nom')} name="lastName" maxLength={100} defaultValue={value.lastName ?? ''} autoComplete="off" />
        <Input label={t('E-mail')} name="email" type="email" maxLength={200} defaultValue={value.email ?? ''} autoComplete="off" />
        <Input label={t('Téléphone')} name="phone" type="tel" maxLength={60} defaultValue={value.phone ?? ''} autoComplete="off" />
        <Input label={t('Fonction')} name="jobTitle" maxLength={120} defaultValue={value.jobTitle ?? ''} />
        <Select label={t('Entreprise')} name="companyId" defaultValue={value.companyId ?? ''} options={[{ value: '', label: t('— Aucune —') }, ...companies.map((c) => ({ value: c.id, label: c.name }))]} />
        {lockLifecycle
          ? <input type="hidden" name="lifecycle" value={lockLifecycle} />
          : <Select label={t('Statut')} name="lifecycle" defaultValue={value.lifecycle ?? 'LEAD'} options={LIFECYCLES.map((l) => ({ value: l, label: t(LIFECYCLE_LABELS[l]) }))} />}
        <Input label={t('Source')} name="source" maxLength={80} defaultValue={value.source ?? ''} hint={t('Ex. : site web, salon, recommandation')} />
        <Select label={t('Responsable')} name="ownerId" defaultValue={value.ownerId === undefined ? userId : value.ownerId ?? ''} options={memberOptions(members, t)} />
      </div>
      <Textarea label={t('Notes')} name="notes" maxLength={5000} defaultValue={value.notes ?? ''} />
    </>
  );
}

type CompanyValues = Partial<Record<'name' | 'website' | 'industry' | 'phone' | 'email' | 'address' | 'city' | 'country' | 'notes', string | null>>;

export function CompanyFields({ t, value = {} }: { t: TFn; value?: CompanyValues }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t('Nom de l’entreprise')} name="name" required maxLength={160} defaultValue={value.name ?? ''} autoComplete="off" />
        <Input label={t('Secteur')} name="industry" maxLength={120} defaultValue={value.industry ?? ''} />
        <Input label={t('E-mail')} name="email" type="email" maxLength={200} defaultValue={value.email ?? ''} autoComplete="off" />
        <Input label={t('Téléphone')} name="phone" type="tel" maxLength={60} defaultValue={value.phone ?? ''} autoComplete="off" />
        <Input label={t('Site web')} name="website" maxLength={200} defaultValue={value.website ?? ''} />
        <Input label={t('Adresse')} name="address" maxLength={200} defaultValue={value.address ?? ''} />
        <Input label={t('Ville')} name="city" maxLength={120} defaultValue={value.city ?? ''} />
        <Input label={t('Pays')} name="country" maxLength={80} defaultValue={value.country ?? ''} />
      </div>
      <Textarea label={t('Notes')} name="notes" maxLength={5000} defaultValue={value.notes ?? ''} />
    </>
  );
}

type DealValues = Partial<{ title: string; value: number; contactId: string | null; companyId: string | null; ownerId: string | null; expectedCloseAt: Date | null }>;

export function DealFields({ t, currency, contacts, companies, members, userId, value = {}, stages }: {
  t: TFn; currency: string; contacts: ContactOptions; companies: CompanyOptions; members: Members; userId: string; value?: DealValues; stages?: { id: string; name: string }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><Input label={t('Titre de l’affaire')} name="title" required maxLength={160} defaultValue={value.title ?? ''} autoComplete="off" /></div>
      <Input label={t('Montant ({currency})', { currency })} name="value" inputMode="decimal" defaultValue={value.value ? (value.value / 100).toFixed(2) : ''} placeholder="0.00" autoComplete="off" />
      <Input label={t('Clôture prévue')} name="expectedCloseAt" type="date" defaultValue={toDateInput(value.expectedCloseAt)} />
      {stages && <Select label={t('Étape')} name="stageId" options={stages.map((s) => ({ value: s.id, label: s.name }))} />}
      <Select label={t('Contact')} name="contactId" defaultValue={value.contactId ?? ''} options={[{ value: '', label: t('— Aucun —') }, ...contacts.map((c) => ({ value: c.id, label: fullName(c) }))]} />
      <Select label={t('Entreprise')} name="companyId" defaultValue={value.companyId ?? ''} options={[{ value: '', label: stages ? t('— Celle du contact —') : t('— Aucune —') }, ...companies.map((c) => ({ value: c.id, label: c.name }))]} />
      <Select label={t('Responsable')} name="ownerId" defaultValue={value.ownerId === undefined ? userId : value.ownerId ?? ''} options={memberOptions(members, t)} />
    </div>
  );
}
