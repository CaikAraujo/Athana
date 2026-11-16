import { db } from './db';
import { AppError } from './errors';

/**
 * Fixed-window rate limiter backed by PostgreSQL, so limits hold across instances
 * (the legacy in-memory limiter was per serverless instance).
 */
export async function rateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt")
    VALUES (${key}, 1, NOW() + (${windowSeconds} * INTERVAL '1 second'))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."resetAt" < NOW() THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" < NOW() THEN NOW() + (${windowSeconds} * INTERVAL '1 second') ELSE "RateLimit"."resetAt" END
    RETURNING "count"`;
  return (rows[0]?.count ?? 1) <= max;
}

export async function enforceRateLimit(key: string, max: number, windowSeconds: number) {
  if (!(await rateLimit(key, max, windowSeconds))) {
    throw new AppError('Trop de tentatives. Veuillez réessayer plus tard.', 'rate_limited');
  }
}
