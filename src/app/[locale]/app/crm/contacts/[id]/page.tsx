import { Link } from '@/i18n/client';
import { formatDate, formatMoney } from '@/i18n/translate';
import { Card, DefList, PageHeader } from '@/components/ui';
import { ActionButton, ActionForm, Modal, Submit } from '@/components/ui/form';
import { convertLeadAction, createDealAction, deleteContactAction, updateContactAction } from '@/modules/crm/actions';
import { companyOptions, contactOptions, getContact, listAttachments, listMembers, listTimeline, tasksFor } from '@/modules/crm/service';
import { ContactFields, DealFields } from '../../_ui/forms';
import { crmPage, fullName, orNotFound } from '../../_ui/page';
import { ActivityForm, Attachments, DealStatusBadge, LifecycleBadge, TaskList, TaskModal, TimelineList } from '../../_ui/parts';

export default async function ContactPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = await params;
  const { locale, ctx, t, tz, currency, can } = await crmPage(params);
  const contact = await orNotFound(getContact(ctx, id));
  const [timeline, tasks, files, companies, members, contacts] = await Promise.all([
    listTimeline(ctx, { contactId: id }), tasksFor(ctx, { contactId: id }), listAttachments(ctx, 'contact', id), companyOptions(ctx), listMembers(ctx), contactOptions(ctx),
  ]);
  const name = fullName(contact);
  const nextLabel = contact.lifecycle === 'LEAD' ? t('Convertir en prospect') : contact.lifecycle === 'PROSPECT' ? t('Convertir en client') : null;
  return (
    <>
      <p className="mb-3 text-sm"><Link href={contact.lifecycle === 'LEAD' ? '/app/crm/leads' : '/app/crm/contacts'} className="muted underline">← {contact.lifecycle === 'LEAD' ? t('Leads') : t('Contacts')}</Link></p>
      <PageHeader
        title={name}
        subtitle={<span className="flex flex-wrap items-center gap-2"><LifecycleBadge value={contact.lifecycle} t={t} />{contact.jobTitle}{contact.company && <Link href={`/app/crm/companies/${contact.company.id}`} className="underline">{contact.company.name}</Link>}</span>}
        actions={
          <>
            {nextLabel && <ActionButton action={convertLeadAction} fields={{ id }} className="btn btn-primary btn-sm">{nextLabel}</ActionButton>}
            <Modal trigger={t('Modifier')} title={t('Modifier le contact')} triggerClassName="btn btn-outline btn-sm">
              <ActionForm action={updateContactAction} className="space-y-4" successMessage={t('Modifications enregistrées.')}>
                <input type="hidden" name="id" value={id} />
                <ContactFields t={t} companies={companies} members={members} userId={ctx.userId} value={contact} />
                <Submit>{t('Enregistrer')}</Submit>
              </ActionForm>
            </Modal>
            {can.remove && <ActionButton action={deleteContactAction} fields={{ id, locale }} className="btn btn-danger btn-sm" confirm={t('Supprimer définitivement ce contact et son historique ?')}>{t('Supprimer')}</ActionButton>}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <Card title={t('Coordonnées')}>
            <DefList items={[
              [t('E-mail'), contact.email && <a href={`mailto:${contact.email}`} className="underline">{contact.email}</a>],
              [t('Téléphone'), contact.phone && <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="underline">{contact.phone}</a>],
              [t('Entreprise'), contact.company && <Link href={`/app/crm/companies/${contact.company.id}`} className="underline">{contact.company.name}</Link>],
              [t('Fonction'), contact.jobTitle],
              [t('Source'), contact.source],
              [t('Responsable'), contact.ownerName],
              [t('Créé le'), formatDate(contact.createdAt, locale)],
              [t('Notes'), contact.notes && <span className="whitespace-pre-wrap">{contact.notes}</span>],
            ]} />
          </Card>
          <Card title={t('Affaires')} actions={
            <Modal trigger={t('Nouvelle affaire')} title={t('Nouvelle affaire')} triggerClassName="btn btn-outline btn-sm">
              <ActionForm action={createDealAction} className="space-y-4" resetOnSuccess successMessage={t('Affaire créée.')}>
                <DealFields t={t} currency={currency} contacts={contacts} companies={companies} members={members} userId={ctx.userId} value={{ contactId: id, companyId: contact.companyId }} />
                <Submit>{t('Créer l’affaire')}</Submit>
              </ActionForm>
            </Modal>
          }>
            {contact.deals.length === 0 ? <p className="muted text-sm">{t('Aucune affaire liée à ce contact.')}</p> : (
              <ul className="divide-y divide-line">
                {contact.deals.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <Link href={`/app/crm/deals/${d.id}`} className="min-w-0 break-words text-sm font-medium underline-offset-2 hover:underline">{d.title}</Link>
                    <span className="flex items-center gap-2 text-sm"><span className="muted">{d.stage.name}</span><DealStatusBadge value={d.status} t={t} /><span className="font-semibold">{formatMoney(d.value, d.currency, locale)}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title={t('Tâches')} actions={<TaskModal t={t} members={members} userId={ctx.userId} link={{ contactId: id }} />}>
            <TaskList tasks={tasks} t={t} locale={locale} />
          </Card>
          <Attachments files={files} entityType="contact" entityId={id} t={t} locale={locale} />
        </div>
        <div className="space-y-6">
          <Card title={t('Ajouter une activité')}><ActivityForm t={t} link={{ contactId: id }} tz={tz} /></Card>
          <Card title={t('Historique')}><TimelineList items={timeline} t={t} locale={locale} tz={tz} /></Card>
        </div>
      </div>
    </>
  );
}
