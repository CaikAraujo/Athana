import { Link } from '@/i18n/client';
import { localePath } from '@/i18n/config';
import { formatDate } from '@/i18n/translate';
import { Empty, PageHeader, Table } from '@/components/ui';
import { ActionButton, ActionForm, Modal, Submit } from '@/components/ui/form';
import { convertLeadAction, createContactAction } from '@/modules/crm/actions';
import { companyOptions, leadSourceOptions, listLeads, listMembers } from '@/modules/crm/service';
import { ContactFields } from '../_ui/forms';
import { crmPage, fullName, one, type SearchParams } from '../_ui/page';
import { FilterBar, FilterField, Pagination } from '../_ui/parts';

const PATH = '/app/crm/leads';

export default async function LeadsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, ctx, t } = await crmPage(params);
  const sp = await searchParams;
  const filters = { q: one(sp.q), source: one(sp.source), ownerId: one(sp.ownerId) };
  const [list, companies, members, sources] = await Promise.all([listLeads(ctx, { ...filters, page: one(sp.page) }), companyOptions(ctx), listMembers(ctx), leadSourceOptions(ctx)]);
  const filtered = !!(filters.q || filters.source || filters.ownerId);
  return (
    <>
      <PageHeader
        title={t('Leads')} subtitle={t('Les nouveaux contacts à qualifier. Convertissez-les en prospects, puis en clients.')}
        actions={
          <Modal trigger={t('Nouveau lead')} title={t('Nouveau lead')}>
            <ActionForm action={createContactAction} className="space-y-4" resetOnSuccess successMessage={t('Lead créé.')}>
              <ContactFields t={t} companies={companies} members={members} userId={ctx.userId} lockLifecycle="LEAD" />
              <Submit>{t('Créer le lead')}</Submit>
            </ActionForm>
          </Modal>
        }
      />
      <FilterBar action={localePath(locale, PATH)} reset={PATH} t={t}>
        <FilterField label={t('Recherche')} name="q"><input id="q-q" name="q" type="search" defaultValue={filters.q} className="input" placeholder={t('Nom, e-mail, téléphone')} /></FilterField>
        <FilterField label={t('Source')} name="source">
          <select id="q-source" name="source" defaultValue={filters.source ?? ''} className="select">
            <option value="">{t('Toutes')}</option>
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </FilterField>
        <FilterField label={t('Responsable')} name="ownerId">
          <select id="q-ownerId" name="ownerId" defaultValue={filters.ownerId ?? ''} className="select">
            <option value="">{t('Tous')}</option>
            {members.map((mb) => <option key={mb.userId} value={mb.userId}>{mb.name}</option>)}
          </select>
        </FilterField>
      </FilterBar>
      {list.total === 0 ? (
        <Empty title={filtered ? t('Aucun lead ne correspond à ces critères.') : t('Aucun lead à traiter.')}>
          {!filtered && t('Les contacts au statut « Lead » apparaissent ici.')}
        </Empty>
      ) : (
        <>
          <Table head={[t('Nom'), t('Coordonnées'), t('Entreprise'), t('Source'), t('Responsable'), t('Reçu le'), t('Action')]}>
            {list.items.map((c) => (
              <tr key={c.id}>
                <td><Link href={`/app/crm/contacts/${c.id}`} className="row-link whitespace-nowrap">{fullName(c)}</Link></td>
                <td className="text-sm">{c.email && <a href={`mailto:${c.email}`} className="block underline-offset-2 hover:underline">{c.email}</a>}{c.phone && <a href={`tel:${c.phone.replace(/[^\d+]/g, '')}`} className="block whitespace-nowrap">{c.phone}</a>}{!c.email && !c.phone && '—'}</td>
                <td>{c.company?.name ?? '—'}</td>
                <td>{c.source ?? '—'}</td>
                <td className="whitespace-nowrap">{c.ownerName ?? '—'}</td>
                <td className="muted whitespace-nowrap">{formatDate(c.createdAt, locale)}</td>
                <td><ActionButton action={convertLeadAction} fields={{ id: c.id }}>{t('Convertir en prospect')}</ActionButton></td>
              </tr>
            ))}
          </Table>
          <Pagination t={t} path={PATH} params={filters} page={list.page} pages={list.pages} total={list.total} />
        </>
      )}
    </>
  );
}
