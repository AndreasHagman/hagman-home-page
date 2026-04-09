'use client'

import { useRef, useState } from 'react'
import { Upload, Check, Loader } from 'lucide-react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { storage, db } from '@/lib/firebase'

interface AdminUploadButtonProps {
  slot: string
  label?: string
  mode?: 'replace' | 'add'
}

export default function AdminUploadButton({ slot, label = 'Upload photo', mode = 'replace' }: AdminUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setState('uploading')
    try {
      const storagePath = mode === 'add' ? `personal/${slot}-${Date.now()}` : `personal/${slot}`
      const storageRef = ref(storage, storagePath)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)

      const slotRef = doc(db, 'personal-images', 'slots')

      if (mode === 'add') {
        const snap = await getDoc(slotRef)
        const existing = snap.exists() ? snap.data()[slot] : undefined
        const current: string[] = Array.isArray(existing) ? existing : existing ? [existing] : []
        await setDoc(slotRef, { [slot]: [...current, url] }, { merge: true })
      } else {
        await setDoc(slotRef, { [slot]: [url] }, { merge: true })
      }

      setState('done')
      setTimeout(() => window.location.reload(), 800)
    } catch (err) {
      console.error('Upload failed', err)
      setState('error')
      setTimeout(() => setState('idle'), 3000)
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={state === 'uploading' || state === 'done'}
        className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono rounded-full border transition-colors duration-200 disabled:opacity-60"
        style={{
          color: state === 'error' ? 'var(--accent)' : 'var(--text-muted)',
          borderColor: state === 'error' ? 'var(--accent)' : 'var(--border)',
          backgroundColor: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)',
        }}
      >
        {state === 'uploading' && <Loader size={11} className="animate-spin" />}
        {state === 'done' && <Check size={11} />}
        {(state === 'idle' || state === 'error') && <Upload size={11} />}
        {state === 'uploading' ? 'Uploading…' : state === 'done' ? 'Done!' : state === 'error' ? 'Failed' : label}
      </button>
    </>
  )
}
