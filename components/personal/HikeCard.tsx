'use client'

import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Move, Check } from 'lucide-react'
import AdminUploadButton from './AdminUploadButton'
import DraggableImage from './DraggableImage'
import type { Hike } from '@/lib/hikes'

interface HikeCardProps {
  hike: Hike
  resolvedImages?: string[]
  positions?: string[]
  isAdmin?: boolean
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export default function HikeCard({ hike, resolvedImages = [], positions = [], isAdmin }: HikeCardProps) {
  const slot = `hike-${toSlug(hike.name)}`
  const [index, setIndex] = useState(0)
  const [isRepositioning, setIsRepositioning] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const hasImages = resolvedImages.length > 0
  const hasMultiple = resolvedImages.length > 1
  const src = resolvedImages[index] ?? ''

  function prev() { setIndex((i) => (i - 1 + resolvedImages.length) % resolvedImages.length) }
  function next() { setIndex((i) => (i + 1) % resolvedImages.length) }

  return (
    <div className="flex flex-col bg-surface border border-border rounded-2xl overflow-hidden">
      <div
        className="relative h-48 w-full bg-surface flex items-center justify-center border-b border-border group"
        onTouchStart={!isRepositioning ? (e) => { touchStartX.current = e.touches[0].clientX } : undefined}
        onTouchEnd={!isRepositioning && hasMultiple ? (e) => {
          if (touchStartX.current === null) return
          const delta = touchStartX.current - e.changedTouches[0].clientX
          if (Math.abs(delta) > 40) delta > 0 ? next() : prev()
          touchStartX.current = null
        } : undefined}
      >
        {hasImages ? (
          <DraggableImage
            src={src}
            alt={`${hike.name} ${index + 1}`}
            sizes="(max-width: 768px) 100vw, 33vw"
            slot={slot}
            imageIndex={index}
            allPositions={positions}
            isRepositioning={isRepositioning}
          />
        ) : (
          <span className="text-[11px] font-mono text-muted opacity-50 tracking-[0.15em] uppercase">
            No photo yet
          </span>
        )}

        {/* Prev / Next arrows */}
        {hasMultiple && !isRepositioning && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              style={{ backgroundColor: 'color-mix(in srgb, var(--bg-surface) 75%, transparent)' }}
              aria-label="Previous photo"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              style={{ backgroundColor: 'color-mix(in srgb, var(--bg-surface) 75%, transparent)' }}
              aria-label="Next photo"
            >
              <ChevronRight size={14} />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {hasMultiple && !isRepositioning && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {resolvedImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className="w-1.5 h-1.5 rounded-full transition-colors duration-200"
                style={{
                  backgroundColor: i === index
                    ? 'var(--foreground)'
                    : 'color-mix(in srgb, var(--foreground) 35%, transparent)',
                }}
                aria-label={`Photo ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Reposition hint */}
        {isRepositioning && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono px-2 py-0.5 rounded-full pointer-events-none z-10"
            style={{ backgroundColor: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)', color: 'var(--text-muted)' }}
          >
            drag to reposition
          </div>
        )}

        {/* Admin overlay */}
        {isAdmin && hasImages && (
          <div className="absolute bottom-2 left-2 z-10">
            <button
              onClick={() => setIsRepositioning((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono rounded-full border transition-colors duration-200"
              style={{
                color: isRepositioning ? 'var(--accent)' : 'var(--text-muted)',
                borderColor: isRepositioning ? 'var(--accent)' : 'var(--border)',
                backgroundColor: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)',
              }}
              aria-label={isRepositioning ? 'Done repositioning' : 'Reposition image'}
            >
              {isRepositioning ? <Check size={11} /> : <Move size={11} />}
              {isRepositioning ? 'Done' : 'Move'}
            </button>
          </div>
        )}
        {isAdmin && !isRepositioning && (
          <div className="absolute bottom-2 right-2 flex gap-1.5 z-10">
            {hasImages && <AdminUploadButton slot={slot} label="+" mode="add" />}
            <AdminUploadButton slot={slot} label={hasImages ? 'Replace' : 'Add photo'} mode="replace" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
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
      </div>
    </div>
  )
}
