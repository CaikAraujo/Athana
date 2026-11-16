import { db } from '@/lib/db';
import { assertLocale, getT, L } from '@/i18n/server';
import { requireStaff } from '@/modules/auth/session';
import { Badge, Empty, PageHeader } from '@/components/ui';
import { DeleteRow, FaqModal } from '../../ContentForms';

export default async function AdminFaq({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'content.manage');
  const t = await getT(locale);
  const faqs = await db.faq.findMany({ orderBy: [{ scope: 'asc' }, { sortOrder: 'asc' }] });
  return (
    <>
      <PageHeader title={t('FAQ')} actions={<FaqModal />} />
      {faqs.length === 0 ? <Empty title={t('Aucune question.')} /> : (
        <ul className="panel divide-y divide-line">{faqs.map((f) => <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="font-medium">{L(f.question, locale)}</p><p className="muted text-xs">{f.scope}</p></div><span className="flex items-center gap-2">{!f.published && <Badge>{t('Masquée')}</Badge>}<FaqModal faq={JSON.parse(JSON.stringify(f))} /><DeleteRow kind="faq" id={f.id} /></span></li>)}</ul>
      )}
    </>
  );
}
