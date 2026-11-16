import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { z } from 'zod';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { randomToken, sha256 } from '@/lib/crypto';
import { rateLimit } from '@/lib/rate-limit';
import { getSetting } from '@/lib/settings';
import { getUser } from '@/modules/auth/session';

const schema = z.object({ analytics: z.boolean(), marketing: z.boolean() });

/** Stores proof of the visitor's cookie choice. The IP is only kept as a salted hash. */
export async function POST(req: Request) {
  const h = await headers();
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
  if (!(await rateLimit(`consent:${ip}`, 30, 3600))) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const jar = await cookies();
  let anonymousId = jar.get('athana_aid')?.value;
  if (!anonymousId || !/^[\w-]{10,60}$/.test(anonymousId)) {
    anonymousId = randomToken(16);
    jar.set('athana_aid', anonymousId, { httpOnly: true, secure: env.isProd, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365 });
  }
  const user = await getUser();
  const { policyVersion } = await getSetting('privacy');
  await db.consent.create({
    data: { anonymousId, userId: user?.id, categories: { necessary: true, ...parsed.data }, policyVersion, ipHash: sha256(env.sessionSecret + ip).slice(0, 32), userAgent: h.get('user-agent')?.slice(0, 250) },
  });
  return NextResponse.json({ ok: true });
}
