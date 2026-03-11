import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ADMIN_EMAILS } from '@/lib/constants'
import siteConfig from '@/site.config'
import AdminSidebar from '@/components/admin/AdminSidebar'
import NotificationBell from '@/components/admin/NotificationBell'

export const metadata = {
  title: `${siteConfig.name} Admin`,
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirect=/admin')
  }

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin' || ADMIN_EMAILS.includes(user.email ?? '')

  if (!isAdmin) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-end px-6">
          <NotificationBell />
        </div>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
