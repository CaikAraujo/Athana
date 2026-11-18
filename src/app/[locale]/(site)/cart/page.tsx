import Image from 'next/image';
import { assertLocale, getT, L } from '@/i18n/server';
import { localePath } from '@/i18n/config';
import { formatMoney } from '@/i18n/translate';
import { getMarket } from '@/lib/settings';
import { priceCart } from '@/modules/orders/cart';
import { readCart } from '@/modules/orders/cart-cookie';
import { Empty } from '@/components/ui';
import { Totals } from '@/components/site/OrderSummary';
import { CouponForm, RemoveItem } from './CartForms';

export const metadata = { robots: { index: false } };

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const t = await getT(locale);
  const [cart, market] = await Promise.all([readCart(), getMarket(locale)]);
  const priced = market ? await priceCart(cart, market) : null;
  return (
    <div className="container-page py-12">
      <h1 className="mb-8 text-3xl font-normal md:text-4xl">{t('Votre panier')}</h1>
      {!priced || priced.lines.length === 0 ? (
        <Empty title={t('Votre panier est vide.')}><a className="btn btn-primary" href={localePath(locale, '/templates')}>{t('Découvrir les modèles')}</a></Empty>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
          <ul className="space-y-4">
            {priced.removed > 0 && <li className="alert alert-warn">{t('Certains articles ne sont plus disponibles et ont été ignorés.')}</li>}
            {priced.lines.map((l) => (
              <li key={l.productId} className="panel flex flex-col gap-4 p-4 sm:flex-row">
                <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg bg-ink-800 sm:w-44">
                  {l.coverImage && <Image src={l.coverImage} alt="" fill sizes="180px" className="object-cover object-top" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-medium"><a className="no-underline hover:text-accent-700" href={localePath(locale, `/templates/${l.slug}`)}>{l.name}</a></h2>
                      <p className="muted text-sm">{t('Pack')} {L(l.packageName, locale)} · {t('env. {n} jours ouvrés', { n: l.deliveryDays })}</p>
                    </div>
                    <p className="font-display text-lg font-medium">{formatMoney(l.total, priced.currency, locale)}</p>
                  </div>
                  {l.addons.length > 0 && <ul className="muted mt-2 text-sm">{l.addons.map((a) => <li key={a.id}>+ {L(a.name, locale)} ({formatMoney(a.amount, priced.currency, locale)})</li>)}</ul>}
                  <div className="mt-3 flex gap-2">
                    <a className="btn btn-ghost btn-sm" href={localePath(locale, `/templates/${l.slug}`) + '#configurer'}>{t('Modifier')}</a>
                    <RemoveItem productId={l.productId} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="panel space-y-5 p-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-medium">{t('Récapitulatif')}</h2>
            <CouponForm current={priced.coupon?.code} />
            {priced.couponError && <p className="field-error">{t(priced.couponError)}</p>}
            <Totals cart={{ ...priced, couponCode: priced.coupon?.code }} locale={locale} t={t} />
            <a className="btn btn-primary btn-lg btn-block" href={localePath(locale, '/checkout')}>{t('Passer la commande')}</a>
            <p className="muted text-center text-xs">{t('Paiement sécurisé. Aucune donnée de carte n’est stockée par ATHANA.')}</p>
          </aside>
        </div>
      )}
    </div>
  );
}
