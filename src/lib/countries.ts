// Shipping destination countries (ISO 3166-1 alpha-2)
// Order: Japan first, then main overseas markets.

export interface ShippingCountry {
  code: string
  name: string // English
  nameJa: string
}

export const SHIPPING_COUNTRIES: ShippingCountry[] = [
  { code: 'JP', name: 'Japan', nameJa: '日本' },
  { code: 'US', name: 'United States', nameJa: 'アメリカ' },
  { code: 'CA', name: 'Canada', nameJa: 'カナダ' },
  { code: 'GB', name: 'United Kingdom', nameJa: 'イギリス' },
  { code: 'FR', name: 'France', nameJa: 'フランス' },
  { code: 'DE', name: 'Germany', nameJa: 'ドイツ' },
  { code: 'IT', name: 'Italy', nameJa: 'イタリア' },
  { code: 'ES', name: 'Spain', nameJa: 'スペイン' },
  { code: 'NL', name: 'Netherlands', nameJa: 'オランダ' },
  { code: 'BE', name: 'Belgium', nameJa: 'ベルギー' },
  { code: 'CH', name: 'Switzerland', nameJa: 'スイス' },
  { code: 'AT', name: 'Austria', nameJa: 'オーストリア' },
  { code: 'SE', name: 'Sweden', nameJa: 'スウェーデン' },
  { code: 'DK', name: 'Denmark', nameJa: 'デンマーク' },
  { code: 'NO', name: 'Norway', nameJa: 'ノルウェー' },
  { code: 'FI', name: 'Finland', nameJa: 'フィンランド' },
  { code: 'IE', name: 'Ireland', nameJa: 'アイルランド' },
  { code: 'PT', name: 'Portugal', nameJa: 'ポルトガル' },
  { code: 'LU', name: 'Luxembourg', nameJa: 'ルクセンブルク' },
  { code: 'AU', name: 'Australia', nameJa: 'オーストラリア' },
  { code: 'NZ', name: 'New Zealand', nameJa: 'ニュージーランド' },
  { code: 'SG', name: 'Singapore', nameJa: 'シンガポール' },
  { code: 'HK', name: 'Hong Kong', nameJa: '香港' },
  { code: 'AE', name: 'United Arab Emirates', nameJa: 'アラブ首長国連邦' },
]

export const SHIPPING_COUNTRY_CODES = SHIPPING_COUNTRIES.map((c) => c.code)

export function isValidShippingCountry(code: string): boolean {
  return SHIPPING_COUNTRY_CODES.includes(code)
}

export function countryLabel(code: string, locale: 'ja' | 'en'): string {
  const c = SHIPPING_COUNTRIES.find((x) => x.code === code)
  if (!c) return code
  return locale === 'ja' ? c.nameJa : c.name
}
