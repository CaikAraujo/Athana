import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatDateTime } from '@/i18n/translate';
import { requireUser } from '@/modules/auth/session';
import { Empty, PageHeader } from '@/components/ui';
import { MarkRead } from '../AccountForms';

export default async function NotificationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const user = await requireUser(locale);
  const t = await getT(locale);
  const items = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 80 });
  return (
    <>
      <PageHeader title={t('Notifications')} actions={items.some((n) => !n.readAt) ? <MarkRead /> : undefined} />
      {items.length === 0 ? <Empty title={t('Aucune notification.')} /> : (
        <ul className="panel divide-y divide-line">
          {items.map((n) => (
            <li key={n.id} className="flex items-start gap-3 p-4">
              <span aria-hidden className={`mt-2 h-2 w-2 shrink-0 rounded-full ${n.readAt ? 'bg-ink-500' : 'bg-gold-500'}`} />
              <div className="min-w-0 flex-1">
                {n.link ? <a className="font-medium no-underline hover:text-gold-300" href={localePath(locale, n.link)}>{n.title}</a> : <p className="font-medium">{n.title}</p>}
                {n.body && <p className="muted text-sm">{n.body}</p>}
                <p className="muted text-xs">{formatDateTime(n.createdAt, locale)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
