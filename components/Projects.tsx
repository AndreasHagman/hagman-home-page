import { projects } from '@/lib/projects'
import ProjectCard from './ProjectCard'
import ScrollFade from './ScrollFade'

export default function Projects() {
  return (
    <section id="projects" className="py-24 md:py-32 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollFade>
          <div className="flex items-center gap-3 mb-4">
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent inline-block flex-shrink-0"
              aria-hidden="true"
            />
            <span className="text-xs font-mono text-muted tracking-[0.18em] uppercase">
              Projects
            </span>
          </div>

          <p
            className="font-display text-3xl md:text-4xl text-foreground mb-14"
            style={{
              fontVariationSettings: "'opsz' 40, 'wght' 400, 'SOFT' 20",
            }}
          >
            Things I&apos;ve built
          </p>
        </ScrollFade>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => (
            <ScrollFade key={project.name} delay={i * 90}>
              <ProjectCard project={project} />
            </ScrollFade>
          ))}
        </div>
      </div>
    </section>
  )
}
