import { db } from '@/lib/db';
import { assertLocale, getT, L } from '@/i18n/server';
import { requireStaff } from '@/modules/auth/session';
import { marketCurrencies } from '@/modules/admin/queries';
import { Card, PageHeader } from '@/components/ui';
import { ProductForm } from '../../CatalogForms';

export default async function NewProduct({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'catalog.manage');
  const t = await getT(locale);
  const [categories, currencies, others, addons] = await Promise.all([db.category.findMany({ where: { deletedAt: null }, orderBy: { sortOrder: 'asc' } }), marketCurrencies(), db.product.findMany({ where: { deletedAt: null }, select: { id: true, name: true } }), db.addon.findMany({ where: { global: false } })]);
  return (
    <>
      <PageHeader title={t('Nouveau produit')} subtitle={t('Le produit est créé en brouillon avec trois packs à compléter.')} />
      <Card><ProductForm categories={categories.map((c) => ({ value: c.id, label: L(c.name, locale) }))} currencies={currencies} others={others.map((o) => ({ value: o.id, label: o.name }))} addons={addons.map((a) => ({ value: a.id, label: L(a.name, locale) }))} /></Card>
    </>
  );
}
