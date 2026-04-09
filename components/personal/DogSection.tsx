'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Move, Check } from 'lucide-react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import ScrollFade from '@/components/ScrollFade'
import AdminUploadButton from './AdminUploadButton'
import DraggableImage from './DraggableImage'
import HeightControl from './HeightControl'

const DEFAULT_HEIGHT = 256

interface DogSectionProps {
  isAdmin?: boolean
  resolvedImages?: string[]
  positions?: string[]
  initialHeight?: number
}

export default function DogSection({ isAdmin, resolvedImages = [], positions = [], initialHeight }: DogSectionProps) {
  const [index, setIndex] = useState(0)
  const [isRepositioning, setIsRepositioning] = useState(false)
  const [imageHeight, setImageHeight] = useState(initialHeight ?? DEFAULT_HEIGHT)
  const [localImages, setLocalImages] = useState(resolvedImages)
  const [localPositions, setLocalPositions] = useState(positions)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (initialHeight) setImageHeight(initialHeight)
  }, [initialHeight])

  useEffect(() => { setLocalImages(resolvedImages) }, [resolvedImages])
  useEffect(() => { setLocalPositions(positions) }, [positions])

  const hasImages = localImages.length > 0
  const hasMultiple = localImages.length > 1
  const src = localImages[index] ?? ''

  function prev() { setIndex((i) => (i - 1 + localImages.length) % localImages.length) }
  function next() { setIndex((i) => (i + 1) % localImages.length) }

  async function reorder(dir: -1 | 1) {
    const newIndex = index + dir
    if (newIndex < 0 || newIndex >= localImages.length) return
    const imgs = [...localImages]
    const pos = [...localPositions]
    ;[imgs[index], imgs[newIndex]] = [imgs[newIndex], imgs[index]]
    ;[pos[index], pos[newIndex]] = [pos[newIndex], pos[index]]
    setLocalImages(imgs)
    setLocalPositions(pos)
    setIndex(newIndex)
    await setDoc(
      doc(db, 'personal-images', 'slots'),
      { caia: imgs, 'caia-positions': pos },
      { merge: true }
    ).catch(console.error)
  }

  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollFade>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block flex-shrink-0" aria-hidden="true" />
            <span className="text-xs font-mono text-muted tracking-[0.18em] uppercase">My dog</span>
          </div>

          <p
            className="font-display text-2xl md:text-3xl text-foreground mb-8"
            style={{ fontVariationSettings: "'opsz' 32, 'wght' 400, 'SOFT' 20" }}
          >
            Meet Caia
          </p>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Photo */}
            <div
              className="relative w-full sm:w-64 flex-shrink-0 rounded-2xl overflow-hidden bg-surface border border-border flex items-center justify-center group"
              style={{ height: imageHeight }}
              onTouchStart={!isRepositioning ? (e) => { touchStartX.current = e.touches[0].clientX } : undefined}
              onTouchEnd={!isRepositioning && hasMultiple ? (e) => {
                if (touchStartX.current === null) return
                const delta = touchStartX.current - e.changedTouches[0].clientX
                if (Math.abs(delta) > 40) delta > 0 ? next() : prev()
                touchStartX.current = null
              } : undefined}
            >
              {hasImages ? (
                <DraggableImage
                  src={src}
                  alt={`Caia ${index + 1}`}
                  sizes="256px"
                  slot="caia"
                  imageIndex={index}
                  allPositions={localPositions}
                  isRepositioning={isRepositioning}
                />
              ) : (
                <span className="text-[11px] font-mono text-muted opacity-50 tracking-[0.15em] uppercase">
                  No photo yet
                </span>
              )}

              {hasMultiple && !isRepositioning && (
                <>
                  <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-surface) 75%, transparent)' }} aria-label="Previous photo"><ChevronLeft size={14} /></button>
                  <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-surface) 75%, transparent)' }} aria-label="Next photo"><ChevronRight size={14} /></button>
                </>
              )}

              {hasMultiple && !isRepositioning && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {localImages.map((_, i) => (
                    <button key={i} onClick={() => setIndex(i)} className="w-1.5 h-1.5 rounded-full transition-colors duration-200" style={{ backgroundColor: i === index ? 'var(--foreground)' : 'color-mix(in srgb, var(--foreground) 35%, transparent)' }} aria-label={`Photo ${i + 1}`} />
                  ))}
                </div>
              )}

              {isRepositioning && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono px-2 py-0.5 rounded-full pointer-events-none z-10" style={{ backgroundColor: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)', color: 'var(--text-muted)' }}>
                  drag to reposition
                </div>
              )}

              {isAdmin && (
                <>
                  {hasMultiple && !isRepositioning && (
                    <div className="absolute top-2 left-2 z-10 flex gap-1">
                      <button
                        onClick={() => reorder(-1)}
                        disabled={index === 0}
                        className="w-6 h-6 rounded-full flex items-center justify-center border disabled:opacity-30 transition-colors duration-200"
                        style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)' }}
                        aria-label="Move image earlier"
                      ><ChevronLeft size={11} /></button>
                      <button
                        onClick={() => reorder(1)}
                        disabled={index === localImages.length - 1}
                        className="w-6 h-6 rounded-full flex items-center justify-center border disabled:opacity-30 transition-colors duration-200"
                        style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)' }}
                        aria-label="Move image later"
                      ><ChevronRight size={11} /></button>
                    </div>
                  )}
                  {!isRepositioning && (
                    <div className="absolute top-2 right-2 z-10">
                      <HeightControl slot="caia" value={imageHeight} onChange={setImageHeight} />
                    </div>
                  )}
                  {hasImages && (
                    <div className="absolute bottom-2 left-2 z-10">
                      <button
                        onClick={() => setIsRepositioning((v) => !v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono rounded-full border transition-colors duration-200"
                        style={{
                          color: isRepositioning ? 'var(--accent)' : 'var(--text-muted)',
                          borderColor: isRepositioning ? 'var(--accent)' : 'var(--border)',
                          backgroundColor: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)',
                        }}
                      >
                        {isRepositioning ? <Check size={11} /> : <Move size={11} />}
                        {isRepositioning ? 'Done' : 'Move'}
                      </button>
                    </div>
                  )}
                  {!isRepositioning && (
                    <div className="absolute bottom-2 right-2 flex gap-1.5 z-10">
                      {hasImages && <AdminUploadButton slot="caia" label="+" mode="add" />}
                      <AdminUploadButton slot="caia" label={hasImages ? 'Replace' : 'Add photo'} mode="replace" />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Text */}
            <div className="flex flex-col gap-4">
              <p className="text-muted text-base leading-relaxed">
                Caia was born on 16 March 2025, so she&apos;s still very much a puppy.
                She&apos;s already been through three dog training courses — with more to
                come — and we work a lot on commands and everyday obedience.
              </p>
              <p className="text-muted text-base leading-relaxed">
                She loves being outside and going on walks, but is equally happy
                curling up in your lap the moment you sit down. The best of both worlds.
              </p>
            </div>
          </div>
        </ScrollFade>
      </div>
    </section>
  )
}
