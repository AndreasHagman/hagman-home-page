import Image from 'next/image'
import AdminUploadButton from './AdminUploadButton'
import type { Hike } from '@/lib/hikes'

interface HikeCardProps {
  hike: Hike
  resolvedImage?: string
  isAdmin?: boolean
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export default function HikeCard({ hike, resolvedImage, isAdmin }: HikeCardProps) {
  const slot = `hike-${toSlug(hike.name)}`

  return (
    <div className="flex flex-col bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Image or placeholder */}
      <div className="relative h-48 w-full bg-surface flex items-center justify-center border-b border-border">
        {resolvedImage ? (
          <Image
            src={resolvedImage}
            alt={hike.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <span className="text-[11px] font-mono text-muted opacity-50 tracking-[0.15em] uppercase">
            No photo yet
          </span>
        )}

        {/* Admin upload overlay */}
        {isAdmin && (
          <div className="absolute bottom-2 right-2">
            <AdminUploadButton slot={slot} label={resolvedImage ? 'Replace' : 'Add photo'} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3
            className="font-display text-lg text-foreground leading-tight"
            style={{ fontVariationSettings: "'opsz' 20, 'wght' 500, 'SOFT' 15" }}
          >
            {hike.name}
          </h3>
          <span className="flex-shrink-0 text-[11px] font-mono text-muted mt-0.5">
            {hike.year}
          </span>
        </div>

        <p className="text-xs font-mono text-accent mb-3">{hike.location}</p>

        <p className="text-muted text-sm leading-relaxed flex-1">
          {hike.description}
        </p>
      </div>
    </div>
  )
}
