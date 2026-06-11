// Shared i18n dictionary for layout / product components.
// Default locale is 'ja' — Japanese pages must render exactly as before.
export { localeFromPathname, localePath } from './checkout'
export type { CheckoutLocale as Locale } from './checkout'

const ja = {
  // Header user menu
  adminPanel: '管理画面',
  partnerPanel: 'パートナー管理',
  myPage: 'マイページ',
  orderHistory: '注文履歴',
  digitalItems: 'デジタルアイテム',
  logout: 'ログアウト',

  // QuickAddToCart
  selectOptions: 'オプションを選択',
  mixedShopsConfirm: '別のショップの商品がカートにあります。カートを空にしてこの商品を追加しますか？',
  addedToCart: 'カートに追加しました',
  add: '追加',
  addToCart: 'カートに入れる',

  // MobileCartBar / CartToast
  viewCart: 'カートを見る',
  continueShopping: '買い物を続ける',

  // SearchBar
  searchPlaceholder: '商品を検索...',
  searching: '検索中...',
  noResultsPrefix: '「',
  noResultsSuffix: '」に一致する商品はありません',

  // ProductCard
  saleEnded: '販売終了',
  beforeSale: '販売開始前',
  onlyLeftPrefix: '残り',
  onlyLeftSuffix: '点',
  madeToOrder: '受注生産',
  contactForPrice: '価格はお問い合わせ',

  // Footer
  footerTagline1: '面白いモノを世の中に。',
  footerTagline2: '枡・カードゲーム・デジタルアイテム。',
  footerShopList: '商品一覧',
  footerAboutMasu: '枡について',
  footerDigital: 'デジタルアイテム',
  footerGallery: 'ギャラリー',
  footerStory: 'FOMUSについて',
  footerColumn: '枡コラム',
  footerMyPage: 'マイページ',
  footerOrders: '注文履歴',
  footerCart: 'カート',
  footerContact: 'お問い合わせ',
  footerCustomOrder: 'オーダーメイド',
  footerShipping: '配送について',
  footerJpyc: 'JPYC決済',
  footerCommercial: '特定商取引法',
  footerPrivacy: 'プライバシー',
  footerTerms: '利用規約',
}

const en: typeof ja = {
  adminPanel: 'Admin',
  partnerPanel: 'Partner Dashboard',
  myPage: 'My Account',
  orderHistory: 'Order History',
  digitalItems: 'Digital Items',
  logout: 'Sign Out',

  selectOptions: 'Select Options',
  mixedShopsConfirm: 'Your cart contains items from another shop. Empty the cart and add this item?',
  addedToCart: 'Added to cart',
  add: 'Add',
  addToCart: 'Add to Cart',

  viewCart: 'View Cart',
  continueShopping: 'Continue Shopping',

  searchPlaceholder: 'Search products...',
  searching: 'Searching...',
  noResultsPrefix: 'No products found for "',
  noResultsSuffix: '"',

  saleEnded: 'Sale Ended',
  beforeSale: 'Coming Soon',
  onlyLeftPrefix: 'Only ',
  onlyLeftSuffix: ' left',
  madeToOrder: 'Made to Order',
  contactForPrice: 'Contact for pricing',

  footerTagline1: 'Bringing extraordinary things to the world.',
  footerTagline2: 'Masu, card games, and digital items.',
  footerShopList: 'All Products',
  footerAboutMasu: 'About Masu',
  footerDigital: 'Digital Items',
  footerGallery: 'Gallery',
  footerStory: 'About FOMUS',
  footerColumn: 'Masu Column',
  footerMyPage: 'My Account',
  footerOrders: 'Order History',
  footerCart: 'Cart',
  footerContact: 'Contact',
  footerCustomOrder: 'Custom Orders',
  footerShipping: 'Shipping',
  footerJpyc: 'JPYC Payment',
  footerCommercial: 'Commercial Transactions Act',
  footerPrivacy: 'Privacy Policy',
  footerTerms: 'Terms of Service',
}

export const commonDict = { ja, en }

/** Product display name for the given locale (falls back to Japanese). */
export function productName(
  product: { name: string; name_en?: string | null },
  locale: 'ja' | 'en'
): string {
  return locale === 'en' && product.name_en ? product.name_en : product.name
}

/** Product description for the given locale (falls back to Japanese). */
export function productDescription(
  product: { description?: string | null; description_en?: string | null },
  locale: 'ja' | 'en'
): string | null {
  return (locale === 'en' && product.description_en ? product.description_en : product.description) ?? null
}
