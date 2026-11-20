/**
 * Idempotent bootstrap seed: reference data only (markets, settings, catalogue, plans, templates, legal models).
 * It never overwrites values that already exist, so it is safe to re-run after the owner has edited them.
 *
 * Admin account: set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD. Outside production, when they are missing,
 * a local admin is created with a random password printed once to the console.
 * SEED_DEMO=true additionally creates a demo coupon (TEST10) for sandbox checkouts.
 */
import { PrismaClient, type Prisma } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { hashPassword } from '../src/lib/crypto';
import { LOCALES, LOCALE_META } from '../src/i18n/config';
import { seedSaas } from './seed-data/saas';
import { ADDONS, CATEGORIES, HOME_FAQ, PACKAGE_COPY, PRODUCTS, PRODUCT_FAQ, p } from './seed-data/catalog';
import { CONTENT_TRANSLATIONS } from './seed-data/translations';
import { EMAIL_TEMPLATES } from './seed-data/emails';
import { LEGAL_PAGES } from './seed-data/legal';
import { BLOG_POSTS } from './seed-data/blog';

const db = new PrismaClient();
const j = (v: unknown) => v as Prisma.InputJsonValue;

/** Adds the German and English texts to localized values that still hold the original French and lack that language. */
function withTranslations(v: unknown): { value: unknown; changed: boolean } {
  if (Array.isArray(v)) { const r = v.map(withTranslations); return { value: r.map((x) => x.value), changed: r.some((x) => x.changed) }; }
  if (!v || typeof v !== 'object') return { value: v, changed: false };
  const o = v as Record<string, unknown>;
  if (typeof o.fr === 'string') {
    const tr = CONTENT_TRANSLATIONS[o.fr];
    if (!tr || (o.de && o.en)) return { value: v, changed: false };
    return { value: { ...o, de: o.de || tr.de, en: o.en || tr.en }, changed: true };
  }
  let changed = false; const out: Record<string, unknown> = {};
  for (const [k, x] of Object.entries(o)) { const r = withTranslations(x); out[k] = r.value; changed ||= r.changed; }
  return { value: out, changed };
}
async function backfillTranslations() {
  const fill = async <T extends { id: string }>(rows: T[], fields: (keyof T)[], save: (id: string, data: Record<string, Prisma.InputJsonValue>) => Promise<unknown>) => {
    for (const row of rows) {
      const data: Record<string, Prisma.InputJsonValue> = {};
      for (const f of fields) { const r = withTranslations(row[f]); if (r.changed) data[f as string] = j(r.value); }
      if (Object.keys(data).length) await save(row.id, data);
    }
  };
  await fill(await db.category.findMany(), ['name'], (id, data) => db.category.update({ where: { id }, data }));
  await fill(await db.addon.findMany(), ['name', 'description'], (id, data) => db.addon.update({ where: { id }, data }));
  await fill(await db.product.findMany(), ['tagline', 'description', 'features', 'faq'], (id, data) => db.product.update({ where: { id }, data }));
  await fill(await db.package.findMany(), ['name', 'description', 'features'], (id, data) => db.package.update({ where: { id }, data }));
  await fill((await db.saasProduct.findMany()).map((x) => ({ ...x, id: x.key })), ['tagline', 'description'], (key, data) => db.saasProduct.update({ where: { key }, data }));
  await fill(await db.plan.findMany(), ['highlights'], (id, data) => db.plan.update({ where: { id }, data }));
  await fill(await db.faq.findMany(), ['question', 'answer'], (id, data) => db.faq.update({ where: { id }, data }));
}

