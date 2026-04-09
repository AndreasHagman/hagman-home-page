import ScrollFade from './ScrollFade'
import { hikes } from '@/lib/hikes'

const snippets = [
  {
    label: 'Hikes',
    value: `${hikes.length} peaks`,
    detail: `including ${hikes[hikes.length - 1].name}`,
  },
  {
    label: 'Races',
    value: 'Tough Viking',
    detail: 'Holmenkollstafetten & more',
  },
  {
    label: 'Dog',
    value: 'Caia',
    detail: 'Nova Scotia Duck Tolling Retriever',
  },
]

export default function PersonalTeaser() {
  return (
    <section className="py-24 md:py-32 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollFade>
          <div className="flex items-center gap-3 mb-4">
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent inline-block flex-shrink-0"
              aria-hidden="true"
            />
            <span className="text-xs font-mono text-muted tracking-[0.18em] uppercase">
              Outside of code
            </span>
          </div>

          <p
            className="font-display text-3xl md:text-4xl text-foreground mb-12 max-w-xl"
            style={{ fontVariationSettings: "'opsz' 40, 'wght' 400, 'SOFT' 20" }}
          >
            There&apos;s more to life than shipping.
          </p>
        </ScrollFade>

        <ScrollFade delay={100}>
          <div className="grid sm:grid-cols-3 gap-8 mb-12">
            {snippets.map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <span className="text-[11px] font-mono text-muted tracking-[0.15em] uppercase opacity-60">
                  {s.label}
                </span>
                <span
                  className="font-display text-xl text-foreground"
                  style={{ fontVariationSettings: "'opsz' 24, 'wght' 500, 'SOFT' 15" }}
                >
                  {s.value}
                </span>
                <span className="text-sm text-muted">{s.detail}</span>
              </div>
            ))}
          </div>

          <a
            href="/personal"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-medium text-sm rounded-full transition-all duration-200 hover:border-accent hover:text-accent hover:-translate-y-0.5"
          >
            See the personal page
            <span aria-hidden="true">→</span>
          </a>
        </ScrollFade>
      </div>
    </section>
  )
}
