import { Link } from '@/i18n/client';
import { localePath } from '@/i18n/config';
import { formatDate } from '@/i18n/translate';
import { Empty, PageHeader, Table } from '@/components/ui';
import { ActionForm, Modal, Submit } from '@/components/ui/form';
import { createCompanyAction } from '@/modules/crm/actions';
import { listCompanies } from '@/modules/crm/service';
import { CompanyFields } from '../_ui/forms';
import { crmPage, one, type SearchParams } from '../_ui/page';
import { FilterBar, FilterField, Pagination, SortLink } from '../_ui/parts';

const PATH = '/app/crm/companies';

export default async function CompaniesPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, ctx, t } = await crmPage(params);
  const sp = await searchParams;
  const filters = { q: one(sp.q), sort: one(sp.sort) ?? 'name', dir: one(sp.dir) ?? 'asc' };
  const list = await listCompanies(ctx, { ...filters, page: one(sp.page), sort: filters.sort as never, dir: filters.dir as never });
  return (
    <>
      <PageHeader
        title={t('Entreprises')} subtitle={t('Les sociétés clientes et prospectées.')}
        actions={
          <Modal trigger={t('Nouvelle entreprise')} title={t('Nouvelle entreprise')}>
            <ActionForm action={createCompanyAction} className="space-y-4" resetOnSuccess successMessage={t('Entreprise créée.')}>
              <CompanyFields t={t} />
              <Submit>{t('Créer l’entreprise')}</Submit>
            </ActionForm>
          </Modal>
        }
      />
      <FilterBar action={localePath(locale, PATH)} reset={PATH} t={t}>
        <FilterField label={t('Recherche')} name="q"><input id="q-q" name="q" type="search" defaultValue={filters.q} className="input" placeholder={t('Nom, e-mail, téléphone, ville')} /></FilterField>
        <input type="hidden" name="sort" value={filters.sort} />
        <input type="hidden" name="dir" value={filters.dir} />
      </FilterBar>
      {list.total === 0 ? (
        <Empty title={filters.q ? t('Aucune entreprise ne correspond à cette recherche.') : t('Aucune entreprise pour le moment.')}>
          {!filters.q && t('Ajoutez votre première entreprise avec le bouton « Nouvelle entreprise ».')}
        </Empty>
      ) : (
        <>
          <Table head={[
            <SortLink key="n" label={t('Nom')} column="name" path={PATH} params={filters} />, t('Secteur'),
            <SortLink key="v" label={t('Ville')} column="city" path={PATH} params={filters} />, t('Téléphone'), t('Contacts'), t('Affaires'),
            <SortLink key="c" label={t('Créé le')} column="createdAt" path={PATH} params={filters} />,
          ]}>
            {list.items.map((c) => (
              <tr key={c.id}>
                <td><Link href={`${PATH}/${c.id}`} className="row-link">{c.name}</Link></td>
                <td>{c.industry ?? '—'}</td>
                <td>{c.city ?? '—'}</td>
                <td className="whitespace-nowrap">{c.phone ? <a href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}>{c.phone}</a> : '—'}</td>
                <td>{c._count.contacts}</td>
                <td>{c._count.deals}</td>
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
