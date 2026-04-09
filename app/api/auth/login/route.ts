import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

const SESSION_DURATION_MS = 60 * 60 * 24 * 7 * 1000 // 7 days

// In-memory rate limiter — best-effort in serverless (resets per cold start)
const attempts = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 10

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  if (entry.count >= MAX_ATTEMPTS) return true
  entry.count++
  return false
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { idToken } = await req.json()

  if (!idToken) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  try {
    const decoded = await adminAuth.verifyIdToken(idToken)

    const allowedEmails = (process.env.ADMIN_EMAIL ?? '').split(',').map((e) => e.trim()).filter(Boolean)
    const allowedPhones = (process.env.ADMIN_PHONE ?? '').split(',').map((p) => p.trim()).filter(Boolean)

const emailOk = !!decoded.email && allowedEmails.includes(decoded.email)
    const phoneOk = !!decoded.phone_number && allowedPhones.includes(decoded.phone_number)

    if (!emailOk && !phoneOk) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    })

    const res = NextResponse.json({ success: true })
    res.cookies.set('admin_session', sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: SESSION_DURATION_MS / 1000,
      path: '/',
    })
    return res
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}
