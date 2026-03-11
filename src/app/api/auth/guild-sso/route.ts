import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifySSOToken } from '@/features/membership-sso'
import siteConfig from '@/site.config'

export async function GET(request: Request) {
  // Return 404 if membership SSO is disabled
  if (!siteConfig.features.membershipSso) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const { searchParams, origin } = new URL(request.url)
  const token = searchParams.get('token')
  const redirect = searchParams.get('redirect') || '/shop'

  if (!token) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const payload = verifySSOToken(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/auth/login?error=invalid_token', request.url))
  }

  const admin = createAdminClient()

  try {
    // Check if user exists by email
    const { data: { users } } = await admin.auth.admin.listUsers()
    let user = users.find((u) => u.email === payload.email)

    if (!user) {
      // Create new user
      const { data, error } = await admin.auth.admin.createUser({
        email: payload.email,
        email_confirm: true,
        user_metadata: { name: payload.name },
        password: crypto.randomUUID(),
      })

      if (error || !data.user) {
        console.error('SSO user creation error:', error)
        return NextResponse.redirect(new URL('/auth/login?error=creation_failed', request.url))
      }
      user = data.user

      // Create profile as guild member
      await admin.from('profiles').upsert({
        id: user.id,
        email: payload.email,
        name: payload.name,
        role: 'customer',
        is_premium_member: true,
        premium_linked_at: new Date().toISOString(),
      })
    } else {
      // Update existing profile to guild member
      await admin
        .from('profiles')
        .update({
          is_premium_member: true,
          premium_linked_at: new Date().toISOString(),
        })
        .eq('id', user.id)
    }

    // Generate magic link for auto-login
    const { data: linkData } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: payload.email,
    })

    if (linkData?.properties?.action_link) {
      // Append redirect destination
      const magicLink = new URL(linkData.properties.action_link)
      magicLink.searchParams.set('next', redirect)
      return NextResponse.redirect(magicLink.toString())
    }

    // Fallback: redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url))
  } catch (error) {
    console.error('Guild SSO error:', error)
    return NextResponse.redirect(new URL('/auth/login?error=sso_failed', request.url))
  }
}
