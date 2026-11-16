import { db } from '@/lib/db';
import { assertLocale, getT, L } from '@/i18n/server';
import { requireStaff } from '@/modules/auth/session';
import { Badge, PageHeader, Table } from '@/components/ui';
import { DeleteCategory } from '../AdminForms';
import { CategoryModal } from '../CatalogForms';

export default async function AdminCategories({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'catalog.manage');
  const t = await getT(locale);
  const categories = await db.category.findMany({ where: { deletedAt: null }, include: { _count: { select: { products: { where: { deletedAt: null } } } } }, orderBy: { sortOrder: 'asc' } });
  return (
    <>
      <PageHeader title={t('Catégories')} actions={<CategoryModal />} />
      <Table head={[t('Nom'), 'Slug', t('Produits'), t('Statut'), '']}>
        {categories.map((c) => <tr key={c.id}><td className="font-medium">{L(c.name, locale)}</td><td className="muted">{c.slug}</td><td>{c._count.products}</td><td>{c.published ? <Badge tone="ok">{t('Publiée')}</Badge> : <Badge>{t('Masquée')}</Badge>}</td><td><span className="flex justify-end gap-2"><CategoryModal category={JSON.parse(JSON.stringify(c))} />{c._count.products === 0 && <DeleteCategory id={c.id} />}</span></td></tr>)}
      </Table>
    </>
  );
}
