import { db } from '@/lib/db';
import { assertLocale, getT, L } from '@/i18n/server';
import { requireStaff } from '@/modules/auth/session';
import { Badge, Empty, PageHeader } from '@/components/ui';
import { BannerModal, DeleteRow } from '../../ContentForms';

export default async function AdminBanners({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'content.manage');
  const t = await getT(locale);
  const banners = await db.banner.findMany();
  return (
    <>
      <PageHeader title={t('Bannières')} actions={<BannerModal />} />
      {banners.length === 0 ? <Empty title={t('Aucune bannière.')} /> : (
        <ul className="panel divide-y divide-line">{banners.map((b) => <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><p>{L(b.message, locale)}</p><span className="flex items-center gap-2">{b.active ? <Badge tone="ok">{t('Active')}</Badge> : <Badge>{t('Inactive')}</Badge>}<BannerModal banner={JSON.parse(JSON.stringify(b))} /><DeleteRow kind="banner" id={b.id} /></span></li>)}</ul>
      )}
    </>
  );
}