async function main() {
  // Markets (URL locale → language, currency, tax). Tax rates start at 0: the owner sets them after fiscal validation.
  for (const [i, code] of LOCALES.entries()) {
    const m = LOCALE_META[code];
    await db.market.upsert({
      where: { code }, update: {},
      create: { code, language: m.language, country: m.country, currency: m.currency, taxRateBps: m.taxRateBps, taxLabel: m.taxLabel, timezone: m.timezone, sortOrder: i },
    });
  }

  await db.market.updateMany({ where: { code: { notIn: [...LOCALES] } }, data: { enabled: false } });

  // Company details taken from the existing athana.ch legal notice.
  const existingCompany = await db.setting.findUnique({ where: { key: 'company' } });
  if (!existingCompany) {
    await db.setting.create({
      data: { key: 'company', value: { legalName: 'ATHANA', address: 'Route de Challex 6', postalCode: '1283', city: 'La Plaine', country: 'CH', email: 'contact@athana.ch', phone: '+41 78 339 98 95', vatNumber: '', registrationNumber: '', iban: '', linkedin: 'https://www.linkedin.com/company/athana-geneve/', whatsapp: '41783399895' } },
    });
  }

  await seedSaas(db);

  for (const [i, c] of CATEGORIES.entries()) {
    await db.category.upsert({ where: { slug: c.slug }, update: {}, create: { slug: c.slug, name: j(c.name), sortOrder: i } });
  }
  for (const [i, a] of ADDONS.entries()) {
    await db.addon.upsert({ where: { slug: a.slug }, update: {}, create: { slug: a.slug, name: j(a.name), description: j(a.description), prices: p(a.chf), sortOrder: i } });
  }

  for (const [i, prod] of PRODUCTS.entries()) {
    const category = await db.category.findUniqueOrThrow({ where: { slug: prod.category } });
    const exists = await db.product.findUnique({ where: { slug: prod.slug } });
    if (exists) continue;
    await db.product.create({
      data: {
        slug: prod.slug, name: prod.name, categoryId: category.id, tagline: j(prod.tagline), description: j(prod.description),
        features: j(prod.features), technologies: prod.technologies, demoSlug: prod.slug,
        coverImage: `/images/catalog/${prod.slug}/cover.jpg`,
        gallery: [1, 2, 3].map((n) => `/images/catalog/${prod.slug}/page-${n}.jpg`),
        startingPrices: p(prod.pricing.BASIC.chf), deliveryDays: prod.pricing.BASIC.days, languages: prod.languages,
        status: 'PUBLISHED', featured: !!prod.featured, sortOrder: i, faq: j(PRODUCT_FAQ),
        packages: {
          create: (['BASIC', 'BUSINESS', 'PREMIUM'] as const).map((tier) => ({
            tier, name: j(PACKAGE_COPY[tier].name), description: j(PACKAGE_COPY[tier].description), features: j(PACKAGE_COPY[tier].features),
            prices: p(prod.pricing[tier].chf), deliveryDays: prod.pricing[tier].days, pagesIncluded: prod.pricing[tier].pages, revisions: prod.pricing[tier].revisions,
          })),
        },
      },
    });
  }
  for (const prod of PRODUCTS) {
    const row = await db.product.findUniqueOrThrow({ where: { slug: prod.slug }, include: { related: true } });
    if (row.related.length) continue;
    await db.product.update({ where: { id: row.id }, data: { related: { connect: prod.related.map((slug) => ({ slug })) } } });
  }

  if ((await db.faq.count()) === 0) {
    await db.faq.createMany({ data: HOME_FAQ.map((f, i) => ({ scope: 'home', question: j(f.q), answer: j(f.a), sortOrder: i })) });
  }

  for (const [key, set] of Object.entries(EMAIL_TEMPLATES)) {
    for (const [language, tpl] of Object.entries(set)) {
      await db.emailTemplate.upsert({ where: { key_language: { key, language } }, update: {}, create: { key, language, ...tpl } });
    }
  }
  for (const [key, set] of Object.entries(LEGAL_PAGES)) {
    for (const [language, page] of Object.entries(set)) {
      await db.contentPage.upsert({ where: { key_language: { key, language } }, update: {}, create: { key, language, ...page } });
    }
  }
  for (const post of BLOG_POSTS) {
    await db.blogPost.upsert({ where: { language_slug: { language: post.language, slug: post.slug } }, update: {}, create: { ...post, status: 'PUBLISHED', publishedAt: new Date() } });
  }

  await backfillTranslations();

  // Super admin
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 12) throw new Error('SEED_ADMIN_PASSWORD must be at least 12 characters');
    await db.user.upsert({ where: { email }, update: { platformRole: 'SUPER_ADMIN' }, create: { email, name: 'Administrateur', passwordHash: await hashPassword(password), platformRole: 'SUPER_ADMIN' } });
    console.log(`Super admin ready: ${email}`);
  } else if (process.env.NODE_ENV !== 'production' && !(await db.user.findFirst({ where: { platformRole: 'SUPER_ADMIN' } }))) {
    const generated = randomBytes(12).toString('base64url');
    await db.user.create({ data: { email: 'admin@athana.local', name: 'Administrateur local', passwordHash: await hashPassword(generated), platformRole: 'SUPER_ADMIN' } });
    console.log(`Local super admin created → admin@athana.local / ${generated}  (shown once; change it after first login)`);
  } else if (!(await db.user.findFirst({ where: { platformRole: 'SUPER_ADMIN' } }))) {
    console.warn('No super admin exists. Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD and run the seed again.');
  }

  if (process.env.SEED_DEMO === 'true') {
    await db.coupon.upsert({ where: { code: 'TEST10' }, update: {}, create: { code: 'TEST10', type: 'PERCENT', value: 10, campaign: 'sandbox' } });
    console.log('Demo coupon TEST10 (10 %) available.');
  }
  console.log('Seed complete.');
}

main().then(() => db.$disconnect()).catch(async (e) => { console.error(e); await db.$disconnect(); process.exit(1); });
