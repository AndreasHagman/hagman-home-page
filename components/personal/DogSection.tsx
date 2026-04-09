'use client'

import ScrollFade from '@/components/ScrollFade'
import ImageCarousel from './ImageCarousel'
import { SLOTS } from '@/lib/slots'

interface DogSectionProps {
  isAdmin?: boolean
  resolvedImages?: string[]
  positions?: string[]
  initialHeight?: number
}

export default function DogSection({ isAdmin, resolvedImages = [], positions = [], initialHeight }: DogSectionProps) {
  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollFade>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block flex-shrink-0" aria-hidden="true" />
            <span className="text-xs font-mono text-muted tracking-[0.18em] uppercase">My dog</span>
          </div>

          <p
            className="font-display text-2xl md:text-3xl text-foreground mb-8"
            style={{ fontVariationSettings: "'opsz' 32, 'wght' 400, 'SOFT' 20" }}
          >
            Meet Caia
          </p>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Photo */}
            <div className="relative w-full sm:w-64 flex-shrink-0 rounded-2xl overflow-hidden bg-surface border border-border">
              <ImageCarousel
                slot={SLOTS.DOG}
                resolvedImages={resolvedImages}
                positions={positions}
                initialHeight={initialHeight}
                defaultHeight={256}
                alt="Caia"
                sizes="256px"
                isAdmin={isAdmin}
              />
            </div>

            {/* Text */}
            <div className="flex flex-col gap-4">
              <p className="text-muted text-base leading-relaxed">
                Caia is a Nova Scotia Duck Tolling Retriever, born on 16 March 2025,
                so she&apos;s still very much a puppy. She&apos;s already been through
                three dog training courses — with more to come — and we work a lot on
                commands and everyday obedience.
              </p>
              <p className="text-muted text-base leading-relaxed">
                She loves being outside and going on walks, but is equally happy
                curling up in your lap the moment you sit down. The best of both worlds.
              </p>
            </div>
          </div>
        </ScrollFade>
      </div>
    </section>
  )
}
