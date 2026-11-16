import { headers } from 'next/headers';
import { DEFAULT_LOCALE, isLocale, localePath } from '@/i18n/config';
import { getT } from '@/i18n/server';

export default async function NotFound() {
  const seg = (await headers()).get('x-athana-path')?.split('/')[1];
  const locale = isLocale(seg) ? seg : DEFAULT_LOCALE;
  const t = await getT(locale);
  return (
    <main id="main" className="bg-grid grid min-h-[70vh] place-items-center px-4 py-20 text-center">
      <div>
        <p className="font-display text-7xl font-semibold text-gold-500/50">404</p>
        <h1 className="mt-4 text-3xl font-semibold">{t('Cette page est introuvable.')}</h1>
        <p className="muted mt-2">{t('Le lien est peut-être incorrect ou la page a été déplacée.')}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><a className="btn btn-primary" href={localePath(locale, '/')}>{t('Retour à l’accueil')}</a><a className="btn btn-outline" href={localePath(locale, '/templates')}>{t('Voir les modèles')}</a></div>
      </div>
    </main>
  );
}
