import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const config: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
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
      { source: '/:lang(en|de|it)', destination: '/fr-ch', permanent: false },
      { source: '/:lang(en|de|it)/:path*', destination: '/fr-ch/:path*', permanent: false },
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
