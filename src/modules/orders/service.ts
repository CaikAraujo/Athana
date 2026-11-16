import { z } from 'zod';
import type { Market, Prisma, User } from '@prisma/client';
import { db } from '@/lib/db';
import { AppError } from '@/lib/errors';
import { m, pick } from '@/i18n/translate';
import { LOCALE_META, isLocale } from '@/i18n/config';
import { priceCart, type Cart } from './cart';

export const billingSchema = z.object({
  fullName: z.string().trim().min(2, m('Nom requis.')).max(120),
  company: z.string().trim().max(160).optional().default(''),
  vatNumber: z.string().trim().max(40).optional().default(''),
  email: z.string().trim().toLowerCase().email(m('Adresse e-mail invalide.')).max(254),
  phone: z.string().trim().max(40).optional().default(''),
  address: z.string().trim().min(3, m('Adresse requise.')).max(200),
  postalCode: z.string().trim().min(2, m('Code postal requis.')).max(20),
  city: z.string().trim().min(1, m('Ville requise.')).max(100),
  country: z.string().trim().length(2, m('Pays requis.')).toUpperCase(),
});
export type Billing = z.infer<typeof billingSchema>;

export async function nextRef(seq: 'order_number_seq' | 'invoice_number_seq' | 'project_ref_seq', prefix: string, tx: Prisma.TransactionClient | typeof db = db) {
  const rows = await tx.$queryRawUnsafe<{ nextval: bigint }[]>(`SELECT nextval('${seq}')`);
  return `${prefix}-${new Date().getUTCFullYear()}-${String(rows[0].nextval).padStart(5, '0')}`;
}

/**
 * Creates a PENDING_PAYMENT order (plus one project per purchased item) from a server-priced cart.
 * No payment is assumed here: fulfilment only starts when a verified provider event arrives.
 */
export async function createOrder(user: Pick<User, 'id'>, cart: Cart, billingInput: unknown, market: Market) {
  const billing = billingSchema.parse(billingInput);
  const priced = await priceCart(cart, market);
  if (!priced.lines.length) throw new AppError(m('Votre panier est vide.'));
  if (priced.removed > 0) throw new AppError(m('Certains articles ne sont plus disponibles. Vérifiez votre panier.'));
  if (cart.coupon && priced.couponError) throw new AppError(priced.couponError);
  const language = isLocale(market.code) ? LOCALE_META[market.code].language : 'fr';

  return db.$transaction(async (tx) => {
    const number = await nextRef('order_number_seq', 'ATH', tx);
    const order = await tx.order.create({
      data: {
        number, userId: user.id, currency: priced.currency, subtotal: priced.subtotal, discount: priced.discount,
        tax: priced.tax, total: priced.total, taxRateBps: priced.taxRateBps, taxLabel: priced.taxLabel,
        pricesIncludeTax: priced.pricesIncludeTax, couponId: priced.coupon?.id, billing, market: market.code,
      },
    });
    for (const line of priced.lines) {
      const item = await tx.orderItem.create({
        data: {
          orderId: order.id, productId: line.productId, packageId: line.packageId, name: line.name, tier: line.tier,
          unitAmount: line.unitAmount, total: line.total,
          addons: line.addons.map((a) => ({ slug: a.slug, name: pick(a.name, language), amount: a.amount })),
        },
      });
      await tx.project.create({
        data: {
          reference: await nextRef('project_ref_seq', 'PRJ', tx), orderItemId: item.id, userId: user.id,
          name: `${line.name} — ${billing.company || billing.fullName}`, status: 'PAYMENT_PENDING',
        },
      });
    }
    return tx.order.findUniqueOrThrow({ where: { id: order.id }, include: { items: true } });
  });
}

export async function cancelOrder(orderId: string, actor: { id: string; staff: boolean }, reason?: string) {
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || (!actor.staff && order.userId !== actor.id)) throw new AppError(m('Commande introuvable.'), 'not_found');
  if (order.status !== 'PENDING_PAYMENT' && order.status !== 'PAYMENT_FAILED') {
    throw new AppError(m('Seule une commande non payée peut être annulée. Pour une commande payée, demandez un remboursement.'));
  }
  return db.order.update({ where: { id: orderId }, data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: reason?.slice(0, 500) } });
}
