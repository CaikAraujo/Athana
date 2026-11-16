import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

export default function robots(): MetadataRoute.Robots {
  // Staging and preview deployments must never be indexed.
  if (process.env.ALLOW_INDEXING !== 'true') return { rules: [{ userAgent: '*', disallow: '/' }] };
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/demo/', '/*/admin', '/*/app/', '/*/compte', '/*/conta', '/*/panier', '/*/carrinho', '/*/commande', '/*/checkout', '/*/sandbox-payment', '/*/offres/', '/*/ofertas/'] }],
    sitemap: `${env.appUrl}/sitemap.xml`,
    host: env.appUrl,
  };
}
