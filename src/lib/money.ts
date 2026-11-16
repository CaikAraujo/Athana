export type PriceMap = Record<string, number>;

/** Price for a currency from an admin-managed price map; null when the product is not sold in that currency. */
export function priceFor(prices: unknown, currency: string): number | null {
  const v = (prices as PriceMap | null)?.[currency];
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null;
}

export function computeTax(netAfterDiscount: number, rateBps: number, pricesIncludeTax: boolean) {
  if (rateBps <= 0) return { tax: 0, total: netAfterDiscount };
  if (pricesIncludeTax) {
    const tax = Math.round(netAfterDiscount - netAfterDiscount / (1 + rateBps / 10000));
    return { tax, total: netAfterDiscount };
  }
  const tax = Math.round((netAfterDiscount * rateBps) / 10000);
  return { tax, total: netAfterDiscount + tax };
}

/** "1 490,50" / "1490.5" → minor units. */
export function parseAmount(input: string): number {
  const n = Number(String(input).replace(/[\s'’]/g, '').replace(',', '.'));
  if (!Number.isFinite(n) || n < 0) throw new Error('Montant invalide');
  return Math.round(n * 100);
}
