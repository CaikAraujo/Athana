import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDateTime } from '@/i18n/translate';
import { requireStaff } from '@/modules/auth/session';
import { Empty, PageHeader, Table } from '@/components/ui';

export default async function AdminAudit({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ action?: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'audit.view');
  const t = await getT(locale);
  const { action } = await searchParams;
  const logs = await db.auditLog.findMany({ where: action ? { action: { startsWith: action } } : {}, orderBy: { createdAt: 'desc' }, take: 300 });
  const users = await db.user.findMany({ where: { id: { in: [...new Set(logs.map((x) => x.actorId).filter(Boolean) as string[])] } }, select: { id: true, email: true } });
  const email = new Map(users.map((u) => [u.id, u.email]));
  return (
    <>
      <PageHeader title={t('Journal d’audit')} subtitle={t('Actions sensibles effectuées sur la plateforme (300 dernières).')} />
      <form method="get" action={localePath(locale, '/admin/audit')} className="mb-4 flex gap-2"><input name="action" defaultValue={action} placeholder={t('Filtrer par action (ex. product, payment)')} className="input max-w-xs" aria-label={t('Filtrer')} /><button className="btn btn-outline" type="submit">{t('Filtrer')}</button></form>
      {logs.length === 0 ? <Empty title={t('Aucune entrée.')} /> : (
        <Table head={[t('Date'), t('Acteur'), t('Action'), t('Objet'), t('Détails')]}>
          {logs.map((lg) => <tr key={lg.id}><td className="whitespace-nowrap">{formatDateTime(lg.createdAt, locale)}</td><td>{lg.actorId ? email.get(lg.actorId) ?? lg.actorId : t('Système')}</td><td>{lg.action}</td><td className="muted text-xs">{lg.entity} {lg.entityId}</td><td className="muted max-w-[280px] truncate text-xs">{lg.meta ? JSON.stringify(lg.meta) : ''}</td></tr>)}
        </Table>
      )}
    </>
  );
}
