import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.E2E_PORT || 3100);

/**
 * End-to-end tests run against a production build with sandbox payments and logged e-mails.
 * They need the seeded database (npm run db:seed with SEED_ADMIN_* and SEED_DEMO=true).
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 1, // absorbs the cold start of a freshly booted server
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}`, locale: 'fr-CH', trace: 'off', launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {} },
  projects: [
    { name: 'setup', testMatch: /global\.setup\.ts/ },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, dependencies: ['setup'], testIgnore: /global\.setup\.ts/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /responsive\.spec\.ts/, dependencies: ['setup'] },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    reuseExistingServer: true,
    timeout: 60_000,
    env: { PAYMENTS_MODE: 'test', ALLOW_TEST_PAYMENTS: 'true', SESSION_SECRET: 'e2e-only-secret-0123456789abcdef0123456789abcdef', EMAIL_PROVIDER: 'log', APP_URL: `http://localhost:${PORT}`, CRON_SECRET: 'e2e-cron-secret' },
  },
});
