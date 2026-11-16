import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { formatDateTime, m } from '@/i18n/translate';
import { requireUser } from '@/modules/auth/session';
import { Empty, PageHeader, Table } from '@/components/ui';

const LABELS: Record<string, string> = {
  'user.register': m('Création du compte'), 'user.password_reset': m('Mot de passe réinitialisé'), 'user.password_change': m('Mot de passe modifié'),
  'user.data_export': m('Export des données'), 'data_request.created': m('Demande relative aux données'), 'subscription.trial_started': m('Essai démarré'),
  'subscription.canceled': m('Abonnement résilié'), 'subscription.cancel_scheduled': m('Résiliation programmée'), 'subscription.resumed': m('Résiliation annulée'),
  'subscription.plan_changed': m('Changement de plan'), 'member.invited': m('Membre invité'), 'member.removed': m('Membre retiré'), 'member.role_changed': m('Rôle modifié'),
};

export default async function ActivityPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const user = await requireUser(locale);
  const t = await getT(locale);
  const logs = await db.auditLog.findMany({ where: { actorId: user.id }, orderBy: { createdAt: 'desc' }, take: 100 });
  return (
    <>
      <PageHeader title={t('Historique d’activité')} subtitle={t('Les actions sensibles effectuées avec votre compte.')} />
      {logs.length === 0 ? <Empty title={t('Aucune activité enregistrée.')} /> : (
        <Table head={[t('Date'), t('Action')]}>
          {logs.map((lg) => <tr key={lg.id}><td className="whitespace-nowrap">{formatDateTime(lg.createdAt, locale)}</td><td>{LABELS[lg.action] ? t(LABELS[lg.action]) : lg.action}</td></tr>)}
        </Table>
      )}
    </>
  );
}
