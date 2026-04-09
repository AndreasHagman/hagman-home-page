'use client'

import { experiences } from '@/lib/experiences'
import ScrollFade from '@/components/ScrollFade'
import ImageCarousel from './ImageCarousel'
import { SLOTS } from '@/lib/slots'

interface ExperiencesSectionProps {
  isAdmin?: boolean
  experienceImages?: Record<string, string[]>
  experiencePositions?: Record<string, string[]>
  experienceHeights?: Record<string, number>
}

function ExperienceCard({
  name, location, year, description, tag,
  resolvedImages = [], positions = [], initialHeight, isAdmin,
}: {
  name: string; location: string; year: number; description: string
  tag: string; resolvedImages?: string[]; positions?: string[]
  initialHeight?: number; isAdmin?: boolean
}) {
  const slot = SLOTS.exp(name)

  return (
    <div className="flex flex-col sm:flex-row sm:items-stretch bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Image */}
      <div className="relative w-full sm:w-40 flex-shrink-0 bg-surface border-b sm:border-b-0 sm:border-r border-border">
        <ImageCarousel
          slot={slot}
          resolvedImages={resolvedImages}
          positions={positions}
          initialHeight={initialHeight}
          defaultHeight={160}
          alt={name}
          sizes="(max-width: 640px) 100vw, 160px"
          isAdmin={isAdmin}
          compact
        />
      </div>

      {/* Content */}
      <div className="flex-1 p-5 flex flex-col gap-1.5">
        <span className="text-[10px] font-mono text-accent tracking-[0.15em] uppercase">{tag}</span>
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg text-foreground leading-tight" style={{ fontVariationSettings: "'opsz' 20, 'wght' 500, 'SOFT' 15" }}>{name}</h3>
          <span className="flex-shrink-0 text-[11px] font-mono text-muted mt-0.5">{year}</span>
        </div>
        <p className="text-xs font-mono text-muted mb-1">{location}</p>
        <p className="text-muted text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export default function ExperiencesSection({ isAdmin, experienceImages = {}, experiencePositions = {}, experienceHeights = {} }: ExperiencesSectionProps) {
  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollFade>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block flex-shrink-0" aria-hidden="true" />
            <span className="text-xs font-mono text-muted tracking-[0.18em] uppercase">Experiences</span>
          </div>
          <p className="font-display text-2xl md:text-3xl text-foreground mb-10" style={{ fontVariationSettings: "'opsz' 32, 'wght' 400, 'SOFT' 20" }}>
            Things I&apos;ve done
          </p>
        </ScrollFade>
        <div className="flex flex-col gap-4">
          {experiences.map((exp, i) => (
            <ScrollFade key={exp.name} delay={i * 80}>
              <ExperienceCard
                {...exp}
                resolvedImages={experienceImages[exp.name]}
                positions={experiencePositions[exp.name]}
                initialHeight={experienceHeights[exp.name]}
                isAdmin={isAdmin}
              />
            </ScrollFade>
          ))}
        </div>
      </div>
    </section>
  )
}
