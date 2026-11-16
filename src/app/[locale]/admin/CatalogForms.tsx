'use client';

import { ActionForm, Checkbox, Input, Modal, Select, Submit, Textarea } from '@/components/ui/form';
import { useLocale, useT } from '@/i18n/client';
import { I18nInput, I18nLines, PriceInputs } from '@/components/app/AdminFields';
import * as A from '@/modules/admin/actions';

type Opt = { value: string; label: string };
type Any = Record<string, unknown>;

export function ProductForm({ product, categories, currencies, others, addons }: { product?: Any; categories: Opt[]; currencies: string[]; others: Opt[]; addons: Opt[] }) {
  const t = useT();
  const locale = useLocale();
  const p = product ?? {};
  const has = (list: unknown, id: string) => Array.isArray(list) && list.includes(id);
  return (
    <ActionForm action={A.saveProductAction} className="space-y-5" successMessage={t('Produit enregistré.')}>
      <input type="hidden" name="locale" value={locale} />
      {p.id ? <input type="hidden" name="id" value={String(p.id)} /> : null}
      <div className="grid gap-4 md:grid-cols-3">
        <Input label={t('Nom')} name="name" defaultValue={String(p.name ?? '')} required />
        {!p.id && <Input label={t('Slug (URL)')} name="slug" hint={t('Laissez vide pour le générer à partir du nom.')} />}
        <Select label={t('Catégorie')} name="categoryId" defaultValue={String(p.categoryId ?? '')} options={categories} required />
      </div>
      <I18nInput label={t('Accroche')} name="tagline" value={p.tagline} />
      <I18nInput label={t('Description')} name="description" value={p.description} multiline rows={5} />
      <I18nLines label={t('Fonctionnalités (une par ligne)')} name="features" value={p.features} />
      <div className="grid gap-4 md:grid-cols-2">
        <Input label={t('Technologies (séparées par des virgules)')} name="technologies" defaultValue={(p.technologies as string[] | undefined)?.join(', ') ?? ''} />
        <Input label={t('Langues disponibles (codes : fr, pt, en…)')} name="languages" defaultValue={(p.languages as string[] | undefined)?.join(', ') ?? ''} />
        <Input label={t('Démo interne (slug dans /demo)')} name="demoSlug" defaultValue={String(p.demoSlug ?? '')} />
        <Input label={t('ou URL de démonstration externe')} name="demoUrl" type="url" defaultValue={String(p.demoUrl ?? '')} placeholder="https://" />
        <Input label={t('Image principale (chemin /images/… ou URL https)')} name="coverImage" defaultValue={String(p.coverImage ?? '')} />
        <Input label={t('Délai de livraison de base (jours ouvrés)')} name="deliveryDays" type="number" min={1} defaultValue={String(p.deliveryDays ?? 10)} />
      </div>
      <Textarea label={t('Galerie (une image par ligne)')} name="gallery" defaultValue={(p.gallery as string[] | undefined)?.join('\n') ?? ''} rows={3} />
      <PriceInputs label={t('Prix « à partir de » affiché dans le catalogue')} name="startingPrices" value={p.startingPrices} currencies={currencies} hint={t('Laissez vide une devise pour ne pas afficher de prix sur ce marché.')} />
      <I18nInput label={t('Titre SEO')} name="seoTitle" value={p.seoTitle} />
      <I18nInput label={t('Description SEO')} name="seoDescription" value={p.seoDescription} multiline rows={2} />
      <div className="grid gap-5 md:grid-cols-2">
        <fieldset><legend className="label">{t('Produits associés')}</legend><div className="max-h-44 space-y-1.5 overflow-y-auto rounded-lg border border-line p-3">{others.map((o) => <label key={o.value} className="flex items-center gap-2 text-sm"><input type="checkbox" name="related" value={o.value} defaultChecked={has(p.relatedIds, o.value)} className="check" />{o.label}</label>)}</div></fieldset>
        <fieldset><legend className="label">{t('Options spécifiques (en plus des options globales)')}</legend><div className="max-h-44 space-y-1.5 overflow-y-auto rounded-lg border border-line p-3">{addons.map((o) => <label key={o.value} className="flex items-center gap-2 text-sm"><input type="checkbox" name="addons" value={o.value} defaultChecked={has(p.addonIds, o.value)} className="check" />{o.label}</label>)}</div></fieldset>
      </div>
      <div className="flex flex-wrap items-center gap-6">
        <Checkbox name="featured" label={t('Mettre en avant sur la page d’accueil')} defaultChecked={!!p.featured} />
        <div className="w-32"><Input label={t('Ordre')} name="sortOrder" type="number" defaultValue={String(p.sortOrder ?? 0)} /></div>
      </div>
      <Submit>{p.id ? t('Enregistrer le produit') : t('Créer le produit')}</Submit>
    </ActionForm>
  );
}

