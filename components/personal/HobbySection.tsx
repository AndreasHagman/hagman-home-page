import ScrollFade from '@/components/ScrollFade'

const hobbies = [
  { label: 'Running', emoji: '🏃' },
  { label: 'Hiking', emoji: '🏔️' },
  { label: 'Game Jams', emoji: '🎮' },
  { label: 'Side Projects', emoji: '🔧' },
  { label: 'Dog walks', emoji: '🐾' },
  { label: 'Music', emoji: '🎵' },
]

export default function HobbySection() {
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
              Interests
            </span>
          </div>

          <p
            className="font-display text-2xl md:text-3xl text-foreground mb-8"
            style={{ fontVariationSettings: "'opsz' 32, 'wght' 400, 'SOFT' 20" }}
          >
            What I do when I&apos;m not coding
          </p>

          <div className="flex flex-wrap gap-3">
            {hobbies.map((hobby) => (
              <span
                key={hobby.label}
                className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-muted border border-border rounded-full hover:border-accent hover:text-accent transition-colors duration-200 cursor-default select-none"
              >
                <span aria-hidden="true">{hobby.emoji}</span>
                {hobby.label}
              </span>
            ))}
          </div>
        </ScrollFade>
      </div>
    </section>
  )
}
