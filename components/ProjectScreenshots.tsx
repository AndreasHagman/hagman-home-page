'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, X, ChevronLeft, ChevronRight, Images } from 'lucide-react'
import AdminUploadButton from './personal/AdminUploadButton'
import { SLOTS } from '@/lib/slots'

interface ProjectScreenshotsProps {
  slug: string
  initialScreenshots: string[]
  isAdmin?: boolean
}

export default function ProjectScreenshots({ slug, initialScreenshots, isAdmin }: ProjectScreenshotsProps) {
  const [screenshots, setScreenshots] = useState(initialScreenshots)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const slot = SLOTS.project(slug)

  const openLightbox = (index: number) => {
    setActiveIndex(index)
    setLightboxOpen(true)
  }

  const closeLightbox = () => setLightboxOpen(false)

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + screenshots.length) % screenshots.length)
  }, [screenshots.length])

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % screenshots.length)
  }, [screenshots.length])

  useEffect(() => {
    if (!lightboxOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxOpen, prev, next])

  // Lock body scroll when lightbox open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [lightboxOpen])

  async function deleteScreenshot(index: number) {
    const updated = screenshots.filter((_, i) => i !== index)
    setScreenshots(updated)
    if (activeIndex >= updated.length) setActiveIndex(Math.max(0, updated.length - 1))
    await fetch('/api/admin/slots', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [slot]: updated }),
    }).catch(console.error)
  }

  if (screenshots.length === 0 && !isAdmin) return null

  return (
    <div>
      <p className="text-xs font-mono text-muted tracking-[0.12em] uppercase opacity-60 mb-4">
        Screenshots
      </p>

      {/* Thumbnail grid */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
        {screenshots.map((src, i) => (
          <div
            key={src}
            className="relative group rounded-xl overflow-hidden border border-border bg-surface cursor-pointer"
            onClick={() => openLightbox(i)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Screenshot ${i + 1}`}
              className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
              <Images
                size={20}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg"
              />
            </div>
            {isAdmin && (
              <button
                onClick={(e) => { e.stopPropagation(); deleteScreenshot(i) }}
                className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full border transition-colors duration-200 hover:border-red-400 hover:text-red-400 opacity-0 group-hover:opacity-100"
                style={{
                  color: 'var(--text-muted)',
                  borderColor: 'var(--border)',
                  backgroundColor: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)',
                }}
                aria-label="Delete screenshot"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        ))}

        {isAdmin && (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border bg-surface min-h-[128px]">
            <AdminUploadButton
              slot={slot}
              label="Add screenshot"
              mode="add"
            />
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && screenshots.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)' }}
          onClick={closeLightbox}
        >
          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-5 right-5 flex items-center justify-center w-9 h-9 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/50 transition-colors duration-200"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Counter */}
          <div className="absolute top-5 left-1/2 -translate-x-1/2 text-xs font-mono text-white/50 tracking-widest">
            {activeIndex + 1} / {screenshots.length}
          </div>

          {/* Prev */}
          {screenshots.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prev() }}
              className="absolute left-4 md:left-8 flex items-center justify-center w-10 h-10 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/50 transition-colors duration-200"
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-4xl w-full px-16 md:px-24"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={activeIndex}
              src={screenshots[activeIndex]}
              alt={`Screenshot ${activeIndex + 1}`}
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl shadow-2xl"
              style={{ animation: 'fadeIn 0.18s ease' }}
            />
          </div>

          {/* Next */}
          {screenshots.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); next() }}
              className="absolute right-4 md:right-8 flex items-center justify-center w-10 h-10 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/50 transition-colors duration-200"
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* Dot indicators */}
          {screenshots.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {screenshots.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(i) }}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: i === activeIndex ? '20px' : '6px',
                    height: '6px',
                    backgroundColor: i === activeIndex ? 'white' : 'rgba(255,255,255,0.35)',
                  }}
                  aria-label={`Go to screenshot ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
