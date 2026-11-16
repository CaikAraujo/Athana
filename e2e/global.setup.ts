import { test as setup } from '@playwright/test';
import { db } from './helpers';

// Rate-limit windows from previous runs must not make the suite flaky.
setup('reset rate limits', async () => { await db.rateLimit.deleteMany(); });
