import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDate } from '@/i18n/translate';
import { requireStaff } from '@/modules/auth/session';
import { Badge, Empty, PageHeader, Table } from '@/components/ui';

export default async function AdminCustomers({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'customers.view');
  const t = await getT(locale);
  const { q } = await searchParams;
  const users = await db.user.findMany({
    where: { platformRole: null, deletedAt: null, ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] } : {}) },
    include: { _count: { select: { orders: true, memberships: true } } }, orderBy: { createdAt: 'desc' }, take: 200,
  });
  return (
    <>
      <PageHeader title={t('Clients')} />
      <form method="get" action={localePath(locale, '/admin/customers')} className="mb-4 flex gap-2"><input name="q" defaultValue={q} placeholder={t('Nom ou e-mail')} className="input max-w-xs" aria-label={t('Rechercher')} /><button className="btn btn-outline" type="submit">{t('Rechercher')}</button></form>
      {users.length === 0 ? <Empty title={t('Aucun client.')} /> : (
        <Table head={[t('Nom'), t('E-mail'), t('Marché'), t('Commandes'), t('Entreprises'), t('Inscription'), '']}>
          {users.map((u) => <tr key={u.id}><td><a className="row-link" href={localePath(locale, `/admin/customers/${u.id}`)}>{u.name}</a></td><td>{u.email}</td><td>{u.locale}</td><td>{u._count.orders}</td><td>{u._count.memberships}</td><td>{formatDate(u.createdAt, locale)}</td><td>{u.disabledAt && <Badge tone="danger">{t('Désactivé')}</Badge>}</td></tr>)}
        </Table>
      )}
    </>
  );
}
