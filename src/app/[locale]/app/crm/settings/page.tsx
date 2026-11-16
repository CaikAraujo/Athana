import { ArrowDown, ArrowUp, Download } from 'lucide-react';
import { Link } from '@/i18n/client';
import { formatDate, formatNumber } from '@/i18n/translate';
import { Badge, Card, PageHeader, Progress } from '@/components/ui';
import { ActionButton, ActionForm, Input, Modal, Select, Submit } from '@/components/ui/form';
import {
  addStageAction, changeMemberRoleAction, createPipelineAction, deletePipelineAction, deleteStageAction, inviteMemberAction, moveStageAction,
  removeMemberAction, renamePipelineAction, setDefaultPipelineAction, updateStageAction,
} from '@/modules/crm/actions';
import { EXPORT_TYPES, ROLE_LABELS, listMembers, listPipelines, planUsage, type ExportType } from '@/modules/crm/service';
import { crmPage } from '../_ui/page';

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale, ctx, t, can, has } = await crmPage(params);
  const [usage, pipelines, members] = await Promise.all([planUsage(ctx), listPipelines(ctx), listMembers(ctx)]);
  const usageLabels: Record<string, string> = { users: t('Utilisateurs'), contacts: t('Contacts'), companies: t('Entreprises'), storageMb: t('Stockage (Mo)') };
  const exportLabels: Record<ExportType, string> = { contacts: t('Exporter les contacts'), companies: t('Exporter les entreprises'), deals: t('Exporter les affaires') };
  const roleOptions = (['ADMIN', 'MANAGER', 'MEMBER'] as const).map((r) => ({ value: r, label: t(ROLE_LABELS[r]) }));
  const usersLimit = usage.usage.find((u) => u.key === 'users')!;
  const seatsFull = usersLimit.limit !== null && usersLimit.used >= usersLimit.limit;
  return (
    <>
      <PageHeader title={t('Paramètres')} subtitle={ctx.organization.name} />
      <div className="space-y-6">
        <Card title={t('Plan et utilisation')} actions={<Link href="/account/subscriptions?product=crm" className="btn btn-outline btn-sm">{t('Gérer l’abonnement')}</Link>}>
          <p className="mb-4 text-sm">{t('Plan actuel')} : <Badge tone="gold">{usage.planName ?? '—'}</Badge></p>
          <ul className="grid gap-4 sm:grid-cols-2">
            {usage.usage.map((u) => (
              <li key={u.key}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
                  <span>{usageLabels[u.key]}</span>
                  <span className="muted tabular-nums">{u.limit === null ? t('{used} · illimité', { used: formatNumber(u.used, locale) }) : t('{used} sur {limit}', { used: formatNumber(u.used, locale), limit: formatNumber(u.limit, locale) })}</span>
                </div>
                {u.limit !== null && <Progress value={u.limit > 0 ? (u.used / u.limit) * 100 : 100} label={usageLabels[u.key]} />}
              </li>
            ))}
          </ul>
        </Card>

        <Card title={t('Export des données')}>
          {!has('export') ? (
            <p className="muted text-sm">{t('L’export CSV n’est pas inclus dans votre plan.')} <Link href="/account/subscriptions?product=crm" className="underline">{t('Voir les plans')}</Link></p>
          ) : !can.remove ? (
            <p className="muted text-sm">{t('Seuls les responsables et administrateurs peuvent exporter les données.')}</p>
          ) : (
            <>
              <p className="muted mb-3 text-sm">{t('Fichiers CSV (UTF-8, séparateur point-virgule) compatibles avec Excel et LibreOffice.')}</p>
              <div className="flex flex-wrap gap-2">
                {EXPORT_TYPES.map((type) => <a key={type} href={`/api/crm/export?type=${type}&locale=${locale}`} className="btn btn-outline btn-sm" download><Download size={16} aria-hidden />{exportLabels[type]}</a>)}
              </div>
            </>
          )}
        </Card>

        <Card title={t('Pipelines et étapes')} actions={can.configure ? (
          has('multiPipelines') ? (
            <Modal trigger={t('Nouveau pipeline')} title={t('Nouveau pipeline')} triggerClassName="btn btn-outline btn-sm">
              <ActionForm action={createPipelineAction} className="space-y-4" resetOnSuccess successMessage={t('Pipeline créé avec les étapes par défaut.')}>
                <Input label={t('Nom du pipeline')} name="name" required maxLength={80} />
                <Submit>{t('Créer le pipeline')}</Submit>
              </ActionForm>
            </Modal>
          ) : <Link href="/account/subscriptions?product=crm" className="text-sm underline">{t('Pipelines multiples : voir les plans')}</Link>
        ) : undefined}>
          {!can.configure && <p className="alert alert-info mb-4">{t('Seuls les administrateurs peuvent modifier les pipelines.')}</p>}
          <div className="space-y-6">
            {pipelines.map((p) => (
              <section key={p.id} className="rounded-xl border border-line p-4" aria-label={p.name}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex flex-wrap items-center gap-2 text-base font-semibold">{p.name}{p.isDefault && <Badge tone="gold">{t('Par défaut')}</Badge>}<span className="muted text-xs font-normal">{t('{count} affaire(s)', { count: p._count.deals })}</span></h3>
                  {can.configure && (
                    <div className="flex flex-wrap gap-2">
                      <Modal trigger={t('Renommer')} title={t('Renommer le pipeline')} triggerClassName="btn btn-ghost btn-sm">
                        <ActionForm action={renamePipelineAction} className="space-y-4" successMessage={t('Modifications enregistrées.')}>
                          <input type="hidden" name="id" value={p.id} />
                          <Input label={t('Nom du pipeline')} name="name" required maxLength={80} defaultValue={p.name} />
                          <Submit>{t('Enregistrer')}</Submit>
                        </ActionForm>
                      </Modal>
                      {!p.isDefault && <ActionButton action={setDefaultPipelineAction} fields={{ id: p.id }} className="btn btn-ghost btn-sm">{t('Définir par défaut')}</ActionButton>}
                      {pipelines.length > 1 && <ActionButton action={deletePipelineAction} fields={{ id: p.id }} className="btn btn-ghost btn-sm text-danger" confirm={t('Supprimer ce pipeline et ses étapes ?')}>{t('Supprimer')}</ActionButton>}
                    </div>
                  )}
                </div>
                <ol className="divide-y divide-line">
                  {p.stages.map((s, i) => (
                    <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                      <span className="min-w-0 text-sm"><span className="muted mr-2 tabular-nums">{i + 1}.</span><span className="font-medium">{s.name}</span> <span className="badge ml-1">{s.probability} %</span> <span className="muted ml-1 text-xs">{t('{count} affaire(s)', { count: s._count.deals })}</span></span>
                      {can.configure && (
                        <span className="flex flex-wrap items-center gap-1">
                          {i > 0 && <ActionButton action={moveStageAction} fields={{ id: s.id, direction: 'up' }} className="btn btn-ghost btn-sm px-2"><ArrowUp size={16} aria-hidden /><span className="sr-only">{t('Monter l’étape {name}', { name: s.name })}</span></ActionButton>}
                          {i < p.stages.length - 1 && <ActionButton action={moveStageAction} fields={{ id: s.id, direction: 'down' }} className="btn btn-ghost btn-sm px-2"><ArrowDown size={16} aria-hidden /><span className="sr-only">{t('Descendre l’étape {name}', { name: s.name })}</span></ActionButton>}
                          <Modal trigger={t('Modifier')} title={t('Modifier l’étape')} triggerClassName="btn btn-ghost btn-sm">
                            <ActionForm action={updateStageAction} className="space-y-4" successMessage={t('Modifications enregistrées.')}>
                              <input type="hidden" name="id" value={s.id} />
                              <Input label={t('Nom de l’étape')} name="name" required maxLength={80} defaultValue={s.name} />
                              <Input label={t('Probabilité de gain (%)')} name="probability" type="number" min={0} max={100} step={1} required defaultValue={s.probability} />
                              <Submit>{t('Enregistrer')}</Submit>
                            </ActionForm>
                          </Modal>
                          {p.stages.length > 1 && <ActionButton action={deleteStageAction} fields={{ id: s.id }} className="btn btn-ghost btn-sm text-danger" confirm={t('Supprimer cette étape ?')}>{t('Supprimer')}</ActionButton>}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
                {can.configure && (
                  <div className="mt-3">
                    <Modal trigger={t('Ajouter une étape')} title={t('Ajouter une étape à {name}', { name: p.name })} triggerClassName="btn btn-outline btn-sm">
                      <ActionForm action={addStageAction} className="space-y-4" resetOnSuccess successMessage={t('Étape ajoutée.')}>
                        <input type="hidden" name="pipelineId" value={p.id} />
                        <Input label={t('Nom de l’étape')} name="name" required maxLength={80} />
                        <Input label={t('Probabilité de gain (%)')} name="probability" type="number" min={0} max={100} step={1} required defaultValue={50} />
                        <Submit>{t('Ajouter l’étape')}</Submit>
                      </ActionForm>
                    </Modal>
                  </div>
                )}
              </section>
            ))}
          </div>
        </Card>

        <Card title={t('Équipe')} actions={can.configure ? (
          seatsFull ? <Link href="/account/subscriptions?product=crm" className="text-sm underline">{t('Limite d’utilisateurs atteinte : voir les plans')}</Link> : (
            <Modal trigger={t('Inviter un membre')} title={t('Inviter un membre')} triggerClassName="btn btn-outline btn-sm">
              <ActionForm action={inviteMemberAction} className="space-y-4" resetOnSuccess successMessage={t('Invitation envoyée.')}>
                <Input label={t('Nom complet')} name="name" required maxLength={120} autoComplete="off" />
                <Input label={t('Adresse e-mail')} name="email" type="email" required maxLength={200} autoComplete="off" />
                <Select label={t('Rôle')} name="role" options={roleOptions} defaultValue="MEMBER" hint={t('Membre : crée et modifie. Responsable : supprime et exporte. Administrateur : configure le CRM et l’équipe.')} />
                <Submit>{t('Envoyer l’invitation')}</Submit>
              </ActionForm>
            </Modal>
          )
        ) : undefined}>
          <ul className="divide-y divide-line">
            {members.map((mb) => (
              <li key={mb.userId} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{mb.name}{mb.isSelf && <span className="muted font-normal"> ({t('vous')})</span>}</p>
                  <p className="muted truncate text-xs">{mb.email} · {t('depuis le {date}', { date: formatDate(mb.joinedAt, locale) })}</p>
                </div>
                {can.configure && mb.role !== 'OWNER' && !mb.isSelf ? (
                  <div className="flex flex-wrap items-end gap-2">
                    <ActionForm action={changeMemberRoleAction} className="flex items-end gap-2">
                      <input type="hidden" name="userId" value={mb.userId} />
                      <label className="sr-only" htmlFor={`role-${mb.userId}`}>{t('Rôle de {name}', { name: mb.name })}</label>
                      <select id={`role-${mb.userId}`} name="role" defaultValue={mb.role} className="select !min-h-9 w-auto py-1 pr-8 text-sm">
                        {roleOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                      <Submit className="btn btn-outline btn-sm">{t('Appliquer')}</Submit>
                    </ActionForm>
                    <ActionButton action={removeMemberAction} fields={{ userId: mb.userId }} className="btn btn-ghost btn-sm text-danger" confirm={t('Retirer {name} de l’équipe ?', { name: mb.name })}>{t('Retirer')}</ActionButton>
                  </div>
                ) : <Badge tone={mb.role === 'OWNER' ? 'gold' : 'neutral'}>{t(ROLE_LABELS[mb.role])}</Badge>}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
