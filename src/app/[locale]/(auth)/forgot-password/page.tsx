import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { ForgotForm } from '../AuthForms';

export default async function ForgotPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const t = await getT(locale);
  return (
    <>
      <h1 className="text-2xl font-semibold">{t('Mot de passe oublié')}</h1>
      <p className="muted mb-6 mt-1 text-sm">{t('Indiquez votre adresse e-mail : nous vous envoyons un lien pour choisir un nouveau mot de passe.')}</p>
      <ForgotForm />
      <p className="muted mt-6 text-center text-sm"><a className="underline hover:text-accent-700" href={localePath(locale, '/login')}>{t('Retour à la connexion')}</a></p>
    </>
  );
}
