'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import AdminUploadButton from './personal/AdminUploadButton'
import { SLOTS } from '@/lib/slots'

interface ProjectScreenshotsProps {
  slug: string
  initialScreenshots: string[]
  isAdmin?: boolean
}

export default function ProjectScreenshots({ slug, initialScreenshots, isAdmin }: ProjectScreenshotsProps) {
  const [screenshots, setScreenshots] = useState(initialScreenshots)
  const slot = SLOTS.project(slug)

  async function deleteScreenshot(index: number) {
    const updated = screenshots.filter((_, i) => i !== index)
    setScreenshots(updated)
    await fetch('/api/admin/slots', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [slot]: updated }),
    }).catch(console.error)
  }

  if (screenshots.length === 0 && !isAdmin) return null

  return (
    <div>
      <p className="text-xs font-mono text-muted tracking-[0.12em] uppercase opacity-60 mb-4">
        Screenshots
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {screenshots.map((src, i) => (
          <div key={src} className="relative group rounded-xl overflow-hidden border border-border bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Screenshot ${i + 1}`} className="w-full h-auto" />
            {isAdmin && (
              <button
                onClick={() => deleteScreenshot(i)}
                className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full border transition-colors duration-200 hover:border-red-400 hover:text-red-400 opacity-0 group-hover:opacity-100"
                style={{
                  color: 'var(--text-muted)',
                  borderColor: 'var(--border)',
                  backgroundColor: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)',
                }}
                aria-label="Delete screenshot"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        ))}

        {isAdmin && (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-surface min-h-[120px]">
            <AdminUploadButton
              slot={slot}
              label="Add screenshot"
              mode="add"
            />
          </div>
        )}
      </div>
    </div>
  )
}
