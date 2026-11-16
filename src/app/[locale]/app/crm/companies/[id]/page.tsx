import { Link } from '@/i18n/client';
import { formatDate, formatMoney } from '@/i18n/translate';
import { Card, DefList, PageHeader } from '@/components/ui';
import { ActionButton, ActionForm, Modal, Submit } from '@/components/ui/form';
import { createContactAction, createDealAction, deleteCompanyAction, updateCompanyAction } from '@/modules/crm/actions';
import { companyOptions, contactOptions, getCompany, listAttachments, listMembers, listTimeline } from '@/modules/crm/service';
import { CompanyFields, ContactFields, DealFields } from '../../_ui/forms';
import { crmPage, fullName, orNotFound } from '../../_ui/page';
import { ActivityForm, Attachments, DealStatusBadge, LifecycleBadge, TimelineList } from '../../_ui/parts';

const safeUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : `https://${u}`);

export default async function CompanyPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = await params;
  const { locale, ctx, t, tz, currency, can } = await crmPage(params);
  const company = await orNotFound(getCompany(ctx, id));
  const [timeline, files, members, companies, contacts] = await Promise.all([
    listTimeline(ctx, { companyId: id }), listAttachments(ctx, 'company', id), listMembers(ctx), companyOptions(ctx), contactOptions(ctx),
  ]);
  return (
    <>
      <p className="mb-3 text-sm"><Link href="/app/crm/companies" className="muted underline">← {t('Entreprises')}</Link></p>
      <PageHeader
        title={company.name} subtitle={[company.industry, company.city].filter(Boolean).join(' · ') || undefined}
        actions={
          <>
            <Modal trigger={t('Modifier')} title={t('Modifier l’entreprise')} triggerClassName="btn btn-outline btn-sm">
              <ActionForm action={updateCompanyAction} className="space-y-4" successMessage={t('Modifications enregistrées.')}>
                <input type="hidden" name="id" value={id} />
                <CompanyFields t={t} value={company} />
                <Submit>{t('Enregistrer')}</Submit>
              </ActionForm>
            </Modal>
            {can.remove && <ActionButton action={deleteCompanyAction} fields={{ id, locale }} className="btn btn-danger btn-sm" confirm={t('Supprimer définitivement cette entreprise et son historique ? Ses contacts sont conservés.')}>{t('Supprimer')}</ActionButton>}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <Card title={t('Informations')}>
            <DefList items={[
              [t('E-mail'), company.email && <a href={`mailto:${company.email}`} className="underline">{company.email}</a>],
              [t('Téléphone'), company.phone && <a href={`tel:${company.phone.replace(/[^\d+]/g, '')}`} className="underline">{company.phone}</a>],
              [t('Site web'), company.website && <a href={safeUrl(company.website)} target="_blank" rel="noopener noreferrer nofollow" className="underline">{company.website}</a>],
              [t('Adresse'), [company.address, company.city, company.country].filter(Boolean).join(', ')],
              [t('Secteur'), company.industry],
              [t('Créé le'), formatDate(company.createdAt, locale)],
              [t('Notes'), company.notes && <span className="whitespace-pre-wrap">{company.notes}</span>],
            ]} />
          </Card>
          <Card title={t('Contacts')} actions={
            <Modal trigger={t('Nouveau contact')} title={t('Nouveau contact')} triggerClassName="btn btn-outline btn-sm">
              <ActionForm action={createContactAction} className="space-y-4" resetOnSuccess successMessage={t('Contact créé.')}>
                <ContactFields t={t} companies={companies} members={members} userId={ctx.userId} value={{ companyId: id }} />
                <Submit>{t('Créer le contact')}</Submit>
              </ActionForm>
            </Modal>
          }>
            {company.contacts.length === 0 ? <p className="muted text-sm">{t('Aucun contact dans cette entreprise.')}</p> : (
              <ul className="divide-y divide-line">
                {company.contacts.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <span className="min-w-0"><Link href={`/app/crm/contacts/${c.id}`} className="break-words text-sm font-medium underline-offset-2 hover:underline">{fullName(c)}</Link>{c.jobTitle && <span className="muted block text-xs">{c.jobTitle}</span>}</span>
                    <LifecycleBadge value={c.lifecycle} t={t} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title={t('Affaires')} actions={
            <Modal trigger={t('Nouvelle affaire')} title={t('Nouvelle affaire')} triggerClassName="btn btn-outline btn-sm">
              <ActionForm action={createDealAction} className="space-y-4" resetOnSuccess successMessage={t('Affaire créée.')}>
                <DealFields t={t} currency={currency} contacts={contacts.filter((c) => c.companyId === id || !c.companyId)} companies={companies} members={members} userId={ctx.userId} value={{ companyId: id }} />
                <Submit>{t('Créer l’affaire')}</Submit>
              </ActionForm>
            </Modal>
          }>
            {company.deals.length === 0 ? <p className="muted text-sm">{t('Aucune affaire liée à cette entreprise.')}</p> : (
              <ul className="divide-y divide-line">
                {company.deals.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <Link href={`/app/crm/deals/${d.id}`} className="min-w-0 break-words text-sm font-medium underline-offset-2 hover:underline">{d.title}</Link>
                    <span className="flex items-center gap-2 text-sm"><span className="muted">{d.stage.name}</span><DealStatusBadge value={d.status} t={t} /><span className="font-semibold">{formatMoney(d.value, d.currency, locale)}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Attachments files={files} entityType="company" entityId={id} t={t} locale={locale} />
        </div>
        <div className="space-y-6">
          <Card title={t('Ajouter une activité')}><ActivityForm t={t} link={{ companyId: id }} tz={tz} /></Card>
          <Card title={t('Historique')}><TimelineList items={timeline} t={t} locale={locale} tz={tz} showLinks /></Card>
        </div>
      </div>
    </>
  );
}
