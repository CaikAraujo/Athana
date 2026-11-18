import { CheckCircle2, Circle } from 'lucide-react';
import { Link } from '@/i18n/client';
import { localePath } from '@/i18n/config';
import { formatMoney } from '@/i18n/translate';
import { Card, PageHeader, Progress, Stat } from '@/components/ui';
import { dashboardKpis, listMembers, listTasks, onboardingChecklist, recentActivity } from '@/modules/crm/service';
import { crmPage } from './_ui/page';
import { TaskList, TaskModal, TimelineList } from './_ui/parts';

export default async function CrmDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, ctx, t, tz, currency } = await crmPage(params);
  const [kpis, checklist, tasks, activity, members] = await Promise.all([
    dashboardKpis(ctx), onboardingChecklist(ctx), listTasks(ctx, { filter: 'mine', pageSize: 8 }), recentActivity(ctx, 8), listMembers(ctx),
  ]);
  const money = (v: number) => formatMoney(v, currency, locale);
  return (
    <>
      <PageHeader
        title={t('Tableau de bord')} subtitle={ctx.organization.name}
        actions={<><Link href="/app/crm/contacts" className="btn btn-outline btn-sm">{t('Contacts')}</Link><Link href="/app/crm/pipeline" className="btn btn-primary btn-sm">{t('Ouvrir le pipeline')}</Link></>}
      />
      <form method="get" action={localePath(locale, '/app/crm/search')} role="search" className="mb-6 flex gap-2">
        <label htmlFor="dash-q" className="sr-only">{t('Rechercher')}</label>
        <input id="dash-q" name="q" type="search" minLength={2} required className="input" placeholder={t('Rechercher un contact, une entreprise, une affaire…')} />
        <button type="submit" className="btn btn-secondary">{t('Rechercher')}</button>
      </form>

      {!checklist.completed && (
        <Card title={t('Bien démarrer')} className="mb-6" actions={<span className="muted text-sm">{t('{done} sur {total}', { done: checklist.doneCount, total: checklist.total })}</span>}>
          <Progress value={(checklist.doneCount / checklist.total) * 100} label={t('Bien démarrer')} />
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {checklist.items.map((item) => (
              <li key={item.key}>
                <Link href={item.href} className={`flex items-center gap-2.5 rounded-lg border border-line px-3 py-2.5 text-sm no-underline hover:border-accent-500 ${item.done ? 'muted line-through' : ''}`}>
                  {item.done ? <CheckCircle2 size={16} className="flex-none text-ok" aria-hidden /> : <Circle size={16} className="flex-none" aria-hidden />}
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat label={t('Affaires en cours')} value={money(kpis.openValue)} hint={t('{count} affaire(s) ouverte(s)', { count: kpis.openCount })} />
        <Stat label={t('Prévision pondérée')} value={money(kpis.forecast)} hint={t('Montant × probabilité de l’étape')} />
        <Stat label={t('Gagné ce mois-ci')} value={money(kpis.wonThisMonth)} hint={t('{count} affaire(s) gagnée(s)', { count: kpis.wonThisMonthCount })} />
        <Stat label={t('Taux de conversion')} value={kpis.conversionRate === null ? '—' : `${kpis.conversionRate} %`} hint={t('Affaires gagnées / clôturées sur 90 jours')} />
        <Stat label={t('Tâches à traiter')} value={kpis.tasksDue} hint={<Link href="/app/crm/tasks" className="underline">{t('Échues ou à faire aujourd’hui')}</Link>} />
        <Stat label={t('Nouveaux leads')} value={kpis.newLeads} hint={<Link href="/app/crm/leads" className="underline">{t('Sur les 30 derniers jours')}</Link>} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card title={t('Mes tâches')} actions={<TaskModal t={t} members={members} userId={ctx.userId} />}>
          <TaskList tasks={tasks.items} t={t} locale={locale} showLinks />
          {tasks.total > tasks.items.length && <Link href="/app/crm/tasks" className="mt-3 inline-block text-sm underline">{t('Voir toutes les tâches')}</Link>}
        </Card>
        <Card title={t('Activité récente')}>
          <TimelineList items={activity} t={t} locale={locale} tz={tz} showLinks />
        </Card>
      </div>
    </>
  );
}
