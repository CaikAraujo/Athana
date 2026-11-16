'use client';

import { ActionButton, ActionForm, Checkbox, Input, Modal, Select, Submit, Textarea } from '@/components/ui/form';
import { useLocale, useT } from '@/i18n/client';
import { I18nInput } from '@/components/app/AdminFields';
import * as A from '@/modules/admin/actions';

type Any = Record<string, unknown>;
const LANG_OPTS = [{ value: 'fr', label: 'Français' }, { value: 'pt-PT', label: 'Português (Portugal)' }, { value: 'pt-BR', label: 'Português (Brasil)' }, { value: 'en', label: 'English' }];

export function ContentPageForm({ page }: { page: Any }) {
  const t = useT();
  return (
    <ActionForm action={A.saveContentPageAction} className="space-y-3" successMessage={t('Page enregistrée.')}>
      <input type="hidden" name="id" value={String(page.id)} />
      <Input label={t('Titre')} name="title" defaultValue={String(page.title)} required />
      <Textarea label={t('Contenu (Markdown simplifié)')} name="body" defaultValue={String(page.body)} rows={16} hint={t('Titres « ## », listes « - », gras « **texte** », liens [texte](https://…). Variables : {{legalName}}, {{address}}, {{email}}…')} />
      <Submit className="btn btn-outline btn-sm">{t('Enregistrer')}</Submit>
    </ActionForm>
  );
}

export function BlogForm({ post }: { post?: Any }) {
  const t = useT();
  const locale = useLocale();
  const p = post ?? {};
  return (
    <ActionForm action={A.saveBlogPostAction} className="space-y-4" successMessage={t('Article enregistré.')}>
      <input type="hidden" name="locale" value={locale} />
      {p.id ? <input type="hidden" name="id" value={String(p.id)} /> : null}
      <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
        <Input label={t('Titre')} name="title" defaultValue={String(p.title ?? '')} required />
        <Select label={t('Langue')} name="language" defaultValue={String(p.language ?? 'fr')} options={LANG_OPTS} />
        <Select label={t('Statut')} name="status" defaultValue={String(p.status ?? 'DRAFT')} options={[{ value: 'DRAFT', label: t('Brouillon') }, { value: 'PUBLISHED', label: t('Publié') }]} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Input label={t('Slug (URL)')} name="slug" defaultValue={String(p.slug ?? '')} hint={t('Laissez vide pour le générer à partir du titre.')} />
        <Input label={t('Clé de traduction')} name="translationKey" defaultValue={String(p.translationKey ?? '')} hint={t('Identique pour les versions traduites d’un même article (hreflang).')} />
      </div>
      <Textarea label={t('Résumé')} name="excerpt" defaultValue={String(p.excerpt ?? '')} rows={2} required />
      <Textarea label={t('Contenu (Markdown simplifié)')} name="body" defaultValue={String(p.body ?? '')} rows={18} required />
      <Input label={t('Titre SEO')} name="seoTitle" defaultValue={String(p.seoTitle ?? '')} />
      <Textarea label={t('Description SEO')} name="seoDescription" defaultValue={String(p.seoDescription ?? '')} rows={2} />
      <Submit>{p.id ? t('Enregistrer') : t('Créer l’article')}</Submit>
    </ActionForm>
  );
}

