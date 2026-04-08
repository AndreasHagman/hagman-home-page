'use client'

import { useRef, useState } from 'react'
import { Upload, Check, Loader } from 'lucide-react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, setDoc } from 'firebase/firestore'
import { storage, db } from '@/lib/firebase'

interface AdminUploadButtonProps {
  slot: string
  label?: string
}

export default function AdminUploadButton({ slot, label = 'Upload photo' }: AdminUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setState('uploading')
    try {
      const storageRef = ref(storage, `personal/${slot}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)

      await setDoc(
        doc(db, 'personal-images', 'slots'),
        { [slot]: url },
        { merge: true }
      )

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
        capture="environment"
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
