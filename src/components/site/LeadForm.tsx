'use client';

import { ActionForm, Checkbox, Input, Select, Submit, Textarea } from '@/components/ui/form';
import { Link, useLocale, useT } from '@/i18n/client';
import { track } from '@/modules/analytics/track';
import { createLeadAction } from '@/modules/content/actions';

/** Contact / quote / campaign lead form. A honeypot field and server-side rate limiting protect it from spam. */
export function LeadForm({ kind = 'contact', interest, compact }: { kind?: 'contact' | 'quote' | 'campaign'; interest?: string; compact?: boolean }) {
  const t = useT();
  const locale = useLocale();
  const quote = kind === 'quote';
  return (
    <ActionForm action={createLeadAction} className="space-y-4" resetOnSuccess successMessage={t('Merci ! Votre message a bien été envoyé. Nous vous répondrons rapidement.')} onDone={() => track(kind === 'contact' ? 'contact' : 'form_submit', { form: kind, interest })}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="kind" value={kind} />
      <div className="hidden" aria-hidden><label>Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label={t('Nom complet')} name="name" autoComplete="name" required />
        <Input label={t('Entreprise')} name="company" autoComplete="organization" />
        <Input label={t('Adresse e-mail')} name="email" type="email" autoComplete="email" required />
        <Input label={t('Téléphone')} name="phone" type="tel" autoComplete="tel" />
      </div>
      {interest ? <input type="hidden" name="interest" value={interest} /> : (
        <Select label={t('Votre besoin')} name="interest" options={[
          { value: 'website', label: t('Site web') }, { value: 'ecommerce', label: t('Boutique en ligne') },
          { value: 'software', label: t('Logiciel (CRM, Pointage…)') }, { value: 'automation', label: t('Automatisation & IA') },
          { value: 'custom', label: t('Développement sur mesure') }, { value: 'other', label: t('Autre') },
        ]} />
      )}
      {quote && (
        <Select label={t('Budget envisagé')} name="budget" options={[
          { value: '', label: t('À définir') }, { value: '<2k', label: t('Moins de 2 000') }, { value: '2-5k', label: '2 000 – 5 000' },
          { value: '5-15k', label: '5 000 – 15 000' }, { value: '15k+', label: t('Plus de 15 000') },
        ]} />
      )}
      <Textarea label={quote ? t('Décrivez votre projet') : t('Votre message')} name="message" required rows={compact ? 4 : 6} minLength={10} />
      <Checkbox name="consent" required label={<>{t('J’accepte que mes données soient utilisées pour traiter ma demande.')} <Link href="/legal/confidentialite" className="underline" target="_blank">{t('Politique de confidentialité')}</Link></>} />
      <Submit className="btn btn-primary btn-lg">{quote ? t('Envoyer ma demande de devis') : t('Envoyer')}</Submit>
    </ActionForm>
  );
}
