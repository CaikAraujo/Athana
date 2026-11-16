import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { formatDateTime } from '@/i18n/translate';
import { requireStaff } from '@/modules/auth/session';
import { Badge, Card, PageHeader } from '@/components/ui';
import { EmailTemplateForm } from '../../ContentForms';

export default async function AdminEmails({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'settings.manage');
  const t = await getT(locale);
  const [templates, logs] = await Promise.all([db.emailTemplate.findMany({ orderBy: [{ key: 'asc' }, { language: 'asc' }] }), db.emailLog.findMany({ orderBy: { createdAt: 'desc' }, take: 25 })]);
  return (
    <>
      <PageHeader title={t('Modèles d’e-mails')} subtitle={t('Un modèle par événement et par langue.')} />
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr] xl:items-start">
        <div className="space-y-3">
          {templates.map((tp) => <details key={tp.id} className="panel p-4"><summary className="cursor-pointer font-medium">{tp.key} <span className="muted font-normal">· {tp.language} — {tp.subject}</span></summary><div className="mt-4"><EmailTemplateForm tpl={tp} /></div></details>)}
        </div>
        <Card title={t('Derniers envois')}>
          {logs.length === 0 ? <p className="muted text-sm">{t('Aucun e-mail pour le moment.')}</p> : <ul className="divide-y divide-line text-sm">{logs.map((lg) => <li key={lg.id} className="py-2"><p className="truncate">{lg.subject || lg.templateKey}</p><p className="muted flex items-center justify-between gap-2 text-xs"><span className="truncate">{lg.to} · {formatDateTime(lg.createdAt, locale)}</span><Badge tone={lg.status === 'sent' ? 'ok' : lg.status === 'failed' ? 'danger' : 'neutral'}>{lg.status}</Badge></p></li>)}</ul>}
        </Card>
      </div>
    </>
  );
}
