import { expect, test } from '@playwright/test';
import { ADMIN, db, login, refuseCookies, register } from './helpers';

test.beforeAll(async () => { await db.rateLimit.deleteMany(); });

test('mandatory scenario: account → template → package → test payment → briefing → admin → approval → completed', async ({ page, browser }) => {
  // 1. A visitor creates an account.
  const customer = await register(page);

  // 2-3. Chooses a template and a package, adds an option.
  await page.goto('/fr-ch/modeles');
  await page.getByRole('link', { name: 'Maison Lumière' }).first().click();
  await expect(page.getByRole('heading', { level: 1, name: 'Maison Lumière' })).toBeVisible();
  await page.locator('label', { hasText: 'Basic' }).first().click();
  await page.locator('label', { hasText: 'Page supplémentaire' }).click();
  await page.getByRole('button', { name: 'Acheter maintenant' }).click();
  await expect(page).toHaveURL(/\/fr-ch\/panier/);
  await expect(page.getByText('Maison Lumière')).toBeVisible();

  // Coupon, then checkout.
  await page.getByLabel('Code promo').fill('TEST10');
  await page.getByRole('button', { name: 'Appliquer' }).click();
  await expect(page.getByText(/Remise/)).toBeVisible();
  await page.getByRole('link', { name: 'Passer la commande' }).click();
  await expect(page).toHaveURL(/\/fr-ch\/commande/);
  await page.locator('#f-address').fill('Rue du Test 1');
  await page.locator('#f-postalCode').fill('1200');
  await page.locator('#f-city').fill('Genève');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Payer la commande' }).click();

  // 4. Test purchase on the sandbox payment page (no real money).
  await expect(page).toHaveURL(/sandbox-payment/);
  await expect(page.getByText('PAIEMENT DE TEST')).toBeVisible();
  await page.getByRole('button', { name: 'Simuler un paiement réussi' }).click();

  // 5. Confirmation.
  await expect(page.getByRole('heading', { name: /commande est confirmée/ })).toBeVisible();
  const user = await db.user.findUniqueOrThrow({ where: { email: customer.email } });
  const order = await db.order.findFirstOrThrow({ where: { userId: user.id }, include: { items: { include: { project: true } }, invoices: true } });
  expect(order.status).toBe('PAID');
  expect(order.discount).toBeGreaterThan(0);
  expect(order.invoices).toHaveLength(1);
  expect(await db.emailLog.count({ where: { to: customer.email, templateKey: 'order_confirmation' } })).toBe(1);
  const projectId = order.items[0].project!.id;

  // 6. Briefing: draft, then submit, then final confirmation.
  await page.getByRole('link', { name: 'Remplir le briefing' }).click();
  await page.getByLabel('Nom de l’entreprise').fill('Bistrot du Test');
  await page.getByRole('button', { name: 'Enregistrer le brouillon' }).click();
  await expect(page.getByText('Brouillon enregistré')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Nom de l’entreprise')).toHaveValue('Bistrot du Test');
  await page.getByLabel('Objectif du site').fill('Présenter la carte et recevoir des réservations.');
  await page.getByLabel(/propres mots/).fill('Un site chaleureux avec la carte, les horaires et un formulaire de réservation.');
  await page.getByRole('button', { name: 'Envoyer le briefing' }).click();
  await expect(page.getByText('Briefing envoyé')).toBeVisible();
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Confirmer définitivement' }).click();
  await expect(page.getByText('Ce briefing est confirmé')).toBeVisible();

  // 7-8. The administrator sees the order and changes the project status.
  const adminCtx = await browser.newContext();
  const admin = await adminCtx.newPage();
  await login(admin, ADMIN.email, ADMIN.password);
  await admin.goto('/fr-ch/admin/orders');
  await admin.getByRole('link', { name: order.number }).click();
  await expect(admin.getByText('Bistrot du Test').or(admin.getByText(customer.email)).first()).toBeVisible();
  await admin.goto(`/fr-ch/admin/projects/${projectId}`);
  await expect(admin.getByText('Bistrot du Test')).toBeVisible(); // briefing content
  await admin.getByLabel('Statut du projet').selectOption('IN_DEVELOPMENT');
  await admin.getByRole('button', { name: 'Mettre à jour le statut' }).click();
  await expect(admin.getByText('Statut mis à jour.')).toBeVisible();

  // 9. The client sees the update.
  await page.goto(`/fr-ch/compte/projects/${projectId}`);
  await expect(page.getByText('En développement').first()).toBeVisible();
  await page.goto('/fr-ch/compte/notifications');
  await expect(page.getByText(/En développement/).first()).toBeVisible();

  // 10. Review → approval → completed.
  await admin.getByLabel('Statut du projet').selectOption('CLIENT_REVIEW');
  await admin.getByRole('button', { name: 'Mettre à jour le statut' }).click();
  await expect(admin.getByText('Statut mis à jour.')).toBeVisible();
  await page.goto(`/fr-ch/compte/projects/${projectId}`);
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Approuver le projet' }).click();
  await expect(page.getByText('Approuvé').first()).toBeVisible();
  await admin.reload();
  await admin.getByLabel('Statut du projet').selectOption('COMPLETED');
  await admin.getByRole('button', { name: 'Mettre à jour le statut' }).click();
  await expect(admin.getByText('Statut mis à jour.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Terminé').first()).toBeVisible();
  expect((await db.project.findUniqueOrThrow({ where: { id: projectId } })).status).toBe('COMPLETED');

  // Invoice is available to the client.
  await page.goto('/fr-ch/compte/invoices');
  await expect(page.getByText(order.invoices[0].number)).toBeVisible();
  await adminCtx.close();
});

test('declined test payment leaves the order unpaid and retryable', async ({ page }) => {
  await register(page);
  await page.goto('/fr-ch/modeles/atelier');
  await page.getByRole('button', { name: 'Acheter maintenant' }).click();
  await page.getByRole('link', { name: 'Passer la commande' }).click();
  await page.locator('#f-address').fill('Rue du Test 1');
  await page.locator('#f-postalCode').fill('1200');
  await page.locator('#f-city').fill('Genève');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Payer la commande' }).click();
  await page.getByRole('button', { name: 'Simuler un paiement refusé' }).click();
  await expect(page.getByText('Le paiement n’a pas abouti')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Payer maintenant' })).toBeVisible();
});

test('access control: customers cannot reach the admin; anonymous APIs are closed', async ({ page, request }) => {
  await register(page);
  await page.goto('/fr-ch/admin');
  await expect(page).toHaveURL(/\/fr-ch\/compte/);
  await page.goto('/fr-ch/admin/orders');
  await expect(page).toHaveURL(/\/fr-ch\/compte/);
  expect((await request.get('/api/files/whatever')).status()).toBe(401);
  expect((await request.get('/api/admin/reports')).status()).toBe(403);
  expect((await request.get('/api/cron/daily')).status()).toBe(401);
  expect((await request.get('/api/crm/export?type=contacts')).status()).toBeGreaterThanOrEqual(401);
  expect((await request.post('/api/webhooks/test', { data: '{}', headers: { 'x-athana-signature': 't=1,v1=bad' } })).status()).toBe(400);
  expect((await request.post('/api/webhooks/stripe', { data: '{}' })).status()).toBeGreaterThanOrEqual(400);
});

test('contact form creates a lead', async ({ page }) => {
  await page.goto('/fr-ch/contact');
  await refuseCookies(page);
  const email = `lead-${Date.now()}@example.test`;
  await page.getByLabel('Nom complet').fill('Prospect Test');
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Votre message').fill('Bonjour, je souhaite un site pour mon restaurant.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Envoyer' }).click();
  await expect(page.getByText('Votre message a bien été envoyé')).toBeVisible();
  expect(await db.lead.count({ where: { email } })).toBe(1);
});
