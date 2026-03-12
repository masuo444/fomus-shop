'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Building2, Copy, Check } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { clearLocalCart } from '@/lib/cart'
import siteConfig from '@/site.config'

export default function BankTransferPage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto px-4 py-16 text-center text-gray-400">読み込み中...</div>}>
      <BankTransferContent />
    </Suspense>
  )
}

function BankTransferContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order_number')
  const total = Number(searchParams.get('total') || 0)
  const [copied, setCopied] = useState<string | null>(null)

  const bankInfo = siteConfig.bankTransfer

  useEffect(() => {
    clearLocalCart()
    window.dispatchEvent(new Event('cart-updated'))
  }, [])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <Building2 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">銀行振込でのお支払い</h1>
        <p className="text-sm text-gray-500">以下の口座にお振込みをお願いいたします</p>
      </div>

      {/* Order info */}
      <div className="bg-gray-50 rounded-xl p-5 mb-6">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-500">注文番号</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-bold">{orderNumber}</span>
            <button onClick={() => copyToClipboard(orderNumber || '', 'order')} className="text-gray-400 hover:text-gray-600">
              {copied === 'order' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">お振込金額</span>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{formatPrice(total)}</span>
            <button onClick={() => copyToClipboard(String(total), 'amount')} className="text-gray-400 hover:text-gray-600">
              {copied === 'amount' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bank details */}
      <div className="border border-gray-200 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">振込先口座</h2>
        {[
          { label: '銀行名', value: bankInfo.bankName },
          { label: '支店名', value: bankInfo.branchName },
          { label: '口座種別', value: bankInfo.accountType },
          { label: '口座番号', value: bankInfo.accountNumber },
          { label: '口座名義', value: bankInfo.accountHolder },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{value}</span>
              <button onClick={() => copyToClipboard(value, label)} className="text-gray-400 hover:text-gray-600">
                {copied === label ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div className="mt-6 space-y-2">
        <p className="text-xs text-gray-400">※ 振込手数料はお客様のご負担となります</p>
        <p className="text-xs text-gray-400">※ 振込名義人の欄に注文番号を記載してください</p>
        <p className="text-xs text-gray-400">※ 3営業日以内にお振込みをお願いいたします</p>
        <p className="text-xs text-gray-400">※ 入金確認後、商品の発送手続きを開始いたします</p>
      </div>

      <div className="mt-8 space-y-3">
        <Link
          href="/shop"
          className="block w-full bg-black text-white py-3 rounded-full text-sm font-medium text-center hover:bg-gray-800 transition-colors"
        >
          ショッピングを続ける
        </Link>
      </div>
    </div>
  )
}
