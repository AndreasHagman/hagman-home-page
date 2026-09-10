'use client'

import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'

interface DeleteItemButtonProps {
  onConfirm: () => void
  label: string
}

const ARM_TIMEOUT_MS = 4000

export default function DeleteItemButton({ onConfirm, label }: DeleteItemButtonProps) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), ARM_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [armed])

  if (armed) {
    return (
      <button
        type="button"
        onClick={() => { setArmed(false); onConfirm() }}
        onBlur={() => setArmed(false)}
        className="px-2 h-6 rounded-full border text-[10px] font-mono border-red-400 text-red-400 transition-colors duration-200"
        aria-label={`Confirm: ${label}`}
      >
        Sure?
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setArmed(true)}
      className="w-6 h-6 rounded-full border flex items-center justify-center transition-colors duration-200 hover:border-red-400 hover:text-red-400"
      style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
      aria-label={label}
    >
      <Trash2 size={11} />
    </button>
  )
}
