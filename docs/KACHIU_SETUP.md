# KACHIU ショップ立ち上げ手順

同一リポジトリ(masuo444/fomus-shop)から2つ目のブランド「KACHIU」(kachiu.jp)をデプロイするための手順。
コードは共有・データは同一Supabase内で `shops.platform` により完全分離される。

## 仕組み

- 各デプロイは `DEFAULT_SHOP_SLUG` で「自分がどのショップか」を認識する
- ストアフロント・公開API・checkoutはすべて `shops.platform = DEFAULT_SHOP_SLUG` のショップだけを表示/許可する
  (FOMUSサイトにKACHIU商品は出ない。逆も同じ)
- 管理画面・注文・顧客・クーポン等はすべて shop_id 単位で分離済み
- ビール等の「外部販売商品」は管理画面の商品編集「外部販売リンク」にURLを入れると、
  カート不可・外部購入ボタンのみの商品になる

## 手順

### 1. DBマイグレーション(共有Supabaseに1回だけ)

Supabase SQL Editor で `supabase/migrations/033_multi_brand.sql` を実行。

- `shops.platform` 列追加(既存ショップは全部 'fomus' になる)
- KACHIUショップ行(slug: `kachiu`, platform: `kachiu`)を作成
- `products.external_url` 列追加

**重要: このmigrationを先に適用してから新コードをデプロイすること**(逆順だとplatform列が無くてFOMUS本番のクエリが落ちる)。

### 2. Stripe(KACHIU専用アカウント)

1. KACHIU用Stripeアカウントを作成
2. APIキー(publishable / secret)を取得
3. Webhookエンドポイント `https://kachiu.jp/api/stripe/webhook` を作成
   - イベント: FOMUS側Webhookと同じ設定(checkout.session.completed 等)
   - signing secret を控える

### 3. Resend

kachiu.jp ドメインをResendに追加し、DNS(SPF/DKIM)を設定。

### 4. Vercelプロジェクト作成

新規プロジェクト `kachiu-shop` を作成し、同じGitHubリポジトリ(masuo444/fomus-shop)を接続。
ドメイン `kachiu.jp` を割り当て。

### 5. 環境変数(kachiu-shop プロジェクト)

```bash
# --- Supabase(FOMUSと同じ値) ---
NEXT_PUBLIC_SUPABASE_URL=<FOMUSと同じ>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<FOMUSと同じ>
SUPABASE_SERVICE_ROLE_KEY=<FOMUSと同じ>

# --- ブランド識別(最重要) ---
DEFAULT_SHOP_SLUG=kachiu
NEXT_PUBLIC_SITE_NAME=KACHIU
NEXT_PUBLIC_SITE_DESCRIPTION=<KACHIUの説明文>
NEXT_PUBLIC_SITE_TAGLINE=<フッターのタグライン(改行は\n)>
NEXT_PUBLIC_BASE_URL=https://kachiu.jp
NEXT_PUBLIC_SITE_URL=https://kachiu.jp
NEXT_PUBLIC_CORPORATE_URL=<コーポレートサイトURL。無ければ https://kachiu.jp>
NEXT_PUBLIC_CORPORATE_NAME=KACHIU.jp
ORDER_PREFIX=KC

# --- FOMUS固有機能をオフ ---
FEATURE_BRAND_PAGES=false        # /story /gallery /shop/masu を404に
FEATURE_MEMBERSHIP=false
FEATURE_MEMBERSHIP_SSO=false
FEATURE_JPYC=false               # 使うなら別途ウォレット設定
FEATURE_MARKETPLACE=false        # 二次流通(根の市)を使わないなら
FEATURE_PARTNERS=false           # パートナー出店を使わないなら

# --- Stripe(KACHIU専用) ---
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<KACHIU Stripe>
STRIPE_SECRET_KEY=<KACHIU Stripe>
STRIPE_WEBHOOK_SECRET=<KACHIU Webhook>

# --- メール ---
RESEND_API_KEY=<Resendキー(共有可)>
EMAIL_FROM=KACHIU <noreply@kachiu.jp>
ADMIN_NOTIFICATION_EMAIL=<注文通知先>
ADMIN_EMAILS=<管理者メール(カンマ区切り)>
NEXT_PUBLIC_ADMIN_EMAILS=<同上>

# --- 特商法・会社情報 ---
LEGAL_COMPANY_NAME=<販売者名>
LEGAL_REPRESENTATIVE=<代表者名>
LEGAL_ADDRESS=<住所>
LEGAL_PHONE=<電話番号>
LEGAL_EMAIL=<連絡先メール>

# --- 銀行振込(使う場合) ---
BANK_TRANSFER_BANK_NAME=...
BANK_TRANSFER_BRANCH_NAME=...
BANK_TRANSFER_ACCOUNT_TYPE=普通
BANK_TRANSFER_ACCOUNT_NUMBER=...
BANK_TRANSFER_ACCOUNT_HOLDER=...

# --- その他 ---
SHIPPING_FEE=<送料(円)>
NEXT_PUBLIC_THEME_PRIMARY=<ブランドカラー>
NEXT_PUBLIC_THEME_ACCENT=<アクセントカラー>
CRON_SECRET=<ランダム文字列>
```

### 6. 動作確認チェックリスト

- [ ] kachiu.jp のトップ/商品一覧にFOMUS商品が出ない
- [ ] shop.fomus.jp にKACHIU商品が出ない(商品ID直打ちでも404)
- [ ] kachiu.jp の管理画面にKACHIUの注文・顧客だけが表示される
- [ ] KACHIUでテスト購入 → KACHIUのStripeダッシュボードに決済が乗る
- [ ] 外部リンク商品(ビール)がカートに入らず、外部ボタンだけ表示される
- [ ] /story /gallery /shop/masu が404になる
- [ ] フッターにFOMUS表記が残っていない
- [ ] 特商法ページがKACHIUの情報になっている

## ローカル開発

KACHIUの見た目で開発するときは `.env.local` の `DEFAULT_SHOP_SLUG` 等を切り替えるか、
別フォルダに同リポジトリをもう1つcloneして `.env.local` をKACHIU用にする。

## 注意

- 顧客のログインアカウント(Supabase Auth)は両ブランド共通基盤。同じメールアドレスなら同じパスワードでログインできるが、購入履歴・顧客データはブランドごとに分離される
- `profiles.role = 'admin'` は全ブランド共通の管理者権限。ブランドごとに管理者を分けたい場合は `ADMIN_EMAILS` をデプロイごとに変える
- KACHIU固有のコード分岐が必要になったら `siteConfig.defaultShopSlug === 'kachiu'` で分岐する
