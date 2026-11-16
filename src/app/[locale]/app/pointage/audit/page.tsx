import { Empty, PageHeader, Table } from '@/components/ui';
import { formatDateTime } from '@/i18n/translate';
import { hasFeature, listAudit } from '@/modules/pointage/service';
import { AUDIT_LABELS, ENTRY_LABELS } from '@/modules/pointage/labels';
import type { EntryType } from '@/modules/pointage/time';
import { Denied, Pagination, UpgradeNotice, href, one, pointagePage, type Search } from '../_components/server';

export default async function AuditPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Search }) {
  const { locale, ctx, actor, t } = await pointagePage(params);
  if (actor.role !== 'ADMIN') return <Denied t={t} />;
  if (!hasFeature(ctx, 'audit')) {
    return (
      <>
        <PageHeader title={t('Journal d’audit')} />
        <UpgradeNotice t={t}>{t('La consultation du journal d’audit complet n’est pas incluse dans votre plan. Les corrections de pointage restent enregistrées et seront visibles dès l’activation.')}</UpgradeNotice>
      </>
    );
  }
  const sp = await searchParams;
  const scope = ['corrections', 'pointage'].includes(one(sp.scope)) ? one(sp.scope) : '';
  const trail = await listAudit(ctx, { page: one(sp.page) || 1, scope });
  const detail = (meta: Record<string, unknown>) => {
    const e = (meta.added ?? meta.voided) as { type?: string; at?: string } | undefined;
    if (e?.type && e.at) return `${t(ENTRY_LABELS[e.type as EntryType] ?? e.type)} · ${formatDateTime(e.at, locale, trail.timezone)}`;
    if (typeof meta.type === 'string' && typeof meta.at === 'string') return `${t(ENTRY_LABELS[meta.type as EntryType] ?? meta.type)} · ${formatDateTime(meta.at, locale, trail.timezone)}`;
    if (typeof meta.startDate === 'string') return `${meta.startDate} → ${String(meta.endDate ?? '')}`;
    if (typeof meta.entries === 'number') return t('{entries} pointage(s), {absences} absence(s)', { entries: meta.entries, absences: Number(meta.absences ?? 0) });
    if (typeof meta.format === 'string') return `${meta.format.toUpperCase()} · ${String(meta.from ?? '')} → ${String(meta.to ?? '')}`;
    return '';
  };
  return (
    <>
      <PageHeader title={t('Journal d’audit')} subtitle={t('{n} événement(s)', { n: trail.total })} />
      <nav className="mb-4 flex flex-wrap gap-2" aria-label={t('Filtrer')}>
        {([['', t('Tout')], ['pointage', t('Pointage')], ['corrections', t('Corrections')]] as const).map(([value, label]) => (
          <a key={value} className={`btn btn-sm ${scope === value ? 'btn-primary' : 'btn-outline'}`} aria-current={scope === value ? 'page' : undefined} href={href(locale, '/audit', { scope: value })}>{label}</a>
        ))}
      </nav>
      {trail.items.length === 0 ? <Empty title={t('Aucun événement.')} /> : (
        <Table head={[t('Date et heure'), t('Action'), t('Auteur'), t('Employé concerné'), t('Détail')]}>
          {trail.items.map((i) => (
            <tr key={i.id}>
              <td className="whitespace-nowrap">{formatDateTime(i.createdAt, locale, trail.timezone)}</td>
              <td>{AUDIT_LABELS[i.action] ? t(AUDIT_LABELS[i.action]) : i.action}</td>
              <td>{i.actor ?? t('Système')}</td>
              <td>{i.employee ?? '—'}</td>
              <td className="max-w-[280px] break-words text-sm">{detail(i.meta)}{i.reason && <div className="muted text-xs">{t('Motif : {reason}', { reason: i.reason })}</div>}</td>
            </tr>
          ))}
        </Table>
      )}
      <Pagination page={trail.page} pages={trail.pages} t={t} to={(page) => href(locale, '/audit', { scope, page })} />
    </>
  );
}
