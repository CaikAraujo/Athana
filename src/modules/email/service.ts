import { Resend } from 'resend';
import { db } from '@/lib/db';
import { env } from '@/lib/env';
import { interpolate } from '@/i18n/translate';
import { LANGUAGE_FALLBACK, LOCALE_META, isLocale, type Language } from '@/i18n/config';

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

function layout(bodyText: string, vars: Record<string, string | number>) {
  // Body is plain text: escape first, then turn URLs into links and blank lines into paragraphs.
  const html = escapeHtml(bodyText)
    .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#8a6d2f">$1</a>')
    .split(/\n{2,}/).map((p) => `<p style="margin:0 0 16px">${p.replace(/\n/g, '<br>')}</p>`).join('');
  return `<!doctype html><html><body style="margin:0;background:#f5f5f4;font-family:Helvetica,Arial,sans-serif;color:#1c1917">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<div style="font-weight:700;letter-spacing:.2em;font-size:18px;margin-bottom:24px">ATHANA</div>
<div style="background:#fff;border-radius:12px;padding:28px;font-size:15px;line-height:1.6">${html}</div>
<p style="font-size:12px;color:#78716c;margin-top:20px">ATHANA · ${escapeHtml(String(vars.appUrl ?? env.appUrl))}</p>
</div></body></html>`;
}

export function languageOf(locale: string | null | undefined): Language {
  return isLocale(locale) ? LOCALE_META[locale].language : 'fr';
}

/**
 * Sends a templated e-mail. Templates live in the database (admin-editable, 3 languages).
 * With EMAIL_PROVIDER=log nothing leaves the server: the message is only written to EmailLog.
 * Never throws: e-mail failure must not break a business transaction.
 */
export async function sendEmail(opts: { to: string; templateKey: string; language: Language; vars?: Record<string, string | number> }) {
  const vars = { appUrl: env.appUrl, ...opts.vars };
  try {
    const chain = [opts.language, ...LANGUAGE_FALLBACK[opts.language], 'fr'] as string[];
    const templates = await db.emailTemplate.findMany({ where: { key: opts.templateKey, language: { in: chain } } });
    const tpl = chain.map((l) => templates.find((t) => t.language === l)).find(Boolean);
    if (!tpl) throw new Error(`Missing e-mail template ${opts.templateKey}`);
    const subject = interpolate(tpl.subject.replace(/\{\{(\w+)\}\}/g, '{$1}'), vars);
    const body = interpolate(tpl.body.replace(/\{\{(\w+)\}\}/g, '{$1}'), vars);
    let status = 'logged';
    let error: string | undefined;
    if (env.emailProvider === 'resend' && env.resendApiKey) {
      const res = await new Resend(env.resendApiKey).emails.send({ from: env.emailFrom, to: [opts.to], subject, html: layout(body, vars), text: body });
      status = res.error ? 'failed' : 'sent';
      error = res.error?.message;
    }
    await db.emailLog.create({ data: { to: opts.to, templateKey: opts.templateKey, language: tpl.language, subject, body, provider: env.emailProvider, status, error } });
    return status !== 'failed';
  } catch (e) {
    console.error('[email]', opts.templateKey, e);
    await db.emailLog.create({ data: { to: opts.to, templateKey: opts.templateKey, language: opts.language, subject: '', body: '', provider: env.emailProvider, status: 'failed', error: String(e).slice(0, 500) } }).catch(() => {});
    return false;
  }
}
