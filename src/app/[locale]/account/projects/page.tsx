import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDate } from '@/i18n/translate';
import { requireUser } from '@/modules/auth/session';
import { projectProgress } from '@/modules/projects/service';
import { Empty, PageHeader, Progress } from '@/components/ui';
import { ProjectBadge } from '@/components/app/status';

export default async function ProjectsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const user = await requireUser(locale);
  const t = await getT(locale);
  const projects = await db.project.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
  return (
    <>
      <PageHeader title={t('Projets')} subtitle={t('Suivez l’avancement de chaque projet, du briefing à la mise en ligne.')} />
      {projects.length === 0 ? <Empty title={t('Aucun projet pour le moment.')}><a className="btn btn-primary btn-sm" href={localePath(locale, '/templates')}>{t('Choisir un modèle')}</a></Empty> : (
        <ul className="grid gap-4 md:grid-cols-2">
          {projects.map((x) => (
            <li key={x.id} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="muted text-xs">{x.reference} · {formatDate(x.createdAt, locale)}</p>
                  <h2 className="truncate text-lg font-semibold"><a className="no-underline hover:text-accent-700" href={localePath(locale, `/account/projects/${x.id}`)}>{x.name}</a></h2>
                </div>
                <ProjectBadge status={x.status} t={t} />
              </div>
              <div className="mt-4"><Progress value={projectProgress(x.status)} label={x.name} /></div>
              <div className="mt-4 flex gap-2">
                <a className="btn btn-outline btn-sm" href={localePath(locale, `/account/projects/${x.id}`)}>{t('Ouvrir')}</a>
                {x.status === 'BRIEFING_PENDING' && <a className="btn btn-primary btn-sm" href={localePath(locale, `/account/projects/${x.id}/briefing`)}>{t('Remplir le briefing')}</a>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
