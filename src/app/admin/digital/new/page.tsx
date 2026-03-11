import { getPlatformShopId } from '@/lib/shop'
import DigitalItemForm from '@/components/admin/DigitalItemForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewDigitalItemPage() {
  const shopId = await getPlatformShopId()
  if (!shopId) return <div className="text-gray-500">ショップが見つかりません</div>

  return (
    <div>
      <Link
        href="/admin/digital"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        デジタルアイテム一覧に戻る
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">新規デジタルアイテム</h1>
      <DigitalItemForm shopId={shopId} />
    </div>
  )
}
