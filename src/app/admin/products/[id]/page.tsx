import { createClient } from '@/lib/supabase/server'
import { getPlatformShopId } from '@/lib/shop'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const shopId = await getPlatformShopId()
  if (!shopId) return <div className="text-gray-500">ショップが見つかりません</div>

  const [{ data: product }, { data: categories }, { data: shippingMethods }] =
    await Promise.all([
      supabase
        .from('products')
        .select(
          '*, category:categories(*), product_options(*, choices:product_option_choices(*)), product_shipping_methods(*)'
        )
        .eq('id', id)
        .eq('shop_id', shopId)
        .single(),
      supabase
        .from('categories')
        .select('*')
        .eq('shop_id', shopId)
        .order('sort_order'),
      supabase
        .from('shipping_methods')
        .select('*')
        .eq('shop_id', shopId)
        .order('sort_order'),
    ])

  if (!product) notFound()

  return (
    <div>
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        商品一覧に戻る
      </Link>
      <h1 className="text-xl font-bold text-gray-900 mb-6">商品を編集</h1>
      <ProductForm
        product={product}
        categories={categories ?? []}
        shippingMethods={shippingMethods ?? []}
        shopId={shopId}
      />
    </div>
  )
}
