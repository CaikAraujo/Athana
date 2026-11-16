import { db } from '@/lib/db';
import { assertLocale, getT, L } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { requireStaff } from '@/modules/auth/session';
import { Badge, PageHeader, Table } from '@/components/ui';
import { ProductStatusButton } from '../AdminForms';

export default async function AdminProducts({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'catalog.manage');
  const t = await getT(locale);
  const products = await db.product.findMany({ include: { category: true, _count: { select: { orderItems: true } } }, orderBy: [{ deletedAt: 'asc' }, { sortOrder: 'asc' }] });
  return (
    <>
      <PageHeader title={t('Produits')} subtitle={t('Modèles de sites vendus dans le catalogue.')} actions={<a className="btn btn-primary btn-sm" href={localePath(locale, '/admin/products/new')}>{t('Nouveau produit')}</a>} />
      <Table head={[t('Nom'), t('Catégorie'), t('Ventes'), t('Statut'), '']}>
        {products.map((p) => (
          <tr key={p.id} className={p.deletedAt ? 'opacity-60' : ''}>
            <td><a className="row-link" href={localePath(locale, `/admin/products/${p.id}`)}>{p.name}</a><br /><span className="muted text-xs">/{p.slug}</span></td>
            <td>{L(p.category.name, locale)}</td><td>{p._count.orderItems}</td>
            <td>{p.deletedAt ? <Badge tone="danger">{t('Supprimé')}</Badge> : p.status === 'PUBLISHED' ? <Badge tone="ok">{t('Publié')}</Badge> : <Badge tone="warn">{t('Brouillon')}</Badge>}</td>
            <td className="text-right">
              {p.deletedAt ? <ProductStatusButton id={p.id} op="restore" label={t('Restaurer')} /> : p.status === 'PUBLISHED' ? <ProductStatusButton id={p.id} op="unpublish" label={t('Dépublier')} /> : <ProductStatusButton id={p.id} op="publish" label={t('Publier')} />}
            </td>
          </tr>
        ))}
      </Table>
    </>
  );
}
