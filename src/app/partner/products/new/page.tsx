import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function PartnerNewProductPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/partner')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, shop_id')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'partner' || !profile?.shop_id) redirect('/')

  const shopId = profile.shop_id

  const [{ data: categories }, { data: shippingMethods }] = await Promise.all([
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

  return (
    <div>
      <Link
        href="/partner/products"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        商品一覧に戻る
      </Link>
      <h1 className="text-xl font-bold text-gray-900 mb-6">商品を登録</h1>
      <ProductForm
        categories={categories ?? []}
        shippingMethods={shippingMethods ?? []}
        shopId={shopId}
        apiBasePath="/api/partner"
        redirectBasePath="/partner"
      />
    </div>
  )
}
