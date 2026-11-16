import { z } from 'zod';
import type { Coupon, Market } from '@prisma/client';
import { db } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { computeTax, priceFor } from '@/lib/money';
import { m } from '@/i18n/translate';

export const cartSchema = z.object({
  items: z.array(z.object({
    productId: z.string().max(40),
    packageId: z.string().max(40),
    addonIds: z.array(z.string().max(40)).max(20).default([]),
  })).max(10).default([]),
  coupon: z.string().trim().max(40).optional(),
});
export type Cart = z.infer<typeof cartSchema>;
export const EMPTY_CART: Cart = { items: [] };

export type PricedLine = {
  productId: string; packageId: string; slug: string; name: string; tier: 'BASIC' | 'BUSINESS' | 'PREMIUM';
  packageName: unknown; coverImage: string | null; deliveryDays: number;
  unitAmount: number; addons: { id: string; slug: string; name: unknown; amount: number }[]; total: number;
};
export type PricedCart = {
  lines: PricedLine[]; currency: string; subtotal: number; discount: number; tax: number; total: number;
  taxRateBps: number; taxLabel: string; pricesIncludeTax: boolean;
  coupon: Coupon | null; couponError: string | null; removed: number;
};

/** Validates a coupon against the current subtotal. Returns the discount in minor units. */
export function couponDiscount(coupon: Coupon, subtotal: number, currency: string, now = new Date()): number {
  if (!coupon.active) throw new AppError(m('Ce code promo n’est plus actif.'));
  if (coupon.startsAt && coupon.startsAt > now) throw new AppError(m('Ce code promo n’est pas encore valable.'));
  if (coupon.endsAt && coupon.endsAt < now) throw new AppError(m('Ce code promo a expiré.'));
  if (coupon.maxRedemptions != null && coupon.redeemedCount >= coupon.maxRedemptions) throw new AppError(m('Ce code promo a atteint sa limite d’utilisation.'));
  if (coupon.minSubtotal != null && subtotal < coupon.minSubtotal) throw new AppError(m('Le montant minimum pour ce code promo n’est pas atteint.'));
  if (coupon.type === 'PERCENT') return Math.min(subtotal, Math.round((subtotal * coupon.value) / 100));
  if (coupon.currency !== currency) throw new AppError(m('Ce code promo n’est pas valable dans cette devise.'));
  return Math.min(subtotal, coupon.value);
}

/**
 * Prices a cart from the database only. Nothing sent by the browser (prices, names) is trusted;
 * unavailable items are dropped and counted in `removed`.
 */
export async function priceCart(cart: Cart, market: Market): Promise<PricedCart> {
  const currency = market.currency;
  const lines: PricedLine[] = [];
  let removed = 0;
  for (const item of cart.items) {
    const pkg = await db.package.findFirst({
      where: { id: item.packageId, productId: item.productId, active: true, product: { status: 'PUBLISHED', deletedAt: null } },
      include: { product: { include: { addons: { where: { active: true } } } } },
    });
    const unit = pkg ? priceFor(pkg.prices, currency) : null;
    if (!pkg || unit === null) { removed++; continue; }
    const globalAddons = await db.addon.findMany({ where: { active: true, global: true } });
    const available = new Map([...globalAddons, ...pkg.product.addons].map((a) => [a.id, a]));
    const addons = [...new Set(item.addonIds)].flatMap((id) => {
      const a = available.get(id);
      const amount = a ? priceFor(a.prices, currency) : null;
      return a && amount !== null ? [{ id: a.id, slug: a.slug, name: a.name, amount }] : [];
    });
    lines.push({
      productId: pkg.productId, packageId: pkg.id, slug: pkg.product.slug, name: pkg.product.name, tier: pkg.tier,
      packageName: pkg.name, coverImage: pkg.product.coverImage, deliveryDays: pkg.deliveryDays,
      unitAmount: unit, addons, total: unit + addons.reduce((s, a) => s + a.amount, 0),
    });
  }
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  let coupon: Coupon | null = null;
  let couponError: string | null = null;
  let discount = 0;
  if (cart.coupon && lines.length) {
    const found = await db.coupon.findUnique({ where: { code: cart.coupon.toUpperCase() } });
    if (!found) couponError = m('Code promo inconnu.');
    else {
      try { discount = couponDiscount(found, subtotal, currency); coupon = found; }
      catch (e) { couponError = e instanceof AppError ? e.message : m('Code promo invalide.'); }
    }
  }
  const { tax, total } = computeTax(subtotal - discount, market.taxRateBps, market.pricesIncludeTax);
  return { lines, currency, subtotal, discount, tax, total, taxRateBps: market.taxRateBps, taxLabel: market.taxLabel, pricesIncludeTax: market.pricesIncludeTax, coupon, couponError, removed };
}
