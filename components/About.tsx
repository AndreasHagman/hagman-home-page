import ScrollFade from './ScrollFade'

const interests = ['Web Apps', 'Side Projects', 'Tooling', 'Running', 'Game Jams']

export default function About() {
  return (
    <section id="about" className="py-24 md:py-32 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollFade>
          <div className="flex items-center gap-3 mb-12">
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent inline-block flex-shrink-0"
              aria-hidden="true"
            />
            <span className="text-xs font-mono text-muted tracking-[0.18em] uppercase">
              About
            </span>
          </div>
        </ScrollFade>

        <ScrollFade delay={120}>
          <p
            className="font-display text-3xl md:text-4xl text-foreground leading-snug mb-6 max-w-2xl"
            style={{
              fontVariationSettings: "'opsz' 40, 'wght' 400, 'SOFT' 20",
            }}
          >
            I build things because{' '}
            <em className="not-italic text-accent">I enjoy it</em>.
          </p>

          <p className="text-muted text-base md:text-lg leading-relaxed max-w-xl mb-10">
            I&apos;m a developer who loves building side projects — from fitness trackers
            to party games. My work is driven by curiosity and the pleasure of making
            something from nothing. I care about clean code, good UX, and actually
            shipping things.
          </p>

          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span
                key={interest}
                className="px-3 py-1.5 text-xs font-mono text-muted border border-border rounded-full hover:border-accent hover:text-accent transition-colors duration-200 cursor-default select-none"
              >
                {interest}
              </span>
            ))}
          </div>
        </ScrollFade>
      </div>
    </section>
  )
}
