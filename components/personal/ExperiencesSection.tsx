'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { experiences } from '@/lib/experiences'
import ScrollFade from '@/components/ScrollFade'
import AdminUploadButton from './AdminUploadButton'
import PositionPicker from './PositionPicker'

interface ExperiencesSectionProps {
  isAdmin?: boolean
  experienceImages?: Record<string, string[]>
  experiencePositions?: Record<string, string[]>
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-')
}

function ExperienceCard({
  name, location, year, description, tag, slot,
  resolvedImages = [], positions = [], isAdmin,
}: {
  name: string
  location: string
  year: number
  description: string
  tag: string
  slot: string
  resolvedImages?: string[]
  positions?: string[]
  isAdmin?: boolean
}) {
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
    <div className="flex flex-col sm:flex-row sm:items-stretch bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Image thumbnail */}
      <div
        className="relative w-full sm:w-40 h-40 sm:h-auto flex-shrink-0 bg-surface flex items-center justify-center border-b sm:border-b-0 sm:border-r border-border group"
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
            alt={`${name} ${index + 1}`}
            fill
            className="object-cover"
            style={{ objectPosition }}
            sizes="(max-width: 640px) 100vw, 160px"
            unoptimized={src.includes('.gif')}
          />
        ) : (
          <span className="text-[10px] font-mono text-muted opacity-40 tracking-[0.15em] uppercase text-center px-3">
            No photo yet
          </span>
        )}

        {/* Arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={prev}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              style={{ backgroundColor: 'color-mix(in srgb, var(--bg-surface) 75%, transparent)' }}
              aria-label="Previous photo"
            >
              <ChevronLeft size={12} />
            </button>
            <button
              onClick={next}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              style={{ backgroundColor: 'color-mix(in srgb, var(--bg-surface) 75%, transparent)' }}
              aria-label="Next photo"
            >
              <ChevronRight size={12} />
            </button>
          </>
        )}

        {/* Dots */}
        {hasMultiple && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1 z-10">
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
              <div className="absolute bottom-1.5 left-1.5 z-10">
                <PositionPicker
                  slot={slot}
                  imageIndex={index}
                  allPositions={positions}
                  current={objectPosition}
                />
              </div>
            )}
            <div className="absolute bottom-1.5 right-1.5 flex gap-1 z-10">
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
      <div className="flex-1 p-5 flex flex-col gap-1.5">
        <span className="text-[10px] font-mono text-accent tracking-[0.15em] uppercase">
          {tag}
        </span>
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
      </div>
    </div>
  )
}

export default function ExperiencesSection({ isAdmin, experienceImages = {}, experiencePositions = {} }: ExperiencesSectionProps) {
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
              Experiences
            </span>
          </div>

          <p
            className="font-display text-2xl md:text-3xl text-foreground mb-10"
            style={{ fontVariationSettings: "'opsz' 32, 'wght' 400, 'SOFT' 20" }}
          >
            Things I&apos;ve done
          </p>
        </ScrollFade>

        <div className="flex flex-col gap-4">
          {experiences.map((exp, i) => (
            <ScrollFade key={exp.name} delay={i * 80}>
              <ExperienceCard
                {...exp}
                slot={`exp-${toSlug(exp.name)}`}
                resolvedImages={experienceImages[exp.name]}
                positions={experiencePositions[exp.name]}
                isAdmin={isAdmin}
              />
            </ScrollFade>
          ))}
        </div>
      </div>
    </section>
  )
}
