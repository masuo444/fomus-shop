import siteConfig from '@/site.config'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記',
}

const items = [
  { label: '販売業者', value: siteConfig.legal.companyName || siteConfig.name },
  { label: '運営責任者', value: siteConfig.legal.representative || '（運営責任者名）' },
  { label: '所在地', value: siteConfig.legal.address || '（所在地）' },
  { label: '電話番号', value: siteConfig.legal.phone || '（電話番号）' },
  { label: 'メールアドレス', value: siteConfig.legal.email || '（メールアドレス）' },
  { label: '販売価格', value: '各商品ページに記載' },
  { label: '商品代金以外の必要料金', value: '送料（国内1,000円〜）、振込手数料（銀行振込の場合）' },
  { label: '支払方法', value: 'クレジットカード（Visa, Mastercard, American Express）、銀行振込' },
  { label: '支払時期', value: 'クレジットカード：注文時 / 銀行振込：注文後3営業日以内' },
  { label: '商品の引渡時期', value: '入金確認後、7営業日以内に発送' },
  { label: '返品・交換', value: '商品到着後7日以内に限り、未使用品に限り返品・交換を承ります。お客様都合による返品の送料はお客様負担となります。' },
  { label: '不良品の取扱', value: '商品到着後7日以内にご連絡ください。送料当社負担にて交換いたします。' },
]

export default function CommercialTransactionsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">特定商取引法に基づく表記</h1>
      <table className="w-full text-sm border-collapse">
        <tbody>
          {items.map((item) => (
            <tr key={item.label} className="border-b border-gray-200">
              <th className="text-left text-gray-900 font-medium py-3 pr-4 align-top whitespace-nowrap w-1/3">
                {item.label}
              </th>
              <td className="text-gray-600 py-3 leading-relaxed">
                {item.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
