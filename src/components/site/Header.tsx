import { adminHost } from '@/lib/admin-host';
import { getUser } from '@/modules/auth/session';
import { readCart } from '@/modules/orders/cart-cookie';
import { HeaderClient } from './HeaderClient';

export async function Header() {
  const [user, cart] = await Promise.all([getUser(), readCart()]);
  return <HeaderClient cartCount={cart.items.length} signedIn={!!user} isStaff={!!user?.platformRole && !adminHost()} />;
}
