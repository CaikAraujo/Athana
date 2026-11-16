import { Link } from '@/i18n/client';
import { localePath } from '@/i18n/config';
import { formatDate } from '@/i18n/translate';
import { Empty, PageHeader, Table } from '@/components/ui';
import { ActionForm, Modal, Submit } from '@/components/ui/form';
import { createContactAction } from '@/modules/crm/actions';
import { LIFECYCLES, LIFECYCLE_LABELS, companyOptions, listContacts, listMembers } from '@/modules/crm/service';
import { ContactFields } from '../_ui/forms';
import { crmPage, fullName, one, type SearchParams } from '../_ui/page';
import { FilterBar, FilterField, LifecycleBadge, Pagination, SortLink } from '../_ui/parts';

const PATH = '/app/crm/contacts';

export default async function ContactsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, ctx, t } = await crmPage(params);
  const sp = await searchParams;
  const filters = { q: one(sp.q), lifecycle: one(sp.lifecycle), companyId: one(sp.companyId), ownerId: one(sp.ownerId), sort: one(sp.sort) ?? 'name', dir: one(sp.dir) ?? 'asc' };
  const [list, companies, members] = await Promise.all([
    listContacts(ctx, { ...filters, page: one(sp.page), lifecycle: filters.lifecycle as never, sort: filters.sort as never, dir: filters.dir as never }),
    companyOptions(ctx), listMembers(ctx),
  ]);
  const filtered = !!(filters.q || filters.lifecycle || filters.companyId || filters.ownerId);
  return (
    <>
      <PageHeader
        title={t('Contacts')} subtitle={t('Toutes les personnes avec qui vous êtes en relation.')}
        actions={
          <Modal trigger={t('Nouveau contact')} title={t('Nouveau contact')}>
            <ActionForm action={createContactAction} className="space-y-4" resetOnSuccess successMessage={t('Contact créé.')}>
              <ContactFields t={t} companies={companies} members={members} userId={ctx.userId} value={{ companyId: filters.companyId }} />
              <Submit>{t('Créer le contact')}</Submit>
            </ActionForm>
          </Modal>
        }
      />
      <FilterBar action={localePath(locale, PATH)} reset={PATH} t={t}>
        <FilterField label={t('Recherche')} name="q"><input id="q-q" name="q" type="search" defaultValue={filters.q} className="input" placeholder={t('Nom, e-mail, téléphone')} /></FilterField>
        <FilterField label={t('Statut')} name="lifecycle">
          <select id="q-lifecycle" name="lifecycle" defaultValue={filters.lifecycle ?? ''} className="select">
            <option value="">{t('Tous')}</option>
            {LIFECYCLES.map((l) => <option key={l} value={l}>{t(LIFECYCLE_LABELS[l])}</option>)}
          </select>
        </FilterField>
        <FilterField label={t('Entreprise')} name="companyId">
          <select id="q-companyId" name="companyId" defaultValue={filters.companyId ?? ''} className="select">
            <option value="">{t('Toutes')}</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </FilterField>
        <FilterField label={t('Responsable')} name="ownerId">
          <select id="q-ownerId" name="ownerId" defaultValue={filters.ownerId ?? ''} className="select">
            <option value="">{t('Tous')}</option>
            {members.map((mb) => <option key={mb.userId} value={mb.userId}>{mb.name}</option>)}
          </select>
        </FilterField>
        <input type="hidden" name="sort" value={filters.sort} />
        <input type="hidden" name="dir" value={filters.dir} />
      </FilterBar>

      {list.total === 0 ? (
        <Empty title={filtered ? t('Aucun contact ne correspond à ces critères.') : t('Aucun contact pour le moment.')}>
          {!filtered && t('Ajoutez votre premier contact avec le bouton « Nouveau contact ».')}
        </Empty>
      ) : (
        <>
          <Table head={[
            <SortLink key="n" label={t('Nom')} column="name" path={PATH} params={filters} />,
            <SortLink key="e" label={t('E-mail')} column="email" path={PATH} params={filters} />,
            t('Téléphone'), t('Entreprise'),
            <SortLink key="l" label={t('Statut')} column="lifecycle" path={PATH} params={filters} />,
            t('Responsable'),
            <SortLink key="c" label={t('Créé le')} column="createdAt" path={PATH} params={filters} />,
          ]}>
            {list.items.map((c) => (
              <tr key={c.id}>
                <td><Link href={`${PATH}/${c.id}`} className="row-link whitespace-nowrap">{fullName(c)}</Link>{c.jobTitle && <div className="muted text-xs">{c.jobTitle}</div>}</td>
                <td>{c.email ? <a href={`mailto:${c.email}`} className="underline-offset-2 hover:underline">{c.email}</a> : '—'}</td>
                <td className="whitespace-nowrap">{c.phone ? <a href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}>{c.phone}</a> : '—'}</td>
                <td>{c.company ? <Link href={`/app/crm/companies/${c.company.id}`} className="underline-offset-2 hover:underline">{c.company.name}</Link> : '—'}</td>
                <td><LifecycleBadge value={c.lifecycle} t={t} /></td>
                <td className="whitespace-nowrap">{c.ownerName ?? '—'}</td>
                <td className="muted whitespace-nowrap">{formatDate(c.createdAt, locale)}</td>
              </tr>
            ))}
          </Table>
          <Pagination t={t} path={PATH} params={filters} page={list.page} pages={list.pages} total={list.total} />
        </>
      )}
    </>
  );
}
