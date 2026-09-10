import { toSlug } from './slots'
import { races as defaultRaces, type Race } from './races'
import { hikes as defaultHikes, type Hike } from './hikes'
import { experiences as defaultExperiences, type Experience } from './experiences'

export const LIST_KEYS = ['races', 'hikes', 'experiences'] as const
export type ListKey = (typeof LIST_KEYS)[number]

export type FieldType = 'text' | 'number' | 'textarea'

export interface FieldSpec {
  key: string
  label: string
  type: FieldType
  required?: boolean
}

/** The only fields a list item may have, besides its id. */
export const FIELDS: Record<ListKey, FieldSpec[]> = {
  races: [
    { key: 'name',     label: 'Race',     type: 'text',   required: true },
    { key: 'year',     label: 'Year',     type: 'number', required: true },
    { key: 'distance', label: 'Distance', type: 'text' },
    { key: 'note',     label: 'Note',     type: 'text' },
  ],
  hikes: [
    { key: 'name',        label: 'Name',        type: 'text',     required: true },
    { key: 'location',    label: 'Location',    type: 'text',     required: true },
    { key: 'year',        label: 'Year',        type: 'number',   required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
  ],
  experiences: [
    { key: 'name',        label: 'Name',        type: 'text',     required: true },
    { key: 'tag',         label: 'Tag',         type: 'text',     required: true },
    { key: 'location',    label: 'Location',    type: 'text',     required: true },
    { key: 'year',        label: 'Year',        type: 'number',   required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
  ],
}

export interface ContentLists {
  races: Race[]
  hikes: Hike[]
  experiences: Experience[]
}

/** Seed data, used per-list whenever Firestore has nothing usable for that list. */
export const DEFAULT_LISTS: ContentLists = {
  races: defaultRaces,
  hikes: defaultHikes,
  experiences: defaultExperiences,
}

/** Derive a permanent id from a name, suffixing on collision within the same list. */
export function makeId(name: string, existingIds: string[]): string {
  const base = toSlug(name.trim()) || 'item'
  if (!existingIds.includes(base)) return base
  let n = 2
  while (existingIds.includes(`${base}-${n}`)) n++
  return `${base}-${n}`
}

/**
 * Validate an incoming list and strip it to the schema in FIELDS.
 * Throws with a human-readable message describing the first problem found.
 */
export function sanitizeList(key: ListKey, value: unknown): Record<string, string | number>[] {
  if (!Array.isArray(value)) throw new Error(`"${key}" must be an array`)

  const seen = new Set<string>()

  return value.map((raw, i) => {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      throw new Error(`${key}[${i}] must be an object`)
    }
    const item = raw as Record<string, unknown>

    const id = typeof item.id === 'string' ? item.id.trim() : ''
    if (!id) throw new Error(`${key}[${i}] is missing "id"`)
    if (seen.has(id)) throw new Error(`${key} has a duplicate id: "${id}"`)
    seen.add(id)

    const out: Record<string, string | number> = { id }

    for (const field of FIELDS[key]) {
      const fieldValue = item[field.key]

      if (field.type === 'number') {
        const n = typeof fieldValue === 'number' ? fieldValue : Number(fieldValue)
        if (!Number.isFinite(n)) {
          if (field.required) throw new Error(`${key}[${i}].${field.key} must be a number`)
          continue
        }
        out[field.key] = n
        continue
      }

      const s = typeof fieldValue === 'string' ? fieldValue.trim() : ''
      if (!s) {
        if (field.required) throw new Error(`${key}[${i}].${field.key} is required`)
        continue
      }
      out[field.key] = s
    }

    return out
  })
}

function readList<T>(key: ListKey, data: Record<string, unknown> | undefined, fallback: T[]): T[] {
  const value = data?.[key]
  if (!Array.isArray(value)) return fallback
  try {
    return sanitizeList(key, value) as unknown as T[]
  } catch {
    // A malformed list in Firestore must never blank the page.
    return fallback
  }
}

/** Merge a `personal-content/lists` snapshot over the seed data, per list. */
export function mergeLists(data?: Record<string, unknown>): ContentLists {
  return {
    races: readList<Race>('races', data, DEFAULT_LISTS.races),
    hikes: readList<Hike>('hikes', data, DEFAULT_LISTS.hikes),
    experiences: readList<Experience>('experiences', data, DEFAULT_LISTS.experiences),
  }
}
