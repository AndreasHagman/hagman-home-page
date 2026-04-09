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

export default function PersonalImages({ isAdmin }: PersonalImagesProps) {
  const [hikeImages, setHikeImages] = useState<Record<string, string[]>>({})
  const [hikePositions, setHikePositions] = useState<Record<string, string[]>>({})
  const [dogImages, setDogImages] = useState<string[]>([])
  const [dogPositions, setDogPositions] = useState<string[]>([])
  const [experienceImages, setExperienceImages] = useState<Record<string, string[]>>({})
  const [experiencePositions, setExperiencePositions] = useState<Record<string, string[]>>({})

  useEffect(() => {
    async function fetchImages() {
      const snap = await getDoc(doc(db, 'personal-images', 'slots'))
      if (!snap.exists()) return

      const data = snap.data() as Record<string, unknown>

      const resolvedHikeImages: Record<string, string[]> = {}
      const resolvedHikePositions: Record<string, string[]> = {}
      for (const hike of hikes) {
        const slug = toSlug(hike.name)
        const imgs = toArray(data[`hike-${slug}`])
        if (imgs.length) resolvedHikeImages[hike.name] = imgs
        const pos = toArray(data[`hike-${slug}-positions`])
        if (pos.length) resolvedHikePositions[hike.name] = pos
      }
      setHikeImages(resolvedHikeImages)
      setHikePositions(resolvedHikePositions)

      const resolvedExpImages: Record<string, string[]> = {}
      const resolvedExpPositions: Record<string, string[]> = {}
      for (const exp of experiences) {
        const slug = toSlug(exp.name)
        const imgs = toArray(data[`exp-${slug}`])
        if (imgs.length) resolvedExpImages[exp.name] = imgs
        const pos = toArray(data[`exp-${slug}-positions`])
        if (pos.length) resolvedExpPositions[exp.name] = pos
      }
      setExperienceImages(resolvedExpImages)
      setExperiencePositions(resolvedExpPositions)

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
      />
      <HikeSection
        isAdmin={isAdmin}
        hikeImages={hikeImages}
        hikePositions={hikePositions}
      />
      <DogSection
        isAdmin={isAdmin}
        resolvedImages={dogImages}
        positions={dogPositions}
      />
    </>
  )
}
