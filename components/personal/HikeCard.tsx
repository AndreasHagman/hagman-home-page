'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Move, Check } from 'lucide-react'
import AdminUploadButton from './AdminUploadButton'
import DraggableImage from './DraggableImage'
import HeightControl from './HeightControl'
import type { Hike } from '@/lib/hikes'

const DEFAULT_HEIGHT = 192

interface HikeCardProps {
  hike: Hike
  resolvedImages?: string[]
  positions?: string[]
  initialHeight?: number
  isAdmin?: boolean
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export default function HikeCard({ hike, resolvedImages = [], positions = [], initialHeight, isAdmin }: HikeCardProps) {
  const slot = `hike-${toSlug(hike.name)}`
  const [index, setIndex] = useState(0)
  const [isRepositioning, setIsRepositioning] = useState(false)
  const [imageHeight, setImageHeight] = useState(initialHeight ?? DEFAULT_HEIGHT)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (initialHeight) setImageHeight(initialHeight)
  }, [initialHeight])

  const hasImages = resolvedImages.length > 0
  const hasMultiple = resolvedImages.length > 1
  const src = resolvedImages[index] ?? ''

  function prev() { setIndex((i) => (i - 1 + resolvedImages.length) % resolvedImages.length) }
  function next() { setIndex((i) => (i + 1) % resolvedImages.length) }

  return (
    <div className="flex flex-col bg-surface border border-border rounded-2xl overflow-hidden">
      <div
        className="relative w-full bg-surface flex items-center justify-center border-b border-border group"
        style={{ height: imageHeight }}
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

        {hasMultiple && !isRepositioning && (
          <>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-surface) 75%, transparent)' }} aria-label="Previous photo"><ChevronLeft size={14} /></button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-surface) 75%, transparent)' }} aria-label="Next photo"><ChevronRight size={14} /></button>
          </>
        )}

        {hasMultiple && !isRepositioning && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {resolvedImages.map((_, i) => (
              <button key={i} onClick={() => setIndex(i)} className="w-1.5 h-1.5 rounded-full transition-colors duration-200" style={{ backgroundColor: i === index ? 'var(--foreground)' : 'color-mix(in srgb, var(--foreground) 35%, transparent)' }} aria-label={`Photo ${i + 1}`} />
            ))}
          </div>
        )}

        {isRepositioning && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono px-2 py-0.5 rounded-full pointer-events-none z-10" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)', color: 'var(--text-muted)' }}>
            drag to reposition
          </div>
        )}

        {isAdmin && (
          <>
            {/* Top-right: height control */}
            {!isRepositioning && (
              <div className="absolute top-2 right-2 z-10">
                <HeightControl slot={slot} value={imageHeight} onChange={setImageHeight} />
              </div>
            )}
            {/* Bottom-left: reposition toggle */}
            {hasImages && (
              <div className="absolute bottom-2 left-2 z-10">
                <button
                  onClick={() => setIsRepositioning((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono rounded-full border transition-colors duration-200"
                  style={{
                    color: isRepositioning ? 'var(--accent)' : 'var(--text-muted)',
                    borderColor: isRepositioning ? 'var(--accent)' : 'var(--border)',
                    backgroundColor: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)',
                  }}
                >
                  {isRepositioning ? <Check size={11} /> : <Move size={11} />}
                  {isRepositioning ? 'Done' : 'Move'}
                </button>
              </div>
            )}
            {/* Bottom-right: upload buttons */}
            {!isRepositioning && (
              <div className="absolute bottom-2 right-2 flex gap-1.5 z-10">
                {hasImages && <AdminUploadButton slot={slot} label="+" mode="add" />}
                <AdminUploadButton slot={slot} label={hasImages ? 'Replace' : 'Add photo'} mode="replace" />
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-display text-lg text-foreground leading-tight" style={{ fontVariationSettings: "'opsz' 20, 'wght' 500, 'SOFT' 15" }}>{hike.name}</h3>
          <span className="flex-shrink-0 text-[11px] font-mono text-muted mt-0.5">{hike.year}</span>
        </div>
        <p className="text-xs font-mono text-accent mb-3">{hike.location}</p>
        <p className="text-muted text-sm leading-relaxed flex-1">{hike.description}</p>
      </div>
    </div>
  )
}
