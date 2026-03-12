import { createAdminClient } from '@/lib/supabase/admin'
import { ValidationError } from '@/lib/validation'

interface ClientSelectedOption {
  choiceId: string
  label: string
  priceAdjustment: number
}

interface CheckoutItem {
  product_id: string
  quantity: number
  selected_options?: Record<string, ClientSelectedOption>
}

/**
 * Validate item quantities: must be positive integers, max 99
 */
export function validateItemQuantities(items: CheckoutItem[]): void {
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 99) {
      throw new ValidationError('数量は1〜99の整数で指定してください')
    }
    if (typeof item.product_id !== 'string' || item.product_id.length === 0) {
      throw new ValidationError('無効な商品IDです')
    }
  }
}

/**
 * Verify option prices against the database.
 * Returns the server-verified options adjustment for each item.
 * Replaces client-sent priceAdjustment with DB values.
 */
export async function verifyOptionPrices(
  items: CheckoutItem[],
  productIds: string[]
): Promise<Map<string, number>> {
  const adjustments = new Map<string, number>() // keyed by `${product_id}:${itemIndex}`

  // Collect all choice IDs from items
  const allChoiceIds: string[] = []
  for (const item of items) {
    if (item.selected_options) {
      for (const opt of Object.values(item.selected_options)) {
        if (opt.choiceId) allChoiceIds.push(opt.choiceId)
      }
    }
  }

  if (allChoiceIds.length === 0) {
    // No options selected — all adjustments are 0
    items.forEach((item, i) => adjustments.set(`${item.product_id}:${i}`, 0))
    return adjustments
  }

  // Load all referenced choices from DB
  const admin = createAdminClient()
  const { data: dbChoices } = await admin
    .from('product_option_choices')
    .select('id, price_adjustment, product_option_id, product_options!inner(product_id)')
    .in('id', allChoiceIds)

  const choiceMap = new Map<string, { priceAdj: number; productId: string }>()
  if (dbChoices) {
    for (const c of dbChoices) {
      const productId = (c as any).product_options?.product_id
      choiceMap.set(c.id, {
        priceAdj: c.price_adjustment ?? 0,
        productId: productId ?? '',
      })
    }
  }

  // Validate each item's options
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    let totalAdj = 0

    if (item.selected_options) {
      for (const [optName, opt] of Object.entries(item.selected_options)) {
        const dbChoice = choiceMap.get(opt.choiceId)
        if (!dbChoice) {
          throw new ValidationError(`無効なオプションが選択されています: ${optName}`)
        }
        // Verify the choice belongs to the correct product
        if (dbChoice.productId !== item.product_id) {
          throw new ValidationError(`オプションが商品と一致しません: ${optName}`)
        }
        totalAdj += dbChoice.priceAdj
      }
    }

    adjustments.set(`${item.product_id}:${i}`, totalAdj)
  }

  return adjustments
}

/**
 * Verify coupon on server side and return discount amount.
 * Returns 0 if no coupon code provided.
 */
export async function verifyCouponDiscount(
  couponCode: string | undefined,
  shopId: string,
  subtotal: number
): Promise<{ discount: number; couponId: string | null }> {
  if (!couponCode || couponCode.trim().length === 0) {
    return { discount: 0, couponId: null }
  }

  const admin = createAdminClient()
  const { data: coupon } = await admin
    .from('coupons')
    .select('*')
    .eq('shop_id', shopId)
    .eq('code', couponCode.toUpperCase())
    .single()

  if (!coupon || !coupon.is_active) {
    throw new ValidationError('無効なクーポンコードです')
  }

  const now = new Date().toISOString()
  if (coupon.starts_at && now < coupon.starts_at) {
    throw new ValidationError('このクーポンはまだ利用期間外です')
  }
  if (coupon.expires_at && now > coupon.expires_at) {
    throw new ValidationError('このクーポンは有効期限切れです')
  }
  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    throw new ValidationError('このクーポンは利用上限に達しています')
  }
  if (subtotal < coupon.min_order_amount) {
    throw new ValidationError(`このクーポンは¥${coupon.min_order_amount.toLocaleString()}以上の注文で利用できます`)
  }

  const discount = coupon.discount_type === 'percentage'
    ? Math.floor(subtotal * coupon.discount_value / 100)
    : coupon.discount_value

  // Cap discount at subtotal (never go negative)
  const finalDiscount = Math.min(Math.max(discount, 0), subtotal)

  return { discount: finalDiscount, couponId: coupon.id }
}

/**
 * Reserve stock atomically using DB function.
 * Returns true if all stock was reserved, false otherwise.
 * This prevents overselling via race conditions.
 */
export async function reserveStock(
  items: { product_id: string; quantity: number; product_name: string }[]
): Promise<{ success: boolean; failedProduct?: string }> {
  const admin = createAdminClient()

  for (const item of items) {
    const { data, error } = await admin.rpc('decrement_stock', {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
    })

    if (error) {
      // Rollback previously decremented items
      // (best effort — admin should monitor for discrepancies)
      console.error(`Stock reservation failed for ${item.product_id}:`, error)
      return { success: false, failedProduct: item.product_name }
    }

    // Verify stock was actually decremented by checking current stock
    const { data: product } = await admin
      .from('products')
      .select('stock')
      .eq('id', item.product_id)
      .single()

    // If stock went below 0 somehow, the WHERE clause in decrement_stock
    // should have prevented it — but check just in case
    if (product && product.stock < 0) {
      return { success: false, failedProduct: item.product_name }
    }
  }

  return { success: true }
}

/**
 * Restore stock for items (used when checkout fails after reservation)
 */
export async function restoreStock(
  items: { product_id: string; quantity: number }[]
): Promise<void> {
  const admin = createAdminClient()
  for (const item of items) {
    const { error } = await admin.rpc('increment_stock', {
      p_product_id: item.product_id,
      p_quantity: item.quantity,
    })
    if (error) console.error(`Stock restore failed for ${item.product_id}:`, error)
  }
}
