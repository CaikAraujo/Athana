'use client';

import { useEffect } from 'react';
import { Link, useT } from '@/i18n/client';

export default function CrmError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="panel mx-auto mt-8 max-w-lg p-6 text-center" role="alert">
      <h1 className="text-xl font-semibold">{t('Une erreur est survenue')}</h1>
      <p className="muted mt-2 text-sm">{t('La page n’a pas pu être affichée. Vous pouvez réessayer ; si le problème persiste, contactez le support.')}</p>
      {error.digest && <p className="muted mt-2 text-xs">{t('Référence')} : {error.digest}</p>}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button type="button" className="btn btn-primary" onClick={() => reset()}>{t('Réessayer')}</button>
        <Link href="/app/crm" className="btn btn-outline">{t('Retour au tableau de bord')}</Link>
      </div>
    </div>
  );
}
