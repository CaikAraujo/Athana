import 'server-only';
import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { randomToken, sha256 } from '@/lib/crypto';
import { forbidden } from '@/lib/errors';
import { getSetting } from '@/lib/settings';
import { localePath, type Locale } from '@/i18n/config';
import { can, type Permission } from './rbac';

export const SESSION_COOKIE = 'athana_session';

export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown';
}

export async function createSession(userId: string) {
  const { sessionDays } = await getSetting('security');
  const token = randomToken();
  const expiresAt = new Date(Date.now() + sessionDays * 86400_000);
  const h = await headers();
  const membership = await db.membership.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' } });
  await db.session.create({
    data: { tokenHash: sha256(token), userId, expiresAt, ip: await clientIp(), userAgent: h.get('user-agent')?.slice(0, 250), activeOrganizationId: membership?.organizationId },
  });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, secure: env.isProd, sameSite: 'lax', path: '/', expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: sha256(token) } });
  jar.delete(SESSION_COOKIE);
}

export const getSession = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { tokenHash: sha256(token) }, include: { user: true } });
  if (!session || session.expiresAt < new Date() || session.user.disabledAt || session.user.deletedAt) return null;
  return session;
});

export async function getUser() {
  return (await getSession())?.user ?? null;
}

/** Page guard: redirects anonymous visitors to the login page. */
export async function requireUser(locale: Locale, next?: string) {
  const user = await getUser();
  if (!user) redirect(localePath(locale, `/login${next ? `?next=${encodeURIComponent(next)}` : ''}`));
  return user;
}

/** Page guard for the admin: 404-like redirect for non-staff, permission check on the backend. */
export async function requireStaff(locale: Locale, permission: Permission) {
  const user = await requireUser(locale, '/admin');
  if (!user.platformRole) redirect(localePath(locale, '/account'));
  if (!can(user.platformRole, permission)) redirect(localePath(locale, '/admin?denied=1'));
  return user;
}

/** Action/API guard: throws instead of redirecting. */
export async function assertUser() {
  const user = await getUser();
  if (!user) throw forbidden('Veuillez vous connecter.');
  return user;
}

export async function assertPermission(permission: Permission) {
  const user = await assertUser();
  if (!can(user.platformRole, permission)) throw forbidden();
  return user;
}
