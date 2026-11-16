'use client';

import { ActionButton, ActionForm, Submit } from '@/components/ui/form';
import { useLocale, useT } from '@/i18n/client';
import { applyCouponAction, removeFromCartAction } from '@/modules/orders/actions';

export function RemoveItem({ productId }: { productId: string }) {
  const t = useT();
  return <ActionButton action={removeFromCartAction} fields={{ productId }} className="btn btn-ghost btn-sm">{t('Retirer')}</ActionButton>;
}

export function CouponForm({ current }: { current?: string }) {
  const t = useT();
  const locale = useLocale();
  return (
    <ActionForm action={applyCouponAction} successMessage={current ? undefined : t('Code promo mis à jour.')}>
      <input type="hidden" name="locale" value={locale} />
      <label className="label" htmlFor="coupon">{t('Code promo')}</label>
      <div className="flex gap-2">
        <input id="coupon" name="coupon" defaultValue={current} className="input uppercase" autoComplete="off" />
        <Submit className="btn btn-outline">{t('Appliquer')}</Submit>
      </div>
    </ActionForm>
  );
}
