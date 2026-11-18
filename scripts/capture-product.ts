/**
 * Captures the screenshots of ATHANA CRM and ATHANA Pointage used on the marketing pages.
 * It creates (once) a demonstration company with fictional data in the LOCAL database, signs in
 * and photographs the real screens — so the images always match the product.
 *   BASE_URL=http://localhost:3000 npx tsx scripts/capture-product.ts
 */
import { chromium, type BrowserContext } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/crypto';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const OUT = 'public/images/software';
const EMAIL = 'demo-captures@athana.local';
const PASSWORD = 'Demo-captures-2026!';
const db = new PrismaClient();
const day = (offset: number, h = 12, m = 0) => { const d = new Date(); d.setDate(d.getDate() + offset); d.setHours(h, m, 0, 0); return d; };

async function seed() {
  let user = await db.user.findUnique({ where: { email: EMAIL } });
  if (!user) user = await db.user.create({ data: { email: EMAIL, name: 'Camille Favre', passwordHash: await hashPassword(PASSWORD), locale: 'fr-ch' } });
  let org = await db.organization.findUnique({ where: { slug: 'atelier-demo-sa' } });
  if (!org) org = await db.organization.create({ data: { name: 'Atelier Démo SA', slug: 'atelier-demo-sa', country: 'CH', timezone: 'Europe/Zurich', memberships: { create: { userId: user.id, role: 'OWNER' } } } });
  for (const key of ['crm', 'pointage']) {
    const plan = await db.plan.findUniqueOrThrow({ where: { saasProductKey_key: { saasProductKey: key, key: 'PRO' } } });
    await db.subscription.upsert({
      where: { organizationId_saasProductKey: { organizationId: org.id, saasProductKey: key } }, update: {},
      create: { organizationId: org.id, saasProductKey: key, planId: plan.id, status: 'ACTIVE', currency: 'CHF', currentPeriodEnd: day(30) },
    });
  }
  return { user, org };
}

