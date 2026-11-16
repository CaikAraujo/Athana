'use client';

/**
 * Vendor-neutral analytics layer. Components call track('purchase', {...});
 * adapters (GTM dataLayer, GA4 gtag, Google Ads, Meta Pixel) are attached only
 * after consent and only when their ID is configured.
 */
export type AnalyticsEvent =
  | 'page_view' | 'view_item' | 'add_to_cart' | 'begin_checkout' | 'purchase'
  | 'briefing_start' | 'briefing_submit' | 'form_submit' | 'contact' | 'subscribe' | 'sign_up' | 'cta_click';

export type ConsentState = { necessary: true; analytics: boolean; marketing: boolean };
export const CONSENT_COOKIE = 'athana_consent';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    __athanaQueue?: [AnalyticsEvent, Record<string, unknown>][];
  }
}

export function readConsent(): ConsentState | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  if (!m) return null;
  try {
    const v = JSON.parse(decodeURIComponent(m[1]));
    return { necessary: true, analytics: !!v.analytics, marketing: !!v.marketing };
  } catch {
    return null;
  }
}

const META_EVENTS: Partial<Record<AnalyticsEvent, string>> = {
  view_item: 'ViewContent', add_to_cart: 'AddToCart', begin_checkout: 'InitiateCheckout', purchase: 'Purchase',
  form_submit: 'Lead', contact: 'Contact', subscribe: 'Subscribe', sign_up: 'CompleteRegistration',
};

export function track(event: AnalyticsEvent, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  const consent = readConsent();
  if (!consent) return; // nothing is collected before a choice is made
  if (consent.analytics) {
    window.dataLayer = window.dataLayer || [];
    if (window.gtag) window.gtag('event', event, params);
    else window.dataLayer.push({ event, ...params });
  }
  if (consent.marketing && window.fbq && META_EVENTS[event]) window.fbq('track', META_EVENTS[event], params);
  window.dispatchEvent(new CustomEvent('athana:track', { detail: { event, params } }));
}
