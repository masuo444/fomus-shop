import { createClient } from '@/lib/supabase/server'
import { ADMIN_EMAILS } from '@/lib/constants'
import { getPlatformShopId, getShopForUser } from '@/lib/shop'

interface ShopAccessResult {
  user: { id: string; email: string }
  shopId: string
  role: 'admin' | 'partner'
}

/**
 * Check shop access for admin or partner users.
 * - Admins get access to the platform (FOMUS) shop by default, or any shop they specify.
 * - Partners get access only to their own shop.
 * @param requiredRole - If specified, only allow users with this role
 */
export async function checkShopAccess(requiredRole?: 'admin' | 'partner'): Promise<ShopAccessResult | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, shop_id')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const isAdmin = profile.role === 'admin' || ADMIN_EMAILS.includes(user.email ?? '')

  if (isAdmin) {
    if (requiredRole && requiredRole !== 'admin') return null
    // Admins operate on the platform shop, fallback to first published shop
    let shopId = await getPlatformShopId()
    if (!shopId) {
      const { getPublishedShopIds } = await import('@/lib/shop')
      const publishedIds = await getPublishedShopIds()
      shopId = publishedIds[0] ?? null
    }
    // Admin access even without a shop (shopId may be empty string)
    return { user: { id: user.id, email: user.email ?? '' }, shopId: shopId ?? '', role: 'admin' }
  }

  if (profile.role === 'partner' && profile.shop_id) {
    if (requiredRole && requiredRole !== 'partner') return null
    return { user: { id: user.id, email: user.email ?? '' }, shopId: profile.shop_id, role: 'partner' }
  }

  return null
}

/** Simple admin check (same as existing pattern but centralized) */
export async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin' || ADMIN_EMAILS.includes(user.email ?? '')
  return isAdmin ? user : null
}

/** Check if user is a partner and return their shop_id */
export async function checkPartner() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, shop_id')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'partner' && profile.shop_id) {
    return { user, shopId: profile.shop_id }
  }

  return null
}
