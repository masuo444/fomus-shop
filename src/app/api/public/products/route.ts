import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import siteConfig from '@/site.config'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://shop.fomus.co.jp'
const ALLOWED_ORIGIN = process.env.PUBLIC_API_CORS_ORIGIN || '*'
const MAX_LIMIT = 50
const DEFAULT_LIMIT = 20

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() })
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams
    const tag = params.get('tag')
    const categoryId = params.get('category')
    const shopSlug = params.get('shop')
    const limit = Math.min(
      Math.max(1, Number(params.get('limit')) || DEFAULT_LIMIT),
      MAX_LIMIT
    )

    const admin = createAdminClient()

    // Resolve shop filter
    let shopIds: string[] = []
    if (shopSlug) {
      const { data: shop } = await admin
        .from('shops')
        .select('id')
        .eq('slug', shopSlug)
        .eq('is_published', true)
        .eq('status', 'active')
        .single()
      if (!shop) {
        return NextResponse.json([], {
          headers: { ...corsHeaders(), 'X-Total-Count': '0' },
        })
      }
      shopIds = [shop.id]
    } else {
      const { data: shops } = await admin
        .from('shops')
        .select('id')
        .eq('is_published', true)
        .eq('status', 'active')
      shopIds = shops?.map((s) => s.id) ?? []
    }

    if (shopIds.length === 0) {
      return NextResponse.json([], {
        headers: { ...corsHeaders(), 'X-Total-Count': '0' },
      })
    }

    // Build query for total count
    let countQuery = admin
      .from('products')
      .select('id', { count: 'exact', head: true })
      .in('shop_id', shopIds)
      .eq('is_published', true)
      .eq('item_type', 'physical')

    if (tag) {
      countQuery = countQuery.ilike('name', `%${tag}%`)
    }
    if (categoryId) {
      countQuery = countQuery.eq('category_id', categoryId)
    }

    const { count } = await countQuery

    // Build query for products
    let query = admin
      .from('products')
      .select(
        'id, name, description, price, compare_at_price, images, stock, category_id, member_price, is_published, sort_order, created_at'
      )
      .in('shop_id', shopIds)
      .eq('is_published', true)
      .eq('item_type', 'physical')

    if (tag) {
      query = query.ilike('name', `%${tag}%`)
    }
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data: products, error } = await query
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Public products API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500, headers: corsHeaders() }
      )
    }

    const showMemberPrice = siteConfig.features.membershipProgram

    const result = (products ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      compare_at_price: p.compare_at_price,
      images: p.images ?? [],
      stock: p.stock,
      category_id: p.category_id,
      member_price: showMemberPrice ? p.member_price : null,
      is_available: p.stock > 0 && p.is_published,
      url: `${BASE_URL}/shop/${p.id}`,
    }))

    return NextResponse.json(result, {
      headers: {
        ...corsHeaders(),
        'X-Total-Count': String(count ?? 0),
      },
    })
  } catch (err) {
    console.error('Public products API unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    )
  }
}
