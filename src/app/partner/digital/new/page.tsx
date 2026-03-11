import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DigitalItemForm from '@/components/admin/DigitalItemForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function PartnerNewDigitalItemPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/partner')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, shop_id')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'partner' || !profile?.shop_id) redirect('/')

  return (
    <div>
      <Link
        href="/partner/digital"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        デジタルアイテム一覧に戻る
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">新規デジタルアイテム</h1>
      <DigitalItemForm
        shopId={profile.shop_id}
        apiBasePath="/api/partner"
        redirectBasePath="/partner"
      />
    </div>
  )
}
