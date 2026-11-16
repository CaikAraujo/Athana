import { z } from 'zod';
import { db } from '@/lib/db';
import { hashPassword, randomToken, sha256, verifyPassword } from '@/lib/crypto';
import { AppError } from '@/lib/errors';
import { audit } from '@/lib/audit';
import { SETTING_DEFAULTS } from '@/lib/settings';

const email = z.string().trim().toLowerCase().email('Adresse e-mail invalide.').max(254);

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Veuillez indiquer votre nom.').max(120),
  email,
  password: z.string().min(SETTING_DEFAULTS.security.passwordMinLength, 'Le mot de passe doit contenir au moins 10 caractères.').max(200),
  locale: z.string().max(10).default('fr-ch'),
  acceptTerms: z.literal(true, { error: 'Vous devez accepter les conditions.' }),
});

export async function registerUser(input: z.input<typeof registerSchema>) {
  const data = registerSchema.parse(input);
  const existing = await db.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError('Un compte existe déjà avec cette adresse e-mail.', 'conflict', { email: 'Un compte existe déjà avec cette adresse e-mail.' });
  const user = await db.user.create({
    data: { name: data.name, email: data.email, passwordHash: await hashPassword(data.password), locale: data.locale },
  });
  await audit({ actorId: user.id, action: 'user.register', entity: 'User', entityId: user.id });
  return user;
}

/** Constant-ish time: always runs a password verification to avoid user enumeration through timing. */
const DUMMY_HASH = 'scrypt$131072$8$1$AAAAAAAAAAAAAAAAAAAAAA==$' + Buffer.alloc(64).toString('base64');

export async function authenticate(emailInput: string, password: string) {
  const parsed = email.safeParse(emailInput);
  const user = parsed.success ? await db.user.findUnique({ where: { email: parsed.data } }) : null;
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok || user.disabledAt || user.deletedAt) {
    throw new AppError('E-mail ou mot de passe incorrect.', 'invalid');
  }
  return user;
}

/** Returns the raw token (to be e-mailed) or null when the account does not exist — callers must not reveal which. */
export async function createPasswordReset(emailInput: string) {
  const parsed = email.safeParse(emailInput);
  if (!parsed.success) return null;
  const user = await db.user.findUnique({ where: { email: parsed.data } });
  if (!user || user.deletedAt || user.disabledAt) return null;
  const token = randomToken();
  await db.passwordResetToken.create({ data: { userId: user.id, tokenHash: sha256(token), expiresAt: new Date(Date.now() + 3600_000) } });
  return { user, token };
}

export async function resetPassword(token: string, newPassword: string) {
  if (newPassword.length < SETTING_DEFAULTS.security.passwordMinLength) {
    throw new AppError('Le mot de passe doit contenir au moins 10 caractères.', 'invalid');
  }
  const row = await db.passwordResetToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    throw new AppError('Ce lien est invalide ou a expiré.', 'invalid');
  }
  const passwordHash = await hashPassword(newPassword);
  await db.$transaction([
    db.user.update({ where: { id: row.userId }, data: { passwordHash } }),
    db.passwordResetToken.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    // A password change revokes every existing session.
    db.session.deleteMany({ where: { userId: row.userId } }),
  ]);
  await audit({ actorId: row.userId, action: 'user.password_reset', entity: 'User', entityId: row.userId });
}

export async function changePassword(userId: string, current: string, next: string) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await verifyPassword(current, user.passwordHash))) throw new AppError('Mot de passe actuel incorrect.', 'invalid');
  if (next.length < SETTING_DEFAULTS.security.passwordMinLength) throw new AppError('Le mot de passe doit contenir au moins 10 caractères.', 'invalid');
  await db.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(next) } });
  await audit({ actorId: userId, action: 'user.password_change', entity: 'User', entityId: userId });
}
