import { execSync } from 'node:child_process';

/** Tests run against a dedicated database (TEST_DATABASE_URL) — never the development one. */
export const TEST_DB = process.env.TEST_DATABASE_URL || 'postgresql://athana:athana@localhost:5432/athana_test';

export default function setup() {
  if (!/test/i.test(new URL(TEST_DB).pathname)) throw new Error('TEST_DATABASE_URL must point to a database whose name contains "test"');
  execSync('npx prisma migrate deploy', { env: { ...process.env, DATABASE_URL: TEST_DB }, stdio: 'pipe' });
}
