import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { LIST_KEYS, sanitizeList, type ListKey } from '@/lib/content'

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

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Body must be an object' }, { status: 400 })
  }

  const input = body as Record<string, unknown>
  const keys = Object.keys(input)

  if (keys.length === 0) {
    return NextResponse.json({ error: 'Body is empty' }, { status: 400 })
  }

  const unknownKeys = keys.filter((k) => !LIST_KEYS.includes(k as ListKey))
  if (unknownKeys.length > 0) {
    return NextResponse.json({ error: `Unknown key(s): ${unknownKeys.join(', ')}` }, { status: 400 })
  }

  const payload: Record<string, unknown> = {}
  try {
    for (const key of keys as ListKey[]) {
      payload[key] = sanitizeList(key, input[key])
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid payload' },
      { status: 400 },
    )
  }

  await adminDb.collection('personal-content').doc('lists').set(payload, { merge: true })
  return NextResponse.json({ success: true })
}
