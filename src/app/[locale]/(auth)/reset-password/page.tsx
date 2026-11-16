import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { ResetForm } from '../AuthForms';

export default async function ResetPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ token?: string }> }) {
  const locale = assertLocale((await params).locale);
  const { token } = await searchParams;
  const t = await getT(locale);
  return (
    <>
      <h1 className="text-2xl font-semibold">{t('Nouveau mot de passe')}</h1>
      {token
        ? <div className="mt-6"><ResetForm token={token} /></div>
        : <p className="alert alert-danger mt-6">{t('Ce lien est invalide ou a expiré.')} <a className="underline" href={localePath(locale, '/forgot-password')}>{t('Demander un nouveau lien')}</a></p>}
    </>
  );
}
