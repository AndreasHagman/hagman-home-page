'use client'

import ScrollFade from '@/components/ScrollFade'
import ImageCarousel from './ImageCarousel'
import { SLOTS } from '@/lib/slots'

const races = [
  { name: 'Tough Viking',        year: 2023, note: undefined },
  { name: 'Holmenkollstafetten', year: 2024, note: 'with Storebrand' },
  { name: 'Sentrumsløpet',       year: 2025, note: undefined },
  { name: 'Nordmarkstravern',    year: 2025, note: undefined },
]

interface RacesSectionProps {
  isAdmin?: boolean
  resolvedImages?: string[]
  positions?: string[]
  initialHeight?: number
}

export default function RacesSection({ isAdmin, resolvedImages = [], positions = [], initialHeight }: RacesSectionProps) {
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
            <div className="flex flex-col gap-3">
              {races.map((race) => (
                <div key={race.name} className="flex items-baseline gap-3">
                  <span
                    className="font-display text-lg text-foreground leading-tight"
                    style={{ fontVariationSettings: "'opsz' 20, 'wght' 500, 'SOFT' 15" }}
                  >
                    {race.name}
                  </span>
                  <span className="text-[11px] font-mono text-muted">{race.year}</span>
                  {race.note && (
                    <span className="text-[11px] font-mono text-muted opacity-60">{race.note}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollFade>
      </div>
    </section>
  )
}
