import siteConfig from '@/site.config'

/**
 * 取引条件の単一の情報源。
 *
 * 特商法12条の6により、注文の最終確認画面（/checkout）には
 *   1. 分量  2. 販売価格  3. 支払の時期・方法  4. 引渡時期
 *   5. 申込みの撤回・解除に関すること  6. 申込期間の定めがあるときはその旨
 * の表示が必要。1・2はカート明細が満たすので、ここでは 3〜6 を持つ。
 *
 * 同じ条件が特商法ページ・利用規約・FAQ・確認画面に散らばると必ず食い違うため、
 * 文言はすべてここから引くこと。ここを直せば全部に反映される。
 */

const isKachiu = siteConfig.defaultShopSlug === 'kachiu'

export type LegalTerms = {
  /** 支払の時期・方法 */
  paymentTiming: string
  /** 引渡時期 */
  deliveryTiming: string
  /** 申込みの撤回・解除に関すること（返品特約）— 確認画面用の要約 */
  cancellationSummary: string
  /** 返品特約の全文（特商法ページ・利用規約用） */
  cancellationFull: string
  /** 申込期間の定めがある場合のみ文字列を入れる。無ければ null */
  applicationPeriod: string | null
}

const kachiu: LegalTerms = {
  paymentTiming: 'クレジットカード決済（Visa／Mastercard／American Express／JCB）。ご注文時に決済されます。',
  deliveryTiming:
    '商品の完成後、ご注文順に順次発送いたします。第一弾は遅くとも2026年12月31日までに発送いたします。',
  cancellationSummary:
    '食品につき、お客様のご都合による返品・交換・ご注文後のキャンセルはお受けできません。破損・品質不良・誤配送があった場合に限り、商品到着後7日以内にご連絡ください。',
  cancellationFull:
    '食品につき、お客様のご都合による返品・交換はお受けできません。未開封・開封を問わず、また「イメージと違う」「好みに合わない」といった理由を含め、お受けできかねます。\n\n' +
    'お届けした商品に破損・品質不良・誤配送があった場合に限り、商品到着後7日以内に ' +
    (siteConfig.legal.email || 'contact@kachiu.jp') +
    ' までご連絡ください。同一商品との交換、または返金にて対応いたします。この場合の送料は当方が負担いたします。状況確認のため、お写真の送付をお願いする場合がございます。\n\n' +
    '商品到着後7日を経過したお申し出については、対応いたしかねます。',
  applicationPeriod: null,
}

const standard: LegalTerms = {
  paymentTiming: 'クレジットカード：注文時',
  deliveryTiming: '入金確認後、7営業日以内に発送',
  cancellationSummary:
    '商品到着後7日以内に限り、未使用品に限り返品・交換を承ります。お客様都合による返品の送料はお客様負担となります。注文確定後のキャンセルは、発送前に限り承ります。',
  cancellationFull:
    '商品到着後7日以内に限り、未使用品に限り返品・交換を承ります。お客様都合による返品の送料はお客様負担となります。',
  applicationPeriod: null,
}

export const legalTerms: LegalTerms = isKachiu ? kachiu : standard

export default legalTerms
