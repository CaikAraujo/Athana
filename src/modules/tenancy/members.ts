import type { OrgRole } from '@prisma/client';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { AppError } from '@/lib/errors';
import { audit } from '@/lib/audit';
import { hashPassword, randomToken } from '@/lib/crypto';
import { m } from '@/i18n/translate';
import { DEFAULT_LOCALE, isLocale, localePath } from '@/i18n/config';
import { createPasswordReset } from '@/modules/auth/service';
import { sendEmail, languageOf } from '@/modules/email/service';
import { assertOrgRole, type TenantCtx } from './context';

/**
 * Adds a person to the tenant. An existing account is linked; otherwise an account is created
 * with an unusable random password and the person receives an invitation link to set their own.
 */
export async function inviteMember(ctx: TenantCtx, input: { email: string; name: string; role?: OrgRole; locale?: string }) {
  assertOrgRole(ctx, 'ADMIN');
  const email = input.email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new AppError(m('Adresse e-mail invalide.'));
  const role = input.role ?? 'MEMBER';
  if (role === 'OWNER') throw new AppError(m('Le rôle propriétaire ne peut pas être attribué par invitation.'));
  let user = await db.user.findUnique({ where: { email } });
  const created = !user;
  if (!user) {
    const inviter = await db.user.findUnique({ where: { id: ctx.userId } });
    user = await db.user.create({ data: { email, name: input.name.trim() || email, passwordHash: await hashPassword(randomToken(24)), locale: input.locale ?? inviter?.locale ?? DEFAULT_LOCALE } });
  }
  if (user.disabledAt || user.deletedAt) throw new AppError(m('Ce compte ne peut pas être invité.'));
  const membership = await db.membership.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: ctx.organizationId } },
    create: { userId: user.id, organizationId: ctx.organizationId, role }, update: {},
  });
  const org = await db.organization.findUniqueOrThrow({ where: { id: ctx.organizationId } });
  const locale = isLocale(user.locale) ? user.locale : DEFAULT_LOCALE;
  if (created) {
    const reset = await createPasswordReset(email, 7 * 86400_000);
    await sendEmail({ to: email, templateKey: 'invitation', language: languageOf(locale), vars: { name: user.name, organization: org.name, inviteUrl: env.appUrl + localePath(locale, `/reset-password?token=${reset!.token}`) } });
  } else {
    await sendEmail({ to: email, templateKey: 'added_to_organization', language: languageOf(locale), vars: { name: user.name, organization: org.name, loginUrl: env.appUrl + localePath(locale, '/login') } });
  }
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'member.invited', entity: 'User', entityId: user.id, meta: { role } });
  return { user, membership, created };
}

export async function setMemberRole(ctx: TenantCtx, userId: string, role: OrgRole) {
  assertOrgRole(ctx, 'ADMIN');
  const target = await db.membership.findUnique({ where: { userId_organizationId: { userId, organizationId: ctx.organizationId } } });
  if (!target) throw new AppError(m('Membre introuvable.'), 'not_found');
  if (target.role === 'OWNER' || role === 'OWNER') throw new AppError(m('Le rôle du propriétaire ne peut pas être modifié ici.'));
  await db.membership.update({ where: { id: target.id }, data: { role } });
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'member.role_changed', entity: 'User', entityId: userId, meta: { role } });
}

export async function removeMember(ctx: TenantCtx, userId: string) {
  assertOrgRole(ctx, 'ADMIN');
  const target = await db.membership.findUnique({ where: { userId_organizationId: { userId, organizationId: ctx.organizationId } } });
  if (!target) throw new AppError(m('Membre introuvable.'), 'not_found');
  if (target.role === 'OWNER') throw new AppError(m('Le propriétaire ne peut pas être retiré.'));
  await db.$transaction([
    db.membership.delete({ where: { id: target.id } }),
    db.session.updateMany({ where: { userId, activeOrganizationId: ctx.organizationId }, data: { activeOrganizationId: null } }),
  ]);
  await audit({ actorId: ctx.userId, organizationId: ctx.organizationId, action: 'member.removed', entity: 'User', entityId: userId });
}
