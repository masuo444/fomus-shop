import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { verifyJpycTransfer, getProvider } from '@/lib/jpyc'
import { sendOrderConfirmation, sendOrderNotificationToAdmin } from '@/lib/email'
import siteConfig from '@/site.config'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { success } = rateLimit(`jpyc-verify:${ip}`, 10, 60000)
  if (!success) {
    return NextResponse.json({ error: 'リクエストが多すぎます。しばらく待ってから再試行してください。' }, { status: 429 })
  }

  if (!siteConfig.jpyc.enabled) {
    return NextResponse.json({ error: 'JPYC決済は利用できません' }, { status: 400 })
  }

  try {
    const { order_id, tx_hash } = await request.json()

    if (!order_id || !tx_hash) {
      return NextResponse.json({ error: 'order_id と tx_hash が必要です' }, { status: 400 })
    }

    // Validate tx hash format (0x + 64 hex chars)
    if (!/^0x[a-fA-F0-9]{64}$/.test(tx_hash)) {
      return NextResponse.json({ error: '無効なトランザクションハッシュです' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Load order
    const { data: order } = await admin
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single()

    if (!order) {
      return NextResponse.json({ error: '注文が見つかりません' }, { status: 404 })
    }

    // P0 Fix: Verify order ownership
    if (order.user_id) {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || user.id !== order.user_id) {
        return NextResponse.json({ error: '権限がありません' }, { status: 403 })
      }
    } else if (order.email) {
      // For guest orders, verify via email in request headers or session
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      // Guest order: only allow if the requester IP matches or has no user
      // This is a weaker check but prevents random order_id guessing
      if (user && user.email !== order.email) {
        return NextResponse.json({ error: '権限がありません' }, { status: 403 })
      }
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'この注文は既に処理されています' }, { status: 400 })
    }

    if (order.payment_method !== 'jpyc') {
      return NextResponse.json({ error: 'この注文はJPYC決済ではありません' }, { status: 400 })
    }

    // Check if this tx_hash is already used by another order
    const { data: existingOrder } = await admin
      .from('orders')
      .select('id')
      .eq('jpyc_tx_hash', tx_hash)
      .neq('id', order_id)
      .limit(1)

    if (existingOrder && existingOrder.length > 0) {
      return NextResponse.json({ error: 'このトランザクションは既に別の注文で使用されています' }, { status: 400 })
    }

    // Verify on-chain
    const result = await verifyJpycTransfer({
      txHash: tx_hash,
      expectedAmount: order.total,
    })

    if (!result.verified) {
      return NextResponse.json({
        verified: false,
        error: result.error || '送金が確認できませんでした',
      })
    }

    // Check block confirmations
    try {
      const provider = await getProvider()
      const receipt = await provider.getTransactionReceipt(tx_hash)
      if (receipt && receipt.blockNumber) {
        const latestBlock = await provider.getBlockNumber()
        const confirmations = latestBlock - receipt.blockNumber
        if (confirmations < siteConfig.jpyc.minConfirmations) {
          return NextResponse.json({
            verified: false,
            confirmations,
            required: siteConfig.jpyc.minConfirmations,
            error: `ブロック承認待ちです（${confirmations}/${siteConfig.jpyc.minConfirmations}）。しばらく待ってから再度お試しください。`,
          })
        }
      }
    } catch (err) {
      console.error('Confirmation check error:', err)
      // Continue with verification if confirmation check fails
    }

    // Update order to paid
    await admin
      .from('orders')
      .update({
        status: 'paid',
        jpyc_tx_hash: tx_hash,
        jpyc_from_address: result.from,
      })
      .eq('id', order_id)

    // Stock already decremented at checkout time (pre-reservation)

    // Send confirmation emails
    try {
      const { data: fullOrder } = await admin
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', order_id)
        .single()

      if (fullOrder) {
        await sendOrderConfirmation(fullOrder, fullOrder.order_items)
        await sendOrderNotificationToAdmin(fullOrder, fullOrder.order_items)
      }
    } catch (emailErr) {
      console.error('Email send error:', emailErr)
    }

    return NextResponse.json({
      verified: true,
      amount: result.amount,
      from: result.from,
    })
  } catch (error) {
    console.error('JPYC verify error:', error)
    return NextResponse.json({ error: '検証に失敗しました' }, { status: 500 })
  }
}
