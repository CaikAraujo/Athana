'use client';
import { Printer } from 'lucide-react';
import { useT } from '@/i18n/client';

export function PrintButton() {
  const t = useT();
  return <button type="button" className="btn btn-outline btn-sm" onClick={() => window.print()}><Printer size={15} aria-hidden />{t('Imprimer / PDF')}</button>;
}
