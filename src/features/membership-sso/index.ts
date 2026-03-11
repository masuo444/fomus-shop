import crypto from 'crypto'

const SSO_SECRET = process.env.MEMBERSHIP_SSO_SECRET || process.env.GUILD_SSO_SECRET || ''

// Generate SSO token (for membership app to call)
export function generateSSOToken(email: string, name: string): string {
  const payload = { email, name, ts: Date.now() }
  const data = JSON.stringify(payload)
  const signature = crypto.createHmac('sha256', SSO_SECRET).update(data).digest('hex')
  return Buffer.from(JSON.stringify({ data, signature })).toString('base64url')
}

// Verify SSO token
export function verifySSOToken(token: string): { email: string; name: string } | null {
  try {
    const { data, signature } = JSON.parse(Buffer.from(token, 'base64url').toString())
    const expected = crypto.createHmac('sha256', SSO_SECRET).update(data).digest('hex')
    if (signature !== expected) return null
    const payload = JSON.parse(data)
    // Token expires after 5 minutes
    if (Date.now() - payload.ts > 5 * 60 * 1000) return null
    return { email: payload.email, name: payload.name }
  } catch {
    return null
  }
}
