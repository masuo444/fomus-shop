# KACHIU ショップ立ち上げ手順

同一リポジトリ(masuo444/fomus-shop)から2つ目のブランド「KACHIU」を **shop.kachiu.jp** にデプロイするための手順。
コードは共有・データは同一Supabase内で `shops.platform` により完全分離される。

## ドメインの役割分担(2026-08-15確定)

| ホスト | 中身 | 基盤 |
|---|---|---|
| `kachiu.jp` / `www.kachiu.jp` | **公式サイト**(静的HTML12ページ) | Cloudflare Pages(プロジェクト `kachiu`) |
| `shop.kachiu.jp` | **EC**(このリポジトリ) | Vercel(プロジェクト `kachiu-shop`) |

公式サイトの「ご予約に進む」等の購入導線から `shop.kachiu.jp` へ送る。
公式サイトのリポジトリは `/Users/masuo/Desktop/KACHIU HP`(別プロジェクト)。

**apexは公式サイトが使用中なので、EC側でapexのDNSを触らないこと。**

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
3. Webhookエンドポイント `https://shop.kachiu.jp/api/stripe/webhook` を作成
   - イベント: FOMUS側Webhookと同じ設定(checkout.session.completed 等)
   - signing secret を控える

### 3. Resend

**Resendに追加するドメインは `shop.kachiu.jp`(サブドメイン)にすること。**

kachiu.jp のapexにはXserverのメール用SPFが既にある:
`v=spf1 +a:sv16532.xserver.jp +a:kachiu.jp +mx include:spf.sender.xserver.jp ~all`

apexにResend用のSPF TXTをもう1本足すと **SPFレコードが2本になりpermerrorで全部無効化される**。
サブドメインをResendに登録すれば、apexのXserverメールに一切触れずに済む。
送信元は `noreply@shop.kachiu.jp` になる。

DNS(SPF/DKIM/DMARC)は Cloudflare の kachiu.jp ゾーンに、Resendが指示するホスト名で追加する。

### 4. Vercelプロジェクト作成

新規プロジェクト `kachiu-shop` を作成し、同じGitHubリポジトリ(masuo444/fomus-shop)を接続。
ドメイン `shop.kachiu.jp` を割り当てる。

DNSは Cloudflare の kachiu.jp ゾーンに追加:

```
shop.kachiu.jp   CNAME   cname.vercel-dns.com   ← Proxy: DNS only(グレー雲)
```

**必ず DNS only にすること。** Proxied(オレンジ雲)にするとCloudflareとVercelの二重プロキシで
証明書の発行に失敗する。

既存の `*.kachiu.jp`(A → 85.131.209.73 / Xserver)より、より具体的な `shop` レコードが優先されるので
ワイルドカードは消さなくてよい。

### 5. 環境変数(kachiu-shop プロジェクト)

```bash
# --- Supabase(FOMUSと同じ値) ---
NEXT_PUBLIC_SUPABASE_URL=<FOMUSと同じ>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<FOMUSと同じ>
SUPABASE_SERVICE_ROLE_KEY=<FOMUSと同じ>

# --- ブランド識別(最重要) ---
DEFAULT_SHOP_SLUG=kachiu
NEXT_PUBLIC_DEFAULT_SHOP_SLUG=kachiu   # 'use client' 側の分岐用。必ず両方設定する
NEXT_PUBLIC_SITE_NAME=KACHIU
NEXT_PUBLIC_SITE_DESCRIPTION=<KACHIUの説明文>
NEXT_PUBLIC_SITE_TAGLINE=<フッターのタグライン(改行は\n)>
NEXT_PUBLIC_BASE_URL=https://shop.kachiu.jp
NEXT_PUBLIC_SITE_URL=https://shop.kachiu.jp
NEXT_PUBLIC_CORPORATE_URL=https://kachiu.jp    # 公式サイト(Cloudflare Pages)へ戻す導線
NEXT_PUBLIC_CORPORATE_NAME=KACHIU
ORDER_PREFIX=KC

# --- FOMUS固有機能をオフ ---
FEATURE_BRAND_PAGES=false        # /story /gallery /shop/masu を404に
FEATURE_MEMBERSHIP=false
FEATURE_MEMBERSHIP_SSO=false
FEATURE_JPYC=false               # 使うなら別途ウォレット設定
FEATURE_PARTNERS=false           # パートナー出店を使わないなら

# --- Stripe(KACHIU専用) ---
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=<KACHIU Stripe>
STRIPE_SECRET_KEY=<KACHIU Stripe>
STRIPE_WEBHOOK_SECRET=<KACHIU Webhook>

# --- メール ---
RESEND_API_KEY=<Resendキー(共有可)>
EMAIL_FROM=KACHIU <noreply@shop.kachiu.jp>    # Resendはサブドメインで登録(上記3参照)
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

# --- 送料 ---
SHIPPING_FEE=1000

# --- テーマ(kachiu.jp と同じ色) ---
NEXT_PUBLIC_THEME_PRIMARY=#4a3438
NEXT_PUBLIC_THEME_ACCENT=#a85c63
NEXT_PUBLIC_THEME_BACKGROUND=#faf6f2
NEXT_PUBLIC_THEME_FOREGROUND=#4a3438
NEXT_PUBLIC_THEME_BORDER=#e8dad5
NEXT_PUBLIC_THEME_MUTED=#75625e
NEXT_PUBLIC_THEME_SUBTLE=#f4ece8
NEXT_PUBLIC_THEME_RADIUS_PILL=0     # KACHIU は角を立てる
NEXT_PUBLIC_THEME_RADIUS_LG=0
NEXT_PUBLIC_THEME_RADIUS_MD=0

# --- 商品詳細の補足3行(kachiu.jp の記載と揃える。「営業日」の約束は書かない) ---
NEXT_PUBLIC_PRODUCT_NOTE_SHIPPING="全国一律 1,000円 ／ 10,000円以上で送料無料"
NEXT_PUBLIC_PRODUCT_NOTE_QUALITY="香料・着色料・保存料は不使用"
NEXT_PUBLIC_PRODUCT_NOTE_PAYMENT="Visa / Mastercard / Amex / JCB"

CRON_SECRET=<ランダム文字列>
```

