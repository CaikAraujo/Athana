import 'server-only';
import { notFound } from 'next/navigation';
import { AppError } from '@/lib/errors';
import { assertLocale, getT } from '@/i18n/server';
import { requireTenant } from '@/modules/tenancy/guard';
import { hasOrgRole, planHasFeature } from '@/modules/tenancy/context';
import { tenantCurrency } from '@/modules/crm/service';

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Guard + context shared by every CRM page. */
export async function crmPage(params: Promise<{ locale: string }>) {
  const locale = assertLocale((await params).locale);
  const ctx = await requireTenant(locale, 'crm');
  const t = await getT(locale);
  return {
    locale, ctx, t, tz: ctx.organization.timezone, currency: tenantCurrency(ctx),
    can: { remove: hasOrgRole(ctx, 'MANAGER'), configure: hasOrgRole(ctx, 'ADMIN') },
    has: (feature: string) => planHasFeature(ctx, feature),
  };
}

/** Service "not found" errors (including ids of another tenant) become a 404 page. */
export async function orNotFound<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    if (err instanceof AppError && err.code === 'not_found') notFound();
    throw err;
  }
}

export function one(v: string | string[] | undefined): string | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  return s?.trim() ? s.trim() : undefined;
}

/** "?a=1&b=2" from defined values only. */
export function qs(params: Record<string, string | number | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  const s = sp.toString();
  return s ? `?${s}` : '';
}

export const fullName = (c: { firstName: string; lastName: string }) => `${c.firstName} ${c.lastName}`.trim();
