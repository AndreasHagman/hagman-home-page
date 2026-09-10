'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import ScrollFade from '@/components/ScrollFade'
import ImageCarousel from './ImageCarousel'
import ItemEditor from './ItemEditor'
import DeleteItemButton from './DeleteItemButton'
import ListError from './ListError'
import { useEditableList } from '@/hooks/useEditableList'
import { FIELDS } from '@/lib/content'
import { SLOTS } from '@/lib/slots'
import type { Experience } from '@/lib/experiences'

interface ExperiencesSectionProps {
  experiences: Experience[]
  isAdmin?: boolean
  images?: Record<string, string[]>
  positions?: Record<string, string[]>
  heights?: Record<string, number>
}

interface ExperienceCardProps {
  experience: Experience
  resolvedImages?: string[]
  imagePositions?: string[]
  initialHeight?: number
  isAdmin?: boolean
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
  onSubmit: (values: Record<string, string | number>) => void
  onCancel: () => void
  error?: string | null
}

function ExperienceCard({
  experience, resolvedImages = [], imagePositions = [], initialHeight, isAdmin,
  isEditing, onEdit, onDelete, onSubmit, onCancel, error,
}: ExperienceCardProps) {
  const { id, name, location, year, description, tag } = experience

  return (
    <div className="flex flex-col sm:flex-row sm:items-stretch bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Image */}
      <div className="relative w-full sm:w-40 flex-shrink-0 bg-surface border-b sm:border-b-0 sm:border-r border-border">
        <ImageCarousel
          slot={SLOTS.exp(id)}
          resolvedImages={resolvedImages}
          positions={imagePositions}
          initialHeight={initialHeight}
          defaultHeight={160}
          alt={name}
          sizes="(max-width: 640px) 100vw, 160px"
          isAdmin={isAdmin}
          compact
        />
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="flex-1 p-2">
          <ItemEditor
            fields={FIELDS.experiences}
            initial={experience}
            submitLabel="Save"
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        </div>
      ) : (
        <div className="group flex-1 p-5 flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-accent tracking-[0.15em] uppercase">{tag}</span>
          <div className="flex items-start justify-between gap-3">
            <h3
              className="font-display text-lg text-foreground leading-tight"
              style={{ fontVariationSettings: "'opsz' 20, 'wght' 500, 'SOFT' 15" }}
            >
              {name}
            </h3>
            <span className="flex-shrink-0 text-[11px] font-mono text-muted mt-0.5">{year}</span>
          </div>
          <p className="text-xs font-mono text-muted mb-1">{location}</p>
          <p className="text-muted text-sm leading-relaxed">{description}</p>

          {isAdmin && (
            <div className="flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
              <button
                type="button"
                onClick={onEdit}
                className="w-6 h-6 rounded-full border flex items-center justify-center transition-colors duration-200 hover:border-accent hover:text-accent"
                style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
                aria-label={`Edit ${name}`}
              >
                <Pencil size={11} />
              </button>
              <DeleteItemButton onConfirm={onDelete} label={`Delete ${name}`} />
            </div>
          )}

          <ListError error={error ? { itemId: experience.id, message: error } : null} itemId={experience.id} className="mt-2" />
        </div>
      )}
    </div>
  )
}

export default function ExperiencesSection({
  experiences, isAdmin, images = {}, positions = {}, heights = {},
}: ExperiencesSectionProps) {
  const { items, error, addItem, updateItem, removeItem } = useEditableList<Experience>('experiences', experiences)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollFade>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block flex-shrink-0" aria-hidden="true" />
            <span className="text-xs font-mono text-muted tracking-[0.18em] uppercase">Experiences</span>
          </div>
          <p
            className="font-display text-2xl md:text-3xl text-foreground mb-10"
            style={{ fontVariationSettings: "'opsz' 32, 'wght' 400, 'SOFT' 20" }}
          >
            Things I&apos;ve done
          </p>
        </ScrollFade>

        <div className="flex flex-col gap-4">
          {items.map((exp, i) => (
            <ScrollFade key={exp.id} delay={i * 80}>
              <ExperienceCard
                experience={exp}
                resolvedImages={images[exp.id]}
                imagePositions={positions[exp.id]}
                initialHeight={heights[exp.id]}
                isAdmin={isAdmin}
                isEditing={editingId === exp.id}
                onEdit={() => setEditingId(exp.id)}
                onDelete={() => removeItem(exp.id)}
                onSubmit={(values) => { updateItem(exp.id, values); setEditingId(null) }}
                onCancel={() => setEditingId(null)}
                error={error?.itemId === exp.id ? error.message : null}
              />
            </ScrollFade>
          ))}

          {isAdmin && (
            isAdding ? (
              <ItemEditor
                fields={FIELDS.experiences}
                submitLabel="Add experience"
                onSubmit={(values) => { addItem(values); setIsAdding(false) }}
                onCancel={() => setIsAdding(false)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full py-4 rounded-2xl border border-dashed border-border text-[11px] font-mono text-muted tracking-[0.15em] uppercase hover:border-accent hover:text-accent transition-colors duration-200"
              >
                + Add experience
              </button>
            )
          )}

          <ListError error={error} itemId={null} />
        </div>
      </div>
    </section>
  )
}
