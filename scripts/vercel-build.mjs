/**
 * Build entry point on Vercel (see vercel.json).
 *  - Production: refuses to build without the required configuration, so a half-configured
 *    deployment can never replace the site that is currently live (Vercel keeps the previous one).
 *  - When a database is configured: applies migrations and the idempotent reference seed.
 *  - Then builds the application.
 */
import { execSync } from 'node:child_process';

const env = process.env;
const run = (cmd, extra = {}) => execSync(cmd, { stdio: 'inherit', env: { ...env, ...extra } });
const target = env.VERCEL_ENV || 'local';
const migrateUrl = env.DATABASE_URL_UNPOOLED || env.POSTGRES_URL_NON_POOLING || env.DATABASE_URL;

const missing = [];
if (!env.DATABASE_URL) missing.push('DATABASE_URL');
if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) missing.push('SESSION_SECRET (32+ characters)');
if (target === 'production') {
  const stripe = env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET;
  if (!stripe && env.ALLOW_TEST_PAYMENTS !== 'true') missing.push('STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET (or ALLOW_TEST_PAYMENTS=true to open with sandbox payments)');
  if (!env.BLOB_READ_WRITE_TOKEN && env.STORAGE_DRIVER !== 'local') missing.push('BLOB_READ_WRITE_TOKEN (private Blob store for customer files)');
}

if (missing.length) {
  const msg = `ATHANA build (${target}): missing configuration:\n  - ${missing.join('\n  - ')}\nSee docs/DEPLOYMENT.md.`;
  if (target === 'production') {
    console.error(`\n${msg}\n\nProduction build aborted on purpose: the current live site stays online.\n`);
    process.exit(1);
  }
  console.warn(`\n${msg}\nContinuing: pages that need the database will fail at runtime on this deployment.\n`);
}

run('npx prisma generate');
if (migrateUrl) {
  // Migrations need a direct (non-pooled) connection when the host provides one.
  run('npx prisma migrate deploy', { DATABASE_URL: migrateUrl });
  run('npx tsx prisma/seed.ts', { DATABASE_URL: migrateUrl });
}
run('npx next build');
