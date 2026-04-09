'use client'

import { ChevronLeft, ChevronRight, Move, Check, Trash2 } from 'lucide-react'
import AdminUploadButton from './AdminUploadButton'
import DraggableImage from './DraggableImage'
import HeightControl from './HeightControl'
import { useImageGallery } from '@/hooks/useImageGallery'

interface ImageCarouselProps {
  slot: string
  resolvedImages?: string[]
  positions?: string[]
  initialHeight?: number
  defaultHeight: number
  alt: string
  sizes: string
  isAdmin?: boolean
  /** Use smaller controls for narrow image panels (e.g. ExperienceCard) */
  compact?: boolean
  className?: string
}

export default function ImageCarousel({
  slot, resolvedImages = [], positions = [], initialHeight, defaultHeight,
  alt, sizes, isAdmin, compact = false, className = '',
}: ImageCarouselProps) {
  const {
    index, setIndex, isRepositioning, setIsRepositioning,
    imageHeight, setImageHeight, localImages, localPositions,
    hasImages, hasMultiple, src,
    prev, next, reorder, deleteImage,
    onTouchStart, onTouchEnd,
  } = useImageGallery({ slot, resolvedImages, positions, initialHeight, defaultHeight })

  // Sizing tokens — standard vs compact
  const iconNav    = compact ? 12 : 14
  const iconAdmin  = compact ? 10 : 11
  const btnNav     = compact ? 'w-6 h-6' : 'w-7 h-7'
  const btnReorder = compact ? 'w-5 h-5' : 'w-6 h-6'
  const btnDelete  = compact ? 'w-6 h-6' : 'w-7 h-7'
  const pad        = compact ? '1.5' : '2'          // numeric string for inline style

  // Inline-style positions so Tailwind doesn't need to generate all combos dynamically
  const TL: React.CSSProperties = { position: 'absolute', top: `${parseFloat(pad) * 4}px`, left: `${parseFloat(pad) * 4}px`, zIndex: 10 }
  const TR: React.CSSProperties = { position: 'absolute', top: `${parseFloat(pad) * 4}px`, right: `${parseFloat(pad) * 4}px`, zIndex: 10 }
  const BL: React.CSSProperties = { position: 'absolute', bottom: `${parseFloat(pad) * 4}px`, left: `${parseFloat(pad) * 4}px`, zIndex: 10 }
  const BR: React.CSSProperties = { position: 'absolute', bottom: `${parseFloat(pad) * 4}px`, right: `${parseFloat(pad) * 4}px`, zIndex: 10 }

  const glassBg = 'color-mix(in srgb, var(--bg-surface) 80%, transparent)'
  const navBg   = 'color-mix(in srgb, var(--bg-surface) 75%, transparent)'

  const reorderBtnClass = `${btnReorder} rounded-full flex items-center justify-center border disabled:opacity-30 transition-colors duration-200`
  const reorderBtnStyle = { color: 'var(--text-muted)', borderColor: 'var(--border)', backgroundColor: glassBg }

  return (
    <div
      className={`relative w-full bg-surface flex items-center justify-center group ${className}`}
      style={{ height: imageHeight }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Image or placeholder */}
      {hasImages ? (
        <DraggableImage
          src={src}
          alt={alt}
          sizes={sizes}
          slot={slot}
          imageIndex={index}
          allPositions={localPositions}
          isRepositioning={isRepositioning}
        />
      ) : (
        <span className="text-[11px] font-mono text-muted opacity-50 tracking-[0.15em] uppercase text-center px-3">
          No photo yet
        </span>
      )}

      {/* Nav arrows */}
      {hasMultiple && !isRepositioning && (
        <>
          <button
            onClick={prev}
            className={`absolute left-2 top-1/2 -translate-y-1/2 ${btnNav} rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10`}
            style={{ backgroundColor: navBg }}
            aria-label="Previous photo"
          >
            <ChevronLeft size={iconNav} />
          </button>
          <button
            onClick={next}
            className={`absolute right-2 top-1/2 -translate-y-1/2 ${btnNav} rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10`}
            style={{ backgroundColor: navBg }}
            aria-label="Next photo"
          >
            <ChevronRight size={iconNav} />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {hasMultiple && !isRepositioning && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {localImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className="w-1.5 h-1.5 rounded-full transition-colors duration-200"
              style={{ backgroundColor: i === index ? 'var(--foreground)' : 'color-mix(in srgb, var(--foreground) 35%, transparent)' }}
              aria-label={`Photo ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* "Drag to reposition" hint */}
      {isRepositioning && (
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono px-2 py-0.5 rounded-full pointer-events-none z-10"
          style={{ backgroundColor: glassBg, color: 'var(--text-muted)' }}
        >
          drag to reposition
        </div>
      )}

      {/* Admin controls */}
      {isAdmin && (
        <>
          {/* Top-left: reorder */}
          {hasMultiple && !isRepositioning && (
            <div style={{ ...TL, display: 'flex', gap: '4px' }}>
              <button
                onClick={() => reorder(-1)}
                disabled={index === 0}
                className={reorderBtnClass}
                style={reorderBtnStyle}
                aria-label="Move image earlier"
              >
                <ChevronLeft size={iconAdmin} />
              </button>
              <button
                onClick={() => reorder(1)}
                disabled={index === localImages.length - 1}
                className={reorderBtnClass}
                style={reorderBtnStyle}
                aria-label="Move image later"
              >
                <ChevronRight size={iconAdmin} />
              </button>
            </div>
          )}

          {/* Top-right: height control */}
          {!isRepositioning && (
            <div style={TR}>
              <HeightControl slot={slot} value={imageHeight} onChange={setImageHeight} />
            </div>
          )}

          {/* Bottom-left: reposition toggle */}
          {hasImages && (
            <div style={BL}>
              <button
                onClick={() => setIsRepositioning((v) => !v)}
                className={`flex items-center gap-1.5 ${compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]'} font-mono rounded-full border transition-colors duration-200`}
                style={{
                  color: isRepositioning ? 'var(--accent)' : 'var(--text-muted)',
                  borderColor: isRepositioning ? 'var(--accent)' : 'var(--border)',
                  backgroundColor: glassBg,
                }}
              >
                {isRepositioning ? <Check size={iconAdmin} /> : <Move size={iconAdmin} />}
                {isRepositioning ? 'Done' : 'Move'}
              </button>
            </div>
          )}

          {/* Bottom-right: delete + upload */}
          {!isRepositioning && (
            <div style={{ ...BR, display: 'flex', gap: '6px' }}>
              {hasImages && (
                <button
                  onClick={deleteImage}
                  className={`flex items-center justify-center ${btnDelete} rounded-full border transition-colors duration-200 hover:border-red-400 hover:text-red-400`}
                  style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', backgroundColor: glassBg }}
                  aria-label="Delete photo"
                >
                  <Trash2 size={iconAdmin} />
                </button>
              )}
              {hasImages && <AdminUploadButton slot={slot} label="+" mode="add" />}
              <AdminUploadButton slot={slot} label={hasImages ? 'Replace' : 'Add photo'} mode="replace" />
            </div>
          )}
        </>
      )}
    </div>
  )
}
