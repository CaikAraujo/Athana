'use client';

import { Link, useT } from '@/i18n/client';

/** Shown when a record does not exist in the active organization. */
export default function CrmNotFound() {
  const t = useT();
  return (
    <div className="empty mx-auto mt-8 max-w-lg">
      <p className="font-medium text-fg-soft">{t('Élément introuvable.')}</p>
      <div className="mt-3"><Link href="/app/crm" className="btn btn-outline btn-sm">{t('Retour au tableau de bord')}</Link></div>
    </div>
  );
}
