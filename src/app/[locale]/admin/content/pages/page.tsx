import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { requireStaff } from '@/modules/auth/session';
import { PageHeader } from '@/components/ui';
import { ContentPageForm } from '../../ContentForms';

export default async function ContentPages({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'content.manage');
  const t = await getT(locale);
  const pages = await db.contentPage.findMany({ orderBy: [{ key: 'asc' }, { language: 'asc' }] });
  return (
    <>
      <PageHeader title={t('Pages légales')} subtitle={t('Modèles à faire valider par un professionnel du droit avant publication.')} />
      <div className="space-y-3">
        {pages.map((pg) => (
          <details key={pg.id} className="panel p-5">
            <summary className="cursor-pointer font-medium">{pg.title} <span className="muted font-normal">· {pg.key} · {pg.language}</span></summary>
            <div className="mt-4"><ContentPageForm page={JSON.parse(JSON.stringify(pg))} /></div>
          </details>
        ))}
      </div>
    </>
  );
}
