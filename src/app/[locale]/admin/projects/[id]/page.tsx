import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDate } from '@/i18n/translate';
import { can } from '@/modules/auth/rbac';
import { requireStaff } from '@/modules/auth/session';
import { PROJECT_FLOW, type BriefingData } from '@/modules/projects/service';
import { PROJECT_STATUS_LABEL } from '@/modules/automation/events';
import { staffOptions } from '@/modules/admin/queries';
import { Badge, Card, DefList, PageHeader } from '@/components/ui';
import { ProjectBadge } from '@/components/app/status';
import { FileList, Thread, Timeline } from '@/components/app/ProjectParts';
import { ProjectAssignForm, ProjectStatusForm, RevisionForm, StaffMessage, TaskDone } from '../../AdminForms';

export default async function AdminProject({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: l, id } = await params;
  const locale = assertLocale(l);
  const staff = await requireStaff(locale, 'projects.view');
  const project = await db.project.findUnique({
    where: { id },
    include: { user: true, assignee: true, briefing: true, orderItem: { include: { order: true, package: true, product: true } }, files: { orderBy: { createdAt: 'desc' } }, events: { orderBy: { createdAt: 'desc' } }, messages: { orderBy: { createdAt: 'asc' } }, revisions: { orderBy: { createdAt: 'desc' } }, tasks: { where: { status: 'OPEN' } } },
  });
  if (!project) notFound();
  const t = await getT(locale);
  const work = can(staff.platformRole, 'projects.work') && (can(staff.platformRole, 'projects.manage') || project.assigneeId === staff.id);
  const data = (project.briefing?.data ?? {}) as Partial<BriefingData>;
  const staffList = await staffOptions();
  const labels: [keyof BriefingData, string][] = [['companyName', t('Nom de l’entreprise')], ['sector', t('Secteur d’activité')], ['contactName', t('Nom du responsable')], ['email', t('Adresse e-mail')], ['phone', t('Téléphone')], ['address', t('Adresse')], ['country', t('Pays')], ['projectLanguage', t('Langue(s) du site')], ['domain', t('Nom de domaine')], ['colors', t('Couleurs préférées')], ['references', t('Sites de référence que vous appréciez')], ['goal', t('Objectif du site')], ['audience', t('Public cible')], ['pages', t('Pages nécessaires')], ['features', t('Fonctionnalités souhaitées')], ['socials', t('Réseaux sociaux')], ['products', t('Services ou produits à présenter')], ['texts', t('Textes du site')], ['extra', t('Informations complémentaires')], ['ownWords', t('Avec vos propres mots')]];
  return (
    <>
      <PageHeader title={`${project.reference} — ${project.name}`} subtitle={<>{t('Client')} : <a className="underline" href={localePath(locale, `/admin/customers/${project.userId}`)}>{project.user.name}</a> · <a className="underline" href={localePath(locale, `/admin/orders/${project.orderItem.orderId}`)}>{project.orderItem.order.number}</a></>} actions={<ProjectBadge status={project.status} t={t} />} />
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr] xl:items-start">
        <div className="space-y-5">
          <Card title={t('Briefing')} actions={<span className="flex items-center gap-2">
            <Badge tone={project.briefing?.status === 'CONFIRMED' ? 'ok' : project.briefing?.status === 'SUBMITTED' ? 'gold' : 'warn'}>{project.briefing?.status ?? '—'}</Badge>
            <Badge tone={project.briefing?.aiConsent ? 'ok' : 'neutral'}>{project.briefing?.aiConsent ? t('Consentement IA : oui') : t('Consentement IA : non')}</Badge>
            <a className="btn btn-outline btn-sm" href={`/api/admin/projects/${project.id}/brief`}>{t('Exporter (JSON)')}</a>
          </span>}>
            {labels.every(([k]) => !data[k]) ? <p className="muted text-sm">{t('Le client n’a pas encore rempli le briefing.')}</p> : (
              <dl className="space-y-3 text-sm">{labels.filter(([k]) => data[k]).map(([k, label]) => <div key={k}><dt className="muted text-xs uppercase tracking-wide">{label}</dt><dd className="whitespace-pre-wrap break-words">{data[k]}</dd></div>)}</dl>
            )}
          </Card>
          <Card title={t('Messages et notes internes')}>
            <Thread messages={project.messages} viewerIsStaff locale={locale} t={t} />
            {can(staff.platformRole, 'projects.work') && <><div className="divider my-4" /><StaffMessage projectId={project.id} /></>}
          </Card>
          <Card title={t('Révisions')}>
            {project.revisions.length === 0 ? <p className="muted text-sm">{t('Aucune révision demandée.')}</p> : (
              <ul className="space-y-4 text-sm">{project.revisions.map((r) => <li key={r.id} className="rounded-lg border border-line p-3"><p className="muted text-xs">{formatDate(r.createdAt, locale)}</p><p className="whitespace-pre-wrap">{r.description}</p>{work && <RevisionForm revisionId={r.id} status={r.status} response={r.response ?? ''} />}</li>)}</ul>
            )}
          </Card>
          <Card title={t('Fichiers')}><FileList files={project.files} t={t} /></Card>
        </div>
        <div className="space-y-5">
          {work && <Card title={t('Statut')}><ProjectStatusForm projectId={project.id} status={project.status} options={PROJECT_FLOW.filter((s) => s !== 'PAYMENT_PENDING' && s !== 'PAID').map((s) => ({ value: s, label: t(PROJECT_STATUS_LABEL[s]) }))} /></Card>}
          {can(staff.platformRole, 'projects.manage') && <Card title={t('Organisation')}><ProjectAssignForm project={{ id: project.id, assigneeId: project.assigneeId ?? '', dueAt: project.dueAt?.toISOString().slice(0, 10) ?? '', previewUrl: project.previewUrl ?? '', liveUrl: project.liveUrl ?? '' }} staff={staffList.map((s) => ({ value: s.id, label: `${s.name} (${s.platformRole})` }))} /></Card>}
          <Card title={t('Détails')}><DefList items={[[t('Modèle'), <a key="m" className="underline" href={`/demo/${project.orderItem.product.demoSlug ?? ''}`} target="_blank" rel="noopener">{project.orderItem.name}</a>], [t('Pack'), project.orderItem.tier], [t('Pages incluses'), project.orderItem.package.pagesIncluded], [t('Révisions incluses'), project.orderItem.package.revisions], [t('Options'), (project.orderItem.addons as { name: string }[]).map((a) => a.name).join(', ')], [t('Responsable'), project.assignee?.name]]} /></Card>
          {project.tasks.length > 0 && <Card title={t('Tâches ouvertes')}><ul className="space-y-2 text-sm">{project.tasks.map((tk) => <li key={tk.id} className="flex items-center justify-between gap-3"><span>{tk.title}</span><TaskDone taskId={tk.id} /></li>)}</ul></Card>}
          <Card title={t('Historique')}><Timeline events={project.events} locale={locale} t={t} /></Card>
        </div>
      </div>
    </>
  );
}
