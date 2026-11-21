/**
 * Captures the client-area project screen shown on the home page, from the real application.
 * Needs a local server and a project awaiting client validation (the end-to-end purchase scenario creates one).
 *   BASE_URL=http://localhost:3000 npx tsx scripts/capture-client-area.ts
 */
import { chromium } from 'playwright';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/crypto';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const PASSWORD = 'Demo-captures-2026!';
const db = new PrismaClient();
const project = await db.project.findFirst({ where: { status: 'CLIENT_REVIEW' }, include: { user: true }, orderBy: { createdAt: 'desc' } });
if (!project) throw new Error('No project in CLIENT_REVIEW: run the end-to-end purchase scenario first.');
await db.user.update({ where: { id: project.userId }, data: { passwordHash: await hashPassword(PASSWORD), name: 'Camille Favre' } });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1040, height: 650 }, deviceScaleFactor: 2.154 });
await ctx.addCookies([{ name: 'athana_consent', value: encodeURIComponent(JSON.stringify({ v: 1, necessary: true, analytics: false, marketing: false, ts: Date.now() })), url: BASE }]);
const page = await ctx.newPage();
await page.goto(`${BASE}/fr-ch/connexion`, { waitUntil: 'networkidle' });
await page.locator('input[type=email]').fill(project.user.email);
await page.locator('input[type=password]').fill(PASSWORD);
await page.getByRole('button', { name: 'Se connecter' }).click();
await page.waitForURL(/compte/);
await page.goto(`${BASE}/fr-ch/compte/projects/${project.id}`, { waitUntil: 'networkidle' });
// Demonstration identity instead of the test account's generated one.
await page.evaluate(() => {
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n: Node | null;
  while ((n = w.nextNode())) n.nodeValue = n.nodeValue!.replace('Camille Test', 'Boulangerie du Lac').replace(/e2e-\w+@example\.test/, 'camille@exemple.ch');
});
await page.addStyleTag({ content: '[aria-label="Accent colour (development only)"]{display:none!important}' });
await page.screenshot({ path: 'public/images/software/espace-client.png' });
console.log('captured espace-client');
await browser.close();
await db.$disconnect();
