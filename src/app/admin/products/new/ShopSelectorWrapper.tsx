'use client'

import { useRouter } from 'next/navigation'

interface Shop {
  id: string
  name: string
  slug: string
}

export default function ShopSelectorWrapper({
  shops,
  currentSlug,
}: {
  shops: Shop[]
  currentSlug: string
}) {
  const router = useRouter()

  if (shops.length <= 1) return null

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">登録先ショップ:</span>
      <select
        value={currentSlug}
        onChange={(e) => router.push(`/admin/products/new?shop=${e.target.value}`)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
      >
        {shops.map((s) => (
          <option key={s.id} value={s.slug}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  )
}
