import { db } from '@/lib/db';
import { assertLocale, getT, L } from '@/i18n/server';
import { formatMoney } from '@/i18n/translate';
import { requireStaff } from '@/modules/auth/session';
import { marketCurrencies } from '@/modules/admin/queries';
import { Badge, PageHeader, Table } from '@/components/ui';
import { AddonModal } from '../CatalogForms';

export default async function AdminAddons({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'catalog.manage');
  const t = await getT(locale);
  const [addons, currencies] = await Promise.all([db.addon.findMany({ orderBy: { sortOrder: 'asc' } }), marketCurrencies()]);
  return (
    <>
      <PageHeader title={t('Options')} subtitle={t('Suppléments proposés lors de la commande d’un modèle.')} actions={<AddonModal currencies={currencies} />} />
      <Table head={[t('Nom'), t('Prix'), t('Portée'), t('Statut'), '']}>
        {addons.map((a) => <tr key={a.id}><td className="font-medium">{L(a.name, locale)}</td><td>{Object.entries(a.prices as Record<string, number>).map(([c, v]) => formatMoney(v, c, locale)).join(' · ')}</td><td>{a.global ? t('Tous les produits') : t('Produits sélectionnés')}</td><td>{a.active ? <Badge tone="ok">{t('Active')}</Badge> : <Badge>{t('Inactive')}</Badge>}</td><td className="text-right"><AddonModal addon={JSON.parse(JSON.stringify(a))} currencies={currencies} /></td></tr>)}
      </Table>
    </>
  );
}
