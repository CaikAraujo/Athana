import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { requireStaff } from '@/modules/auth/session';
import { ROLE_PERMISSIONS } from '@/modules/auth/rbac';
import { Badge, Card, PageHeader, Table } from '@/components/ui';
import { StaffModal } from '../../ContentForms';

export default async function AdminTeam({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'users.manage');
  const t = await getT(locale);
  const staff = await db.user.findMany({ where: { platformRole: { not: null } }, orderBy: { name: 'asc' } });
  return (
    <>
      <PageHeader title={t('Équipe et rôles')} actions={<StaffModal />} />
      <Table head={[t('Nom'), t('E-mail'), t('Rôle'), t('État'), '']}>
        {staff.map((s) => <tr key={s.id}><td className="font-medium">{s.name}</td><td>{s.email}</td><td><Badge tone="gold">{s.platformRole}</Badge></td><td>{s.disabledAt ? <Badge tone="danger">{t('Désactivé')}</Badge> : <Badge tone="ok">{t('Actif')}</Badge>}</td><td className="text-right"><StaffModal member={JSON.parse(JSON.stringify({ id: s.id, name: s.name, platformRole: s.platformRole, disabledAt: s.disabledAt }))} /></td></tr>)}
      </Table>
      <Card title={t('Permissions par rôle')} className="mt-6">
        <dl className="space-y-3 text-sm">{Object.entries(ROLE_PERMISSIONS).map(([role, perms]) => <div key={role}><dt className="font-medium">{role}</dt><dd className="muted">{perms.join(' · ')}</dd></div>)}</dl>
      </Card>
    </>
  );
}
