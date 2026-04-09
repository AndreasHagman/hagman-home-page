import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('admin_session')?.value

  if (sessionCookie) {
    try {
      const decoded = await adminAuth.verifySessionCookie(sessionCookie)
      await adminAuth.revokeRefreshTokens(decoded.uid)
    } catch {
      // Cookie invalid or already expired — still clear it
    }
  }

  const res = NextResponse.json({ success: true })
  res.cookies.set('admin_session', '', { path: '/', maxAge: 0 })
  return res
}