async function seedCrm(orgId: string, userId: string) {
  if (await db.crmDeal.count({ where: { organizationId: orgId } })) return;
  const pipeline = await db.crmPipeline.findFirstOrThrow({ where: { organizationId: orgId, isDefault: true }, include: { stages: { orderBy: { position: 'asc' } } } });
  const companies = await Promise.all([['Boulangerie du Lac', 'Alimentation', 'Lausanne'], ['Cabinet Rivière', 'Santé', 'Genève'], ['Menuiserie Alpina', 'Artisanat', 'Sion'], ['Studio Nord', 'Design', 'Fribourg'], ['Garage des Vignes', 'Automobile', 'Vevey'], ['Fiduciaire Léman', 'Conseil', 'Nyon']]
    .map(([name, industry, city]) => db.crmCompany.create({ data: { organizationId: orgId, name, industry, city, country: 'CH' } })));
  const people: [string, string, string, 'LEAD' | 'PROSPECT' | 'CUSTOMER', string][] = [
    ['Élodie', 'Martin', 'Gérante', 'CUSTOMER', 'Recommandation'], ['Julien', 'Rivière', 'Médecin associé', 'PROSPECT', 'Site web'], ['Marc', 'Dubuis', 'Directeur', 'CUSTOMER', 'Salon'],
    ['Sofia', 'Keller', 'Fondatrice', 'PROSPECT', 'Site web'], ['Pierre', 'Vigne', 'Chef d’atelier', 'LEAD', 'Appel entrant'], ['Nadia', 'Rochat', 'Associée', 'LEAD', 'LinkedIn'],
    ['Thomas', 'Berger', 'Responsable achats', 'PROSPECT', 'Recommandation'], ['Laura', 'Mottet', 'Assistante de direction', 'CUSTOMER', 'Site web'],
  ];
  const contacts = await Promise.all(people.map(([firstName, lastName, jobTitle, lifecycle, source], i) => db.crmContact.create({
    data: { organizationId: orgId, firstName, lastName, jobTitle, lifecycle, source, companyId: companies[i % companies.length].id, ownerId: userId, email: `${firstName.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '')}@exemple.ch`, phone: '+41 00 000 00 0' + i },
  })));
  const deals: [string, number, number][] = [
    ['Site vitrine + réservation', 349000, 0], ['Refonte du site', 520000, 0], ['Boutique en ligne', 890000, 1], ['Contrat de maintenance', 144000, 1], ['Application de planning', 1850000, 2],
    ['Module de prise de rendez-vous', 260000, 2], ['Intégration comptable', 430000, 3], ['Site multilingue', 610000, 3], ['Catalogue produits', 380000, 1],
  ];
  for (const [i, [title, value, stage]] of deals.entries()) {
    const st = pipeline.stages[Math.min(stage, pipeline.stages.length - 1)];
    await db.crmDeal.create({ data: { organizationId: orgId, title, value, currency: 'CHF', pipelineId: pipeline.id, stageId: st.id, contactId: contacts[i % contacts.length].id, companyId: companies[i % companies.length].id, ownerId: userId, expectedCloseAt: day(6 + i * 3) } });
  }
  const last = pipeline.stages[pipeline.stages.length - 1];
  for (const [title, value] of [['Site institutionnel', 420000], ['Landing page de campagne', 149000]] as const) {
    await db.crmDeal.create({ data: { organizationId: orgId, title, value, currency: 'CHF', pipelineId: pipeline.id, stageId: last.id, status: 'WON', closedAt: day(-3), companyId: companies[0].id, contactId: contacts[0].id, ownerId: userId } });
  }
  for (const [i, title] of ['Rappeler Julien Rivière', 'Envoyer la proposition à Studio Nord', 'Préparer la démonstration', 'Relancer le devis de la menuiserie'].entries()) {
    await db.crmTask.create({ data: { organizationId: orgId, title, dueAt: day(i, 12), assigneeId: userId, contactId: contacts[i].id } });
  }
  for (const [i, [type, body]] of ([['call', 'Appel de découverte : besoin d’un site avec prise de rendez-vous.'], ['email', 'Envoi de la proposition commerciale.'], ['meeting', 'Démonstration du prototype, retour très positif.'], ['note', 'Souhaite un lancement avant la fin du trimestre.']] as const).entries()) {
    await db.crmActivity.create({ data: { organizationId: orgId, type, body, userId, contactId: contacts[i].id, occurredAt: day(-i, 10 + i) } });
  }
}

