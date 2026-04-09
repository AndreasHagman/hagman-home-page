import { hikes } from '@/lib/hikes'
import HikeCard from './HikeCard'
import ScrollFade from '@/components/ScrollFade'

interface HikeSectionProps {
  isAdmin?: boolean
  hikeImages?: Record<string, string[]>
}

export default function HikeSection({ isAdmin, hikeImages = {} }: HikeSectionProps) {
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
              Hikes & Trips
            </span>
          </div>

          <p
            className="font-display text-2xl md:text-3xl text-foreground mb-10"
            style={{ fontVariationSettings: "'opsz' 32, 'wght' 400, 'SOFT' 20" }}
          >
            Places I&apos;ve been
          </p>
        </ScrollFade>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hikes.map((hike, i) => (
            <ScrollFade key={hike.name} delay={i * 80}>
              <HikeCard
                hike={hike}
                resolvedImages={hikeImages[hike.name]}
                isAdmin={isAdmin}
              />
            </ScrollFade>
          ))}
        </div>
      </div>
    </section>
  )
}
