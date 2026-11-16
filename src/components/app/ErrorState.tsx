'use client';

import { useT } from '@/i18n/client';

export function ErrorState({ reset }: { reset: () => void }) {
  const t = useT();
  return (
    <div className="empty" role="alert">
      <p className="font-medium text-fg-soft">{t('Une erreur est survenue lors du chargement de cette page.')}</p>
      <button type="button" className="btn btn-outline btn-sm mt-4" onClick={reset}>{t('Réessayer')}</button>
    </div>
  );
}
