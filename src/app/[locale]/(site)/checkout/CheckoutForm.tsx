'use client';

import { ActionForm, Checkbox, Input, Select, Submit } from '@/components/ui/form';
import { Link, useLocale, useT } from '@/i18n/client';
import { track } from '@/modules/analytics/track';
import { placeOrderAction } from '@/modules/orders/actions';

export function CheckoutForm({ defaults, countries, value, currency, sandbox }: { defaults: { fullName: string; email: string; phone: string; country: string }; countries: { value: string; label: string }[]; value: number; currency: string; sandbox: boolean }) {
  const t = useT();
  const locale = useLocale();
  return (
    <ActionForm action={placeOrderAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t('Nom complet')} name="fullName" defaultValue={defaults.fullName} autoComplete="name" required />
        <Input label={t('Entreprise')} name="company" autoComplete="organization" />
        <Input label={t('Adresse e-mail de facturation')} name="email" type="email" defaultValue={defaults.email} autoComplete="email" required />
        <Input label={t('Téléphone')} name="phone" type="tel" defaultValue={defaults.phone} autoComplete="tel" />
      </div>
      <Input label={t('Adresse')} name="address" autoComplete="street-address" required />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label={t('Code postal')} name="postalCode" autoComplete="postal-code" required />
        <Input label={t('Ville')} name="city" autoComplete="address-level2" required />
        <Select label={t('Pays')} name="country" defaultValue={defaults.country} options={countries} required />
      </div>
      <Input label={t('Numéro de TVA (facultatif)')} name="vatNumber" />
      <Checkbox name="acceptTerms" required label={<>{t('J’ai lu et j’accepte les')} <Link href="/legal/cgv" className="underline" target="_blank">{t('conditions générales de vente')}</Link>.</>} />
      {sandbox && <p className="alert alert-warn">{t('Mode test : aucun paiement réel ne sera effectué. Vous serez redirigé vers une page de paiement de démonstration.')}</p>}
      <span className="block" onClick={() => track('begin_checkout', { value: value / 100, currency })}>
        <Submit className="btn btn-primary btn-lg btn-block">{t('Payer la commande')}</Submit>
      </span>
    </ActionForm>
  );
}
