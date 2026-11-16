'use server';

import { cookies } from 'next/headers';
import { z } from 'zod';
import { db } from '@/lib/db';
import { run, formObject, type ActionState } from '@/lib/action';
import { enforceRateLimit } from '@/lib/rate-limit';
import { m } from '@/i18n/translate';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';
import { clientIp } from '@/modules/auth/session';
import { emit } from '@/modules/automation/events';

const leadSchema = z.object({
  kind: z.enum(['contact', 'quote', 'campaign']).default('contact'),
  name: z.string().trim().min(2, m('Veuillez indiquer votre nom.')).max(120),
  email: z.string().trim().toLowerCase().email(m('Adresse e-mail invalide.')).max(254),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(160).optional(),
  interest: z.string().trim().max(60).optional(),
  budget: z.string().trim().max(20).optional(),
  message: z.string().trim().min(10, m('Votre message est trop court.')).max(4000),
  consent: z.literal('on', { error: m('Votre accord est nécessaire pour traiter la demande.') }),
});

export async function createLeadAction(_: ActionState, fd: FormData): Promise<ActionState> {
  const f = formObject(fd);
  const locale = isLocale(String(f.locale)) ? String(f.locale) : DEFAULT_LOCALE;
  return run(async () => {
    if (f.website) return { ok: true }; // honeypot: pretend success, store nothing
    await enforceRateLimit(`lead:${await clientIp()}`, 8, 3600);
    const data = leadSchema.parse(f);
    // Campaign attribution captured by the landing page (first-party cookie, only utm_* keys).
    let utm: Record<string, string> | undefined;
    try {
      const raw = (await cookies()).get('athana_utm')?.value;
      if (raw) utm = Object.fromEntries(Object.entries(JSON.parse(raw) as Record<string, string>).filter(([k, v]) => /^utm_(source|medium|campaign|term|content)$/.test(k) && typeof v === 'string').map(([k, v]) => [k, v.slice(0, 120)]));
    } catch { /* ignore malformed cookie */ }
    const lead = await db.lead.create({
      data: { kind: data.kind, name: data.name, email: data.email, phone: data.phone || null, company: data.company || null, interest: data.interest || null, budget: data.budget || null, message: data.message, market: locale, utm },
    });
    await emit({ type: 'lead.created', leadId: lead.id });
  }, locale);
}
