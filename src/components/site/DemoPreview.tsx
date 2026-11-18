'use client';

import { useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { useT } from '@/i18n/client';

/** Live demo in a browser frame, with a desktop / mobile width switch. */
export function DemoPreview({ src, title }: { src: string; title: string }) {
  const t = useT();
  const [mobile, setMobile] = useState(false);
  return (
    <div>
      <div className="mb-3 flex justify-center gap-1 rounded-full border border-line-strong bg-ink-850 p-1 sm:w-max sm:mx-auto" role="group" aria-label={t('Format de l’aperçu')}>
        <button type="button" onClick={() => setMobile(false)} aria-pressed={!mobile} className={`btn btn-sm rounded-full! ${!mobile ? 'btn-secondary' : 'btn-ghost'}`}><Monitor size={15} aria-hidden />{t('Ordinateur')}</button>
        <button type="button" onClick={() => setMobile(true)} aria-pressed={mobile} className={`btn btn-sm rounded-full! ${mobile ? 'btn-secondary' : 'btn-ghost'}`}><Smartphone size={15} aria-hidden />{t('Mobile')}</button>
      </div>
      <div className="browser mx-auto transition-[max-width] duration-500" style={{ maxWidth: mobile ? 400 : '100%' }}>
        <div className="browser-bar" aria-hidden><i /><i /><i /></div>
        <iframe src={src} title={title} loading="lazy" className="block h-[640px] w-full bg-white" />
      </div>
    </div>
  );
}
