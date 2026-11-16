import { vi } from 'vitest';

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://athana:athana@localhost:5432/athana_test';
process.env.SESSION_SECRET = 'test-secret-0123456789abcdef0123456789abcdef';
process.env.PAYMENTS_MODE = 'test';
process.env.EMAIL_PROVIDER = 'log';
process.env.APP_URL = 'http://localhost:3000';
process.env.STORAGE_DIR = './storage/test';

// React's request-scoped cache() is a pass-through outside a React render.
vi.mock('react', async (orig) => ({ ...(await orig<typeof import('react')>()), cache: <T,>(fn: T) => fn }));
