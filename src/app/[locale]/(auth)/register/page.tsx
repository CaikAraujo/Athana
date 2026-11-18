import { redirect } from 'next/navigation';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { getUser } from '@/modules/auth/session';
import { RegisterForm } from '../AuthForms';

export default async function RegisterPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ next?: string }> }) {
  const locale = assertLocale((await params).locale);
  const { next } = await searchParams;
  if (await getUser()) redirect(localePath(locale, next && next.startsWith('/') ? next : '/account'));
  const t = await getT(locale);
  return (
    <>
      <h1 className="text-2xl font-semibold">{t('Créer un compte')}</h1>
      <p className="muted mb-6 mt-1 text-sm">{t('Un seul compte pour vos sites, vos projets et vos logiciels ATHANA.')}</p>
      <RegisterForm next={next} />
      <p className="muted mt-6 text-center text-sm">{t('Déjà client ?')} <a className="text-accent-700 underline" href={localePath(locale, `/login${next ? `?next=${encodeURIComponent(next)}` : ''}`)}>{t('Se connecter')}</a></p>
    </>
  );
}
