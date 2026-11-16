import { db } from '@/lib/db';
import { L } from '@/i18n/server';
import { localePath, type Locale } from '@/i18n/config';

/** Promotional banner managed in the admin (Content → Banners). Hidden when none is active. */
export async function BannerBar({ locale }: { locale: Locale }) {
  const now = new Date();
  const banner = await db.banner.findFirst({
    where: { active: true, AND: [{ OR: [{ startsAt: null }, { startsAt: { lte: now } }] }, { OR: [{ endsAt: null }, { endsAt: { gte: now } }] }] },
  }).catch(() => null);
  if (!banner) return null;
  const text = L(banner.message, locale);
  return (
    <div className="no-print bg-gold-500 px-4 py-2 text-center text-sm font-medium text-black">
      {banner.linkPath ? <a className="underline-offset-2 hover:underline" href={localePath(locale, banner.linkPath)}>{text}</a> : text}
    </div>
  );
}
