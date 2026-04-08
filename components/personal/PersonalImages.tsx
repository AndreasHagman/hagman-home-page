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

export default function PersonalImages({ isAdmin }: PersonalImagesProps) {
  const [hikeImages, setHikeImages] = useState<Record<string, string>>({})
  const [dogImage, setDogImage] = useState<string | undefined>()

  useEffect(() => {
    async function fetchImages() {
      const snap = await getDoc(doc(db, 'personal-images', 'slots'))
      if (!snap.exists()) return

      const data = snap.data() as Record<string, string>

      const resolved: Record<string, string> = {}
      for (const hike of hikes) {
        const slot = `hike-${toSlug(hike.name)}`
        if (data[slot]) resolved[hike.name] = data[slot]
      }
      setHikeImages(resolved)

      if (data['caia']) setDogImage(data['caia'])
    }

    fetchImages()
  }, [])

  return (
    <>
      <HikeSection isAdmin={isAdmin} hikeImages={hikeImages} />
      <DogSection isAdmin={isAdmin} resolvedImage={dogImage} />
    </>
  )
}
