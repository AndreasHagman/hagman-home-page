import { experiences } from '@/lib/experiences'
import ScrollFade from '@/components/ScrollFade'

export default function ExperiencesSection() {
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
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 p-5 bg-surface border border-border rounded-2xl">
                <div className="flex-shrink-0 flex items-center gap-3 sm:w-48">
                  <div>
                    <span className="text-[10px] font-mono text-accent tracking-[0.15em] uppercase">
                      {exp.tag}
                    </span>
                    <h3
                      className="font-display text-lg text-foreground leading-tight mt-0.5"
                      style={{ fontVariationSettings: "'opsz' 20, 'wght' 500, 'SOFT' 15" }}
                    >
                      {exp.name}
                    </h3>
                  </div>
                </div>

                <div className="hidden sm:block w-px self-stretch bg-border flex-shrink-0" />

                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted">{exp.location}</span>
                    <span className="text-[10px] font-mono text-muted opacity-50">{exp.year}</span>
                  </div>
                  <p className="text-muted text-sm leading-relaxed">{exp.description}</p>
                </div>
              </div>
            </ScrollFade>
          ))}
        </div>
      </div>
    </section>
  )
}
