'use client'

import { ExternalLink } from 'lucide-react'
import type { Project } from '@/lib/projects'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const isExternal = project.href !== '#'

  return (
    <div className="group relative flex flex-col bg-surface border border-border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-accent"
      style={{ boxShadow: '0 1px 4px 0 rgba(0,0,0,0.05)' }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 8px 32px -8px color-mix(in srgb, var(--accent) 25%, transparent), 0 1px 4px 0 rgba(0,0,0,0.05)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.boxShadow =
          '0 1px 4px 0 rgba(0,0,0,0.05)'
      }}
    >
      {/* Tag */}
      <span
        className="self-start mb-5 px-2.5 py-1 text-[11px] font-mono text-accent rounded-full border"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)',
          borderColor: 'color-mix(in srgb, var(--accent) 22%, transparent)',
        }}
      >
        {project.tag}
      </span>

      {/* Title row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3
          className="font-display text-xl text-foreground group-hover:text-accent transition-colors duration-200 leading-tight"
          style={{ fontVariationSettings: "'opsz' 24, 'wght' 600, 'SOFT' 15" }}
        >
          {project.name}
        </h3>
        <ExternalLink
          size={15}
          strokeWidth={1.75}
          className="text-muted flex-shrink-0 mt-0.5 transition-all duration-200 group-hover:text-accent group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
      </div>

      {/* Description */}
      <p className="text-muted text-sm leading-relaxed flex-1">
        {project.description}
      </p>

      {/* Note */}
      {project.note && (
        <p className="mt-2 text-[11px] font-mono text-muted opacity-70">
          {project.note}
        </p>
      )}

      {/* Bottom row: external link + optional detail link */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <a
          href={project.href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="flex items-center gap-1.5 text-xs font-mono text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <span>{project.type === 'repo' ? 'View on GitHub' : 'Open app'}</span>
          <span aria-hidden="true">→</span>
        </a>

        {project.slug && (
          <a
            href={`/projects/${project.slug}`}
            className="text-xs font-mono text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:text-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            Details →
          </a>
        )}
      </div>
    </div>
  )
}
