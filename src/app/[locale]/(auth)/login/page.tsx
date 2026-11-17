import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { adminHost, normalizeHost } from '@/lib/admin-host';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { getUser } from '@/modules/auth/session';
import { LoginForm } from '../AuthForms';

export default async function LoginPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ next?: string; reset?: string }> }) {
  const locale = assertLocale((await params).locale);
  const { next, reset } = await searchParams;
  const user = await getUser();
  if (user) {
    const h = await headers();
    const onAdmin = !adminHost() || normalizeHost(h.get('x-forwarded-host') ?? h.get('host')) === adminHost();
    redirect(localePath(locale, user.platformRole && onAdmin ? '/admin' : '/account'));
  }
  const t = await getT(locale);
  return (
    <>
      <h1 className="text-2xl font-semibold">{t('Connexion')}</h1>
      <p className="muted mb-6 mt-1 text-sm">{t('Accédez à vos commandes, projets et abonnements.')}</p>
      {reset && <p className="alert alert-ok mb-4">{t('Mot de passe mis à jour. Vous pouvez vous connecter.')}</p>}
      <LoginForm next={next} />
      <p className="muted mt-6 text-center text-sm">{t('Pas encore de compte ?')} <a className="text-gold-300 underline" href={localePath(locale, `/register${next ? `?next=${encodeURIComponent(next)}` : ''}`)}>{t('Créer un compte')}</a></p>
    </>
  );
}
