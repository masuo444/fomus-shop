import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PartnerSidebar from '@/components/partner/PartnerSidebar'

export const metadata = {
  title: 'Partner Dashboard',
}

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/partner')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, shop_id')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'partner' || !profile?.shop_id) {
    redirect('/')
  }

  const { data: shop } = await supabase
    .from('shops')
    .select('name')
    .eq('id', profile.shop_id)
    .single()

  const shopName = shop?.name ?? 'Partner'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <PartnerSidebar />
      <main className="flex-1 overflow-auto">
        <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-end px-6">
          <span className="text-sm text-gray-500">{shopName}</span>
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
