'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ScrollFade from '@/components/ScrollFade'
import AdminUploadButton from './AdminUploadButton'

interface DogSectionProps {
  isAdmin?: boolean
  resolvedImages?: string[]
}

export default function DogSection({ isAdmin, resolvedImages = [] }: DogSectionProps) {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)

  const hasImages = resolvedImages.length > 0
  const hasMultiple = resolvedImages.length > 1
  const src = resolvedImages[index] ?? ''

  function prev() {
    setIndex((i) => (i - 1 + resolvedImages.length) % resolvedImages.length)
  }
  function next() {
    setIndex((i) => (i + 1) % resolvedImages.length)
  }

  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollFade>
          <div className="flex items-center gap-3 mb-4">
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent inline-block flex-shrink-0"
              aria-hidden="true"
            />
            <span className="text-xs font-mono text-muted tracking-[0.18em] uppercase">
              My dog
            </span>
          </div>

          <p
            className="font-display text-2xl md:text-3xl text-foreground mb-8"
            style={{ fontVariationSettings: "'opsz' 32, 'wght' 400, 'SOFT' 20" }}
          >
            Meet Caia
          </p>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Photo carousel */}
            <div
              className="relative w-full sm:w-64 h-64 flex-shrink-0 rounded-2xl overflow-hidden bg-surface border border-border flex items-center justify-center group"
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
                  alt={`Caia ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="256px"
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

              {/* Admin upload buttons */}
              {isAdmin && (
                <div className="absolute bottom-2 right-2 flex gap-1.5 z-10">
                  {hasImages && (
                    <AdminUploadButton slot="caia" label="+" mode="add" />
                  )}
                  <AdminUploadButton
                    slot="caia"
                    label={hasImages ? 'Replace' : 'Add photo'}
                    mode="replace"
                  />
                </div>
              )}
            </div>

            {/* Text */}
            <div className="flex flex-col gap-4">
              <p className="text-muted text-base leading-relaxed">
                Caia was born on 16 March 2025, so she&apos;s still very much a puppy.
                She&apos;s already been through three dog training courses — with more to
                come — and we work a lot on commands and everyday obedience.
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
