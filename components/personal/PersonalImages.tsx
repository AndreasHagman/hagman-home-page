'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import HikeSection from './HikeSection'
import DogSection from './DogSection'
import ExperiencesSection from './ExperiencesSection'
import RacesSection from './RacesSection'
import { DEFAULT_LISTS, mergeLists, type ContentLists } from '@/lib/content'

interface PersonalImagesProps {
  isAdmin: boolean
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

/** Pull the images, focal points and heights for one family of slots, keyed by item id. */
function collect(data: Record<string, unknown>, prefix: string, ids: string[]) {
  const images: Record<string, string[]> = {}
  const positions: Record<string, string[]> = {}
  const heights: Record<string, number> = {}

  for (const id of ids) {
    const imgs = toArray(data[`${prefix}-${id}`])
    if (imgs.length) images[id] = imgs
    const pos = toArray(data[`${prefix}-${id}-positions`])
    if (pos.length) positions[id] = pos
    const h = toNumber(data[`${prefix}-${id}-height`])
    if (h) heights[id] = h
  }

  return { images, positions, heights }
}

export default function PersonalImages({ isAdmin }: PersonalImagesProps) {
  const [lists, setLists] = useState<ContentLists>(DEFAULT_LISTS)
  const [slots, setSlots] = useState<Record<string, unknown>>({})

  useEffect(() => {
    async function load() {
      const results = await Promise.allSettled([
        getDoc(doc(db, 'personal-images', 'slots')),
        getDoc(doc(db, 'personal-content', 'lists')),
      ])

      // Handle slots read
      if (results[0].status === 'fulfilled') {
        const slotSnap = results[0].value
        if (slotSnap.exists()) setSlots(slotSnap.data() as Record<string, unknown>)
      } else {
        console.error('Failed to fetch image slots:', results[0].reason)
      }

      // Handle lists read
      if (results[1].status === 'fulfilled') {
        const listSnap = results[1].value
        setLists(mergeLists(listSnap.exists() ? (listSnap.data() as Record<string, unknown>) : undefined))
      } else {
        console.error('Failed to fetch content lists:', results[1].reason)
        setLists(DEFAULT_LISTS)
      }
    }
    load().catch(console.error)
  }, [])

  const hike = collect(slots, 'hike', lists.hikes.map((h) => h.id))
  const exp = collect(slots, 'exp', lists.experiences.map((e) => e.id))

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
        experiences={lists.experiences}
        isAdmin={isAdmin}
        images={exp.images}
        positions={exp.positions}
        heights={exp.heights}
      />
      <RacesSection
        races={lists.races}
        isAdmin={isAdmin}
        resolvedImages={toArray(slots['races'])}
        positions={toArray(slots['races-positions'])}
        initialHeight={toNumber(slots['races-height'])}
      />
      <HikeSection
        hikes={lists.hikes}
        isAdmin={isAdmin}
        images={hike.images}
        positions={hike.positions}
        heights={hike.heights}
      />
      <DogSection
        isAdmin={isAdmin}
        resolvedImages={toArray(slots['caia'])}
        positions={toArray(slots['caia-positions'])}
        initialHeight={toNumber(slots['caia-height'])}
      />
    </>
  )
}
