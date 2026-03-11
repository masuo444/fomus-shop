import { useState, useEffect } from 'react'
import type { Currency } from '@/lib/currency'

function getCurrencyFromCookie(): Currency {
  if (typeof document === 'undefined') return 'jpy'
  const match = document.cookie.match(/(?:^|; )currency=([^;]*)/)
  return match?.[1] === 'eur' ? 'eur' : 'jpy'
}

export function useCurrency(): Currency {
  const [currency, setCurrency] = useState<Currency>('jpy')

  useEffect(() => {
    setCurrency(getCurrencyFromCookie())
  }, [])

  return currency
}

export function setCurrencyCookie(currency: Currency) {
  document.cookie = `currency=${currency};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`
}
