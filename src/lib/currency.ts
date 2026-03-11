import { cookies } from 'next/headers'

export type Currency = 'jpy' | 'eur'

/**
 * Get currency from cookie (server components).
 */
export async function getCurrency(): Promise<Currency> {
  const cookieStore = await cookies()
  const val = cookieStore.get('currency')?.value
  return val === 'eur' ? 'eur' : 'jpy'
}

/**
 * Get the appropriate price for a product based on currency.
 * Returns null if product is not available in the requested currency.
 */
export function getProductPrice(
  product: { price: number; price_eur?: number | null },
  currency: Currency
): number | null {
  if (currency === 'eur') {
    return product.price_eur ?? null
  }
  return product.price
}

/**
 * Get the appropriate member price for a product based on currency.
 */
export function getProductMemberPrice(
  product: { member_price: number | null; member_price_eur?: number | null },
  currency: Currency
): number | null {
  if (currency === 'eur') {
    return product.member_price_eur ?? null
  }
  return product.member_price
}

/**
 * Get the appropriate compare-at price for a product based on currency.
 */
export function getProductComparePrice(
  product: { compare_at_price: number | null; compare_at_price_eur?: number | null },
  currency: Currency
): number | null {
  if (currency === 'eur') {
    return product.compare_at_price_eur ?? null
  }
  return product.compare_at_price
}
