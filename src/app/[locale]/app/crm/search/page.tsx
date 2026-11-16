import { Link } from '@/i18n/client';
import { localePath } from '@/i18n/config';
import { formatMoney } from '@/i18n/translate';
import { Card, Empty, PageHeader } from '@/components/ui';
import { globalSearch } from '@/modules/crm/service';
import { crmPage, fullName, one, type SearchParams } from '../_ui/page';
import { DealStatusBadge, LifecycleBadge } from '../_ui/parts';

export default async function SearchPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: SearchParams }) {
  const { locale, ctx, t } = await crmPage(params);
  const q = (one((await searchParams).q) ?? '').slice(0, 200);
  const results = q.length >= 2 ? await globalSearch(ctx, q) : null;
  return (
    <>
      <PageHeader title={t('Recherche')} subtitle={results ? t('{count} résultat(s) pour « {q} »', { count: results.total, q }) : t('Cherchez parmi vos contacts, entreprises et affaires.')} />
      <form method="get" action={localePath(locale, '/app/crm/search')} role="search" className="mb-6 flex gap-2">
        <label htmlFor="search-q" className="sr-only">{t('Rechercher')}</label>
        <input id="search-q" name="q" type="search" defaultValue={q} minLength={2} required autoFocus={!q} className="input" placeholder={t('Nom, e-mail, téléphone, titre d’affaire…')} />
        <button type="submit" className="btn btn-primary">{t('Rechercher')}</button>
      </form>
      {q && q.length < 2 && <p className="alert alert-warn">{t('Saisissez au moins 2 caractères.')}</p>}
      {results && results.total === 0 && <Empty title={t('Aucun résultat.')}>{t('Vérifiez l’orthographe ou essayez un autre mot-clé.')}</Empty>}
      {results && results.total > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card title={t('Contacts ({count})', { count: results.contacts.length })}>
            {results.contacts.length === 0 ? <p className="muted text-sm">{t('Aucun contact.')}</p> : (
              <ul className="divide-y divide-line">
                {results.contacts.map((c) => (
                  <li key={c.id} className="py-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2"><Link href={`/app/crm/contacts/${c.id}`} className="break-words text-sm font-medium underline-offset-2 hover:underline">{fullName(c)}</Link><LifecycleBadge value={c.lifecycle} t={t} /></div>
                    <p className="muted break-words text-xs">{[c.email, c.phone, c.company?.name].filter(Boolean).join(' · ')}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title={t('Entreprises ({count})', { count: results.companies.length })}>
            {results.companies.length === 0 ? <p className="muted text-sm">{t('Aucune entreprise.')}</p> : (
              <ul className="divide-y divide-line">
                {results.companies.map((c) => (
                  <li key={c.id} className="py-2.5">
                    <Link href={`/app/crm/companies/${c.id}`} className="break-words text-sm font-medium underline-offset-2 hover:underline">{c.name}</Link>
                    <p className="muted break-words text-xs">{[c.city, c.email, c.phone].filter(Boolean).join(' · ')}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title={t('Affaires ({count})', { count: results.deals.length })}>
            {results.deals.length === 0 ? <p className="muted text-sm">{t('Aucune affaire.')}</p> : (
              <ul className="divide-y divide-line">
                {results.deals.map((d) => (
                  <li key={d.id} className="py-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2"><Link href={`/app/crm/deals/${d.id}`} className="break-words text-sm font-medium underline-offset-2 hover:underline">{d.title}</Link><DealStatusBadge value={d.status} t={t} /></div>
                    <p className="muted text-xs">{d.stage.name} · {formatMoney(d.value, d.currency, locale)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
