/**
 * FOMUS GUILD 会員の紹介コードによる売上通知。
 *
 * 決済が確定した注文に紹介コードが付いている場合、GUILD側
 * （https://guild-app.fomusglobal.com）へ売上額を通知し、そのコードを
 * 持つ会員へ売上の一定割合をポイントで還元してもらう。
 *
 * GUILD側の /api/sales/credit は order_id をUNIQUE制約で冪等化しているため、
 * このリクエストが重複しても二重付与にはならない。
 *
 * 注意: MEMBERSHIP_URL(guild.fomus.co.jp)は現在DNS未解決の別ドメインのため
 * 使用しない。必ず GUILD_APP_URL（guild-app.fomusglobal.com）を使うこと。
 */

interface OrderForReferral {
  id: string
  referral_code?: string | null
  subtotal: number
  coupon_discount?: number | null
  currency?: string | null
  email: string
}

export async function notifyGuildSalesCredit(order: OrderForReferral): Promise<void> {
  const code = order.referral_code?.trim()
  if (!code) return

  // GUILD側のポイント経済はJPY前提。EUR決済は対象外（将来対応可）。
  if (order.currency && order.currency !== 'jpy') return

  const guildUrl = process.env.GUILD_APP_URL
  const secret = process.env.SALES_WEBHOOK_SECRET
  if (!guildUrl || !secret) {
    console.error('GUILD sales credit skipped: GUILD_APP_URL or SALES_WEBHOOK_SECRET not configured')
    return
  }

  // コミッション対象額 = 商品代金 - クーポン割引（送料は含めない）
  const amountJpy = Math.round(Math.max(0, order.subtotal - (order.coupon_discount || 0)))
  if (amountJpy <= 0) return

  try {
    const res = await fetch(`${guildUrl.replace(/\/$/, '')}/api/sales/credit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sales-secret': secret,
      },
      body: JSON.stringify({
        orderId: order.id,
        code,
        amountJpy,
        buyerEmail: order.email,
      }),
    })
    if (!res.ok) {
      console.error('GUILD sales credit request failed:', order.id, res.status, await res.text().catch(() => ''))
    }
  } catch (err) {
    console.error('GUILD sales credit request error:', order.id, err)
  }
}
