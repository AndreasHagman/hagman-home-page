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
import type { Race } from '@/lib/races'

const VISIBLE_LIMIT = 5

interface RacesSectionProps {
  races: Race[]
  isAdmin?: boolean
  resolvedImages?: string[]
  positions?: string[]
  initialHeight?: number
}

export default function RacesSection({
  races, isAdmin, resolvedImages = [], positions = [], initialHeight,
}: RacesSectionProps) {
  const { items, error, addItem, updateItem, removeItem } = useEditableList<Race>('races', races)
  const [expanded, setExpanded] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const sorted = [...items].sort((a, b) => b.year - a.year)
  const overLimit = sorted.length > VISIBLE_LIMIT
  const isCapped = !isAdmin && overLimit && !expanded
  const visible = isCapped ? sorted.slice(0, VISIBLE_LIMIT) : sorted

  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollFade>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block flex-shrink-0" aria-hidden="true" />
            <span className="text-xs font-mono text-muted tracking-[0.18em] uppercase">Races</span>
          </div>

          <p
            className="font-display text-2xl md:text-3xl text-foreground mb-8"
            style={{ fontVariationSettings: "'opsz' 32, 'wght' 400, 'SOFT' 20" }}
          >
            On the start line
          </p>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Photo */}
            <div className="relative w-full sm:w-64 flex-shrink-0 rounded-2xl overflow-hidden bg-surface border border-border">
              <ImageCarousel
                slot={SLOTS.RACES}
                resolvedImages={resolvedImages}
                positions={positions}
                initialHeight={initialHeight}
                defaultHeight={256}
                alt="Race photo"
                sizes="256px"
                isAdmin={isAdmin}
              />
            </div>

            {/* Race list */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              {visible.map((race) => (
                <div key={race.id}>
                  {editingId === race.id ? (
                    <ItemEditor
                      fields={FIELDS.races}
                      initial={race}
                      submitLabel="Save"
                      onSubmit={(values) => { updateItem(race.id, values); setEditingId(null) }}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="group flex items-baseline flex-wrap gap-x-3 gap-y-1">
                      <span
                        className="font-display text-lg text-foreground leading-tight"
                        style={{ fontVariationSettings: "'opsz' 20, 'wght' 500, 'SOFT' 15" }}
                      >
                        {race.name}
                      </span>
                      <span className="text-[11px] font-mono text-muted">{race.year}</span>
                      {race.distance && (
                        <span className="text-[11px] font-mono text-accent">{race.distance}</span>
                      )}
                      {race.note && (
                        <span className="text-[11px] font-mono text-muted opacity-60">{race.note}</span>
                      )}
                      {isAdmin && (
                        <span className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                          <button
                            type="button"
                            onClick={() => setEditingId(race.id)}
                            className="w-6 h-6 rounded-full border flex items-center justify-center transition-colors duration-200 hover:border-accent hover:text-accent"
                            style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
                            aria-label={`Edit ${race.name}`}
                          >
                            <Pencil size={11} />
                          </button>
                          <DeleteItemButton
                            onConfirm={() => removeItem(race.id)}
                            label={`Delete ${race.name}`}
                          />
                        </span>
                      )}
                    </div>
                  )}

                  <ListError error={error} itemId={race.id} className="mt-1" />
                </div>
              ))}

              {!isAdmin && overLimit && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="self-start mt-1 text-[11px] font-mono text-muted tracking-[0.15em] uppercase hover:text-accent transition-colors duration-200"
                >
                  {expanded ? 'Show less' : `Show all (${sorted.length})`}
                </button>
              )}

              {isAdmin && (
                isAdding ? (
                  <ItemEditor
                    fields={FIELDS.races}
                    submitLabel="Add race"
                    onSubmit={(values) => { addItem(values); setIsAdding(false) }}
                    onCancel={() => setIsAdding(false)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAdding(true)}
                    className="self-start mt-2 px-4 py-2 rounded-xl border border-dashed border-border text-[11px] font-mono text-muted tracking-[0.15em] uppercase hover:border-accent hover:text-accent transition-colors duration-200"
                  >
                    + Add race
                  </button>
                )
              )}

              <ListError error={error} itemId={null} />
            </div>
          </div>
        </ScrollFade>
      </div>
    </section>
  )
}