export function PackageForm({ pkg, currencies }: { pkg: Any; currencies: string[] }) {
  const t = useT();
  return (
    <ActionForm action={A.savePackageAction} className="space-y-4" successMessage={t('Pack enregistré.')}>
      <input type="hidden" name="id" value={String(pkg.id)} />
      <I18nInput label={t('Nom du pack')} name="name" value={pkg.name} />
      <I18nInput label={t('Description')} name="description" value={pkg.description} multiline rows={2} />
      <I18nLines label={t('Contenu du pack (une ligne par élément)')} name="features" value={pkg.features} />
      <PriceInputs label={t('Prix')} name="prices" value={pkg.prices} currencies={currencies} hint={t('Une devise vide rend le pack indisponible sur ce marché.')} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label={t('Délai (jours ouvrés)')} name="deliveryDays" type="number" min={1} defaultValue={String(pkg.deliveryDays)} />
        <Input label={t('Pages incluses')} name="pagesIncluded" type="number" min={1} defaultValue={String(pkg.pagesIncluded)} />
        <Input label={t('Cycles de révision')} name="revisions" type="number" min={0} defaultValue={String(pkg.revisions)} />
      </div>
      <Checkbox name="active" label={t('Pack actif (proposé à la vente)')} defaultChecked={!!pkg.active} />
      <Submit className="btn btn-outline btn-sm">{t('Enregistrer le pack')}</Submit>
    </ActionForm>
  );
}

