export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center overflow-hidden dot-grid-bg"
    >
      {/* Ambient glow — top right */}
      <div
        className="hero-blob absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, var(--accent) 0%, transparent 65%)',
          filter: 'blur(90px)',
          opacity: 0.18,
        }}
        aria-hidden="true"
      />

      {/* Ambient glow — bottom left */}
      <div
        className="hero-blob absolute -bottom-16 -left-32 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, var(--accent) 0%, transparent 65%)',
          filter: 'blur(80px)',
          opacity: 0.12,
          animationDelay: '-5s',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-5xl mx-auto px-6 pt-32 pb-28 w-full">
        <div className="hero-animate max-w-3xl">
          {/* Eyebrow */}
          <p className="text-xs font-mono text-accent tracking-[0.2em] uppercase mb-6">
            Hello, I&apos;m
          </p>

          {/* Name */}
          <h1 className="font-display hero-name text-[clamp(3.75rem,11vw,7.5rem)] text-foreground mb-8">
            Andreas
            <br />
            Hagman
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-muted font-light leading-relaxed mb-5 max-w-lg">
            Developer building{' '}
            <span className="text-accent font-medium">small, fun,</span>
            {' '}and useful apps
          </p>

          {/* Intro */}
          <p className="text-base md:text-lg text-muted leading-relaxed mb-10 max-w-lg">
            I turn ideas into working software — whether tracking my runs or building
            games to play with friends. I build things to learn, to solve problems,
            and mostly because it&apos;s fun. AI has become a big part of how I develop,
            letting me move faster and tackle more ambitious ideas.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-background font-medium text-sm rounded-full transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
              style={{
                boxShadow:
                  '0 4px 20px -4px color-mix(in srgb, var(--accent) 50%, transparent)',
              }}
            >
              View Projects
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground font-medium text-sm rounded-full transition-all duration-200 hover:border-accent hover:text-accent hover:-translate-y-0.5"
            >
              Contact
            </a>
          </div>
        </div>

        {/* Scroll nudge */}
        <div
          className="absolute bottom-10 left-6 flex items-center gap-3 text-muted"
          style={{ opacity: 0.5 }}
        >
          <div className="w-6 h-px bg-current" />
          <span className="text-[11px] font-mono tracking-[0.18em] uppercase">
            Scroll
          </span>
        </div>
      </div>
    </section>
  )
}
