import { expect, type Page } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

export const db = new PrismaClient();
export const ADMIN = { email: process.env.SEED_ADMIN_EMAIL || 'admin@athana.test', password: process.env.SEED_ADMIN_PASSWORD || 'Admin-Local-2026!' };
export const PORT = process.env.E2E_PORT || 3100;
/** The back office is served on its own host (ADMIN_HOST), as in production. */
export const ADMIN_URL = `http://admin.localhost:${PORT}`;
export const uid = () => Math.random().toString(36).slice(2, 9);

/** Dismisses the cookie banner by refusing optional cookies. */
export async function refuseCookies(page: Page, origin?: string) {
  // The banner appears after hydration; pre-setting the choice cookie is deterministic.
  const base = origin ?? new URL(page.url() === 'about:blank' ? (process.env.E2E_BASE || `http://localhost:${process.env.E2E_PORT || 3100}`) : page.url()).origin;
  await page.context().addCookies([{ name: 'athana_consent', value: encodeURIComponent('{"analytics":false,"marketing":false}'), url: base }]);
  const btn = page.getByRole('button', { name: 'Tout refuser' });
  if (await btn.isVisible().catch(() => false)) await btn.click();
}

export async function register(page: Page, name = 'Camille Test') {
  const email = `e2e-${uid()}@example.test`;
  const password = 'Mot-de-passe-e2e-2026';
  await refuseCookies(page);
  await page.goto('/fr-ch/inscription');
  await page.getByLabel('Nom complet').fill(name);
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe').fill(password);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await expect(page).toHaveURL(/\/fr-ch\/compte/);
  return { email, password };
}

export async function login(page: Page, email: string, password: string, origin?: string) {
  await refuseCookies(page, origin);
  await page.goto('/fr-ch/connexion');
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe').fill(password);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).not.toHaveURL(/connexion/);
}

/** No horizontal scrolling at the current viewport. */
export async function expectNoOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, `horizontal overflow on ${page.url()}`).toBeLessThanOrEqual(1);
}
