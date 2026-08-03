import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'
import { getPublishedShopIds } from '@/lib/shop'
import { SHIPPING_FEE } from '@/lib/constants'
import siteConfig from '@/site.config'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Per-user cost tracking (in-memory, resets on deploy/restart)
// Key: IP, Value: { cost: cents spent, resetAt: timestamp }
const userCosts = new Map<string, { cost: number; resetAt: number }>()
const MAX_COST_PER_USER = 50 // ¥50 per user per day
const COST_PER_REQUEST = 0.3 // ~¥0.3 per request (conservative estimate)
const DAY_MS = 24 * 60 * 60 * 1000

function checkUserBudget(ip: string): boolean {
  const now = Date.now()
  const entry = userCosts.get(ip)

  if (!entry || now > entry.resetAt) {
    userCosts.set(ip, { cost: COST_PER_REQUEST, resetAt: now + DAY_MS })
    return true
  }

  if (entry.cost + COST_PER_REQUEST > MAX_COST_PER_USER) {
    return false
  }

  entry.cost += COST_PER_REQUEST
  return true
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'
  const { success } = rateLimit(`concierge:${ip}`, 10, 60000)
  if (!success) {
    return NextResponse.json({ error: 'リクエストが多すぎます。少し待ってからお試しください。' }, { status: 429 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI機能は現在準備中です。' }, { status: 503 })
  }

  // Check per-user daily budget
  if (!checkUserBudget(ip)) {
    return NextResponse.json({ error: '本日のご利用上限に達しました。また明日ご利用ください。' }, { status: 429 })
  }

  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'メッセージが必要です。' }, { status: 400 })
    }

    // Fetch published products for context (this brand's shops only)
    const admin = createAdminClient()
    const shopIds = await getPublishedShopIds()
    const { data: products } = await admin
      .from('products')
      .select('id, name, price, description, stock, images, item_type, category:categories(name)')
      .eq('is_published', true)
      .eq('item_type', 'physical')
      .in('shop_id', shopIds)
      .order('sort_order', { ascending: true })

    const productList = (products || []).map((p: any) => {
      const category = p.category?.name || ''
      const status = p.stock === 0 ? '売切れ' : '在庫あり'
      const priceText = p.price === 0 ? '要問合せ' : `¥${p.price.toLocaleString()}`
      return `- ${p.name}（${priceText}）${category ? `[${category}]` : ''} ${status} ID:${p.id}`
    }).join('\n')

    // 枡・SILVA 前提の案内はFOMUSブランドのデプロイでのみ使う
    const brandGuidance = siteConfig.features.brandPages
      ? `- 防水コーティングオプションがあることを適宜伝える
- ${siteConfig.name}は日本の伝統工芸「枡」をベースにしたエンターテインメントカンパニー

## 取り扱い商品
${productList}

## 提案の方針
- 贈り物 → ${siteConfig.name}枡（¥2,200）や蓋付き枡がおすすめ
- 初めての方 → ミニ${siteConfig.name}枡（¥1,500）やSILVA（¥990）から
- 法人・大量注文 → 10個セットや枡タワーを案内
- 日本酒好き → コーティング付き${siteConfig.name}枡を推奨
- ユニーク → 首掛け枡、アラビア語枡、MASUKAMEなど`
      : `
## 取り扱い商品
${productList}

## 提案の方針
- 上記の取り扱い商品だけを根拠に提案する（ブランドの由来や商品の背景を推測して語らない）`

    const systemPrompt = `あなたは${siteConfig.name}公式オンラインショップの商品コンシェルジュです。
お客様の用途・予算・好みをヒアリングして、最適な商品を提案してください。

## ルール
- 親しみやすく、簡潔に回答（2-3文程度）
- 商品を提案する際は必ず商品名と価格を含める
- 商品リンクは /shop/{商品ID} の形式で案内する
- 存在しない商品は絶対に提案しない
- 予算を聞かれたら素直に価格帯を案内する
- 在庫切れの商品は「現在売り切れです」と伝える
- 送料は国内¥${SHIPPING_FEE.toLocaleString()}
${brandGuidance}`

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: systemPrompt,
      messages: messages.slice(-6).map((m: any) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({ message: text })
  } catch (error) {
    console.error('Concierge error:', error)
    return NextResponse.json({ error: 'エラーが発生しました。' }, { status: 500 })
  }
}
