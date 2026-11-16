import { NextResponse, type NextRequest } from 'next/server';
import { AppError } from '@/lib/errors';
import { DEFAULT_LOCALE, isLocale } from '@/i18n/config';
import { getT } from '@/i18n/server';
import { getUser } from '@/modules/auth/session';
import { tenantFromSession } from '@/modules/tenancy/guard';
import { exportCsv } from '@/modules/crm/service';

export const dynamic = 'force-dynamic';

const STATUS: Partial<Record<AppError['code'], number>> = { forbidden: 403, limit: 403, not_found: 404, invalid: 400 };

/** GET /api/crm/export?type=contacts|companies|deals — CSV download for the tenant of the current session. */
export async function GET(req: NextRequest) {
  const requested = req.nextUrl.searchParams.get('locale');
  const user = await getUser();
  const locale = isLocale(requested) ? requested : isLocale(user?.locale) ? user.locale : DEFAULT_LOCALE;
  const t = await getT(locale);
  try {
    const ctx = await tenantFromSession('crm');
    const { filename, csv } = await exportCsv(ctx, req.nextUrl.searchParams.get('type') ?? '', t);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    if (err instanceof AppError) return NextResponse.json({ error: t(err.message), code: err.code }, { status: STATUS[err.code] ?? 400 });
    console.error('[crm export]', err);
    return NextResponse.json({ error: t('Une erreur est survenue. Veuillez réessayer.') }, { status: 500 });
  }
}
