// ============================================
// Site Configuration - White Label Package
// ============================================
// All site-specific settings are centralized here.
// Override via environment variables for each deployment.

const siteConfig = {
  // Branding
  name: process.env.NEXT_PUBLIC_SITE_NAME || 'My Store',
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Online Store',
  logoText: process.env.NEXT_PUBLIC_SITE_NAME || 'My Store',
  logoUrl: process.env.NEXT_PUBLIC_LOGO_URL || null,

  tagline: process.env.NEXT_PUBLIC_SITE_TAGLINE || '面白いモノを世の中に。\n枡・カードゲーム・デジタルアイテム。',
  corporateUrl: process.env.NEXT_PUBLIC_CORPORATE_URL || 'https://www.fomus.jp',
  corporateName: process.env.NEXT_PUBLIC_CORPORATE_NAME || 'FOMUS.jp',

  // Shop
  // サーバー側は DEFAULT_SHOP_SLUG、クライアント側('use client')は NEXT_PUBLIC_ 付きでないと読めない。
  // どちらか片方しか設定していなくても同じ値になるよう両方を見る。
  defaultShopSlug: process.env.NEXT_PUBLIC_DEFAULT_SHOP_SLUG || process.env.DEFAULT_SHOP_SLUG || 'main',
  orderPrefix: process.env.ORDER_PREFIX || 'OR',
  currency: 'jpy' as const,

  // Pricing
  shippingFee: Number(process.env.SHIPPING_FEE || 1000),
  shippingFeeEur: Number(process.env.SHIPPING_FEE_EUR || 1500), // EUR in cents (€15.00)
  shippingFeeIntl: Number(process.env.SHIPPING_FEE_INTL || 3000), // JPY, non-Japan address with JPY currency
  defaultCommissionRate: Number(process.env.DEFAULT_COMMISSION_RATE || 10),

  // Admin
  adminEmails: (process.env.NEXT_PUBLIC_ADMIN_EMAILS || process.env.ADMIN_EMAILS || '').split(',').filter(Boolean),

  // Email
  emailFrom: process.env.EMAIL_FROM || 'noreply@example.com',
  adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || '',

  // Theme
  // 既定値は globals.css のFOMUS用の値と一致させてある。環境変数を設定しない
  // デプロイ（=FOMUS）では見た目が変わらない。
  theme: {
    primary: process.env.NEXT_PUBLIC_THEME_PRIMARY || '#111111',
    accent: process.env.NEXT_PUBLIC_THEME_ACCENT || '#111111',
    memberColor: process.env.NEXT_PUBLIC_THEME_MEMBER || '#00A8A0',
    // 地の色・文字色まで差し替えられないと、ブランドごとの世界観が出せないため公開
    background: process.env.NEXT_PUBLIC_THEME_BACKGROUND || '#FAF9F7',
    foreground: process.env.NEXT_PUBLIC_THEME_FOREGROUND || '#1A1A18',
    border: process.env.NEXT_PUBLIC_THEME_BORDER || '#E8E6E1',
    muted: process.env.NEXT_PUBLIC_THEME_MUTED || '#6B6760',
    subtle: process.env.NEXT_PUBLIC_THEME_SUBTLE || '#F3F2EF',
    // 角丸。'pill' はボタン用の完全な丸み。KACHIU のように角を立てるブランドは 0 を渡す
    radiusPill: process.env.NEXT_PUBLIC_THEME_RADIUS_PILL || '9999px',
    radiusLg: process.env.NEXT_PUBLIC_THEME_RADIUS_LG || '0.75rem',
    radiusMd: process.env.NEXT_PUBLIC_THEME_RADIUS_MD || '0.5rem',
  },

  // JPYC Payment
  jpyc: {
    enabled: process.env.FEATURE_JPYC === 'true',
    walletAddress: process.env.JPYC_WALLET_ADDRESS || '',
    // JPYC V2 on Polygon
    contractAddress: process.env.JPYC_CONTRACT_ADDRESS || '0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB',
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
    fallbackRpcUrls: [
      'https://polygon-rpc.com',
      'https://rpc-mainnet.matic.quiknode.pro',
    ],
    minConfirmations: 12,
    chainId: 137,
    // Confirmation polling
    pollIntervalMs: 5000,
    maxPollMinutes: 30,
  },

  // Bank Transfer
  bankTransfer: {
    enabled: false,
    bankName: process.env.BANK_TRANSFER_BANK_NAME || '三菱UFJ銀行',
    branchName: process.env.BANK_TRANSFER_BRANCH_NAME || '渋谷支店',
    accountType: process.env.BANK_TRANSFER_ACCOUNT_TYPE || '普通',
    accountNumber: process.env.BANK_TRANSFER_ACCOUNT_NUMBER || '1234567',
    accountHolder: process.env.BANK_TRANSFER_ACCOUNT_HOLDER || 'カ）フォムス',
    deadlineDays: 3,
  },

  // Feature flags
  features: {
    membershipProgram: process.env.FEATURE_MEMBERSHIP === 'true',
    membershipSso: process.env.FEATURE_MEMBERSHIP_SSO === 'true',
    membershipUrl: process.env.MEMBERSHIP_URL || '',
    membershipName: process.env.NEXT_PUBLIC_MEMBERSHIP_NAME || process.env.MEMBERSHIP_NAME || 'Premium',
    digitalItems: (process.env.NEXT_PUBLIC_FEATURE_DIGITAL ?? process.env.FEATURE_DIGITAL) !== 'false',
    partnerMarketplace: process.env.FEATURE_PARTNERS !== 'false',
    birthdayCoupons: process.env.FEATURE_BIRTHDAY_COUPONS !== 'false',
    // FOMUS brand content pages (/story, /gallery, /shop/masu) — disable on other brands
    brandPages: process.env.FEATURE_BRAND_PAGES !== 'false',
  },
  // 商品詳細ページの補足3行。配送・品質・支払の実態はブランドごとに違うため。
  // 未設定なら i18n 辞書の既定文（FOMUS向け）を使う。空文字を渡すとその行を消す。
  productNotes: {
    shipping: process.env.NEXT_PUBLIC_PRODUCT_NOTE_SHIPPING ?? null,
    quality:  process.env.NEXT_PUBLIC_PRODUCT_NOTE_QUALITY  ?? null,
    payment:  process.env.NEXT_PUBLIC_PRODUCT_NOTE_PAYMENT  ?? null,
  },
  // Legal
  legal: {
    companyName: process.env.LEGAL_COMPANY_NAME || '',
    representative: process.env.LEGAL_REPRESENTATIVE || '',
    address: process.env.LEGAL_ADDRESS || '',
    phone: process.env.LEGAL_PHONE || '',
    email: process.env.LEGAL_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || '',
  },
} as const

export default siteConfig
