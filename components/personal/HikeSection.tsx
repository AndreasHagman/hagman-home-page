'use client'

import { useState } from 'react'
import HikeCard from './HikeCard'
import ItemEditor from './ItemEditor'
import ListError from './ListError'
import ScrollFade from '@/components/ScrollFade'
import { useEditableList } from '@/hooks/useEditableList'
import { FIELDS } from '@/lib/content'
import type { Hike } from '@/lib/hikes'

interface HikeSectionProps {
  hikes: Hike[]
  isAdmin?: boolean
  images?: Record<string, string[]>
  positions?: Record<string, string[]>
  heights?: Record<string, number>
}

export default function HikeSection({
  hikes, isAdmin, images = {}, positions = {}, heights = {},
}: HikeSectionProps) {
  const { items, error, addItem, updateItem, removeItem } = useEditableList<Hike>('hikes', hikes)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollFade>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block flex-shrink-0" aria-hidden="true" />
            <span className="text-xs font-mono text-muted tracking-[0.18em] uppercase">Hikes &amp; Trips</span>
          </div>
          <p
            className="font-display text-2xl md:text-3xl text-foreground mb-10"
            style={{ fontVariationSettings: "'opsz' 32, 'wght' 400, 'SOFT' 20" }}
          >
            Places I&apos;ve been
          </p>
        </ScrollFade>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((hike, i) => (
            <ScrollFade key={hike.id} delay={i * 80}>
              <HikeCard
                hike={hike}
                resolvedImages={images[hike.id]}
                positions={positions[hike.id]}
                initialHeight={heights[hike.id]}
                isAdmin={isAdmin}
                isEditing={editingId === hike.id}
                onEdit={() => setEditingId(hike.id)}
                onDelete={() => removeItem(hike.id)}
                onSubmit={(values) => { updateItem(hike.id, values); setEditingId(null) }}
                onCancel={() => setEditingId(null)}
                error={error?.itemId === hike.id ? error.message : null}
              />
            </ScrollFade>
          ))}

          {isAdmin && !isAdding && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="min-h-[12rem] rounded-2xl border border-dashed border-border text-[11px] font-mono text-muted tracking-[0.15em] uppercase hover:border-accent hover:text-accent transition-colors duration-200"
            >
              + Add hike
            </button>
          )}
        </div>

        {isAdmin && isAdding && (
          <div className="mt-5">
            <ItemEditor
              fields={FIELDS.hikes}
              submitLabel="Add hike"
              onSubmit={(values) => { addItem(values); setIsAdding(false) }}
              onCancel={() => setIsAdding(false)}
            />
          </div>
        )}

        <ListError error={error} itemId={null} className="mt-3" />
      </div>
    </section>
  )
}