export function FaqModal({ faq }: { faq?: Any }) {
  const t = useT();
  return (
    <Modal trigger={faq ? t('Modifier') : t('Nouvelle question')} triggerClassName={faq ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'} title={t('Question fréquente')}>
      <ActionForm action={A.saveFaqAction} className="space-y-4" successMessage={t('Enregistré.')}>
        {faq ? <input type="hidden" name="id" value={String(faq.id)} /> : null}
        <I18nInput label={t('Question')} name="question" value={faq?.question} />
        <I18nInput label={t('Réponse')} name="answer" value={faq?.answer} multiline rows={4} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label={t('Emplacement')} name="scope" defaultValue={String(faq?.scope ?? 'home')} options={[{ value: 'home', label: t('Page d’accueil') }, { value: 'crm', label: 'ATHANA CRM' }, { value: 'pointage', label: 'ATHANA Pointage' }]} />
          <Input label={t('Ordre')} name="sortOrder" type="number" defaultValue={String(faq?.sortOrder ?? 0)} />
        </div>
        <Checkbox name="published" label={t('Publiée')} defaultChecked={faq ? !!faq.published : true} />
        <Submit>{t('Enregistrer')}</Submit>
      </ActionForm>
    </Modal>
  );
}

export function BannerModal({ banner }: { banner?: Any }) {
  const t = useT();
  const d = (v: unknown) => (v ? new Date(v as string).toISOString().slice(0, 10) : '');
  return (
    <Modal trigger={banner ? t('Modifier') : t('Nouvelle bannière')} triggerClassName={banner ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'} title={t('Bannière promotionnelle')}>
      <ActionForm action={A.saveBannerAction} className="space-y-4" successMessage={t('Enregistré.')}>
        {banner ? <input type="hidden" name="id" value={String(banner.id)} /> : null}
        <I18nInput label={t('Message')} name="message" value={banner?.message} />
        <Input label={t('Lien interne (facultatif)')} name="linkPath" defaultValue={String(banner?.linkPath ?? '')} placeholder="/templates" />
        <div className="grid gap-4 sm:grid-cols-2"><Input label={t('Début')} name="startsAt" type="date" defaultValue={d(banner?.startsAt)} /><Input label={t('Fin')} name="endsAt" type="date" defaultValue={d(banner?.endsAt)} /></div>
        <Checkbox name="active" label={t('Active')} defaultChecked={!!banner?.active} />
        <Submit>{t('Enregistrer')}</Submit>
      </ActionForm>
    </Modal>
  );
}

export function TestimonialModal({ item }: { item?: Any }) {
  const t = useT();
  return (
    <Modal trigger={item ? t('Modifier') : t('Nouveau témoignage')} triggerClassName={item ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'} title={t('Témoignage client')}>
      <ActionForm action={A.saveTestimonialAction} className="space-y-4" successMessage={t('Enregistré.')}>
        {item ? <input type="hidden" name="id" value={String(item.id)} /> : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('Auteur')} name="author" defaultValue={String(item?.author ?? '')} required />
          <Input label={t('Fonction')} name="role" defaultValue={String(item?.role ?? '')} />
          <Input label={t('Entreprise')} name="company" defaultValue={String(item?.company ?? '')} />
          <Select label={t('Langue')} name="language" defaultValue={String(item?.language ?? 'fr')} options={LANG_OPTS} />
        </div>
        <Textarea label={t('Témoignage')} name="content" defaultValue={String(item?.content ?? '')} rows={4} required />
        <Checkbox name="authentic" label={t('Je confirme que ce témoignage provient d’un client réel, qui a donné son accord pour sa publication.')} />
        <Checkbox name="published" label={t('Publier sur le site')} defaultChecked={!!item?.published} />
        <Submit>{t('Enregistrer')}</Submit>
      </ActionForm>
    </Modal>
  );
}

export function DeleteRow({ kind, id }: { kind: 'faq' | 'banner' | 'testimonial'; id: string }) {
  const t = useT();
  const action = kind === 'faq' ? A.saveFaqAction : kind === 'banner' ? A.saveBannerAction : A.saveTestimonialAction;
  return <ActionButton action={action} fields={{ id, delete: '1' }} className="btn btn-ghost btn-sm" confirm={t('Supprimer définitivement ?')}>{t('Supprimer')}</ActionButton>;
}

export function TranslationForm({ language, source, value, base }: { language: string; source: string; value: string; base: string }) {
  const t = useT();
  return (
    <ActionForm action={A.saveTranslationAction} className="grid gap-2 md:grid-cols-[1fr_1fr_auto] md:items-start">
      <input type="hidden" name="language" value={language} />
      <input type="hidden" name="source" value={source} />
      <p className="text-sm text-fg-soft">{source}</p>
      <textarea name="value" defaultValue={value} placeholder={base} rows={2} className="textarea min-h-0" aria-label={t('Traduction')} />
      <Submit className="btn btn-outline btn-sm">{t('OK')}</Submit>
    </ActionForm>
  );
}

// ── Settings ────────────────────────────────────────────────────────────────

export function SettingForm({ settingKey, fields, values }: { settingKey: string; fields: { name: string; label: string; type?: 'text' | 'number' | 'checkbox' | 'lines'; hint?: string }[]; values: Any }) {
  const t = useT();
  return (
    <ActionForm action={A.saveSettingAction} className="space-y-4" successMessage={t('Paramètres enregistrés.')}>
      <input type="hidden" name="key" value={settingKey} />
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((f) => f.type === 'checkbox'
          ? <div key={f.name} className="sm:col-span-2"><Checkbox name={f.name} label={f.label} defaultChecked={!!values[f.name]} /></div>
          : f.type === 'lines'
            ? <div key={f.name} className="sm:col-span-2"><Textarea label={f.label} name={f.name} defaultValue={(values[f.name] as string[]).join('\n')} rows={5} hint={f.hint} /></div>
            : <Input key={f.name} label={f.label} name={f.name} type={f.type ?? 'text'} defaultValue={String(values[f.name] ?? '')} hint={f.hint} />)}
      </div>
      <Submit className="btn btn-outline btn-sm">{t('Enregistrer')}</Submit>
    </ActionForm>
  );
}

export function MarketForm({ market }: { market: Any }) {
  const t = useT();
  return (
    <ActionForm action={A.saveMarketAction} className="space-y-4" successMessage={t('Marché enregistré.')}>
      <input type="hidden" name="code" value={String(market.code)} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label={t('Devise')} name="currency" defaultValue={String(market.currency)} required maxLength={3} className="uppercase" />
        <Input label={t('Taux de taxe (%)')} name="taxRate" defaultValue={(Number(market.taxRateBps) / 100).toString()} inputMode="decimal" />
        <Input label={t('Libellé de la taxe')} name="taxLabel" defaultValue={String(market.taxLabel)} />
      </div>
      <Input label={t('Moyens de paiement affichés (séparés par des virgules)')} name="paymentMethods" defaultValue={(market.paymentMethods as string[]).join(', ')} hint={t('Information affichée au client ; l’activation réelle se fait chez le prestataire de paiement.')} />
      <Checkbox name="pricesIncludeTax" label={t('Les prix du catalogue incluent la taxe')} defaultChecked={!!market.pricesIncludeTax} />
      <Checkbox name="enabled" label={t('Marché ouvert à la vente')} defaultChecked={!!market.enabled} />
      <Submit className="btn btn-outline btn-sm">{t('Enregistrer')}</Submit>
    </ActionForm>
  );
}

export function EmailTemplateForm({ tpl }: { tpl: Any }) {
  const t = useT();
  return (
    <ActionForm action={A.saveEmailTemplateAction} className="space-y-3" successMessage={t('Modèle enregistré.')}>
      <input type="hidden" name="id" value={String(tpl.id)} />
      <Input label={t('Objet')} name="subject" defaultValue={String(tpl.subject)} required />
      <Textarea label={t('Corps (texte, variables entre {{ }})')} name="body" defaultValue={String(tpl.body)} rows={9} required />
      <Submit className="btn btn-outline btn-sm">{t('Enregistrer')}</Submit>
    </ActionForm>
  );
}

const ROLE_OPTS = ['SUPER_ADMIN', 'ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'SUPPORT', 'FINANCE', 'MARKETING'].map((r) => ({ value: r, label: r.replace('_', ' ') }));

export function StaffModal({ member }: { member?: Any }) {
  const t = useT();
  return (
    <Modal trigger={member ? t('Modifier') : t('Ajouter un membre')} triggerClassName={member ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'} title={member ? String(member.name) : t('Ajouter un membre de l’équipe')}>
      <ActionForm action={A.saveStaffAction} className="space-y-4" successMessage={member ? t('Enregistré.') : t('Membre ajouté. Un e-mail d’invitation lui a été envoyé s’il n’avait pas de compte.')}>
        {member ? <input type="hidden" name="id" value={String(member.id)} /> : <><Input label={t('Nom complet')} name="name" required /><Input label={t('Adresse e-mail')} name="email" type="email" required /></>}
        <Select label={t('Rôle')} name="role" defaultValue={String(member?.platformRole ?? 'SUPPORT')} options={member ? [...ROLE_OPTS, { value: 'NONE', label: t('Aucun (retirer l’accès à l’administration)') }] : ROLE_OPTS} />
        {member && <Checkbox name="disabled" label={t('Compte désactivé')} defaultChecked={!!member.disabledAt} />}
        <Submit>{t('Enregistrer')}</Submit>
      </ActionForm>
    </Modal>
  );
}
