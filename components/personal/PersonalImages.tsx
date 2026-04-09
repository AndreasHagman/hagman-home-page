'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import HikeSection from './HikeSection'
import DogSection from './DogSection'
import { hikes } from '@/lib/hikes'

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
  const [dogImages, setDogImages] = useState<string[]>([])

  useEffect(() => {
    async function fetchImages() {
      const snap = await getDoc(doc(db, 'personal-images', 'slots'))
      if (!snap.exists()) return

      const data = snap.data() as Record<string, unknown>

      const resolved: Record<string, string[]> = {}
      for (const hike of hikes) {
        const slot = `hike-${toSlug(hike.name)}`
        const imgs = toArray(data[slot])
        if (imgs.length) resolved[hike.name] = imgs
      }
      setHikeImages(resolved)
      setDogImages(toArray(data['caia']))
    }

    fetchImages()
  }, [])

  return (
    <>
      <HikeSection isAdmin={isAdmin} hikeImages={hikeImages} />
      <DogSection isAdmin={isAdmin} resolvedImages={dogImages} />
    </>
  )
}
