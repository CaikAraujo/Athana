import 'server-only';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';
import { cartSchema, EMPTY_CART, type Cart } from './cart';

const COOKIE = 'athana_cart';

/** The cart only stores ids; prices are always recomputed on the server. */
export async function readCart(): Promise<Cart> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return EMPTY_CART;
  try {
    return cartSchema.parse(JSON.parse(raw));
  } catch {
    return EMPTY_CART;
  }
}

export async function writeCart(cart: Cart) {
  const jar = await cookies();
  if (!cart.items.length) jar.delete(COOKIE);
  else jar.set(COOKIE, JSON.stringify(cart), { httpOnly: true, secure: env.isProd, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
}
