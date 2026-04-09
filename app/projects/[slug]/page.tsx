import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { ExternalLink, Github, ArrowLeft } from 'lucide-react'
import { projects } from '@/lib/projects'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { SLOTS } from '@/lib/slots'
import ProjectScreenshots from '@/components/ProjectScreenshots'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = projects.find((p) => p.slug === slug)
  if (!project) return {}
  return {
    title: `${project.name} — Andreas Hagman`,
    description: project.description,
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = projects.find((p) => p.slug === slug)
  if (!project) notFound()

  // Check admin session
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('admin_session')?.value
  let isAdmin = false
  if (sessionCookie) {
    try {
      await adminAuth.verifySessionCookie(sessionCookie, true)
      isAdmin = true
    } catch {
      isAdmin = false
    }
  }

  // Fetch screenshots from Firestore
  const slot = SLOTS.project(slug)
  const doc = await adminDb.collection('personal-images').doc('slots').get()
  const data = doc.data() ?? {}
  const screenshots: string[] = Array.isArray(data[slot]) ? data[slot] : []

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-3xl mx-auto px-6 py-20">

          {/* Back */}
          <a
            href="/#projects"
            className="inline-flex items-center gap-2 text-xs font-mono text-muted hover:text-foreground transition-colors duration-200 mb-12"
          >
            <ArrowLeft size={13} />
            Projects
          </a>

          {/* Header */}
          <div className="mb-10">
            <span
              className="inline-block mb-5 px-2.5 py-1 text-[11px] font-mono text-accent rounded-full border"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                borderColor: 'color-mix(in srgb, var(--accent) 22%, transparent)',
              }}
            >
              {project.tag}
            </span>

            <h1
              className="font-display text-4xl md:text-5xl text-foreground mb-6 leading-tight"
              style={{ fontVariationSettings: "'opsz' 48, 'wght' 400, 'SOFT' 20" }}
            >
              {project.name}
            </h1>

            {/* Links */}
            <div className="flex flex-wrap gap-3">
              {project.type !== 'repo' && (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-background text-sm font-medium rounded-full transition-all duration-200 hover:opacity-90"
                >
                  <ExternalLink size={13} />
                  Open app
                </a>
              )}
              {(project.repoHref ?? (project.type === 'repo' ? project.href : null)) && (
                <a
                  href={project.repoHref ?? project.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground text-sm font-medium rounded-full transition-all duration-200 hover:border-accent hover:text-accent"
                >
                  <Github size={13} />
                  View on GitHub
                </a>
              )}
            </div>
          </div>

          {/* Description */}
          {project.longDescription && (
            <p className="text-muted text-base md:text-lg leading-relaxed mb-12">
              {project.longDescription}
            </p>
          )}

          {/* Tech stack */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="mb-12">
              <p className="text-xs font-mono text-muted tracking-[0.12em] uppercase opacity-60 mb-3">
                Built with
              </p>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 text-xs font-mono text-accent border rounded-full cursor-default select-none"
                    style={{ borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)' }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {project.features && project.features.length > 0 && (
            <div className="mb-12">
              <p className="text-xs font-mono text-muted tracking-[0.12em] uppercase opacity-60 mb-4">
                Features
              </p>
              <ul className="flex flex-col gap-3">
                {project.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-muted leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 mt-1.5" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Screenshots — client component handles upload/delete */}
          <ProjectScreenshots
            slug={slug}
            initialScreenshots={screenshots}
            isAdmin={isAdmin}
          />

        </div>
      </main>
      <Footer />
    </>
  )
}