export function CategoryModal({ category }: { category?: Any }) {
  const t = useT();
  return (
    <Modal trigger={category ? t('Modifier') : t('Nouvelle catégorie')} triggerClassName={category ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'} title={category ? t('Modifier la catégorie') : t('Nouvelle catégorie')}>
      <ActionForm action={A.saveCategoryAction} className="space-y-4" successMessage={t('Catégorie enregistrée.')}>
        {category ? <input type="hidden" name="id" value={String(category.id)} /> : <Input label={t('Slug (URL)')} name="slug" hint={t('Laissez vide pour le générer à partir du nom.')} />}
        <I18nInput label={t('Nom')} name="name" value={category?.name} />
        <Input label={t('Ordre')} name="sortOrder" type="number" defaultValue={String(category?.sortOrder ?? 0)} />
        <Checkbox name="published" label={t('Publiée')} defaultChecked={category ? !!category.published : true} />
        <Submit>{t('Enregistrer')}</Submit>
      </ActionForm>
    </Modal>
  );
}

export function AddonModal({ addon, currencies }: { addon?: Any; currencies: string[] }) {
  const t = useT();
  return (
    <Modal trigger={addon ? t('Modifier') : t('Nouvelle option')} triggerClassName={addon ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'} title={addon ? t('Modifier l’option') : t('Nouvelle option')}>
      <ActionForm action={A.saveAddonAction} className="space-y-4" successMessage={t('Option enregistrée.')}>
        {addon ? <input type="hidden" name="id" value={String(addon.id)} /> : <Input label={t('Slug (URL)')} name="slug" hint={t('Laissez vide pour le générer à partir du nom.')} />}
        <I18nInput label={t('Nom')} name="name" value={addon?.name} />
        <I18nInput label={t('Description')} name="description" value={addon?.description} multiline rows={2} />
        <PriceInputs label={t('Prix')} name="prices" value={addon?.prices} currencies={currencies} />
        <Input label={t('Ordre')} name="sortOrder" type="number" defaultValue={String(addon?.sortOrder ?? 0)} />
        <Checkbox name="global" label={t('Proposée sur tous les produits')} defaultChecked={addon ? !!addon.global : true} />
        <Checkbox name="active" label={t('Active')} defaultChecked={addon ? !!addon.active : true} />
        <Submit>{t('Enregistrer')}</Submit>
      </ActionForm>
    </Modal>
  );
}

export function CouponModal({ coupon, currencies }: { coupon?: Any; currencies: string[] }) {
  const t = useT();
  const d = (v: unknown) => (v ? new Date(v as string).toISOString().slice(0, 10) : '');
  const fixed = coupon?.type === 'FIXED';
  return (
    <Modal trigger={coupon ? t('Modifier') : t('Nouveau coupon')} triggerClassName={coupon ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'} title={coupon ? t('Modifier le coupon') : t('Nouveau coupon')}>
      <ActionForm action={A.saveCouponAction} className="space-y-4" successMessage={t('Coupon enregistré.')}>
        {coupon ? <><input type="hidden" name="id" value={String(coupon.id)} /><input type="hidden" name="code" value={String(coupon.code)} /></> : null}
        {!coupon && <Input label={t('Code')} name="code" required className="uppercase" />}
        <div className="grid gap-4 sm:grid-cols-3">
          <Select label={t('Type')} name="type" defaultValue={String(coupon?.type ?? 'PERCENT')} options={[{ value: 'PERCENT', label: t('Pourcentage') }, { value: 'FIXED', label: t('Montant fixe') }]} />
          <Input label={t('Valeur')} name="value" required defaultValue={coupon ? String(fixed ? Number(coupon.value) / 100 : coupon.value) : ''} hint={t('% ou montant')} />
          <Select label={t('Devise (montant fixe)')} name="currency" defaultValue={String(coupon?.currency ?? currencies[0])} options={currencies.map((c) => ({ value: c, label: c }))} />
        </div>
        <Input label={t('Campagne')} name="campaign" defaultValue={String(coupon?.campaign ?? '')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label={t('Utilisations maximales')} name="maxRedemptions" type="number" min={1} defaultValue={coupon?.maxRedemptions ? String(coupon.maxRedemptions) : ''} />
          <Input label={t('Sous-total minimum')} name="minSubtotal" defaultValue={coupon?.minSubtotal ? String(Number(coupon.minSubtotal) / 100) : ''} />
          <Input label={t('Début')} name="startsAt" type="date" defaultValue={d(coupon?.startsAt)} />
          <Input label={t('Fin')} name="endsAt" type="date" defaultValue={d(coupon?.endsAt)} />
        </div>
        <Checkbox name="active" label={t('Actif')} defaultChecked={coupon ? !!coupon.active : true} />
        <Submit>{t('Enregistrer')}</Submit>
      </ActionForm>
    </Modal>
  );
}

export function PlanForm({ plan, currencies }: { plan: Any; currencies: string[] }) {
  const t = useT();
  return (
    <ActionForm action={A.savePlanAction} className="space-y-4" successMessage={t('Plan enregistré.')}>
      <input type="hidden" name="id" value={String(plan.id)} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label={t('Nom')} name="name" defaultValue={String(plan.name)} required />
        <Input label={t('Jours d’essai')} name="trialDays" type="number" min={0} defaultValue={String(plan.trialDays)} />
        <Input label={t('Places incluses')} name="includedSeats" type="number" min={0} defaultValue={String(plan.includedSeats)} />
      </div>
      <PriceInputs label={t('Prix mensuel')} name="prices" value={plan.prices} currencies={currencies} />
      <PriceInputs label={t('Prix par place supplémentaire')} name="seatPrices" value={plan.seatPrices} currencies={currencies} hint={t('Facturation à l’utilisateur ou à l’employé au-delà des places incluses.')} />
      <Textarea label={t('Limites (JSON)')} name="limits" defaultValue={JSON.stringify(plan.limits)} rows={2} hint={t('Exemple : {"users":10,"contacts":5000}. Une clé absente signifie « illimité ».')} />
      <Input label={t('Fonctionnalités activées (clés séparées par des virgules)')} name="features" defaultValue={(plan.features as string[]).join(', ')} />
      <Checkbox name="active" label={t('Plan proposé à la vente')} defaultChecked={!!plan.active} />
      <Submit className="btn btn-outline btn-sm">{t('Enregistrer le plan')}</Submit>
    </ActionForm>
  );
}
