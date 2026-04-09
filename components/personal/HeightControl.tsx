'use client'

import { Minus, Plus } from 'lucide-react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface HeightControlProps {
  slot: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (h: number) => void
}

export default function HeightControl({
  slot, value, min = 96, max = 480, step = 16, onChange,
}: HeightControlProps) {
  async function adjust(delta: number) {
    const next = Math.max(min, Math.min(max, value + delta))
    onChange(next)
    await setDoc(
      doc(db, 'personal-images', 'slots'),
      { [`${slot}-height`]: next },
      { merge: true }
    ).catch(console.error)
  }

  return (
    <div
      className="flex items-center gap-1 px-2 py-1 rounded-full border text-[11px] font-mono"
      style={{
        color: 'var(--text-muted)',
        borderColor: 'var(--border)',
        backgroundColor: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)',
      }}
    >
      <button
        onClick={() => adjust(-step)}
        disabled={value <= min}
        className="disabled:opacity-30 leading-none"
        aria-label="Decrease height"
      >
        <Minus size={10} />
      </button>
      <span className="w-9 text-center tabular-nums">{value}px</span>
      <button
        onClick={() => adjust(step)}
        disabled={value >= max}
        className="disabled:opacity-30 leading-none"
        aria-label="Increase height"
      >
        <Plus size={10} />
      </button>
    </div>
  )
}
