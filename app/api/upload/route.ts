import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  const session = req.cookies.get('admin_session')
  if (session?.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const slot = formData.get('slot') as string | null

  if (!file || !slot) {
    return NextResponse.json({ error: 'Missing file or slot' }, { status: 400 })
  }

  // Sanitize slot name: only allow lowercase letters, numbers and hyphens
  if (!/^[a-z0-9-]+$/.test(slot)) {
    return NextResponse.json({ error: 'Invalid slot name' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const allowedExts = ['jpg', 'jpeg', 'png', 'webp', 'heic']
  if (!allowedExts.includes(ext)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
  }

  const filename = `${slot}.${ext}`
  const savePath = path.join(process.cwd(), 'public', 'images', 'personal', filename)

  await writeFile(savePath, buffer)

  return NextResponse.json({ success: true, filename })
}
