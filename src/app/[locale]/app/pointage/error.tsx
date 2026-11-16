'use client';

import { useT } from '@/i18n/client';

export default function PointageError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useT();
  return (
    <div className="empty" role="alert">
      <p className="font-medium text-fg-soft">{t('Une erreur est survenue. Veuillez réessayer.')}</p>
      <div className="mt-4"><button type="button" className="btn btn-primary" onClick={() => reset()}>{t('Réessayer')}</button></div>
    </div>
  );
}
