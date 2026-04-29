import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getPlatformShopId } from '@/lib/shop'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ShopSelectorWrapper from './ShopSelectorWrapper'

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ shop?: string }>
}) {
  const { shop: shopSlug } = await searchParams

  const admin = createAdminClient()
  const supabase = await createClient()

  // Load all active shops for the selector
  const { data: shops } = await admin
    .from('shops')
    .select('id, name, slug')
    .eq('status', 'active')
    .order('name')

  // Determine selected shop
  let shopId: string | null = null
  if (shopSlug && shops) {
    shopId = shops.find((s) => s.slug === shopSlug)?.id ?? null
  }
  if (!shopId) shopId = await getPlatformShopId()
  if (!shopId) return <div className="text-gray-500">ショップが見つかりません</div>

  const [{ data: categories }, { data: shippingMethods }] = await Promise.all([
    supabase.from('categories').select('*').eq('shop_id', shopId).order('sort_order'),
    supabase.from('shipping_methods').select('*').eq('shop_id', shopId).order('sort_order'),
  ])

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        商品一覧に戻る
      </Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">商品を登録</h1>
        <ShopSelectorWrapper shops={shops ?? []} currentSlug={shopSlug ?? 'fomus'} />
      </div>
      <ProductForm
        categories={categories ?? []}
        shippingMethods={shippingMethods ?? []}
        shopId={shopId}
      />
    </div>
  )
}
