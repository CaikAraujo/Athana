import 'server-only';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { AppError, forbidden } from '@/lib/errors';
import { m } from '@/i18n/translate';
import { localePath, type Locale } from '@/i18n/config';
import { getSession, requireUser } from '@/modules/auth/session';
import { assertSubscription, loadTenantCtx, subscriptionIsUsable, type TenantCtx } from './context';

/** Page guard for SaaS products: signed in → active organization → usable subscription. */
export async function requireTenant(locale: Locale, productKey: string): Promise<TenantCtx & { organization: { id: string; name: string; timezone: string; settings: unknown } }> {
  await requireUser(locale, `/app/${productKey}`);
  const session = (await getSession())!;
  if (!session.activeOrganizationId) redirect(localePath(locale, `/account/companies?need=${productKey}`));
  let ctx: TenantCtx;
  try {
    ctx = await loadTenantCtx(session.userId, session.activeOrganizationId, productKey);
  } catch {
    redirect(localePath(locale, `/account/companies?need=${productKey}`));
  }
  if (!subscriptionIsUsable(ctx.subscription)) redirect(localePath(locale, `/account/subscriptions?product=${productKey}`));
  const organization = await db.organization.findUniqueOrThrow({ where: { id: ctx.organizationId }, select: { id: true, name: true, timezone: true, settings: true } });
  return { ...ctx, organization };
}

/** Action/API guard: the tenant always comes from the server-side session, never from the request body. */
export async function tenantFromSession(productKey: string): Promise<TenantCtx> {
  const session = await getSession();
  if (!session) throw forbidden(m('Veuillez vous connecter.'));
  if (!session.activeOrganizationId) throw new AppError(m('Aucune entreprise active.'), 'forbidden');
  const ctx = await loadTenantCtx(session.userId, session.activeOrganizationId, productKey);
  assertSubscription(ctx);
  return ctx;
}

export async function switchOrganization(organizationId: string) {
  const session = await getSession();
  if (!session) throw forbidden();
  const membership = await db.membership.findUnique({ where: { userId_organizationId: { userId: session.userId, organizationId } } });
  if (!membership) throw forbidden();
  await db.session.update({ where: { id: session.id }, data: { activeOrganizationId: organizationId } });
}
