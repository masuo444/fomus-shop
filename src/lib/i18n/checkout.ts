// i18n dictionary for cart / checkout / checkout-success pages.
// Default locale is 'ja' — Japanese pages must render exactly as before.
// Note: some strings already switch by currency (isEur) in the JA site;
// for those, the page selects 'en' when (isEur || locale === 'en') so the
// existing JA-site behavior is preserved byte-for-byte.

export type CheckoutLocale = 'ja' | 'en'

const ja = {
  // Common
  loading: '読み込み中...',
  continueShopping: 'ショッピングを続ける',
  subtotal: '小計',
  shipping: '送料',
  total: '合計',
  couponDiscount: 'クーポン割引',
  processing: '処理中...',
  productNotFound: '商品が見つかりません',
  productFallback: '商品',
  postalPrefix: '〒',

  // Cart page
  cartTitle: 'カート',
  cartEmptyTitle: 'カートは空です',
  cartEmptyDesc: '商品をカートに追加してください',
  freeShippingIncluded: '無料（送料込み）',
  domesticShippingNote: '※ 国内送料1,000円〜',
  intlShippingIncludedNote: 'International shipping included',
  mixedShopsTitle: '異なるショップの商品が含まれています',
  mixedShopsDesc: '同一ショップの商品のみ同時に購入できます。いずれかのショップの商品を削除してください。',
  proceedToSupport: '支援の手続きへ',
  proceedToCheckout: 'レジに進む',

  // Checkout page
  checkoutTitle: 'お会計',
  orderConfirmation: 'ご注文内容の確認',
  supporterInfo: '支援者情報',
  shippingInfo: '配送先情報',
  intlShippingAvailableNote: 'International shipping available',
  orderItems: '注文商品',
  paymentMethod: 'お支払い方法',
  creditCard: 'クレジットカード',
  creditCardBrands: 'Visa / Mastercard / AMEX',
  bankTransfer: '銀行振込',
  bankTransferDesc: '3営業日以内にお振込み',
  jpyc: 'JPYC',
  jpycDesc: 'Polygon / 手数料ほぼ無料',
  shippingIncluded: '送料込み',
  confirmOrder: '注文を確定する',
  editOrder: '修正する',
  fullName: 'お名前',
  email: 'メールアドレス',
  phone: '電話番号',
  postalCode: '郵便番号',
  postalCodePlaceholder: '000-0000',
  country: 'お届け先の国',
  address: '住所',
  searchingAddress: '住所を検索中...',
  orderSummary: '注文内容',
  couponCode: 'クーポンコード',
  couponCodePlaceholder: 'コードを入力',
  apply: '適用',
  removeCoupon: '取消',
  couponInvalid: 'クーポンが無効です',
  couponCheckFailed: 'クーポンの確認に失敗しました',
  referralCode: '紹介コード（任意）',
  referralCodePlaceholder: 'コードをお持ちの方はこちら',
  referralCodeNote: 'GUILDメンバーの紹介コードを入力すると、そのメンバーにポイントが還元されます',
  orderCreateFailed: '注文の作成に失敗しました',
  paymentCreateFailed: '決済の作成に失敗しました',
  genericError: 'エラーが発生しました',
  payByBankTransfer: '銀行振込で注文する',
  payWithJpyc: 'JPYC決済へ',
  proceedToPayment: 'お支払いへ',
  backToCart: 'カートに戻る',

  // 特商法12条の6（最終確認画面の表示義務）
  termsHeading: 'ご注文内容の確認事項',
  termsPayment: '支払の時期・方法',
  termsDelivery: '引渡時期',
  termsCancellation: '申込みの撤回・解除',
  termsPeriod: '申込期間',
  termsLink: '特定商取引法に基づく表記を見る',

  // Success page
  thankYou: 'ご注文ありがとうございます',
  confirmationEmailSent: 'ご注文の確認メールをお送りしました。',
  shippingNotice: '商品の発送準備が整い次第、発送通知をお送りいたします。',
  createAccountPrompt: 'アカウントを作成しませんか？',
  createAccountDesc: '次回のお買い物で配送先の入力が不要になります。注文履歴の確認やデジタルアイテムの購入もできるようになります。',
  createAccountFree: '無料でアカウント作成',
  createAccountTitle: 'アカウント作成',
  nameLabel: 'お名前',
  passwordLabel: 'パスワード',
  passwordPlaceholder: '6文字以上',
  creating: '作成中...',
  createAccountButton: 'アカウント作成',
  cancel: 'キャンセル',
  emailNotFound: 'メールアドレスが見つかりません',
  alreadyRegistered: 'このメールアドレスは既に登録されています。ログインしてください。',
  accountCreated: 'アカウントを作成しました！',
  accountCreatedDesc: '確認メールをお送りしました。メール内のリンクをクリックしてアカウントを有効化してください。',
  viewOrders: '注文履歴を確認',
  logIn: 'ログインする',
  recommended: 'こちらもおすすめ',
}

