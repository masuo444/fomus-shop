import { createAdminClient } from '@/lib/supabase/admin'
import siteConfig from '@/site.config'

const PLATFORM_SHOP_SLUG = siteConfig.defaultShopSlug

/** Get all published shop IDs */
export async function getPublishedShopIds(): Promise<string[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('shops')
    .select('id')
    .eq('is_published', true)
    .eq('status', 'active')

  return data?.map((s) => s.id) ?? []
}

/** Get the platform shop ID */
export async function getPlatformShopId(): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('shops')
    .select('id')
    .eq('slug', PLATFORM_SHOP_SLUG)
    .single()

  return data?.id ?? null
}

/** Get the platform shop */
export async function getPlatformShop(): Promise<{ id: string; slug: string } | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('shops')
    .select('id, slug')
    .eq('slug', PLATFORM_SHOP_SLUG)
    .single()

  return data
}

/** Get the shop a user belongs to (for partners) */
export async function getShopForUser(userId: string): Promise<string | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('shop_id')
    .eq('id', userId)
    .single()

  return data?.shop_id ?? null
}

/** Get shop by ID with full details */
export async function getShopById(shopId: string) {
  const admin = createAdminClient()
  const { data } = await admin
    .from('shops')
    .select('*')
    .eq('id', shopId)
    .single()

  return data
}
