import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { requireUser } from '@/modules/auth/session';
import { Badge, Card, PageHeader } from '@/components/ui';
import { FileList } from '@/components/app/ProjectParts';
import { DeleteFile, UploadForm } from '../../../AccountForms';
import { BriefingForm } from './BriefingForm';

export default async function BriefingPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale: l, id } = await params;
  const locale = assertLocale(l);
  const user = await requireUser(locale, `/account/projects/${id}/briefing`);
  const project = await db.project.findFirst({ where: { id, userId: user.id }, include: { briefing: { include: { files: { orderBy: { createdAt: 'desc' } } } } } });
  if (!project) notFound();
  const t = await getT(locale);
  const back = localePath(locale, `/account/projects/${project.id}`);
  if (!project.briefing || project.status === 'PAYMENT_PENDING') {
    return <><PageHeader title={t('Briefing')} /><p className="alert alert-warn">{t('Le briefing sera disponible après le paiement.')} <a className="underline" href={back}>{t('Retour au projet')}</a></p></>;
  }
  const b = project.briefing;
  const locked = b.status === 'CONFIRMED';
  // Pre-fill contact details the first time.
  const data = { contactName: user.name, email: user.email, phone: user.phone ?? '', ...(b.data as Record<string, string>) };
  return (
    <>
      <PageHeader title={t('Briefing du projet')} subtitle={`${project.reference} — ${project.name}`}
        actions={<><Badge tone={locked ? 'ok' : b.status === 'SUBMITTED' ? 'gold' : 'warn'}>{locked ? t('Confirmé') : b.status === 'SUBMITTED' ? t('Envoyé — modifiable') : t('Brouillon')}</Badge><a className="btn btn-ghost btn-sm" href={back}>{t('Retour au projet')}</a></>} />
      {locked && <p className="alert alert-ok mb-5">{t('Ce briefing est confirmé. Pour toute précision, utilisez la messagerie du projet.')}</p>}
      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr] xl:items-start">
        <BriefingForm projectId={project.id} data={data} status={b.status} aiConsent={b.aiConsent} />
        <Card title={t('Logo, images et documents')} className="xl:sticky xl:top-24">
          <p className="muted mb-3 text-sm">{t('Ajoutez votre logo, vos photos et tout document utile (textes, charte graphique, liste de prix…).')}</p>
          <FileList files={b.files} t={t} action={(f) => (!locked ? <DeleteFile fileId={f.id} /> : null)} />
          {!locked && <><div className="divider my-4" /><UploadForm projectId={project.id} briefing /></>}
        </Card>
      </div>
    </>
  );
}
