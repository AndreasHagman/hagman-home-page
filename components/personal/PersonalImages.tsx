'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import HikeSection from './HikeSection'
import DogSection from './DogSection'
import ExperiencesSection from './ExperiencesSection'
import RacesSection from './RacesSection'
import { hikes } from '@/lib/hikes'
import { experiences } from '@/lib/experiences'

interface PersonalImagesProps {
  isAdmin: boolean
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-')
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[]
  if (typeof value === 'string' && value) return [value]
  return []
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value
  return undefined
}

export default function PersonalImages({ isAdmin }: PersonalImagesProps) {
  const [hikeImages, setHikeImages] = useState<Record<string, string[]>>({})
  const [hikePositions, setHikePositions] = useState<Record<string, string[]>>({})
  const [hikeHeights, setHikeHeights] = useState<Record<string, number>>({})
  const [dogImages, setDogImages] = useState<string[]>([])
  const [dogPositions, setDogPositions] = useState<string[]>([])
  const [dogHeight, setDogHeight] = useState<number | undefined>()
  const [raceImages, setRaceImages] = useState<string[]>([])
  const [racePositions, setRacePositions] = useState<string[]>([])
  const [raceHeight, setRaceHeight] = useState<number | undefined>()
  const [experienceImages, setExperienceImages] = useState<Record<string, string[]>>({})
  const [experiencePositions, setExperiencePositions] = useState<Record<string, string[]>>({})
  const [experienceHeights, setExperienceHeights] = useState<Record<string, number>>({})

  useEffect(() => {
    async function fetchImages() {
      const snap = await getDoc(doc(db, 'personal-images', 'slots'))
      if (!snap.exists()) return
      const data = snap.data() as Record<string, unknown>

      const hImgs: Record<string, string[]> = {}
      const hPos: Record<string, string[]> = {}
      const hH: Record<string, number> = {}
      for (const hike of hikes) {
        const slug = toSlug(hike.name)
        const imgs = toArray(data[`hike-${slug}`])
        if (imgs.length) hImgs[hike.name] = imgs
        const pos = toArray(data[`hike-${slug}-positions`])
        if (pos.length) hPos[hike.name] = pos
        const h = toNumber(data[`hike-${slug}-height`])
        if (h) hH[hike.name] = h
      }
      setHikeImages(hImgs)
      setHikePositions(hPos)
      setHikeHeights(hH)

      const eImgs: Record<string, string[]> = {}
      const ePos: Record<string, string[]> = {}
      const eH: Record<string, number> = {}
      for (const exp of experiences) {
        const slug = toSlug(exp.name)
        const imgs = toArray(data[`exp-${slug}`])
        if (imgs.length) eImgs[exp.name] = imgs
        const pos = toArray(data[`exp-${slug}-positions`])
        if (pos.length) ePos[exp.name] = pos
        const h = toNumber(data[`exp-${slug}-height`])
        if (h) eH[exp.name] = h
      }
      setExperienceImages(eImgs)
      setExperiencePositions(ePos)
      setExperienceHeights(eH)

      setDogImages(toArray(data['caia']))
      setDogPositions(toArray(data['caia-positions']))
      setDogHeight(toNumber(data['caia-height']))

      setRaceImages(toArray(data['races']))
      setRacePositions(toArray(data['races-positions']))
      setRaceHeight(toNumber(data['races-height']))
    }

    fetchImages()
  }, [])

  return (
    <>
      {isAdmin && (
        <div className="fixed top-16 right-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-mono" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)', backdropFilter: 'blur(8px)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          admin
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              window.location.reload()
            }}
            className="ml-1 opacity-50 hover:opacity-100 transition-opacity duration-200"
            aria-label="Log out"
          >
            ×
          </button>
        </div>
      )}
      <ExperiencesSection
        isAdmin={isAdmin}
        experienceImages={experienceImages}
        experiencePositions={experiencePositions}
        experienceHeights={experienceHeights}
      />
      <RacesSection
        isAdmin={isAdmin}
        resolvedImages={raceImages}
        positions={racePositions}
        initialHeight={raceHeight}
      />
      <HikeSection
        isAdmin={isAdmin}
        hikeImages={hikeImages}
        hikePositions={hikePositions}
        hikeHeights={hikeHeights}
      />
      <DogSection
        isAdmin={isAdmin}
        resolvedImages={dogImages}
        positions={dogPositions}
        initialHeight={dogHeight}
      />
    </>
  )
}
