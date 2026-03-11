import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import siteConfig from '@/site.config'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://shop.fomus.co.jp'
const ALLOWED_ORIGIN = process.env.PUBLIC_API_CORS_ORIGIN || '*'

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const admin = createAdminClient()

    // Fetch product with options
    const { data: product, error } = await admin
      .from('products')
      .select(
        `id, name, description, price, compare_at_price, images, stock, category_id, member_price, is_published, item_type, shop_id,
        product_options (
          id, name, required, sort_order,
          choices:product_option_choices ( id, label, price_adjustment, stock, sort_order )
        )`
      )
      .eq('id', id)
      .eq('is_published', true)
      .eq('item_type', 'physical')
      .single()

    if (error || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404, headers: corsHeaders() }
      )
    }

    // Verify the product belongs to a published, active shop
    const { data: shop } = await admin
      .from('shops')
      .select('id')
      .eq('id', product.shop_id)
      .eq('is_published', true)
      .eq('status', 'active')
      .single()

    if (!shop) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404, headers: corsHeaders() }
      )
    }

    const showMemberPrice = siteConfig.features.membershipProgram

    // Sort options and choices by sort_order
    const productOptions = (product.product_options ?? [])
      .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      .map((opt: { id: string; name: string; required: boolean; sort_order: number; choices?: { id: string; label: string; price_adjustment: number; stock: number | null; sort_order: number }[] }) => ({
        id: opt.id,
        name: opt.name,
        required: opt.required,
        sort_order: opt.sort_order,
        choices: (opt.choices ?? [])
          .sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
          .map((c: { id: string; label: string; price_adjustment: number; stock: number | null; sort_order: number }) => ({
            id: c.id,
            label: c.label,
            price_adjustment: c.price_adjustment,
            stock: c.stock,
            sort_order: c.sort_order,
          })),
      }))

    const result = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      compare_at_price: product.compare_at_price,
      images: product.images ?? [],
      stock: product.stock,
      category_id: product.category_id,
      member_price: showMemberPrice ? product.member_price : null,
      is_available: product.stock > 0 && product.is_published,
      url: `${BASE_URL}/shop/${product.id}`,
      product_options: productOptions,
    }

    return NextResponse.json(result, { headers: corsHeaders() })
  } catch (err) {
    console.error('Public product detail API error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders() }
    )
  }
}
