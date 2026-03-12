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

  // Shop
  defaultShopSlug: process.env.DEFAULT_SHOP_SLUG || 'main',
  orderPrefix: process.env.ORDER_PREFIX || 'OR',
  currency: 'jpy' as const,

  // Pricing
  shippingFee: Number(process.env.SHIPPING_FEE || 500),
  shippingFeeEur: Number(process.env.SHIPPING_FEE_EUR || 1500), // EUR in cents (€15.00)
  defaultCommissionRate: Number(process.env.DEFAULT_COMMISSION_RATE || 10),

  // Admin
  adminEmails: (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean),

  // Email
  emailFrom: process.env.EMAIL_FROM || 'noreply@example.com',
  adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL || '',

  // Theme
  theme: {
    primary: process.env.NEXT_PUBLIC_THEME_PRIMARY || '#111111',
    accent: process.env.NEXT_PUBLIC_THEME_ACCENT || '#111111',
    memberColor: process.env.NEXT_PUBLIC_THEME_MEMBER || '#00A8A0',
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
    enabled: true,
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
    membershipName: process.env.MEMBERSHIP_NAME || 'Premium',
    digitalItems: process.env.FEATURE_DIGITAL !== 'false',
    marketplace: process.env.FEATURE_MARKETPLACE !== 'false',
    marketplaceName: process.env.MARKETPLACE_NAME || '根の市',
    partnerMarketplace: process.env.FEATURE_PARTNERS !== 'false',
    birthdayCoupons: process.env.FEATURE_BIRTHDAY_COUPONS !== 'false',
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
