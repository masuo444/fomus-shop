import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <p className="text-6xl font-bold text-gray-200 mb-4">404</p>
      <h1 className="text-xl font-bold text-gray-900 mb-2">ページが見つかりません</h1>
      <p className="text-sm text-gray-500 mb-8">お探しのページは存在しないか、移動した可能性があります。</p>
      <div className="space-y-3">
        <Link
          href="/shop"
          className="block w-full bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          ショップへ戻る
        </Link>
        <Link
          href="/"
          className="block text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          トップページへ
        </Link>
      </div>
    </div>
  )
}
