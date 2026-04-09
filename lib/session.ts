import { createHmac, timingSafeEqual } from 'crypto'

const SECRET = process.env.ADMIN_SESSION_SECRET ?? ''

export function signSession(): string {
  const exp = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url')
  const sig = createHmac('sha256', SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifySession(token: string | undefined): boolean {
  if (!token || !SECRET) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [payload, sig] = parts
  const expected = createHmac('sha256', SECRET).update(payload).digest('base64url')
  try {
    const a = Buffer.from(sig, 'base64url')
    const b = Buffer.from(expected, 'base64url')
    if (a.length !== b.length) return false
    if (!timingSafeEqual(a, b)) return false
  } catch { return false }
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return Date.now() < exp
  } catch { return false }
}
