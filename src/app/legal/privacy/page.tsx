import siteConfig from '@/site.config'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: 'FOUMSのプライバシーポリシー。個人情報の収集・利用目的・第三者提供・管理について。',
}

export default function PrivacyPolicyPage() {
  const siteName = siteConfig.name
  const contactEmail = siteConfig.legal.email || siteConfig.adminNotificationEmail || '（メールアドレス）'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>

      <p className="text-sm text-gray-600 leading-relaxed mb-6">
        {siteName}（以下「当サイト」）は、お客様の個人情報の保護を重要と考え、以下のとおりプライバシーポリシーを定めます。
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">1. 個人情報の収集</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        当サイトでは、サービスの提供にあたり、以下の個人情報を収集することがあります。
      </p>
      <ul className="list-disc list-inside text-sm text-gray-600 leading-relaxed mt-2 space-y-1">
        <li>氏名</li>
        <li>メールアドレス</li>
        <li>住所（配送先情報）</li>
        <li>電話番号</li>
        <li>決済情報（クレジットカード情報はStripe社が管理し、当サイトでは保持しません）</li>
        <li>アカウント情報（ログインID、パスワード等）</li>
      </ul>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">2. 個人情報の利用目的</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        収集した個人情報は、以下の目的で利用いたします。
      </p>
      <ul className="list-disc list-inside text-sm text-gray-600 leading-relaxed mt-2 space-y-1">
        <li>ご注文の処理および商品の配送</li>
        <li>お客様へのご連絡（注文確認、発送通知等）</li>
        <li>アカウントの管理</li>
        <li>カスタマーサポートの提供</li>
        <li>サービスの改善およびマーケティング分析</li>
        <li>法令に基づく対応</li>
      </ul>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">3. 個人情報の第三者提供</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        当サイトは、以下の場合を除き、お客様の同意なく個人情報を第三者に提供することはありません。
      </p>
      <ul className="list-disc list-inside text-sm text-gray-600 leading-relaxed mt-2 space-y-1">
        <li>決済処理のためStripe社に決済関連情報を提供する場合</li>
        <li>商品配送のため配送業者に配送先情報を提供する場合</li>
        <li>データの保管・管理のためSupabase社にデータを保管する場合</li>
        <li>法令に基づく開示要求があった場合</li>
      </ul>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">4. 個人情報の管理</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        当サイトは、個人情報の漏洩、滅失、毀損を防止するため、適切なセキュリティ対策を講じます。
        通信はSSL/TLSにより暗号化し、データベースへのアクセスは適切に制限しています。
        クレジットカード情報はStripe社のPCI DSS準拠環境で処理され、当サイトのサーバーには保存されません。
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">5. Cookieの使用</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        当サイトでは、ログイン状態の維持やサイト利用状況の分析のためにCookieを使用しています。
        ブラウザの設定によりCookieの受け入れを拒否することができますが、その場合一部の機能が制限されることがあります。
      </p>

      <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-4">6. お問い合わせ</h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        個人情報の取り扱いに関するお問い合わせは、以下までご連絡ください。
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mt-2">
        メールアドレス：{contactEmail}
      </p>
    </div>
  )
}
