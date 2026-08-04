// i18n dictionary for the shop list / product detail pages and their components.
// Default locale is 'ja' — Japanese pages must render exactly as before.
// Templates use {placeholders}; render them with fmt().

export type ProductLocale = 'ja' | 'en'

const ja = {
  // Breadcrumb / shop list page
  breadcrumbHome: 'ホーム',
  breadcrumbShop: '商品一覧',
  shopTitle: '商品一覧',
  all: 'すべて',
  sortLabel: '並び替え:',
  sortNewest: '新着順',
  sortPriceAsc: '安い順',
  sortPriceDesc: '高い順',
  viewAll: 'すべて見る',
  otherCategory: 'その他',
  noProducts: '商品がありません',

  // Product detail
  addedToCart: 'カートに追加しました',
  addToCart: 'カートに追加',
  buyNow: '購入する',
  support: '支援する',
  quantity: '数量',
  reviewsSuffix: '件のレビュー',
  contactForPrice: '価格はお問い合わせください',
  memberPriceBadge: '{name}会員価格',
  memberPriceHint: '{name}会員なら {price}',
  joinForMemberPrice: '{name}に入会して会員価格で購入',
  memberBenefit: '{name}会員特典あり',
  madeToOrderNote: '完全受注生産 — 数量限定',
  outOfStock: '在庫切れ',
  lowStock: '残りわずか（{n}点）',
  inStock: '在庫あり',
  saleUntil: '{date} まで販売',
  saleFrom: '{date} 販売開始',
  salePeriodEnded: '販売期間は終了しました',
  shippingIncluded: '送料込み',
  optionsTotal: 'オプション合計',
  optionSelectPrompt: '「{options}」を選択してください',
  optionJoiner: '」「',
  mixedShopsConfirm: 'カートには別のショップの商品が入っています。カートを空にしてこの商品を追加しますか？',
  contactSubject: '「{name}」について',
  contactCta: 'お問い合わせ・ご相談',
  contactNote: 'デザイン・価格など、お気軽にご相談ください',
  beforeSaleButton: '販売開始前です',
  afterSaleButton: '販売期間終了',
  shippingLine: '国内送料 ¥1,000 / 3〜5営業日でお届け',
  qualityLine: '安心の品質保証 / 不良品は無料交換対応',
  paymentBrands: 'Visa / Mastercard / Amex / JCB / JPYC',
  relatedProducts: '関連商品',

  // ProductReviews
  customerReviews: 'カスタマーレビュー',
  verifiedPurchase: '認証済み購入',
  reviewsCountSuffix: '件',

  // ProductOptionSelector
  required: '必須',
  none: 'なし',
  choiceOutOfStock: '品切れ',
  noSelection: '選択しない',
  pleaseSelect: '選択してください',

  // ShareButtons
  share: 'シェア',
  shareOnX: 'Xでシェア',
  shareOnLine: 'LINEでシェア',
  copyLink: 'リンクをコピー',

  // RecentlyViewed
  recentlyViewed: '最近見た商品',

  // FavoriteButton
  removeFavorite: 'お気に入りから削除',
  addFavorite: 'お気に入りに追加',

  // MemberCTA
  ctaBecomeMember: '{name}会員になる',
  ctaCompactDesc: '{name}限定価格・限定商品',
  ctaLearnMore: '詳しく見る',
  ctaFullDesc: '{name}会員だけの特別な特典をご利用いただけます',
  ctaBenefitPrice: '{name}限定価格で購入',
  ctaBenefitAccess: '限定商品へのアクセス',
  ctaJoin: '{name}に入会する',
}

const en: typeof ja = {
  breadcrumbHome: 'Home',
  breadcrumbShop: 'All Products',
  shopTitle: 'All Products',
  all: 'All',
  sortLabel: 'Sort:',
  sortNewest: 'Newest',
  sortPriceAsc: 'Price: Low to High',
  sortPriceDesc: 'Price: High to Low',
  viewAll: 'View all',
  otherCategory: 'Other',
  noProducts: 'No products available',

  addedToCart: 'Added to cart',
  addToCart: 'Add to Cart',
  buyNow: 'Buy Now',
  support: 'Support This Project',
  quantity: 'Quantity',
  reviewsSuffix: ' reviews',
  contactForPrice: 'Contact us for pricing',
  memberPriceBadge: '{name} Member Price',
  memberPriceHint: '{name} members: {price}',
  joinForMemberPrice: 'Join {name} to unlock member pricing',
  memberBenefit: '{name} member benefits available',
  madeToOrderNote: 'Made to order — Limited quantity',
  outOfStock: 'Out of stock',
  lowStock: 'Only {n} left in stock',
  inStock: 'In stock',
  saleUntil: 'On sale until {date}',
  saleFrom: 'On sale from {date}',
  salePeriodEnded: 'This sale has ended',
  shippingIncluded: 'Shipping included',
  optionsTotal: 'Options total',
  optionSelectPrompt: 'Please select: {options}',
  optionJoiner: ', ',
  mixedShopsConfirm: 'Your cart contains items from another shop. Empty the cart and add this item?',
  contactSubject: 'Inquiry about "{name}"',
  contactCta: 'Contact Us',
  contactNote: 'Feel free to ask about design, pricing, and more',
  beforeSaleButton: 'Coming soon',
  afterSaleButton: 'Sale ended',
  shippingLine: 'Domestic shipping (Japan) ¥1,000 / Ships in 3-5 business days',
  qualityLine: 'Quality guaranteed / Free replacement for defective items',
  paymentBrands: 'Visa / Mastercard / Amex / JCB',
  relatedProducts: 'Related Products',

  customerReviews: 'Customer Reviews',
  verifiedPurchase: 'Verified Purchase',
  reviewsCountSuffix: '',

  required: 'Required',
  none: 'None',
  choiceOutOfStock: 'Out of stock',
  noSelection: 'No selection',
  pleaseSelect: 'Please select',

  share: 'Share',
  shareOnX: 'Share on X',
  shareOnLine: 'Share on LINE',
  copyLink: 'Copy link',

  recentlyViewed: 'Recently Viewed',

  removeFavorite: 'Remove from favorites',
  addFavorite: 'Add to favorites',

  ctaBecomeMember: 'Become a {name} Member',
  ctaCompactDesc: 'Exclusive {name} pricing & products',
  ctaLearnMore: 'Learn More',
  ctaFullDesc: 'Enjoy special benefits exclusive to {name} members',
  ctaBenefitPrice: 'Member-only pricing',
  ctaBenefitAccess: 'Access to exclusive products',
  ctaJoin: 'Join {name}',
}

export const productDict: Record<ProductLocale, typeof ja> = { ja, en }

/** Fill {placeholders} in a dictionary template. */
export function fmt(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''))
}

/** Date locale for toLocaleDateString. */
export function dateLocale(locale: ProductLocale): string {
  return locale === 'en' ? 'en-US' : 'ja-JP'
}

/** Category display name (uses name_en if the column exists, falls back to Japanese). */
export function categoryName(
  category: { name: string; name_en?: string | null },
  locale: ProductLocale
): string {
  return locale === 'en' && category.name_en ? category.name_en : category.name
}