**設定しないこと**: `MEMBERSHIP_URL`(FOMUS GUILDのリンクがフッターに出る)。

### 6. 動作確認チェックリスト

- [ ] shop.kachiu.jp のトップ/商品一覧にFOMUS商品が出ない
- [ ] shop.fomus.jp にKACHIU商品が出ない(商品ID直打ちでも404)
- [ ] shop.kachiu.jp の管理画面にKACHIUの注文・顧客だけが表示される
- [ ] kachiu.jp(公式サイト)が今まで通り表示され、@kachiu.jp のメールが受信できる(apexとMXに影響が出ていないこと)
- [ ] 公式サイトの購入導線から shop.kachiu.jp に遷移する
- [ ] KACHIUでテスト購入 → KACHIUのStripeダッシュボードに決済が乗る
- [ ] 外部リンク商品(ビール)がカートに入らず、外部ボタンだけ表示される
- [ ] /story /gallery /shop/masu が404になる
- [ ] フッターにFOMUS表記が残っていない
- [ ] 特商法ページがKACHIUの情報になっている

## ローカル開発

KACHIUの見た目で開発するときは `.env.local` の `DEFAULT_SHOP_SLUG` 等を切り替えるか、
別フォルダに同リポジトリをもう1つcloneして `.env.local` をKACHIU用にする。

## KACHIU 専用の表示層

`src/components/kachiu/` 配下が KACHIU 専用。`layout.tsx` と `page.tsx` が
`siteConfig.defaultShopSlug === 'kachiu'` で切り替える。

| ファイル | 役割 |
|---|---|
| `KachiuHeader.tsx` | ワードマーク／公式サイト／カート の3点だけ。検索・言語切替・会員導線は出さない |
| `KachiuFooter.tsx` | kachiu.jp のフッターと同じ並び |
| `home/KachiuHome.tsx` | トップ＝全商品の「品書き」。ブランドの物語は語らず公式サイトへ返す |
| `KachiuProductCard.tsx` | 名・一行・価格・数量・カートに入れる。トップと関連商品で使う |
| `KachiuLabel.tsx` | 写真が無い間に描くラベル。写真が入れば同じ枠に差し替わる |
| `KachiuAddToCart.tsx` | 数量ステッパー付きのカート追加。ロジックは共有の lib/cart |

カート・チェックアウト・商品詳細は共有ページのまま。Tailwind の固定グレーをテーマ変数に
置き換えてあるので、色と角丸は環境変数で KACHIU の見た目になる。

`KachiuHome.tsx` には開発時のみ表示されるプレビュー商品(`DEV_PREVIEW`)が入っている。
`NODE_ENV === 'development'` かつ DB に商品が無いときだけ出るので本番には出ない。

## 注意

- 顧客のログインアカウント(Supabase Auth)は両ブランド共通基盤。同じメールアドレスなら同じパスワードでログインできるが、購入履歴・顧客データはブランドごとに分離される
- `profiles.role = 'admin'` は全ブランド共通の管理者権限。ブランドごとに管理者を分けたい場合は `ADMIN_EMAILS` をデプロイごとに変える
- KACHIU固有のコード分岐が必要になったら `siteConfig.defaultShopSlug === 'kachiu'` で分岐する
