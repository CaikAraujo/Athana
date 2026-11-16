import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { formatDateTime } from '@/i18n/translate';
import { requireStaff } from '@/modules/auth/session';
import { Badge, Empty, PageHeader } from '@/components/ui';
import { LeadStatus } from '../AdminForms';

export default async function AdminLeads({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  await requireStaff(locale, 'leads.view');
  const t = await getT(locale);
  const leads = await db.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  const tone = { NEW: 'gold', CONTACTED: 'info', QUALIFIED: 'ok', CLOSED: 'neutral' } as const;
  const label = { NEW: t('Nouveau'), CONTACTED: t('Contacté'), QUALIFIED: t('Qualifié'), CLOSED: t('Clos') };
  return (
    <>
      <PageHeader title={t('Leads')} subtitle={t('Demandes reçues via les formulaires de contact, de devis et de campagne.')} />
      {leads.length === 0 ? <Empty title={t('Aucun lead pour le moment.')} /> : (
        <ul className="space-y-4">
          {leads.map((ld) => {
            const utm = ld.utm as Record<string, string> | null;
            return (
              <li key={ld.id} className="panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{ld.name}{ld.company && <span className="muted font-normal"> · {ld.company}</span>}</p>
                    <p className="text-sm"><a className="underline" href={`mailto:${ld.email}`}>{ld.email}</a>{ld.phone && <> · <a href={`tel:${ld.phone}`}>{ld.phone}</a></>}</p>
                    <p className="muted mt-1 text-xs">{formatDateTime(ld.createdAt, locale)} · {ld.kind} · {ld.market}{ld.interest ? ` · ${ld.interest}` : ''}{ld.budget ? ` · ${ld.budget}` : ''}{utm?.utm_source ? ` · ${utm.utm_source}/${utm.utm_campaign ?? '-'}` : ''}</p>
                  </div>
                  <span className="flex items-center gap-2"><Badge tone={tone[ld.status]}>{label[ld.status]}</Badge><LeadStatus leadId={ld.id} status={ld.status} /></span>
                </div>
                <p className="mt-3 whitespace-pre-wrap break-words text-sm text-fg-soft">{ld.message}</p>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
