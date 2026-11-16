// Fails when a seeded catalogue image is missing from public/ (run scripts/capture-catalog.mjs to regenerate).
import { existsSync } from 'node:fs';
const slugs = ['atelier', 'maison-lumiere', 'clinique-alba', 'helvetia-immo', 'studio-eclat', 'batipro', 'alpina-voyages', 'boutique-nord', 'cabinet-meridien', 'portfolio-lena'];
const missing = slugs.flatMap((s) => ['cover', 'page-1', 'page-2', 'page-3'].map((n) => `public/images/catalog/${s}/${n}.jpg`)).filter((f) => !existsSync(f));
if (missing.length) { console.error('Missing catalogue images:\n' + missing.join('\n')); process.exit(1); }
console.log('Catalogue images OK');
