// Session-based cart for guest users
const CART_KEY = 'fomus_cart'

export interface LocalCartItem {
  product_id: string
  quantity: number
  shop_id?: string
}

export function getLocalCart(): LocalCartItem[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(CART_KEY)
  return data ? JSON.parse(data) : []
}

export function setLocalCart(items: LocalCartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

export function addToLocalCart(productId: string, quantity: number = 1, shopId?: string) {
  const cart = getLocalCart()
  const existing = cart.find(item => item.product_id === productId)
  if (existing) {
    existing.quantity += quantity
  } else {
    cart.push({ product_id: productId, quantity, shop_id: shopId })
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

export function removeFromLocalCart(productId: string) {
  const cart = getLocalCart().filter(item => item.product_id !== productId)
  setLocalCart(cart)
  return cart
}

export function updateLocalCartQuantity(productId: string, quantity: number) {
  const cart = getLocalCart()
  const item = cart.find(item => item.product_id === productId)
  if (item) {
    item.quantity = quantity
    if (item.quantity <= 0) {
      return removeFromLocalCart(productId)
    }
  }
  setLocalCart(cart)
  return cart
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
