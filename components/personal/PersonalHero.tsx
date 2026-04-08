export default function PersonalHero() {
  return (
    <section className="pt-32 pb-16 max-w-5xl mx-auto px-6">
      <div className="flex items-center gap-3 mb-6">
        <span
          className="w-1.5 h-1.5 rounded-full bg-accent inline-block flex-shrink-0"
          aria-hidden="true"
        />
        <span className="text-xs font-mono text-muted tracking-[0.18em] uppercase">
          About me
        </span>
      </div>

      <h1
        className="font-display text-4xl md:text-5xl text-foreground mb-6 leading-tight"
        style={{ fontVariationSettings: "'opsz' 48, 'wght' 400, 'SOFT' 20" }}
      >
        Beyond the code
      </h1>

      <p className="text-muted text-base md:text-lg leading-relaxed max-w-xl">
        There&apos;s more to life than shipping software. I spend a lot of time
        outdoors — hiking mountains, running trails — and coming home to my dog Caia.
        This is the less polished, more personal side of things.
      </p>
    </section>
  )
}
