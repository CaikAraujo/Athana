'use client';

import { ActionForm, Checkbox, Input, Submit } from '@/components/ui/form';
import { Link, useLocale, useT } from '@/i18n/client';
import { forgotPasswordAction, loginAction, registerAction, resetPasswordAction } from '@/modules/auth/actions';

export function LoginForm({ next }: { next?: string }) {
  const t = useT();
  const locale = useLocale();
  return (
    <ActionForm action={loginAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      {next && <input type="hidden" name="next" value={next} />}
      <Input label={t('Adresse e-mail')} name="email" type="email" autoComplete="email" required />
      <Input label={t('Mot de passe')} name="password" type="password" autoComplete="current-password" required />
      <Submit className="btn btn-primary btn-block">{t('Se connecter')}</Submit>
      <p className="text-center text-sm"><Link href="/forgot-password" className="muted underline hover:text-gold-300">{t('Mot de passe oublié ?')}</Link></p>
    </ActionForm>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const t = useT();
  const locale = useLocale();
  return (
    <ActionForm action={registerAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      {next && <input type="hidden" name="next" value={next} />}
      <Input label={t('Nom complet')} name="name" autoComplete="name" required />
      <Input label={t('Adresse e-mail')} name="email" type="email" autoComplete="email" required />
      <Input label={t('Mot de passe')} name="password" type="password" autoComplete="new-password" minLength={10} required hint={t('10 caractères minimum.')} />
      <Checkbox name="acceptTerms" required label={<>{t('J’accepte les')} <Link href="/legal/cgv" className="underline" target="_blank">{t('conditions générales')}</Link> {t('et la')} <Link href="/legal/confidentialite" className="underline" target="_blank">{t('politique de confidentialité')}</Link>.</>} />
      <Submit className="btn btn-primary btn-block">{t('Créer mon compte')}</Submit>
    </ActionForm>
  );
}

export function ForgotForm() {
  const t = useT();
  const locale = useLocale();
  return (
    <ActionForm action={forgotPasswordAction} className="space-y-4" resetOnSuccess successMessage={t('Si un compte existe avec cette adresse, un e-mail de réinitialisation vient d’être envoyé.')}>
      <input type="hidden" name="locale" value={locale} />
      <Input label={t('Adresse e-mail')} name="email" type="email" autoComplete="email" required />
      <Submit className="btn btn-primary btn-block">{t('Recevoir le lien')}</Submit>
    </ActionForm>
  );
}

export function ResetForm({ token }: { token: string }) {
  const t = useT();
  const locale = useLocale();
  return (
    <ActionForm action={resetPasswordAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="token" value={token} />
      <Input label={t('Nouveau mot de passe')} name="password" type="password" autoComplete="new-password" minLength={10} required hint={t('10 caractères minimum.')} />
      <Submit className="btn btn-primary btn-block">{t('Enregistrer le mot de passe')}</Submit>
    </ActionForm>
  );
}
