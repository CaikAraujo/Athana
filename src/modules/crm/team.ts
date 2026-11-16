import { z } from 'zod';
import type { OrgRole } from '@prisma/client';
import { db } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { m } from '@/i18n/translate';
import { assertWithinLimit } from '@/modules/tenancy/context';
import { inviteMember, removeMember, setMemberRole } from '@/modules/tenancy/members';
import { assertCanConfigure, reqText, type TenantCtx } from './shared';

const ORDER: Record<OrgRole, number> = { OWNER: 0, ADMIN: 1, MANAGER: 2, MEMBER: 3 };

/** Members of the tenant (visible to every member: used for owner / assignee selectors). */
export async function listMembers(ctx: TenantCtx) {
  const rows = await db.membership.findMany({ where: { organizationId: ctx.organizationId }, include: { user: { select: { id: true, name: true, email: true } } } });
  return rows
    .map((r) => ({ userId: r.userId, name: r.user.name, email: r.user.email, role: r.role, joinedAt: r.createdAt, isSelf: r.userId === ctx.userId }))
    .sort((a, b) => ORDER[a.role] - ORDER[b.role] || a.name.localeCompare(b.name));
}

const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, m('Adresse e-mail invalide.')).max(200),
  name: reqText(120), role: z.enum(['ADMIN', 'MANAGER', 'MEMBER'], { error: m('Rôle invalide.') }).default('MEMBER'),
});

/** ADMIN+ only; the plan's `users` limit is checked before the invitation is sent. */
export async function inviteTeamMember(ctx: TenantCtx, input: z.input<typeof inviteSchema>) {
  assertCanConfigure(ctx);
  const data = inviteSchema.parse(input);
  const already = await db.membership.findFirst({ where: { organizationId: ctx.organizationId, user: { email: data.email } } });
  if (already) throw new AppError(m('Cette personne fait déjà partie de votre équipe.'), 'conflict', { email: m('Cette personne fait déjà partie de votre équipe.') });
  await assertWithinLimit(ctx, 'users', () => db.membership.count({ where: { organizationId: ctx.organizationId } }));
  return inviteMember(ctx, data);
}

export async function changeMemberRole(ctx: TenantCtx, userId: string, role: string) {
  assertCanConfigure(ctx);
  const next = z.enum(['ADMIN', 'MANAGER', 'MEMBER'], { error: m('Rôle invalide.') }).parse(role);
  if (userId === ctx.userId) throw new AppError(m('Vous ne pouvez pas modifier votre propre rôle.'), 'conflict');
  await setMemberRole(ctx, userId, next);
}

/** Removes a member and releases the records they owned (owner / assignee become empty). */
export async function removeTeamMember(ctx: TenantCtx, userId: string) {
  assertCanConfigure(ctx);
  if (userId === ctx.userId) throw new AppError(m('Vous ne pouvez pas vous retirer vous-même.'), 'conflict');
  await removeMember(ctx, userId);
  const organizationId = ctx.organizationId;
  await db.$transaction([
    db.crmContact.updateMany({ where: { organizationId, ownerId: userId }, data: { ownerId: null } }),
    db.crmDeal.updateMany({ where: { organizationId, ownerId: userId }, data: { ownerId: null } }),
    db.crmTask.updateMany({ where: { organizationId, assigneeId: userId, doneAt: null }, data: { assigneeId: null } }),
  ]);
}
