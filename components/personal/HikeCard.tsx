'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import AdminUploadButton from './AdminUploadButton'
import PositionPicker from './PositionPicker'
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
  const touchStartX = useRef<number | null>(null)

  const hasImages = resolvedImages.length > 0
  const hasMultiple = resolvedImages.length > 1
  const src = resolvedImages[index] ?? ''
  const objectPosition = positions[index] || 'center'

  function prev() {
    setIndex((i) => (i - 1 + resolvedImages.length) % resolvedImages.length)
  }
  function next() {
    setIndex((i) => (i + 1) % resolvedImages.length)
  }

  return (
    <div className="flex flex-col bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Image area */}
      <div
        className="relative h-48 w-full bg-surface flex items-center justify-center border-b border-border group"
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null || !hasMultiple) return
          const delta = touchStartX.current - e.changedTouches[0].clientX
          if (Math.abs(delta) > 40) delta > 0 ? next() : prev()
          touchStartX.current = null
        }}
      >
        {hasImages ? (
          <Image
            src={src}
            alt={`${hike.name} ${index + 1}`}
            fill
            className="object-cover"
            style={{ objectPosition }}
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized={src.includes('.gif')}
          />
        ) : (
          <span className="text-[11px] font-mono text-muted opacity-50 tracking-[0.15em] uppercase">
            No photo yet
          </span>
        )}

        {/* Prev / Next arrows */}
        {hasMultiple && (
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
        {hasMultiple && (
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

        {/* Admin overlay */}
        {isAdmin && (
          <>
            {hasImages && (
              <div className="absolute bottom-2 left-2 z-10">
                <PositionPicker
                  slot={slot}
                  imageIndex={index}
                  allPositions={positions}
                  current={objectPosition}
                />
              </div>
            )}
            <div className="absolute bottom-2 right-2 flex gap-1.5 z-10">
              {hasImages && <AdminUploadButton slot={slot} label="+" mode="add" />}
              <AdminUploadButton
                slot={slot}
                label={hasImages ? 'Replace' : 'Add photo'}
                mode="replace"
              />
            </div>
          </>
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
          <span className="flex-shrink-0 text-[11px] font-mono text-muted mt-0.5">
            {hike.year}
          </span>
        </div>

        <p className="text-xs font-mono text-accent mb-3">{hike.location}</p>

        <p className="text-muted text-sm leading-relaxed flex-1">
          {hike.description}
        </p>
      </div>
    </div>
  )
}
