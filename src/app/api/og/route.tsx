import { ImageResponse } from 'next/og'
import siteConfig from '@/site.config'

export const runtime = 'edge'

const SHOP_LABEL = `${siteConfig.name.toUpperCase()} SHOP`

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('id')

  if (!productId) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', width: '100%', height: '100%', background: '#111', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 48, color: '#fff', fontWeight: 300, letterSpacing: '0.05em' }}>{SHOP_LABEL}</div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }

  let name = SHOP_LABEL
  let price = ''
  let imageUrl = ''

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (supabaseUrl && supabaseKey) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)
      const filter = isUuid ? `id=eq.${productId}` : `slug=eq.${productId}`
      const res = await fetch(
        `${supabaseUrl}/rest/v1/products?${filter}&select=name,price,images&limit=1`,
        { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } }
      )
      const data = await res.json()
      if (data?.[0]) {
        name = data[0].name
        price = `¥${Number(data[0].price).toLocaleString()}`
        imageUrl = data[0].images?.[0] || ''
      }
    }
  } catch {
    // fallback
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#111',
          color: '#fff',
        }}
      >
        {imageUrl && (
          <div style={{ display: 'flex', width: 630, height: 630, overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px 50px',
            flex: 1,
          }}
        >
          <div style={{ fontSize: 14, color: '#666', letterSpacing: '0.15em', marginBottom: 20 }}>
            {SHOP_LABEL}
          </div>
          <div style={{ fontSize: 40, fontWeight: 600, lineHeight: 1.3, marginBottom: 24 }}>
            {name}
          </div>
          {price && (
            <div style={{ fontSize: 32, fontWeight: 300, color: '#ccc' }}>
              {price}
            </div>
          )}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
