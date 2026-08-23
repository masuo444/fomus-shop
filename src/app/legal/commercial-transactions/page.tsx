import siteConfig from '@/site.config'
import legalTerms from '@/lib/legal-terms'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '特定商取引法に基づく表記',
  description: `${siteConfig.name}の特定商取引法に基づく表記。販売業者情報・支払方法・返品交換ポリシー。`,
  alternates: { canonical: '/legal/commercial-transactions' },
}

const isKachiu = siteConfig.defaultShopSlug === 'kachiu'

const commonItems = [
  { label: '販売業者', value: siteConfig.legal.companyName || siteConfig.name },
  { label: '運営責任者', value: siteConfig.legal.representative || '（運営責任者名）' },
  { label: '所在地', value: siteConfig.legal.address || '（所在地）' },
  { label: '電話番号', value: siteConfig.legal.phone || '（電話番号）' },
  { label: 'メールアドレス', value: siteConfig.legal.email || '（メールアドレス）' },
]

// KACHIU は食品のため返品条件が他ブランドと異なる。公式サイト(kachiu.jp/legal/)と
// 同一文言にしてあるので、片方だけ直さないこと。
const kachiuItems = [
  { label: '販売価格', value: '各商品ページに記載の価格（税込）' },
  { label: '商品代金以外の必要料金', value: '送料 全国一律1,000円（税込10,000円以上のご注文で無料／北海道・沖縄・離島は別途）' },
  { label: '支払方法・支払時期', value: legalTerms.paymentTiming },
  { label: '商品の引渡時期', value: legalTerms.deliveryTiming },
  { label: '返品・交換（返品特約）', value: legalTerms.cancellationFull },
  { label: '注文のキャンセル・変更', value: 'ご注文完了後のキャンセル、および数量・お届け先などの内容変更はお受けできません。' },
  { label: 'お受け取りについて', value: '長期のご不在、住所の不備、受け取りの辞退により商品が返送された場合、再発送に必要な送料および手数料はお客様のご負担となります。' },
]

const defaultItems = [
  { label: '販売価格', value: '各商品ページに記載' },
  { label: '商品代金以外の必要料金', value: '送料（国内1,000円〜）' },
  { label: '支払方法', value: 'クレジットカード（Visa, Mastercard, American Express, JCB）、JPYC' },
  { label: '支払時期', value: legalTerms.paymentTiming },
  { label: '商品の引渡時期', value: legalTerms.deliveryTiming },
  { label: '返品・交換', value: legalTerms.cancellationFull },
  { label: '不良品の取扱', value: '商品到着後7日以内にご連絡ください。送料当社負担にて交換いたします。' },
]

const items = [...commonItems, ...(isKachiu ? kachiuItems : defaultItems)]

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
              <td className="text-gray-600 py-3 leading-relaxed whitespace-pre-line">
                {item.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
