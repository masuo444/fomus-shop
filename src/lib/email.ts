import { Resend } from 'resend'
import type { Order, OrderItem } from '@/lib/types'
import { formatPrice, formatDate } from '@/lib/utils'
import { ORDER_STATUS_LABELS, SHIPPING_CARRIERS } from '@/lib/types'
import siteConfig from '@/site.config'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = siteConfig.emailFrom
const ADMIN_EMAIL = siteConfig.adminNotificationEmail

function baseLayout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="ja">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:20px;">
  <div style="background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
    <div style="background:#111;padding:24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:18px;letter-spacing:2px;">${siteConfig.name}</h1>
    </div>
    <div style="padding:32px 24px;">
      <h2 style="margin:0 0 24px;font-size:20px;color:#111;">${title}</h2>
      ${content}
    </div>
    <div style="padding:16px 24px;background:#f9f9f9;border-top:1px solid #eee;text-align:center;">
      <p style="margin:0;font-size:12px;color:#999;">${siteConfig.name}</p>
    </div>
  </div>
</div>
</body>
</html>`
}

function itemsTable(orderItems: OrderItem[], currency: Order['currency'] = 'jpy'): string {
  const rows = orderItems
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#333;">${item.product_name}</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#666;text-align:center;">${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#333;text-align:right;">${formatPrice(item.price * item.quantity, currency)}</td>
    </tr>`
    )
    .join('')

  return `
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <thead>
      <tr>
        <th style="padding:8px 0;border-bottom:2px solid #eee;font-size:12px;color:#999;text-align:left;font-weight:600;">商品名</th>
        <th style="padding:8px 0;border-bottom:2px solid #eee;font-size:12px;color:#999;text-align:center;font-weight:600;">数量</th>
        <th style="padding:8px 0;border-bottom:2px solid #eee;font-size:12px;color:#999;text-align:right;font-weight:600;">小計</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`
}

export async function sendOrderConfirmation(order: Order, orderItems: OrderItem[]) {
  const content = `
    <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 20px;">
      ${order.shipping_name} 様<br><br>
      この度はご注文いただき、誠にありがとうございます。<br>
      以下の内容でご注文を承りました。
    </p>

    <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 8px;font-size:12px;color:#999;">注文番号</p>
      <p style="margin:0;font-size:16px;font-weight:600;color:#111;">#${order.order_number}</p>
    </div>

    ${itemsTable(orderItems, order.currency)}

    <div style="margin:16px 0;padding:16px 0;border-top:1px solid #eee;">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:14px;color:#666;">${order.currency === 'eur' ? 'Subtotal' : '小計'}</span>
        <span style="font-size:14px;color:#333;">${formatPrice(order.subtotal, order.currency)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:14px;color:#666;">${order.currency === 'eur' ? 'Shipping' : '送料'}</span>
        <span style="font-size:14px;color:#333;">${formatPrice(order.shipping_fee, order.currency)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid #eee;">
        <span style="font-size:16px;font-weight:600;color:#111;">${order.currency === 'eur' ? 'Total' : '合計'}</span>
        <span style="font-size:16px;font-weight:600;color:#111;">${formatPrice(order.total, order.currency)}</span>
      </div>
    </div>

    <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 8px;font-size:12px;color:#999;">配送先</p>
      <p style="margin:0;font-size:14px;color:#333;line-height:1.6;">
        〒${order.shipping_postal_code}<br>
        ${order.shipping_address}<br>
        ${order.shipping_name}
      </p>
    </div>

    <p style="font-size:13px;color:#999;line-height:1.6;margin:24px 0 0;">
      商品の発送準備が整い次第、改めてご連絡いたします。
    </p>
  `

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: order.email,
      subject: `【${siteConfig.name}】ご注文ありがとうございます（#${order.order_number}）`,
      html: baseLayout('ご注文ありがとうございます', content),
    })
  } catch (err) {
    console.error('Failed to send order confirmation email:', err)
  }
}

export async function sendShippingNotification(order: Order) {
  const carrierName = order.shipping_carrier
    ? SHIPPING_CARRIERS[order.shipping_carrier] || order.shipping_carrier
    : ''

  const content = `
    <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 20px;">
      ${order.shipping_name} 様<br><br>
      ご注文いただいた商品を発送いたしました。
    </p>

    <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 8px;font-size:12px;color:#999;">注文番号</p>
      <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#111;">#${order.order_number}</p>
      ${
        carrierName
          ? `<p style="margin:0 0 8px;font-size:12px;color:#999;">配送業者</p>
             <p style="margin:0 0 16px;font-size:14px;color:#333;">${carrierName}</p>`
          : ''
      }
      ${
        order.tracking_number
          ? `<p style="margin:0 0 8px;font-size:12px;color:#999;">追跡番号</p>
             <p style="margin:0;font-size:14px;font-weight:600;color:#111;">${order.tracking_number}</p>`
          : ''
      }
    </div>

    <p style="font-size:13px;color:#999;line-height:1.6;margin:24px 0 0;">
      お届けまでしばらくお待ちください。
    </p>
  `

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: order.email,
      subject: `【${siteConfig.name}】商品を発送しました（#${order.order_number}）`,
      html: baseLayout('商品を発送しました', content),
    })
  } catch (err) {
    console.error('Failed to send shipping notification email:', err)
  }
}

export async function sendOrderNotificationToAdmin(order: Order, orderItems: OrderItem[]) {
  const content = `
    <p style="font-size:14px;color:#555;line-height:1.7;margin:0 0 20px;">
      新しい注文が入りました。
    </p>

    <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 8px;font-size:12px;color:#999;">注文番号</p>
      <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#111;">#${order.order_number}</p>
      <p style="margin:0 0 8px;font-size:12px;color:#999;">顧客</p>
      <p style="margin:0 0 4px;font-size:14px;color:#333;">${order.shipping_name}</p>
      <p style="margin:0;font-size:13px;color:#666;">${order.email}</p>
    </div>

    ${itemsTable(orderItems, order.currency)}

    <div style="margin:16px 0;padding:16px 0;border-top:1px solid #eee;">
      <div style="display:flex;justify-content:space-between;">
        <span style="font-size:16px;font-weight:600;color:#111;">合計</span>
        <span style="font-size:16px;font-weight:600;color:#111;">${formatPrice(order.total, order.currency)}</span>
      </div>
    </div>

    <div style="background:#f9f9f9;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0 0 8px;font-size:12px;color:#999;">配送先</p>
      <p style="margin:0;font-size:14px;color:#333;line-height:1.6;">
        〒${order.shipping_postal_code}<br>
        ${order.shipping_address}<br>
        ${order.shipping_name}<br>
        ${order.shipping_phone}
      </p>
    </div>
  `

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `【${siteConfig.name}】新しい注文が入りました（#${order.order_number}）`,
      html: baseLayout('新しい注文が入りました', content),
    })
  } catch (err) {
    console.error('Failed to send admin notification email:', err)
  }
}
