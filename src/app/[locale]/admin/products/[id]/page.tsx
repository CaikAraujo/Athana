import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { assertLocale, getT, L } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { requireStaff } from '@/modules/auth/session';
import { marketCurrencies } from '@/modules/admin/queries';
import { Badge, Card, PageHeader } from '@/components/ui';
import { ProductStatusButton } from '../../AdminForms';
import { PackageForm, ProductForm } from '../../CatalogForms';

export default async function EditProduct({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: l, id } = await params;
  const locale = assertLocale(l);
  await requireStaff(locale, 'catalog.manage');
  const product = await db.product.findUnique({ where: { id }, include: { packages: { orderBy: { tier: 'asc' } }, related: { select: { id: true } }, addons: { select: { id: true } } } });
  if (!product) notFound();
  const t = await getT(locale);
  const [categories, currencies, others, addons] = await Promise.all([db.category.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } }), marketCurrencies(), db.product.findMany({ where: { deletedAt: null, id: { not: id } }, select: { id: true, name: true } }), db.addon.findMany({ where: { global: false } })]);
  const plain = JSON.parse(JSON.stringify({ ...product, relatedIds: product.related.map((r) => r.id), addonIds: product.addons.map((a) => a.id) }));
  return (
    <>
      <PageHeader title={product.name} subtitle={`/${product.slug}`} actions={<>
        {product.deletedAt ? <Badge tone="danger">{t('Supprimé')}</Badge> : product.status === 'PUBLISHED' ? <Badge tone="ok">{t('Publié')}</Badge> : <Badge tone="warn">{t('Brouillon')}</Badge>}
        {!product.deletedAt && product.status === 'PUBLISHED' && <><a className="btn btn-ghost btn-sm" href={localePath(locale, `/templates/${product.slug}`)} target="_blank" rel="noopener">{t('Voir la page')}</a><ProductStatusButton id={product.id} op="unpublish" label={t('Dépublier')} /></>}
        {!product.deletedAt && product.status !== 'PUBLISHED' && <ProductStatusButton id={product.id} op="publish" label={t('Publier')} />}
        {product.deletedAt ? <ProductStatusButton id={product.id} op="restore" label={t('Restaurer')} /> : <ProductStatusButton id={product.id} op="delete" label={t('Supprimer')} danger confirm={t('Supprimer ce produit ? Il sera retiré du catalogue ; l’historique des commandes est conservé.')} />}
      </>} />
      <Card title={t('Fiche produit')}><ProductForm product={plain} categories={categories.map((c) => ({ value: c.id, label: L(c.name, locale) }))} currencies={currencies} others={others.map((o) => ({ value: o.id, label: o.name }))} addons={addons.map((a) => ({ value: a.id, label: L(a.name, locale) }))} /></Card>
      <h2 className="mb-3 mt-8 text-xl font-semibold">{t('Packs et prix')}</h2>
      <div className="grid gap-5 xl:grid-cols-3">
        {plain.packages.map((pk: Record<string, unknown>) => <Card key={String(pk.id)} title={String(pk.tier)}><PackageForm pkg={pk} currencies={currencies} /></Card>)}
      </div>
    </>
  );
}