async function seedPointage(orgId: string, userId: string) {
  if (await db.ptEmployee.count({ where: { organizationId: orgId } })) return;
  const schedule = await db.ptSchedule.create({ data: { organizationId: orgId, name: 'Temps plein', weeklyMinutes: 2460, days: [1, 2, 3, 4, 5].map((d) => ({ day: d, start: '08:00', end: '17:12', breakMinutes: 60 })) } });
  const depts = await Promise.all(['Atelier', 'Bureau', 'Livraison'].map((name) => db.ptDepartment.create({ data: { organizationId: orgId, name } })));
  const staff: [string, string, 'in' | 'break' | 'out' | 'done'][] = [['Camille', 'Favre', 'in'], ['Lucas', 'Monnier', 'in'], ['Inès', 'Carron', 'break'], ['Noah', 'Pittet', 'in'], ['Sarah', 'Blanc', 'out'], ['Hugo', 'Roduit', 'in'], ['Mila', 'Gay', 'done'], ['Léo', 'Dayer', 'in']];
  const at = (h: number, m: number, offset = 0) => day(offset, h, m);
  for (const [i, [firstName, lastName, state]] of staff.entries()) {
    const emp = await db.ptEmployee.create({ data: { organizationId: orgId, firstName, lastName, userId: i === 0 ? userId : null, role: i === 0 ? 'ADMIN' : 'EMPLOYEE', departmentId: depts[i % 3].id, scheduleId: schedule.id } });
    // Previous working days (complete), then today's state.
    for (let back = 1; back <= 6; back++) {
      const d = at(8, 0, -back);
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const rows: ['CLOCK_IN' | 'BREAK_START' | 'BREAK_END' | 'CLOCK_OUT', number, number][] = [['CLOCK_IN', 7, 55 + (i % 9)], ['BREAK_START', 12, i % 10], ['BREAK_END', 13, i % 12], ['CLOCK_OUT', 17, 5 + ((i * 7 + back * 5) % 40)]];
      await db.ptTimeEntry.createMany({ data: rows.map(([type, h, m]) => ({ organizationId: orgId, employeeId: emp.id, type, at: at(h, m, -back), source: 'web' })) });
    }
    if (state === 'out') continue;
    const today: ['CLOCK_IN' | 'BREAK_START' | 'BREAK_END' | 'CLOCK_OUT', Date][] = [['CLOCK_IN', at(7, 52 + (i % 8))]];
    const now = new Date();
    if (state === 'break') today.push(['BREAK_START', new Date(now.getTime() - 12 * 60000)]);
    if (state === 'done') today.push(['CLOCK_OUT', new Date(now.getTime() - 20 * 60000)]);
    await db.ptTimeEntry.createMany({ data: today.filter(([, d]) => d < now).map(([type, d]) => ({ organizationId: orgId, employeeId: emp.id, type, at: d, source: i % 2 ? 'mobile' : 'web' })) });
  }
  const sarah = await db.ptEmployee.findFirstOrThrow({ where: { organizationId: orgId, firstName: 'Sarah' } });
  await db.ptAbsence.create({ data: { organizationId: orgId, employeeId: sarah.id, type: 'VACATION', startDate: day(-1), endDate: day(3), status: 'APPROVED' } });
}

async function login(ctx: BrowserContext) {
  await ctx.addCookies([{ name: 'athana_consent', value: encodeURIComponent('{"analytics":false,"marketing":false}'), url: BASE }]);
  const page = await ctx.newPage();
  await page.addInitScript(() => localStorage.setItem('athana-accent', document.documentElement.dataset.accent || 'cyan'));
  await page.goto(`${BASE}/fr-ch/connexion`);
  await page.getByLabel('Adresse e-mail').fill(EMAIL);
  await page.getByLabel('Mot de passe').fill(PASSWORD);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await page.waitForURL(/compte/);
  return page;
}

const { user, org } = await seed();
await db.session.updateMany({ where: { userId: user.id }, data: { activeOrganizationId: org.id } });
await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const desktop = await browser.newContext({ viewport: { width: 1360, height: 850 }, deviceScaleFactor: 1.5 });
const page = await login(desktop);
await db.session.updateMany({ where: { userId: user.id }, data: { activeOrganizationId: org.id } });
await page.goto(`${BASE}/fr-ch/app/crm`, { waitUntil: 'networkidle' }); // first visit creates the default pipeline
await seedCrm(org.id, user.id);
await seedPointage(org.id, user.id);
const hideDevTools = () => page.addStyleTag({ content: '[aria-label="Accent colour (development only)"]{display:none!important}' });
for (const [name, path] of [['crm-dashboard', '/app/crm'], ['crm-pipeline', '/app/crm/pipeline'], ['crm-contacts', '/app/crm/contacts'], ['pointage-team', '/app/pointage/team'], ['pointage-reports', '/app/pointage/history']] as const) {
  await page.goto(`${BASE}/fr-ch${path}`, { waitUntil: 'networkidle' });
  await hideDevTools();
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('captured', name);
}
const mobile = await browser.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2, storageState: await desktop.storageState() });
const m = await mobile.newPage();
await m.goto(`${BASE}/fr-ch/app/pointage`, { waitUntil: 'networkidle' });
await m.addStyleTag({ content: '[aria-label="Accent colour (development only)"]{display:none!important}' });
await m.screenshot({ path: `${OUT}/pointage-mobile.png` });
console.log('captured pointage-mobile');
await browser.close();
await db.$disconnect();
