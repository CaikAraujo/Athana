import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDate } from '@/i18n/translate';
import { requireStaff } from '@/modules/auth/session';
import { Badge, Empty, PageHeader, Table } from '@/components/ui';

export default async function AdminBlog({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'content.manage');
  const t = await getT(locale);
  const posts = await db.blogPost.findMany({ orderBy: { updatedAt: 'desc' } });
  return (
    <>
      <PageHeader title={t('Blog')} actions={<a className="btn btn-primary btn-sm" href={localePath(locale, '/admin/content/blog/new')}>{t('Nouvel article')}</a>} />
      {posts.length === 0 ? <Empty title={t('Aucun article.')} /> : (
        <Table head={[t('Titre'), t('Langue'), t('Statut'), t('Mise à jour')]}>
          {posts.map((p) => <tr key={p.id}><td><a className="row-link" href={localePath(locale, `/admin/content/blog/${p.id}`)}>{p.title}</a></td><td>{p.language}</td><td>{p.status === 'PUBLISHED' ? <Badge tone="ok">{t('Publié')}</Badge> : <Badge tone="warn">{t('Brouillon')}</Badge>}</td><td>{formatDate(p.updatedAt, locale)}</td></tr>)}
        </Table>
      )}
    </>
  );
}
