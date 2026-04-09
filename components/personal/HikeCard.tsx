'use client'

import ImageCarousel from './ImageCarousel'
import { SLOTS } from '@/lib/slots'
import type { Hike } from '@/lib/hikes'

interface HikeCardProps {
  hike: Hike
  resolvedImages?: string[]
  positions?: string[]
  initialHeight?: number
  isAdmin?: boolean
}

export default function HikeCard({ hike, resolvedImages = [], positions = [], initialHeight, isAdmin }: HikeCardProps) {
  const slot = SLOTS.hike(hike.name)

  return (
    <div className="flex flex-col bg-surface border border-border rounded-2xl overflow-hidden">
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