const en: Record<keyof typeof ja, string> = {
  // Common
  loading: 'Loading...',
  continueShopping: 'Continue Shopping',
  subtotal: 'Subtotal',
  shipping: 'Shipping',
  total: 'Total',
  couponDiscount: 'Coupon Discount',
  processing: 'Processing...',
  productNotFound: 'Product not found',
  productFallback: 'Item',
  postalPrefix: '',

  // Cart page
  cartTitle: 'Cart',
  cartEmptyTitle: 'Your cart is empty',
  cartEmptyDesc: "Looks like you haven't added anything yet",
  freeShippingIncluded: 'Free (shipping included)',
  domesticShippingNote: 'Domestic shipping (Japan) from ¥1,000',
  intlShippingIncludedNote: 'International shipping included',
  mixedShopsTitle: 'Your cart contains items from different shops',
  mixedShopsDesc: 'Items from only one shop can be purchased at a time. Please remove items from one of the shops.',
  proceedToSupport: 'Proceed to Checkout',
  proceedToCheckout: 'Proceed to Checkout',

  // Checkout page
  checkoutTitle: 'Checkout',
  orderConfirmation: 'Review Your Order',
  supporterInfo: 'Supporter Information',
  shippingInfo: 'Shipping Information',
  intlShippingAvailableNote: 'International shipping available',
  orderItems: 'Order Items',
  paymentMethod: 'Payment Method',
  creditCard: 'Credit Card',
  creditCardBrands: 'Visa / Mastercard / AMEX',
  bankTransfer: 'Bank Transfer',
  bankTransferDesc: 'Pay within 3 business days',
  jpyc: 'JPYC',
  jpycDesc: 'Polygon / Near-zero fees',
  shippingIncluded: 'Shipping included',
  confirmOrder: 'Place Order',
  editOrder: 'Edit',
  fullName: 'Full Name',
  email: 'Email',
  phone: 'Phone',
  postalCode: 'Postal Code',
  postalCodePlaceholder: '',
  country: 'Country',
  address: 'Address',
  searchingAddress: 'Looking up address...',
  orderSummary: 'Order Summary',
  couponCode: 'Coupon Code',
  couponCodePlaceholder: 'Enter code',
  apply: 'Apply',
  removeCoupon: 'Remove',
  couponInvalid: 'Invalid coupon code',
  couponCheckFailed: 'Failed to validate coupon. Please try again.',
  referralCode: 'Referral Code (optional)',
  referralCodePlaceholder: 'Enter a code if you have one',
  referralCodeNote: 'Entering a GUILD member’s referral code rewards them with points.',
  orderCreateFailed: 'Failed to create your order. Please try again.',
  paymentCreateFailed: 'Failed to start payment. Please try again.',
  genericError: 'Something went wrong. Please try again.',
  payByBankTransfer: 'Order with Bank Transfer',
  payWithJpyc: 'Pay with JPYC',
  proceedToPayment: 'Proceed to Payment',
  backToCart: 'Back to Cart',

  // 特商法12条の6（最終確認画面の表示義務）
  termsHeading: 'Order Terms',
  termsPayment: 'Payment',
  termsDelivery: 'Delivery',
  termsCancellation: 'Cancellation & Returns',
  termsPeriod: 'Order Period',
  termsLink: 'View Commercial Transactions Act disclosure',

  // Success page
  thankYou: 'Thank you for your order!',
  confirmationEmailSent: 'A confirmation email has been sent to you.',
  shippingNotice: "We'll send you a shipping notification as soon as your order is on its way.",
  createAccountPrompt: 'Create an account?',
  createAccountDesc: 'Save your shipping details for faster checkout next time, view your order history, and access digital items.',
  createAccountFree: 'Create a Free Account',
  createAccountTitle: 'Create Account',
  nameLabel: 'Name',
  passwordLabel: 'Password',
  passwordPlaceholder: 'At least 6 characters',
  creating: 'Creating...',
  createAccountButton: 'Create Account',
  cancel: 'Cancel',
  emailNotFound: 'Email address not found',
  alreadyRegistered: 'This email is already registered. Please log in instead.',
  accountCreated: 'Your account has been created!',
  accountCreatedDesc: 'We sent you a confirmation email. Click the link in the email to activate your account.',
  viewOrders: 'View Order History',
  logIn: 'Log In',
  recommended: 'You may also like',
}

export const checkoutDict: Record<CheckoutLocale, typeof ja> = { ja, en }

/** Detect locale from a pathname. Defaults to 'ja'. */
export function localeFromPathname(pathname: string | null | undefined): CheckoutLocale {
  if (pathname === '/en' || pathname?.startsWith('/en/')) return 'en'
  return 'ja'
}

/** Prefix a path with /en when locale is 'en'. */
export function localePath(locale: CheckoutLocale, path: string): string {
  return locale === 'en' ? `/en${path}` : path
}
