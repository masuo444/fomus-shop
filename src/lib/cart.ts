// Session-based cart for guest users
const CART_KEY = 'fomus_cart'

export interface SelectedOptions {
  [optionName: string]: {
    choiceId: string
    label: string
    priceAdjustment: number
  }
}

export interface LocalCartItem {
  product_id: string
  quantity: number
  shop_id?: string
  selected_options?: SelectedOptions
}

export function getLocalCart(): LocalCartItem[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(CART_KEY)
  return data ? JSON.parse(data) : []
}

export function setLocalCart(items: LocalCartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

/** Generate a unique cart key for a product + options combination */
function cartItemKey(productId: string, options?: SelectedOptions): string {
  if (!options || Object.keys(options).length === 0) return productId
  const sorted = Object.entries(options).sort(([a], [b]) => a.localeCompare(b))
  return `${productId}__${sorted.map(([k, v]) => `${k}:${v.choiceId}`).join('|')}`
}

export function addToLocalCart(productId: string, quantity: number = 1, shopId?: string, selectedOptions?: SelectedOptions) {
  const cart = getLocalCart()
  const key = cartItemKey(productId, selectedOptions)
  const existing = cart.find(item => cartItemKey(item.product_id, item.selected_options) === key)
  if (existing) {
    existing.quantity += quantity
  } else {
    cart.push({ product_id: productId, quantity, shop_id: shopId, selected_options: selectedOptions })
  }
  setLocalCart(cart)
  return cart
}

/** Check if adding a product from this shop would mix shops in the cart */
export function wouldMixShops(shopId: string): boolean {
  const cart = getLocalCart()
  if (cart.length === 0) return false
  const existingShopIds = cart.filter(i => i.shop_id).map(i => i.shop_id!)
  if (existingShopIds.length === 0) return false
  return existingShopIds.some(id => id !== shopId)
}

export function removeFromLocalCart(productId: string, selectedOptions?: SelectedOptions) {
  const key = cartItemKey(productId, selectedOptions)
  const cart = getLocalCart().filter(item => cartItemKey(item.product_id, item.selected_options) !== key)
  setLocalCart(cart)
  return cart
}

export function updateLocalCartQuantity(productId: string, quantity: number, selectedOptions?: SelectedOptions) {
  const cart = getLocalCart()
  const key = cartItemKey(productId, selectedOptions)
  const item = cart.find(item => cartItemKey(item.product_id, item.selected_options) === key)
  if (item) {
    item.quantity = quantity
    if (item.quantity <= 0) {
      return removeFromLocalCart(productId, selectedOptions)
    }
  }
  setLocalCart(cart)
  return cart
}

/** Get the total price adjustment from selected options */
export function getOptionsAdjustment(options?: SelectedOptions): number {
  if (!options) return 0
  return Object.values(options).reduce((sum, opt) => sum + opt.priceAdjustment, 0)
}

/** Format selected options as display text */
export function formatOptionsText(options?: SelectedOptions): string {
  if (!options || Object.keys(options).length === 0) return ''
  return Object.entries(options)
    .map(([name, opt]) => `${name}: ${opt.label}`)
    .join(' / ')
}

export function clearLocalCart() {
  localStorage.removeItem(CART_KEY)
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sessionId = localStorage.getItem('fomus_session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('fomus_session_id', sessionId)
  }
  return sessionId
}
