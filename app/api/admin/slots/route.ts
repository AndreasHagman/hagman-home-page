import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('admin_session')?.value

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await adminAuth.verifySessionCookie(sessionCookie, true)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body: Record<string, unknown> = await req.json()
  const slotRef = adminDb.collection('personal-images').doc('slots')

  // Handle append operations (key ending in __append means push to existing array)
  const appendKeys = Object.keys(body).filter((k) => k.endsWith('__append'))
  if (appendKeys.length > 0) {
    const snap = await slotRef.get()
    const existing = snap.exists ? (snap.data() ?? {}) : {}
    for (const key of appendKeys) {
      const slot = key.replace('__append', '')
      const current = Array.isArray(existing[slot]) ? existing[slot] : existing[slot] ? [existing[slot]] : []
      body[slot] = [...current, body[key]]
      delete body[key]
    }
  }

  await slotRef.set(body, { merge: true })
  return NextResponse.json({ success: true })
}
