/**
 * Generates the catalogue images from the live template demos (so product images are always real).
 *   BASE_URL=http://localhost:3000 node scripts/capture-catalog.mjs
 * Requires a running app and Playwright's Chromium.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const DEMOS = {
  atelier: ['fonctionnalites', 'tarifs', 'contact'], 'maison-lumiere': ['carte', 'reservation', 'histoire'], 'clinique-alba': ['specialites', 'equipe', 'rendez-vous'],
  'helvetia-immo': ['biens', 'vendre', 'agence'], 'studio-eclat': ['soins', 'reservation', 'salon'], batipro: ['services', 'realisations', 'devis'],
  'alpina-voyages': ['destinations', 'sejours', 'contact'], 'boutique-nord': ['boutique', 'produit', 'panier'], 'cabinet-meridien': ['expertises', 'equipe', 'publications'],
  'portfolio-lena': ['projetos', 'sobre', 'contacto'],
};
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
for (const [slug, pages] of Object.entries(DEMOS)) {
  const dir = `public/images/catalog/${slug}`;
  await mkdir(dir, { recursive: true });
  const shots = [['', 'cover'], ...pages.map((p, i) => [p, `page-${i + 1}`])];
  for (const [p, name] of shots) {
    await page.goto(`${BASE}/demo/${slug}${p ? '/' + p : ''}?embed=1`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${dir}/${name}.jpg`, type: 'jpeg', quality: 82 });
  }
  console.log('captured', slug);
}
// Default Open Graph image from the home hero.
const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await og.addInitScript(() => { document.cookie = 'athana_consent=' + encodeURIComponent('{"analytics":false,"marketing":false}') + '; path=/'; });
await og.goto(`${BASE}/fr-ch`, { waitUntil: 'networkidle' });
await og.screenshot({ path: 'public/images/og-default.png' });
await browser.close();
