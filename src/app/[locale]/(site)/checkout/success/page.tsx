import { notFound } from 'next/navigation';
import { CheckCircle2, Clock } from 'lucide-react';
import { db } from '@/lib/db';
import { assertLocale, getT } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatMoney } from '@/i18n/translate';
import { requireUser } from '@/modules/auth/session';
import { TrackEvent } from '@/components/site/Consent';

export const metadata = { robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function SuccessPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ order?: string }> }) {
  const locale = assertLocale((await params).locale);
  const user = await requireUser(locale);
  const { order: orderId } = await searchParams;
  const order = orderId ? await db.order.findFirst({ where: { id: orderId, userId: user.id }, include: { items: { include: { project: true } } } }) : null;
  if (!order) notFound();
  const t = await getT(locale);
  const paid = order.status === 'PAID';
  const project = order.items[0]?.project;
  return (
    <div className="container-page grid min-h-[60vh] place-items-center py-16">
      <div className="card card-pad max-w-xl text-center">
        {paid ? (
          <>
            <TrackEvent event="purchase" onceKey={order.id} params={{ transaction_id: order.number, value: order.total / 100, currency: order.currency, tax: order.tax / 100, items: order.items.map((i) => ({ item_id: i.productId, item_name: i.name, item_variant: i.tier, price: i.total / 100 })) }} />
            <CheckCircle2 size={48} className="mx-auto text-ok" aria-hidden />
            <h1 className="mt-4 text-3xl font-semibold">{t('Merci, votre commande est confirmée !')}</h1>
            <p className="lead mt-3">{t('Commande {n} — {total}', { n: order.number, total: formatMoney(order.total, order.currency, locale) })}</p>
            <p className="muted mt-3">{t('Un e-mail de confirmation vient de vous être envoyé. Prochaine étape : le briefing, pour que nous puissions démarrer votre projet.')}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              {project && <a className="btn btn-primary btn-lg" href={localePath(locale, `/account/projects/${project.id}/briefing`)}>{t('Remplir le briefing')}</a>}
              <a className="btn btn-outline btn-lg" href={localePath(locale, `/account/orders/${order.id}`)}>{t('Voir ma commande')}</a>
            </div>
          </>
        ) : (
          <>
            <Clock size={48} className="mx-auto text-warn" aria-hidden />
            <h1 className="mt-4 text-3xl font-semibold">{t('Paiement en cours de confirmation')}</h1>
            <p className="muted mt-3">{t('Nous attendons la confirmation de votre paiement par notre prestataire. Cette page se met à jour dès qu’elle arrive ; vous recevrez aussi un e-mail.')}</p>
            <meta httpEquiv="refresh" content="6" />
            <a className="btn btn-outline mt-7" href={localePath(locale, `/account/orders/${order.id}`)}>{t('Voir ma commande')}</a>
          </>
        )}
      </div>
    </div>
  );
}
