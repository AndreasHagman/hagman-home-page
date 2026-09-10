'use client'

import { Pencil } from 'lucide-react'
import ImageCarousel from './ImageCarousel'
import ItemEditor from './ItemEditor'
import DeleteItemButton from './DeleteItemButton'
import ListError from './ListError'
import type { EditableListError } from '@/hooks/useEditableList'
import { FIELDS } from '@/lib/content'
import { SLOTS } from '@/lib/slots'
import type { Hike } from '@/lib/hikes'

interface HikeCardProps {
  hike: Hike
  resolvedImages?: string[]
  positions?: string[]
  initialHeight?: number
  isAdmin?: boolean
  isEditing?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onSubmit?: (values: Record<string, string | number>) => void
  onCancel?: () => void
  error?: EditableListError | null
}

export default function HikeCard({
  hike, resolvedImages = [], positions = [], initialHeight, isAdmin,
  isEditing = false, onEdit, onDelete, onSubmit, onCancel, error,
}: HikeCardProps) {
  const slot = SLOTS.hike(hike.id)

  return (
    <div className="flex flex-col bg-surface border border-border rounded-2xl overflow-hidden h-full">
      <ImageCarousel
        slot={slot}
        resolvedImages={resolvedImages}
        positions={positions}
        initialHeight={initialHeight}
        defaultHeight={192}
        alt={hike.name}
        sizes="(max-width: 768px) 100vw, 33vw"
        isAdmin={isAdmin}
        className="border-b border-border"
      />

      {isEditing ? (
        <ItemEditor
          fields={FIELDS.hikes}
          initial={hike}
          submitLabel="Save"
          onSubmit={(values) => onSubmit?.(values)}
          onCancel={() => onCancel?.()}
        />
      ) : (
        <div className="group p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3
              className="font-display text-lg text-foreground leading-tight"
              style={{ fontVariationSettings: "'opsz' 20, 'wght' 500, 'SOFT' 15" }}
            >
              {hike.name}
            </h3>
            <span className="flex-shrink-0 text-[11px] font-mono text-muted mt-0.5">{hike.year}</span>
          </div>
          <p className="text-xs font-mono text-accent mb-3">{hike.location}</p>
          <p className="text-muted text-sm leading-relaxed flex-1">{hike.description}</p>

          {isAdmin && (
            <div className="flex items-center gap-1.5 mt-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
              <button
                type="button"
                onClick={() => onEdit?.()}
                className="w-6 h-6 rounded-full border flex items-center justify-center transition-colors duration-200 hover:border-accent hover:text-accent"
                style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
                aria-label={`Edit ${hike.name}`}
              >
                <Pencil size={11} />
              </button>
              <DeleteItemButton onConfirm={() => onDelete?.()} label={`Delete ${hike.name}`} />
            </div>
          )}
        </div>
      )}

      <ListError error={error} itemId={hike.id} className="px-5 pb-4" />
    </div>
  )
}
