import { NextResponse } from 'next/server'
import { generateSSOToken } from '@/features/membership-sso'
import siteConfig from '@/site.config'

export async function POST(request: Request) {
  // Return 404 if membership SSO is disabled
  if (!siteConfig.features.membershipSso) {
    return new NextResponse('Not Found', { status: 404 })
  }

  // Verify API key
  const apiKey = request.headers.get('x-api-key')
  const secret = process.env.MEMBERSHIP_SSO_SECRET || process.env.GUILD_SSO_SECRET || ''

  if (apiKey !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: 'email and name are required' }, { status: 400 })
    }

    const token = generateSSOToken(email, name)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || ''
    const url = `${baseUrl}/api/auth/guild-sso?token=${token}`

    return NextResponse.json({ token, url })
  } catch (error) {
    console.error('SSO generate error:', error)
    return NextResponse.json({ error: 'エラーが発生しました' }, { status: 500 })
  }
}
