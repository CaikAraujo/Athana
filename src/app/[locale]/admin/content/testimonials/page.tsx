import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { requireStaff } from '@/modules/auth/session';
import { Badge, Empty, PageHeader } from '@/components/ui';
import { DeleteRow, TestimonialModal } from '../../ContentForms';

export default async function AdminTestimonials({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'content.manage');
  const t = await getT(locale);
  const items = await db.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <>
      <PageHeader title={t('Témoignages')} subtitle={t('La section « Témoignages » du site n’apparaît que lorsqu’au moins un témoignage réel est publié.')} actions={<TestimonialModal />} />
      {items.length === 0 ? <Empty title={t('Aucun témoignage. Ajoutez-en dès que vos clients vous en confient.')} /> : (
        <ul className="panel divide-y divide-line">{items.map((x) => <li key={x.id} className="flex flex-wrap items-start justify-between gap-3 p-4"><div className="min-w-0 max-w-2xl"><p className="text-sm text-fg-soft">“{x.content}”</p><p className="muted mt-1 text-xs">{x.author}{x.company ? ` — ${x.company}` : ''} · {x.language}</p></div><span className="flex items-center gap-2">{x.published ? <Badge tone="ok">{t('Publié')}</Badge> : <Badge>{t('Brouillon')}</Badge>}<TestimonialModal item={JSON.parse(JSON.stringify(x))} /><DeleteRow kind="testimonial" id={x.id} /></span></li>)}</ul>
      )}
    </>
  );
}
