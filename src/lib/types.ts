export interface Shop {
  id: string
  name: string
  slug: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  owner_id: string
  royalty_percentage: number
  is_published: boolean
  commission_rate: number
  status: 'active' | 'suspended'
  contact_email: string | null
  invoice_registration_number: string | null
  created_at: string
}

export interface Commission {
  id: string
  order_id: string
  shop_id: string
  order_total: number
  commission_rate: number
  commission_amount: number
  partner_amount: number
  status: 'pending' | 'paid'
  created_at: string
  shop?: Shop
  order?: Order
}

export interface Product {
  id: string
  shop_id: string
  name: string
  description: string | null
  price: number
  compare_at_price: number | null
  images: string[]
  category_id: string | null
  category?: Category
  stock: number
  is_published: boolean
  item_type: 'physical' | 'digital'
  tax_rate: number
  quantity_limit: number | null
  sort_order: number
  preorder_enabled: boolean
  preorder_start_date: string | null
  preorder_end_date: string | null
  weight_grams: number | null
  member_price: number | null
  price_eur: number | null
  member_price_eur: number | null
  compare_at_price_eur: number | null
  created_at: string
  updated_at: string
  product_options?: ProductOption[]
  product_shipping_methods?: ProductShippingMethod[]
}

export interface ShippingMethod {
  id: string
  shop_id: string
  name: string
  type: 'flat' | 'regional' | 'free'
  flat_fee: number
  is_default: boolean
  sort_order: number
  created_at: string
}

export interface ProductShippingMethod {
  id: string
  product_id: string
  shipping_method_id: string
  shipping_method?: ShippingMethod
}

export interface ProductOption {
  id: string
  product_id: string
  name: string
  required: boolean
  sort_order: number
  created_at: string
  choices?: ProductOptionChoice[]
}

export interface ProductOptionChoice {
  id: string
  option_id: string
  label: string
  price_adjustment: number
  stock: number | null
  sort_order: number
}

export interface Category {
  id: string
  shop_id: string
  name: string
  slug: string
  sort_order: number
}

export interface CartItem {
  id: string
  user_id: string | null
  session_id: string | null
  product_id: string
  quantity: number
  product?: Product
}

export interface Order {
  id: string
  order_number: string
  shop_id: string
  user_id: string | null
  email: string
  status: 'pending' | 'awaiting_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  subtotal: number
  shipping_fee: number
  total: number
  shipping_name: string
  shipping_postal_code: string
  shipping_address: string
  shipping_phone: string
  tracking_number: string | null
  shipping_carrier: string | null
  note: string | null
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  currency: 'jpy' | 'eur'
  stripe_invoice_id: string | null
  invoice_number: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  price: number
  quantity: number
  image_url: string | null
  product?: Product
}

export interface Profile {
  id: string
  email: string
  name: string | null
  phone: string | null
  postal_code: string | null
  address: string | null
  role: 'customer' | 'admin' | 'partner'
  shop_id: string | null
  points: number
  total_points_earned: number
  rank: 'bronze' | 'silver' | 'gold' | 'premium'
  birthday: string | null
  referral_code: string | null
  referred_by: string | null
  is_premium_member: boolean
  premium_linked_at: string | null
  digital_access_enabled: boolean
  created_at: string
}

export interface PointTransaction {
  id: string
  user_id: string
  amount: number
  type: 'purchase' | 'referral' | 'birthday' | 'registration' | 'spend' | 'adjustment' | 'premium_bonus' | 'resale' | 'point_exchange' | 'payout'
  description: string | null
  order_id: string | null
  created_at: string
}

export interface Favorite {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  status: 'pending' | 'completed'
  created_at: string
}

export const RANK_LABELS: Record<Profile['rank'], string> = {
  bronze: 'ブロンズ',
  silver: 'シルバー',
  gold: 'ゴールド',
  premium: 'Premium会員',
}

export const RANK_POINT_RATES: Record<Profile['rank'], number> = {
  bronze: 5,
  silver: 7,
  gold: 10,
  premium: 10,
}

export const RANK_THRESHOLDS = {
  silver: 3000,
  gold: 10000,
}

export interface Customer {
  id: string
  shop_id: string
  user_id: string | null
  email: string
  name: string | null
  phone: string | null
  total_orders: number
  total_spent: number
  last_order_at: string | null
  note: string | null
  created_at: string
}

// Digital / NFT-like types
export interface DigitalItem {
  id: string
  shop_id: string
  name: string
  description: string | null
  image_url: string | null
  price: number
  total_supply: number
  issued_count: number
  royalty_percentage: number
  resale_enabled: boolean
  is_published: boolean
  item_category: 'collectible' | 'ticket' | 'art' | 'other'
  created_by: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export const DIGITAL_ITEM_CATEGORIES: Record<DigitalItem['item_category'], string> = {
  collectible: 'コレクティブル',
  ticket: 'チケット',
  art: 'アート',
  other: 'その他',
}

export interface DigitalToken {
  id: string
  token_number: number
  digital_item_id: string
  current_owner_id: string
  original_price: number
  status: 'owned' | 'listed' | 'transferred'
  created_at: string
  digital_item?: DigitalItem
  owner?: Profile
}

export interface OwnershipTransfer {
  id: string
  digital_token_id: string
  from_user_id: string | null
  to_user_id: string
  price: number
  royalty_amount: number
  seller_amount: number
  transfer_type: 'purchase' | 'resale' | 'gift'
  stripe_payment_intent_id: string | null
  created_at: string
}

export interface ResaleListing {
  id: string
  digital_token_id: string
  seller_id: string
  price: number
  status: 'active' | 'sold' | 'cancelled'
  created_at: string
  updated_at: string
  digital_token?: DigitalToken
  seller?: Profile
}

export interface PayoutRequest {
  id: string
  user_id: string
  points: number
  amount: number
  fee: number
  bank_name: string
  branch_name: string
  account_type: 'ordinary' | 'current'
  account_number: string
  account_holder: string
  status: 'pending' | 'completed' | 'rejected'
  admin_note: string | null
  created_at: string
  completed_at: string | null
  user?: Profile
}

export const ORDER_STATUS_LABELS: Record<Order['status'], string> = {
  pending: '未決済',
  awaiting_payment: '入金待ち',
  paid: '入金済み',
  processing: '準備中',
  shipped: '発送済み',
  delivered: '配達完了',
  cancelled: 'キャンセル',
  refunded: '返金済み',
}

export const SHIPPING_CARRIERS: Record<string, string> = {
  yamato: 'ヤマト運輸',
  sagawa: '佐川急便',
  japan_post: '日本郵便',
  other: 'その他',
}

export interface Coupon {
  id: string
  shop_id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number
  max_uses: number | null
  used_count: number
  starts_at: string | null
  expires_at: string | null
  is_active: boolean
  created_at: string
}
