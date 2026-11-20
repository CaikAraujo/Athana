import type { NextConfig } from 'next';

// Third-party hosts are only contacted after consent and when the matching ID is configured.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.googleadservices.com https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.doubleclick.net https://www.googleadservices.com https://www.google.com https://www.facebook.com",
  "frame-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com",
  "object-src 'none'",
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const config: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  images: { qualities: [75, 92] },
  experimental: { serverActions: { bodySizeLimit: '16mb' } },
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
      // Demos are embedded in product pages (same origin only); everything else refuses framing.
      { source: '/demo/:path*', headers: [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }] },
      { source: '/((?!demo).*)', headers: [{ key: 'X-Frame-Options', value: 'DENY' }] },
    ];
  },
  async redirects() {
    // Preserve SEO equity of the legacy site URLs (fr/en/de/it prefixes and old slugs).
    return [
      { source: '/fr', destination: '/fr-ch', permanent: true },
      { source: '/fr/:path*', destination: '/fr-ch/:path*', permanent: true },
      { source: '/de', destination: '/de-ch', permanent: false },
      { source: '/de/:path*', destination: '/de-ch', permanent: false },
      { source: '/en', destination: '/en-ch', permanent: false },
      { source: '/en/:path*', destination: '/en-ch', permanent: false },
      { source: '/it', destination: '/fr-ch', permanent: false },
      { source: '/it/:path*', destination: '/fr-ch', permanent: false },
      { source: '/:locale/projets', destination: '/:locale/realisations', permanent: true },
      { source: '/:locale/demarrer', destination: '/:locale/devis', permanent: true },
      { source: '/:locale/services/developpement-web-sur-mesure-geneve', destination: '/:locale/sur-mesure', permanent: true },
      { source: '/:locale/services/application-web-securisee-geneve', destination: '/:locale/sur-mesure', permanent: true },
      { source: '/:locale/services/integration-odoo-erp-geneve', destination: '/:locale/automation', permanent: true },
      { source: '/:locale/impressum', destination: '/:locale/legal/mentions-legales', permanent: true },
      { source: '/:locale/confidentialite', destination: '/:locale/legal/confidentialite', permanent: true },
    ];
  },
};

export default config;
