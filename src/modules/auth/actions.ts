'use server';

import { redirect } from 'next/navigation';
import { run, formObject, type ActionState } from '@/lib/action';
import { enforceRateLimit } from '@/lib/rate-limit';
import { env } from '@/lib/env';
import { DEFAULT_LOCALE, isLocale, localePath } from '@/i18n/config';
import { sendEmail, languageOf } from '@/modules/email/service';
import { emit } from '@/modules/automation/events';
import { authenticate, createPasswordReset, registerUser, resetPassword } from './service';
import { clientIp, createSession, destroySession } from './session';

const loc = (v: unknown) => (isLocale(String(v)) ? (String(v) as Parameters<typeof localePath>[0]) : DEFAULT_LOCALE);

/** Only same-site internal paths are accepted as post-login destinations (no open redirect). */
function safeNext(next: unknown, fallback: string) {
  const n = String(next ?? '');
  return /^\/[a-z0-9\-/_?=&%.]*$/i.test(n) && !n.startsWith('//') ? n : fallback;
}

export async function loginAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const f = formObject(fd);
  const locale = loc(f.locale);
  return run(async () => {
    const ip = await clientIp();
    await enforceRateLimit(`login:ip:${ip}`, 20, 900);
    await enforceRateLimit(`login:acct:${String(f.email).toLowerCase().slice(0, 200)}`, 8, 900);
    const user = await authenticate(String(f.email), String(f.password));
    await createSession(user.id);
    redirect(localePath(locale, safeNext(f.next, user.platformRole ? '/admin' : '/account')));
  }, locale);
}

export async function registerAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const f = formObject(fd);
  const locale = loc(f.locale);
  return run(async () => {
    await enforceRateLimit(`register:${await clientIp()}`, 10, 3600);
    const user = await registerUser({ name: String(f.name), email: String(f.email), password: String(f.password), locale, acceptTerms: (f.acceptTerms === 'on') as true });
    await createSession(user.id);
    await emit({ type: 'user.registered', userId: user.id });
    redirect(localePath(locale, safeNext(f.next, '/account')) + (String(f.next ?? '').includes('?') ? '&' : '?') + 'welcome=1');
  }, locale);
}

export async function logoutAction(fd: FormData) {
  await destroySession();
  redirect(localePath(loc(fd.get('locale')), '/'));
}

export async function forgotPasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const f = formObject(fd);
  const locale = loc(f.locale);
  return run(async () => {
    await enforceRateLimit(`forgot:${await clientIp()}`, 6, 3600);
    const res = await createPasswordReset(String(f.email));
    if (res) {
      await sendEmail({
        to: res.user.email, templateKey: 'password_reset', language: languageOf(res.user.locale),
        vars: { name: res.user.name, resetUrl: env.appUrl + localePath(loc(res.user.locale), `/reset-password?token=${res.token}`) },
      });
    }
    // Same answer whether or not the account exists.
    return { ok: true };
  }, locale);
}

export async function resetPasswordAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const f = formObject(fd);
  const locale = loc(f.locale);
  return run(async () => {
    await enforceRateLimit(`reset:${await clientIp()}`, 10, 3600);
    await resetPassword(String(f.token), String(f.password));
    redirect(localePath(locale, '/login?reset=1'));
  }, locale);
}
