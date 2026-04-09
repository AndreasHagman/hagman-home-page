'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Move, Check, Trash2 } from 'lucide-react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import ScrollFade from '@/components/ScrollFade'
import AdminUploadButton from './AdminUploadButton'
import DraggableImage from './DraggableImage'
import HeightControl from './HeightControl'

const DEFAULT_HEIGHT = 256

const races = [
  { name: 'Tough Viking',        year: 2023, note: undefined },
  { name: 'Holmenkollstafetten', year: 2024, note: 'with Storebrand' },
  { name: 'Sentrumsløpet',       year: 2025, note: undefined },
  { name: 'Nordmarkstravern',    year: 2025, note: undefined },
]

interface RacesSectionProps {
  isAdmin?: boolean
  resolvedImages?: string[]
  positions?: string[]
  initialHeight?: number
}

export default function RacesSection({ isAdmin, resolvedImages = [], positions = [], initialHeight }: RacesSectionProps) {
  const [index, setIndex] = useState(0)
  const [isRepositioning, setIsRepositioning] = useState(false)
  const [imageHeight, setImageHeight] = useState(initialHeight ?? DEFAULT_HEIGHT)
  const [localImages, setLocalImages] = useState(resolvedImages)
  const [localPositions, setLocalPositions] = useState(positions)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (initialHeight) setImageHeight(initialHeight)
  }, [initialHeight])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setLocalImages(resolvedImages) }, [JSON.stringify(resolvedImages)])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setLocalPositions(positions) }, [JSON.stringify(positions)])

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
      { races: imgs, 'races-positions': pos },
      { merge: true }
    ).catch(console.error)
  }

  async function deleteImage() {
    const imgs = localImages.filter((_, i) => i !== index)
    const pos = localPositions.filter((_, i) => i !== index)
    setLocalImages(imgs)
    setLocalPositions(pos)
    setIndex((i) => Math.max(0, Math.min(i, imgs.length - 1)))
    await setDoc(
      doc(db, 'personal-images', 'slots'),
      { races: imgs, 'races-positions': pos },
      { merge: true }
    ).catch(console.error)
  }

  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollFade>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block flex-shrink-0" aria-hidden="true" />
            <span className="text-xs font-mono text-muted tracking-[0.18em] uppercase">Races</span>
          </div>

          <p
            className="font-display text-2xl md:text-3xl text-foreground mb-8"
            style={{ fontVariationSettings: "'opsz' 32, 'wght' 400, 'SOFT' 20" }}
          >
            On the start line
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
                  alt={`Race photo ${index + 1}`}
                  sizes="256px"
                  slot="races"
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
                      <HeightControl slot="races" value={imageHeight} onChange={setImageHeight} />
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
                      {hasImages && (
                        <button
                          onClick={deleteImage}
                          className="flex items-center justify-center w-7 h-7 rounded-full border transition-colors duration-200 hover:border-red-400 hover:text-red-400"
                          style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)' }}
                          aria-label="Delete photo"
                        ><Trash2 size={11} /></button>
                      )}
                      {hasImages && <AdminUploadButton slot="races" label="+" mode="add" />}
                      <AdminUploadButton slot="races" label={hasImages ? 'Replace' : 'Add photo'} mode="replace" />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Race list */}
            <div className="flex flex-col gap-3">
              {races.map((race) => (
                <div key={race.name} className="flex items-baseline gap-3">
                  <span
                    className="font-display text-lg text-foreground leading-tight"
                    style={{ fontVariationSettings: "'opsz' 20, 'wght' 500, 'SOFT' 15" }}
                  >
                    {race.name}
                  </span>
                  <span className="text-[11px] font-mono text-muted">{race.year}</span>
                  {race.note && (
                    <span className="text-[11px] font-mono text-muted opacity-60">{race.note}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollFade>
      </div>
    </section>
  )
}
