'use client';

import { useEffect } from 'react';
import { readConsent } from '@/modules/analytics/track';

/** Stores utm_* parameters in a first-party cookie (30 days) so a later lead can be attributed. Requires analytics consent. */
export function UtmCapture() {
  useEffect(() => {
    const save = () => {
      if (!readConsent()?.analytics) return;
      const sp = new URLSearchParams(window.location.search);
      const utm: Record<string, string> = {};
      for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) { const v = sp.get(k); if (v) utm[k] = v.slice(0, 120); }
      if (Object.keys(utm).length) document.cookie = `athana_utm=${encodeURIComponent(JSON.stringify(utm))}; path=/; max-age=2592000; samesite=lax`;
    };
    save();
    window.addEventListener('athana:consent', save);
    return () => window.removeEventListener('athana:consent', save);
  }, []);
  return null;
}
