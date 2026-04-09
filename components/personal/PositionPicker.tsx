'use client'

import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const GRID = [
  ['top left',    'top center',    'top right'],
  ['center left', 'center',        'center right'],
  ['bottom left', 'bottom center', 'bottom right'],
]

interface PositionPickerProps {
  slot: string
  imageIndex: number
  allPositions: string[]
  current: string
}

export default function PositionPicker({ slot, imageIndex, allPositions, current }: PositionPickerProps) {
  const [active, setActive] = useState(current || 'center')
  const [saving, setSaving] = useState(false)

  async function handleSelect(pos: string) {
    if (pos === active || saving) return
    setActive(pos)
    setSaving(true)
    try {
      const updated = [...allPositions]
      while (updated.length <= imageIndex) updated.push('center')
      updated[imageIndex] = pos
      await setDoc(
        doc(db, 'personal-images', 'slots'),
        { [`${slot}-positions`]: updated },
        { merge: true }
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="grid grid-cols-3 gap-0.5 p-1 rounded-lg border border-border"
      style={{ backgroundColor: 'color-mix(in srgb, var(--bg-surface) 85%, transparent)' }}
      title="Set focal point"
    >
      {GRID.flat().map((pos) => (
        <button
          key={pos}
          onClick={() => handleSelect(pos)}
          disabled={saving}
          className="w-3.5 h-3.5 rounded-sm transition-colors duration-150"
          style={{
            backgroundColor: active === pos
              ? 'var(--accent)'
              : 'color-mix(in srgb, var(--foreground) 20%, transparent)',
          }}
          aria-label={`Focal point: ${pos}`}
          title={pos}
        />
      ))}
    </div>
  )
}
