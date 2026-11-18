import { redirect } from 'next/navigation';
import { assertLocale, getT } from '@/i18n/server';
import { LOCALE_META, localePath } from '@/i18n/config';
import { env } from '@/lib/env';
import { getMarket } from '@/lib/settings';
import { countryOptions } from '@/lib/countries';
import { requireUser } from '@/modules/auth/session';
import { priceCart } from '@/modules/orders/cart';
import { readCart } from '@/modules/orders/cart-cookie';
import { CartLines, Totals } from '@/components/site/OrderSummary';
import { CheckoutForm } from './CheckoutForm';

export const metadata = { robots: { index: false } };

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = assertLocale((await params).locale);
  const user = await requireUser(locale, '/checkout');
  const t = await getT(locale);
  const [cart, market] = await Promise.all([readCart(), getMarket(locale)]);
  if (!market || !cart.items.length) redirect(localePath(locale, '/cart'));
  const priced = await priceCart(cart, market);
  if (!priced.lines.length) redirect(localePath(locale, '/cart'));
  const methods = (market.paymentMethods as string[]) ?? [];
  return (
    <div className="container-page py-12">
      <h1 className="mb-2 text-3xl font-semibold md:text-4xl">{t('Finaliser la commande')}</h1>
      <p className="muted mb-8">{t('Connecté en tant que {email}', { email: user.email })}</p>
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <section className="panel p-5 md:p-7">
          <h2 className="mb-5 text-lg font-semibold">{t('Coordonnées de facturation')}</h2>
          <CheckoutForm defaults={{ fullName: user.name, email: user.email, phone: user.phone ?? '', country: market.country }} countries={countryOptions(LOCALE_META[locale].intl)} value={priced.total} currency={priced.currency} sandbox={env.paymentsMode === 'test'} />
        </section>
        <aside className="panel space-y-4 p-5 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold">{t('Votre commande')}</h2>
          <CartLines cart={priced} locale={locale} t={t} />
          <Totals cart={{ ...priced, couponCode: priced.coupon?.code }} locale={locale} t={t} />
          {methods.length > 0 && <p className="muted text-xs">{t('Moyens de paiement')} : {methods.join(', ')}</p>}
          <p className="muted text-xs">{t('Le paiement s’effectue sur la page sécurisée de notre prestataire de paiement. Aucune donnée de carte n’est stockée par ATHANA.')}</p>
          <a className="text-sm underline hover:text-accent-700" href={localePath(locale, '/cart')}>{t('Modifier le panier')}</a>
        </aside>
      </div>
    </div>
  );
}
