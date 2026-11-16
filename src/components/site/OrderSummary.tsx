import type { Locale } from '@/i18n/config';
import { formatMoney, pick, type TFn } from '@/i18n/translate';
import { LOCALE_META } from '@/i18n/config';
import type { PricedCart } from '@/modules/orders/cart';

export function Totals({ cart, locale, t }: { cart: Pick<PricedCart, 'subtotal' | 'discount' | 'tax' | 'total' | 'currency' | 'taxRateBps' | 'taxLabel' | 'pricesIncludeTax'> & { couponCode?: string | null }; locale: Locale; t: TFn }) {
  const f = (n: number) => formatMoney(n, cart.currency, locale);
  return (
    <dl className="space-y-2 text-sm">
      <div className="flex justify-between"><dt className="muted">{t('Sous-total')}</dt><dd>{f(cart.subtotal)}</dd></div>
      {cart.discount > 0 && <div className="flex justify-between text-ok"><dt>{t('Remise')}{cart.couponCode ? ` (${cart.couponCode})` : ''}</dt><dd>− {f(cart.discount)}</dd></div>}
      {cart.taxRateBps > 0 && <div className="flex justify-between"><dt className="muted">{cart.taxLabel} {(cart.taxRateBps / 100).toLocaleString(LOCALE_META[locale].intl)} %{cart.pricesIncludeTax ? ` (${t('incluse')})` : ''}</dt><dd>{f(cart.tax)}</dd></div>}
      <div className="flex justify-between border-t border-line pt-3 text-base font-semibold"><dt>{t('Total')}</dt><dd className="font-display text-xl">{f(cart.total)}</dd></div>
    </dl>
  );
}

export function CartLines({ cart, locale, t }: { cart: PricedCart; locale: Locale; t: TFn }) {
  const language = LOCALE_META[locale].language;
  return (
    <ul className="divide-y divide-line">
      {cart.lines.map((l) => (
        <li key={l.productId} className="py-3 text-sm">
          <div className="flex justify-between gap-3"><span className="font-medium">{l.name} <span className="muted">· {pick(l.packageName, language)}</span></span><span>{formatMoney(l.unitAmount, cart.currency, locale)}</span></div>
          {l.addons.map((a) => <div key={a.id} className="muted flex justify-between gap-3"><span>+ {pick(a.name, language)}</span><span>{formatMoney(a.amount, cart.currency, locale)}</span></div>)}
        </li>
      ))}
    </ul>
  );
}
