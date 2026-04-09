'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import HikeSection from './HikeSection'
import DogSection from './DogSection'
import ExperiencesSection from './ExperiencesSection'
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
    }

    fetchImages()
  }, [])

  return (
    <>
      <ExperiencesSection
        isAdmin={isAdmin}
        experienceImages={experienceImages}
        experiencePositions={experiencePositions}
        experienceHeights={experienceHeights}
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
      />
    </>
  )
}
