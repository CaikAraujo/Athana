import { expect, test } from '@playwright/test';
import { db, refuseCookies, register } from './helpers';

test.beforeAll(async () => { await db.rateLimit.deleteMany(); });

test('SaaS: create a company, start CRM and Pointage trials, use both, cancel', async ({ page }) => {
  const customer = await register(page, 'Sam Saas');
  await page.goto('/fr-ch/app/crm');
  await expect(page).toHaveURL(/compte\/companies/); // no company yet
  await page.getByLabel('Nom de l’entreprise').fill('Atelier Saas SA');
  await page.getByRole('button', { name: 'Créer l’entreprise' }).click();
  await expect(page.getByText('Entreprise active')).toBeVisible();

  await page.goto('/fr-ch/compte/subscriptions');
  await page.locator('#crm').getByRole('button', { name: /Essai gratuit/ }).first().click();
  await expect(page).toHaveURL(/\/fr-ch\/app\/crm/);
  await expect(page.getByText('ATHANA CRM').first()).toBeVisible();
  await page.goto('/fr-ch/app/crm/contacts');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

  await page.goto('/fr-ch/compte/subscriptions');
  await page.locator('#pointage').getByRole('button', { name: /Essai gratuit/ }).first().click();
  await expect(page).toHaveURL(/\/fr-ch\/app\/pointage/);
  await expect(page.getByText('ATHANA Pointage').first()).toBeVisible();

  const user = await db.user.findUniqueOrThrow({ where: { email: customer.email } });
  const subs = await db.subscription.findMany({ where: { organization: { memberships: { some: { userId: user.id } } } } });
  expect(subs.map((s) => s.saasProductKey).sort()).toEqual(['crm', 'pointage']);
  expect(subs.every((s) => s.status === 'TRIALING')).toBe(true);

  // Paid activation through the sandbox, then cancellation.
  await page.goto('/fr-ch/compte/subscriptions');
  await page.getByRole('button', { name: 'Activer l’abonnement payant' }).first().click();
  await expect(page).toHaveURL(/sandbox-payment/);
  await page.getByRole('button', { name: 'Simuler un paiement réussi' }).click();
  await expect(page.getByText('Votre abonnement est activé')).toBeVisible();
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Résilier' }).first().click();
  await expect(page.getByText(/Résiliation programmée/).first()).toBeVisible();
});

test('languages: detection, manual switch, localized URLs, hreflang and a single currency', async ({ browser }) => {
  const ctx = await browser.newContext({ locale: 'de-CH' });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page).toHaveURL(/\/de-ch$/);
  await refuseCookies(page).catch(() => {});
  await expect(page.locator('html')).toHaveAttribute('lang', 'de-CH');
  await expect(page.locator('h1')).toContainText('Website');
  await page.goto('/de-ch/vorlagen');
  await expect(page.getByText('CHF').first()).toBeVisible();
  // The explicit choice wins over browser detection.
  await page.locator('[data-lang-switch]').first().click();
  await page.locator('[data-lang="fr-ch"]').first().click();
  await expect(page).toHaveURL(/\/fr-ch\/modeles/);
  await expect(page.getByText('CHF').first()).toBeVisible();
  await page.goto('/');
  await expect(page).toHaveURL(/\/fr-ch$/);
  // Every language sells in the same currency.
  for (const path of ['/pt-ch/modelos/atelier', '/en-ch/templates/atelier']) {
    await page.goto(path);
    await expect(page.getByText('CHF').first()).toBeVisible();
    await expect(page.getByText(/€|R\$/)).toHaveCount(0);
  }
  await page.goto('/pt-ch/modelos/atelier');
  await expect(page.locator('link[rel="alternate"][hreflang="fr-CH"]')).toHaveAttribute('href', /\/fr-ch\/modeles\/atelier$/);
  await expect(page.locator('link[rel="alternate"][hreflang="de-CH"]')).toHaveAttribute('href', /\/de-ch\/vorlagen\/atelier$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/pt-ch\/modelos\/atelier$/);
  await expect(page.getByRole('button', { name: 'Comprar agora' }).first()).toBeVisible();
  // Addresses of the former country versions move permanently to the matching language.
  const legacy = await ctx.request.get('/pt-br/modelos/atelier', { maxRedirects: 0 });
  expect(legacy.status()).toBe(308);
  expect(legacy.headers().location).toMatch(/\/pt-ch\/modelos\/atelier$/);
  await ctx.close();
});

test('SEO: structured data, sitemap and robots', async ({ page, request }) => {
  await page.goto('/fr-ch/modeles/atelier');
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  const types = ld.map((x) => JSON.parse(x)['@type']);
  expect(types).toEqual(expect.arrayContaining(['Product', 'BreadcrumbList']));
  await page.goto('/fr-ch');
  expect((await page.locator('script[type="application/ld+json"]').allTextContents()).map((x) => JSON.parse(x)['@type'])).toEqual(expect.arrayContaining(['Organization', 'FAQPage']));
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/fr-ch/modeles/atelier');
  expect(sitemap).toContain('/de-ch/vorlagen/atelier');
  expect(sitemap).toContain('hreflang="en-CH"');
  expect((await request.get('/robots.txt')).status()).toBe(200);
  // Demos are never indexed.
  await page.goto('/demo/atelier');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});
