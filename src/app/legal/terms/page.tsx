import siteConfig from '@/site.config'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約',
  description: 'FOUMSの利用規約。アカウント登録・商品購入・支払い・配送・返品に関する条件。',
}

export default function TermsPage() {
  const siteName = siteConfig.name
  const contactEmail = siteConfig.legal.email || siteConfig.adminNotificationEmail || '（メールアドレス）'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">利用規約</h1>

      <p className="text-sm text-gray-600 leading-relaxed mb-6">
        この利用規約（以下「本規約」）は、{siteName}（以下「当サイト」）の利用条件を定めるものです。
        ご利用にあたっては、本規約に同意いただく必要があります。
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">第1条（適用範囲）</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        本規約は、当サイトが提供するすべてのサービス（商品の販売、デジタルアイテムの提供、マーケットプレイス機能等）に適用されます。
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">第2条（アカウント登録）</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        利用者は、正確かつ最新の情報を提供してアカウント登録を行うものとします。
        アカウントの管理責任は利用者にあり、第三者への譲渡・貸与は禁止します。
        不正利用が判明した場合、当サイトはアカウントを停止または削除することがあります。
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">第3条（商品の購入）</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        商品の価格、仕様等は各商品ページに記載のとおりとします。
        注文の成立は、当サイトが注文確認メールを送信した時点とします。
        在庫状況等により注文をお断りする場合があります。
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">第4条（支払い）</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        支払方法は、クレジットカード（Visa、Mastercard、American Express）および銀行振込とします。
        クレジットカード決済はStripe社のシステムを利用します。
        銀行振込の場合、注文後3営業日以内にお振り込みください。期限内に入金が確認できない場合、注文はキャンセルとなります。
        振込手数料はお客様のご負担となります。
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">第5条（配送）</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        商品は入金確認後、7営業日以内に発送いたします。
        配送先の不備等によりお届けできない場合の再配送費用はお客様のご負担となります。
        天災、交通事情等により配送が遅延する場合があります。
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">第6条（返品・キャンセル）</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        商品到着後7日以内に限り、未使用品に限り返品・交換を承ります。
        お客様都合による返品の送料はお客様負担となります。
        不良品の場合は、送料当サイト負担にて交換いたします。
        注文確定後のキャンセルは、発送前に限り承ります。
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">第7条（デジタルアイテム）</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        デジタルアイテムの購入後の返品・返金は原則として承りません。
        デジタルアイテムの二次販売（リセール）が許可されている場合、当サイトが定めるプラットフォーム上でのみ行うことができます。
        二次販売時には、当サイトが定めるロイヤリティが発生する場合があります。
        デジタルアイテムの利用範囲は、各商品の説明に記載のとおりとします。
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">第8条（知的財産権）</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        当サイト上のコンテンツ（画像、テキスト、デザイン等）に関する知的財産権は、当サイトまたは正当な権利者に帰属します。
        利用者は、私的使用の範囲を超えてコンテンツを複製、転載、改変することはできません。
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">第9条（禁止事項）</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        利用者は、以下の行為を行ってはなりません。
      </p>
      <ul className="list-disc list-inside text-sm text-gray-600 leading-relaxed mt-2 space-y-1">
        <li>虚偽の情報を登録する行為</li>
        <li>他の利用者のアカウントを不正に使用する行為</li>
        <li>当サイトの運営を妨害する行為</li>
        <li>法令または公序良俗に反する行為</li>
        <li>当サイトのコンテンツを無断で商用利用する行為</li>
        <li>不正アクセス、スクレイピング等の行為</li>
      </ul>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">第10条（免責事項）</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        当サイトは、サービスの内容や情報の正確性について、可能な限りの努力をいたしますが、完全性を保証するものではありません。
        天災、システム障害等の不可抗力による損害について、当サイトは責任を負いません。
        利用者間のトラブルについて、当サイトは仲裁の義務を負いません。
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">第11条（規約の変更）</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        当サイトは、必要に応じて本規約を変更することがあります。
        変更後の規約は、当サイト上に掲載した時点から効力を生じるものとします。
        重要な変更がある場合は、メール等で事前にお知らせいたします。
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">第12条（準拠法・裁判管轄）</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        本規約の解釈および適用は、日本法に準拠するものとします。
        本規約に関する紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
      </p>

      <div className="mt-12 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          お問い合わせ：{contactEmail}
        </p>
      </div>
    </div>
  )
}
