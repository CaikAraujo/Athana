'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useT, Link } from '@/i18n/client';
import { CONSENT_COOKIE, readConsent, track, type ConsentState } from '@/modules/analytics/track';

type Ids = { ga4: string; gtm: string; googleAds: string; metaPixel: string };

function persist(c: ConsentState, policyVersion: string) {
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify({ analytics: c.analytics, marketing: c.marketing, v: policyVersion }))}; path=/; max-age=${60 * 60 * 24 * 180}; samesite=lax`;
  // Proof of consent is stored server-side (RGPD art. 7 / nLPD).
  fetch('/api/consent', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ analytics: c.analytics, marketing: c.marketing }) }).catch(() => {});
  window.dispatchEvent(new Event('athana:consent'));
}

export function ConsentSettingsButton() {
  const t = useT();
  return <button type="button" className="muted cursor-pointer text-sm hover:text-gold-300" onClick={() => window.dispatchEvent(new Event('athana:consent-open'))}>{t('Gérer les cookies')}</button>;
}

/** Cookie banner + tag loader. Tags are injected only when an ID is configured AND consent was given. */
export function ConsentManager({ ids, policyVersion }: { ids: Ids; policyVersion: string }) {
  const t = useT();
  const pathname = usePathname();
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [draft, setDraft] = useState({ analytics: false, marketing: false });

  useEffect(() => {
    const c = readConsent();
    setConsent(c);
    setOpen(!c);
    const reopen = () => { setDraft({ analytics: !!readConsent()?.analytics, marketing: !!readConsent()?.marketing }); setCustom(true); setOpen(true); };
    window.addEventListener('athana:consent-open', reopen);
    return () => window.removeEventListener('athana:consent-open', reopen);
  }, []);

  useEffect(() => { if (consent?.analytics) track('page_view', { page_path: pathname }); }, [pathname, consent]);

  const choose = (c: ConsentState) => { persist(c, policyVersion); setConsent(c); setOpen(false); setCustom(false); };
  const gtagId = ids.ga4 || ids.googleAds;

  return (
    <>
      {consent?.analytics && ids.gtm && (
        <Script id="gtm" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('consent','default',{analytics_storage:'granted',ad_storage:${consent.marketing ? "'granted'" : "'denied'"},ad_user_data:${consent.marketing ? "'granted'" : "'denied'"},ad_personalization:${consent.marketing ? "'granted'" : "'denied'"}});(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(ids.gtm)});`}</Script>
      )}
      {consent?.analytics && !ids.gtm && gtagId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gtagId)}`} strategy="afterInteractive" />
          <Script id="gtag" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('consent','default',{analytics_storage:'granted',ad_storage:${consent.marketing ? "'granted'" : "'denied'"},ad_user_data:${consent.marketing ? "'granted'" : "'denied'"},ad_personalization:${consent.marketing ? "'granted'" : "'denied'"}});${ids.ga4 ? `gtag('config',${JSON.stringify(ids.ga4)},{anonymize_ip:true});` : ''}${ids.googleAds && consent.marketing ? `gtag('config',${JSON.stringify(ids.googleAds)});` : ''}`}</Script>
        </>
      )}
      {consent?.marketing && ids.metaPixel && (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(ids.metaPixel)});fbq('track','PageView');`}</Script>
      )}
      {open && (
        <div role="dialog" aria-modal="false" aria-label={t('Cookies et confidentialité')} className="no-print fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl rounded-2xl border border-line-strong bg-ink-850/95 p-5 shadow-2xl backdrop-blur-md" style={{ animation: 'toast-in .3s ease-out' }}>
          <p className="text-sm font-semibold">{t('Cookies et confidentialité')}</p>
          <p className="muted mt-1 text-sm">
            {t('Nous utilisons des cookies nécessaires au fonctionnement du site et, avec votre accord, des cookies de mesure d’audience et de marketing.')}{' '}
            <Link href="/legal/cookies" className="underline hover:text-gold-300">{t('En savoir plus')}</Link>
          </p>
          {custom && (
            <div className="mt-3 space-y-2 text-sm">
              <label className="flex items-center gap-3"><input type="checkbox" className="check" checked disabled /> {t('Nécessaires (toujours actifs)')}</label>
              <label className="flex cursor-pointer items-center gap-3"><input type="checkbox" className="check" checked={draft.analytics} onChange={(e) => setDraft({ ...draft, analytics: e.target.checked })} /> {t('Mesure d’audience')}</label>
              <label className="flex cursor-pointer items-center gap-3"><input type="checkbox" className="check" checked={draft.marketing} onChange={(e) => setDraft({ ...draft, marketing: e.target.checked })} /> {t('Marketing')}</label>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {custom
              ? <button type="button" className="btn btn-primary btn-sm" onClick={() => choose({ necessary: true, ...draft })}>{t('Enregistrer mes choix')}</button>
              : <button type="button" className="btn btn-primary btn-sm" onClick={() => choose({ necessary: true, analytics: true, marketing: true })}>{t('Tout accepter')}</button>}
            <button type="button" className="btn btn-outline btn-sm" onClick={() => choose({ necessary: true, analytics: false, marketing: false })}>{t('Tout refuser')}</button>
            {!custom && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCustom(true)}>{t('Personnaliser')}</button>}
          </div>
        </div>
      )}
    </>
  );
}

/** Fires one analytics event when mounted (server pages drop it in to report purchase, view_item…). */
export function TrackEvent({ event, params, onceKey }: { event: Parameters<typeof track>[0]; params?: Record<string, unknown>; onceKey?: string }) {
  useEffect(() => {
    if (onceKey) {
      if (sessionStorage.getItem(`trk:${onceKey}`)) return;
      sessionStorage.setItem(`trk:${onceKey}`, '1');
    }
    track(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export function Reveal({ children, className = '', as: Tag = 'div' }: { children: React.ReactNode; className?: string; as?: 'div' | 'section' | 'li' }) {
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('is-visible'); io.disconnect(); } }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [el]);
  return <Tag ref={setEl as never} className={`reveal ${className}`}>{children}</Tag>;
}
