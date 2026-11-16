import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDate } from '@/i18n/translate';
import { requireUser } from '@/modules/auth/session';
import { projectProgress } from '@/modules/projects/service';
import { Badge, Card, DefList, PageHeader, Progress } from '@/components/ui';
import { ProjectBadge } from '@/components/app/status';
import { FileList, Milestones, Thread, Timeline } from '@/components/app/ProjectParts';
import { DeleteFile, MessageForm, ReviewActions, UploadForm } from '../../AccountForms';

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: l, id } = await params;
  const locale = assertLocale(l);
  const user = await requireUser(locale);
  const project = await db.project.findFirst({
    where: { id, userId: user.id },
    include: {
      briefing: true, orderItem: { include: { order: true, package: true } }, files: { orderBy: { createdAt: 'desc' } },
      events: { where: { internal: false }, orderBy: { createdAt: 'desc' } }, messages: { where: { internal: false }, orderBy: { createdAt: 'asc' } }, revisions: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!project) notFound();
  const t = await getT(locale);
  const p = (path: string) => localePath(locale, path);
  const revTone = { OPEN: 'warn', IN_PROGRESS: 'info', DONE: 'ok', REJECTED: 'danger' } as const;
  const revLabel = { OPEN: t('Ouverte'), IN_PROGRESS: t('En cours'), DONE: t('Traitée'), REJECTED: t('Refusée') };
  return (
    <>
      <PageHeader title={project.name} subtitle={`${project.reference} · ${t('Commande {n}', { n: project.orderItem.order.number })}`} actions={<ProjectBadge status={project.status} t={t} />} />
      <Card className="mb-5">
        <Milestones status={project.status} t={t} />
        <div className="mt-5"><Progress value={projectProgress(project.status)} label={t('Avancement')} /></div>
        {project.status === 'PAYMENT_PENDING' && <p className="alert alert-warn mt-4">{t('En attente du paiement.')} <a className="underline" href={p(`/account/orders/${project.orderItem.orderId}`)}>{t('Voir la commande')}</a></p>}
        {project.status === 'BRIEFING_PENDING' && <p className="alert alert-warn mt-4 flex flex-wrap items-center justify-between gap-3">{t('Remplissez le briefing pour que nous puissions démarrer.')} <a className="btn btn-primary btn-sm" href={p(`/account/projects/${project.id}/briefing`)}>{t('Remplir le briefing')}</a></p>}
        {project.status === 'CLIENT_REVIEW' && (
          <div className="alert alert-info mt-4">
            <p className="mb-3">{t('Votre projet est prêt à être validé.')} {project.previewUrl && <a className="underline" href={project.previewUrl} target="_blank" rel="noopener noreferrer">{t('Ouvrir l’aperçu')}</a>}</p>
            <ReviewActions projectId={project.id} />
          </div>
        )}
        {project.liveUrl && <p className="alert alert-ok mt-4">{t('Votre site est en ligne :')} <a className="underline" href={project.liveUrl} target="_blank" rel="noopener noreferrer">{project.liveUrl}</a></p>}
      </Card>
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div className="space-y-5">
          <Card title={t('Messages')}>
            <Thread messages={project.messages} viewerIsStaff={false} locale={locale} t={t} />
            <div className="divider my-4" />
            <MessageForm projectId={project.id} />
          </Card>
          <Card title={t('Révisions')}>
            <p className="muted mb-3 text-sm">{t('{used} demande(s) sur {max} cycle(s) inclus dans votre pack.', { used: project.revisions.length, max: project.orderItem.package.revisions })}</p>
            {project.revisions.length === 0 ? <p className="muted text-sm">{t('Aucune révision demandée.')}</p> : (
              <ul className="space-y-3 text-sm">
                {project.revisions.map((r) => (
                  <li key={r.id} className="rounded-lg border border-line p-3">
                    <div className="mb-1 flex items-center justify-between gap-2"><span className="muted text-xs">{formatDate(r.createdAt, locale)}</span><Badge tone={revTone[r.status]}>{revLabel[r.status]}</Badge></div>
                    <p className="whitespace-pre-wrap">{r.description}</p>
                    {r.response && <p className="muted mt-2 border-t border-line pt-2">ATHANA : {r.response}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title={t('Fichiers')}>
            <FileList files={project.files} t={t} action={(f) => (f.ownerId === user.id ? <DeleteFile fileId={f.id} /> : null)} />
            {project.status !== 'PAYMENT_PENDING' && <><div className="divider my-4" /><UploadForm projectId={project.id} /></>}
          </Card>
        </div>
        <div className="space-y-5">
          <Card title={t('Détails')}>
            <DefList items={[[t('Modèle'), project.orderItem.name], [t('Pack'), project.orderItem.tier], [t('Livraison estimée'), project.dueAt ? formatDate(project.dueAt, locale) : t('Communiquée après le briefing')],
              [t('Briefing'), project.briefing ? <a key="b" className="underline hover:text-gold-300" href={p(`/account/projects/${project.id}/briefing`)}>{project.briefing.status === 'CONFIRMED' ? t('Confirmé') : project.briefing.status === 'SUBMITTED' ? t('Envoyé — modifiable') : t('À compléter')}</a> : '—']]} />
          </Card>
          <Card title={t('Historique')}><Timeline events={project.events} locale={locale} t={t} /></Card>
        </div>
      </div>
    </>
  );
}
