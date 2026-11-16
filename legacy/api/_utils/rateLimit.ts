// In-memory rate limiter for small deployments.
// Note: in serverless this is per instance; better than no protection.

type RateLimitOptions = {
  maxRequests?: number;
  windowMs?: number;
};

const requestMap = new Map<string, { count: number; resetAt: number }>();
const DEFAULT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000);
const DEFAULT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS || 5);
const CLEANUP_INTERVAL = 250;
let callsSinceCleanup = 0;

const cleanupExpired = (now: number) => {
  callsSinceCleanup += 1;
  if (callsSinceCleanup < CLEANUP_INTERVAL) return;
  callsSinceCleanup = 0;
  for (const [key, record] of requestMap.entries()) {
    if (now > record.resetAt) {
      requestMap.delete(key);
    }
  }
};

export function getClientIp(req: any): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

export function isRateLimited(ip: string, routeKey = 'default', options?: RateLimitOptions): boolean {
  const now = Date.now();
  cleanupExpired(now);

  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const maxRequests = options?.maxRequests ?? DEFAULT_MAX_REQUESTS;
  const key = `${routeKey}:${ip}`;
  const record = requestMap.get(key);

  if (!record || now > record.resetAt) {
    requestMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (record.count >= maxRequests) {
    return true;
  }

  record.count += 1;
  return false;
}
