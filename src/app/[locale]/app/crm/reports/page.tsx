import { Link } from '@/i18n/client';
import { formatDate, formatMoney } from '@/i18n/translate';
import { Card, Empty, PageHeader } from '@/components/ui';
import { ACTIVITY_LABELS, ACTIVITY_TYPES, listPipelines, reports } from '@/modules/crm/service';
import { crmPage, one, orNotFound, type SearchParams } from '../_ui/page';
import { UpgradeNotice } from '../_ui/parts';

const pct = (value: number, max: number) => (max > 0 ? Math.max(value > 0 ? 2 : 0, Math.round((value / max) * 100)) : 0);

function HBar({ label, value, display, max, tone = 'gold' }: { label: string; value: number; display: string; max: number; tone?: 'gold' | 'ok' | 'danger' | 'info' }) {
  const color = { gold: 'bg-accent-600', ok: 'bg-ok', danger: 'bg-danger', info: 'bg-info' }[tone];
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-sm">
      <span className="truncate">{label}</span>
      <span className="font-semibold tabular-nums">{display}</span>
      <div className="col-span-2 h-2.5 overflow-hidden rounded-full bg-ink-600" role="img" aria-label={`${label} : ${display}`}>
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct(value, max)}%` }} />
      </div>
    </div>
  );
}

export default async function ReportsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, ctx, t, currency, has } = await crmPage(params);
  if (!has('reports')) {
    return (
      <>
        <PageHeader title={t('Rapports')} />
        <UpgradeNotice t={t} title={t('Rapports avancés')}>{t('Affaires gagnées et perdues, pipeline par étape, activité de l’équipe et sources de leads. Disponible avec le plan Pro.')}</UpgradeNotice>
      </>
    );
  }
  const pipelineId = one((await searchParams).pipeline);
  const [data, pipelines] = await Promise.all([orNotFound(reports(ctx, { pipelineId })), listPipelines(ctx)]);
  const money = (v: number) => formatMoney(v, currency, locale);
  const maxMonth = Math.max(1, ...data.wonLostByMonth.flatMap((r) => [r.wonValue, r.lostValue]));
  const maxStage = Math.max(1, ...data.pipelineByStage.map((s) => s.value));
  const maxUser = Math.max(1, ...data.activityPerUser.map((u) => u.total));
  const maxSource = Math.max(1, ...data.leadSources.map((s) => s.count));
  const H = 140;
  return (
    <>
      <PageHeader title={t('Rapports')} subtitle={t('Vue d’ensemble de votre activité commerciale.')} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title={t('Affaires gagnées et perdues par mois')}>
          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${data.wonLostByMonth.length * 80} ${H + 30}`} className="h-52 w-full min-w-[420px]" role="img" aria-label={t('Affaires gagnées et perdues par mois')} preserveAspectRatio="xMidYMid meet">
              <line x1="0" x2="100%" y1={H} y2={H} stroke="currentColor" opacity="0.2" />
              {data.wonLostByMonth.map((r, i) => {
                const won = (r.wonValue / maxMonth) * (H - 10);
                const lost = (r.lostValue / maxMonth) * (H - 10);
                return (
                  <g key={r.month} transform={`translate(${i * 80}, 0)`}>
                    <rect x="14" y={H - won} width="22" height={won} rx="3" fill="var(--color-ok)"><title>{`${t('Gagnées')} : ${r.won} · ${money(r.wonValue)}`}</title></rect>
                    <rect x="42" y={H - lost} width="22" height={lost} rx="3" fill="var(--color-danger)"><title>{`${t('Perdues')} : ${r.lost} · ${money(r.lostValue)}`}</title></rect>
                    <text x="39" y={H + 20} textAnchor="middle" fontSize="12" fill="var(--color-fg-muted)">{formatDate(r.date, locale, { dateStyle: undefined, month: 'short', year: '2-digit', timeZone: 'UTC' })}</text>
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="mt-2 flex flex-wrap gap-4 text-xs"><span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-ok" aria-hidden />{t('Gagnées')}</span><span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-danger" aria-hidden />{t('Perdues')}</span></p>
          <div className="table-wrap mt-4">
            <table className="table">
              <thead><tr><th scope="col">{t('Mois')}</th><th scope="col">{t('Gagnées')}</th><th scope="col">{t('Montant gagné')}</th><th scope="col">{t('Perdues')}</th><th scope="col">{t('Montant perdu')}</th></tr></thead>
              <tbody>
                {data.wonLostByMonth.map((r) => (
                  <tr key={r.month}>
                    <td className="whitespace-nowrap capitalize">{formatDate(r.date, locale, { dateStyle: undefined, month: 'long', year: 'numeric', timeZone: 'UTC' })}</td>
                    <td>{r.won}</td><td className="whitespace-nowrap">{money(r.wonValue)}</td><td>{r.lost}</td><td className="whitespace-nowrap">{money(r.lostValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title={t('Pipeline par étape')}>
          {pipelines.length > 1 && (
            <nav aria-label={t('Pipelines')} className="mb-4 flex flex-wrap gap-2">
              {pipelines.map((p) => <Link key={p.id} href={`/app/crm/reports?pipeline=${p.id}`} className={`btn btn-sm ${p.id === data.pipeline.id ? 'btn-secondary' : 'btn-outline'}`}>{p.name}</Link>)}
            </nav>
          )}
          <div className="space-y-4">
            {data.pipelineByStage.map((s) => <HBar key={s.stageId} label={t('{name} · {count} affaire(s)', { name: s.name, count: s.count })} value={s.value} max={maxStage} display={money(s.value)} />)}
          </div>
          <p className="muted mt-4 text-sm">{t('Prévision pondérée')} : <strong className="text-fg">{money(data.pipelineByStage.reduce((sum, s) => sum + s.weighted, 0))}</strong></p>
        </Card>

        <Card title={t('Activité par utilisateur (30 derniers jours)')}>
          {data.activityPerUser.length === 0 ? <Empty title={t('Aucune activité enregistrée sur la période.')} /> : (
            <div className="space-y-4">
              {data.activityPerUser.map((u) => (
                <div key={u.userId}>
                  <HBar label={u.name} value={u.total} max={maxUser} display={String(u.total)} tone="info" />
                  <p className="muted mt-1 text-xs">{ACTIVITY_TYPES.filter((ty) => u.byType[ty]).map((ty) => `${t(ACTIVITY_LABELS[ty])} : ${u.byType[ty]}`).join(' · ')}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title={t('Sources des contacts')}>
          {data.leadSources.length === 0 ? <Empty title={t('Aucun contact pour le moment.')} /> : (
            <div className="space-y-4">
              {data.leadSources.map((s) => <HBar key={s.source || '-'} label={s.source || t('Non renseignée')} value={s.count} max={maxSource} display={String(s.count)} />)}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
