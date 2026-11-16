import { expect, test } from '@playwright/test';
import { expectNoOverflow, refuseCookies } from './helpers';

const PUBLIC = ['/fr-ch', '/fr-ch/modeles', '/fr-ch/modeles/boutique-nord', '/fr-ch/logiciels', '/fr-ch/logiciels/pointage', '/fr-ch/sur-mesure', '/fr-ch/devis', '/fr-ch/blog', '/fr-ch/legal/confidentialite', '/fr-ch/connexion', '/fr-ch/inscription', '/fr-ch/panier', '/pt-br', '/pt-pt/modelos'];
const DEMOS = ['atelier', 'maison-lumiere', 'clinique-alba', 'helvetia-immo', 'studio-eclat', 'batipro', 'alpina-voyages', 'boutique-nord', 'cabinet-meridien', 'portfolio-lena'];

test('public pages have no horizontal overflow at this viewport', async ({ page }) => {
  for (const path of PUBLIC) {
    await page.goto(path);
    await refuseCookies(page);
    await expect(page.locator('h1').first()).toBeVisible();
    await expectNoOverflow(page);
  }
});

test('navigation works at this viewport', async ({ page, isMobile }) => {
  await page.goto('/fr-ch');
  await refuseCookies(page);
  if (isMobile) await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'Logiciels' }).click();
  await expect(page).toHaveURL(/\/fr-ch\/logiciels/);
});

test('template demos render and navigate without overflow', async ({ page }) => {
  for (const slug of DEMOS) {
    await page.goto(`/demo/${slug}`);
    await expect(page.locator('h1').first()).toBeVisible();
    await expectNoOverflow(page);
  }
});
