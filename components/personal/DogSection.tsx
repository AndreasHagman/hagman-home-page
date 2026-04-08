import Image from 'next/image'
import ScrollFade from '@/components/ScrollFade'
import AdminUploadButton from './AdminUploadButton'

interface DogSectionProps {
  isAdmin?: boolean
  resolvedImage?: string
}

export default function DogSection({ isAdmin, resolvedImage }: DogSectionProps) {
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
              My dog
            </span>
          </div>

          <p
            className="font-display text-2xl md:text-3xl text-foreground mb-8"
            style={{ fontVariationSettings: "'opsz' 32, 'wght' 400, 'SOFT' 20" }}
          >
            Meet Caia
          </p>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Photo */}
            <div className="relative w-full sm:w-64 h-64 flex-shrink-0 rounded-2xl overflow-hidden bg-surface border border-border flex items-center justify-center">
              {resolvedImage ? (
                <Image
                  src={resolvedImage}
                  alt="Caia"
                  fill
                  className="object-cover"
                  sizes="256px"
                />
              ) : (
                <span className="text-[11px] font-mono text-muted opacity-50 tracking-[0.15em] uppercase">
                  No photo yet
                </span>
              )}

              {isAdmin && (
                <div className="absolute bottom-2 right-2">
                  <AdminUploadButton slot="caia" label={resolvedImage ? 'Replace' : 'Add photo'} />
                </div>
              )}
            </div>

            {/* Text */}
            <div className="flex flex-col gap-4">
              <p className="text-muted text-base leading-relaxed">
                Caia is my dog and the best co-worker I&apos;ve had. She&apos;s always
                up for a walk, never complains about deadlines, and has a remarkable
                talent for napping through video calls.
              </p>
              <p className="text-muted text-base leading-relaxed">
                Most of my hiking trips come with a four-legged hiking partner — she
                handles the terrain better than I do.
              </p>
            </div>
          </div>
        </ScrollFade>
      </div>
    </section>
  )
}
