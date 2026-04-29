import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ADMIN_EMAILS } from '@/lib/constants'
import { getPlatformShopId } from '@/lib/shop'

interface ShopAccessResult {
  user: { id: string; email: string }
  shopId: string
  role: 'admin' | 'partner'
}

export async function checkShopAccess(requiredRole?: 'admin' | 'partner'): Promise<ShopAccessResult | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role, shop_id')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const isAdmin = profile.role === 'admin' || ADMIN_EMAILS.includes(user.email ?? '')

  if (isAdmin) {
    if (requiredRole && requiredRole !== 'admin') return null
    let shopId = await getPlatformShopId()
    if (!shopId) {
      const { getPublishedShopIds } = await import('@/lib/shop')
      const publishedIds = await getPublishedShopIds()
      shopId = publishedIds[0] ?? null
    }
    return { user: { id: user.id, email: user.email ?? '' }, shopId: shopId ?? '', role: 'admin' }
  }

  if (profile.role === 'partner' && profile.shop_id) {
    if (requiredRole && requiredRole !== 'partner') return null
    return { user: { id: user.id, email: user.email ?? '' }, shopId: profile.shop_id, role: 'partner' }
  }

  return null
}

export async function checkAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin' || ADMIN_EMAILS.includes(user.email ?? '')
  return isAdmin ? user : null
}

export async function checkPartner() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('role, shop_id')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'partner' && profile.shop_id) {
    return { user, shopId: profile.shop_id }
  }

  return null
}
