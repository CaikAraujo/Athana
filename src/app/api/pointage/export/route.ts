import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '@/lib/errors';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';
import { getT } from '@/i18n/server';
import { getUser } from '@/modules/auth/session';
import { tenantFromSession } from '@/modules/tenancy/guard';
import { exportReport } from '@/modules/pointage/reports';

export const dynamic = 'force-dynamic';

const STATUS: Record<AppError['code'], number> = { forbidden: 403, not_found: 404, invalid: 400, conflict: 409, limit: 403, rate_limited: 429, not_configured: 503 };

/**
 * GET /api/pointage/export?format=csv|pdf&from=YYYY-MM-DD&to=YYYY-MM-DD[&employeeId=][&departmentId=]
 * The tenant comes from the session; role scope and the `export` plan feature are enforced by the service.
 */
export async function GET(req: Request) {
  const user = await getUser();
  const locale = isLocale(user?.locale) ? user.locale : DEFAULT_LOCALE;
  const t = await getT(locale);
  try {
    const ctx = await tenantFromSession('pointage');
    const q = new URL(req.url).searchParams;
    const file = await exportReport(ctx, { format: q.get('format') ?? '', from: q.get('from') ?? '', to: q.get('to') ?? '', employeeId: q.get('employeeId'), departmentId: q.get('departmentId') }, { t, locale });
    return new NextResponse(Buffer.from(file.body), {
      headers: {
        'Content-Type': file.contentType,
        'Content-Disposition': `attachment; filename="${file.filename}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    if (err instanceof AppError) return NextResponse.json({ error: t(err.message) }, { status: user ? STATUS[err.code] ?? 400 : 401 });
    if (err instanceof ZodError) return NextResponse.json({ error: err.issues[0]?.message ? t(err.issues[0].message) : t('Paramètres invalides.') }, { status: 400 });
    console.error('[pointage.export]', err);
    return NextResponse.json({ error: t('Une erreur est survenue. Veuillez réessayer.') }, { status: 500 });
  }
}
