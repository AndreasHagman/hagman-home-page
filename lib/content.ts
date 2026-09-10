import { toSlug } from './slots'
import { races as defaultRaces, type Race } from './races'
import { hikes as defaultHikes, type Hike } from './hikes'
import { experiences as defaultExperiences, type Experience } from './experiences'

export const LIST_KEYS = ['races', 'hikes', 'experiences'] as const
export type ListKey = (typeof LIST_KEYS)[number]

export type FieldType = 'text' | 'number' | 'textarea'

/** Max string length for text fields; one oversized paste cannot blow the 1MB Firestore document limit. */
export const MAX_TEXT_LENGTH = 200
/** Max string length for textarea fields; one oversized paste cannot blow the 1MB Firestore document limit. */
export const MAX_TEXTAREA_LENGTH = 2000
/** Max number of items per list; one request cannot write arbitrarily many items. */
export const MAX_LIST_LENGTH = 200

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
 * When `strict` is true, throws with a human-readable message describing the first problem found.
 * When `strict` is false, drops invalid items and logs errors, returning only valid items.
 */
export function sanitizeList(key: ListKey, value: unknown, strict = true): Record<string, string | number>[] {
  if (!Array.isArray(value)) throw new Error(`"${key}" must be an array`)
  if (value.length > MAX_LIST_LENGTH) throw new Error(`"${key}" must have at most ${MAX_LIST_LENGTH} items`)

  const seen = new Set<string>()
  const result: Record<string, string | number>[] = []

  for (let i = 0; i < value.length; i++) {
    const raw = value[i]

    try {
      if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        throw new Error(`${key}[${i}] must be an object`)
      }
      const item = raw as Record<string, unknown>

      const id = typeof item.id === 'string' ? item.id.trim() : ''
      if (!id) throw new Error(`${key}[${i}] is missing "id"`)
      if (id.length > MAX_TEXT_LENGTH) throw new Error(`${key}[${i}].id must be ${MAX_TEXT_LENGTH} characters or fewer`)
      if (seen.has(id)) throw new Error(`${key} has a duplicate id: "${id}"`)
      seen.add(id)

      const out: Record<string, string | number> = { id }

      for (const field of FIELDS[key]) {
        const fieldValue = item[field.key]

        if (field.type === 'number') {
          // Only accept actual finite numbers or numeric strings (not null, false, [], etc.)
          let n: number
          if (typeof fieldValue === 'number') {
            n = fieldValue
          } else if (typeof fieldValue === 'string') {
            const trimmed = fieldValue.trim()
            if (!trimmed) {
              if (field.required) throw new Error(`${key}[${i}].${field.key} must be a number`)
              continue
            }
            n = Number(trimmed)
          } else {
            if (field.required) throw new Error(`${key}[${i}].${field.key} must be a number`)
            continue
          }
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
        const max = field.type === 'textarea' ? MAX_TEXTAREA_LENGTH : MAX_TEXT_LENGTH
        if (s.length > max) {
          throw new Error(`${key}[${i}].${field.key} must be ${max} characters or fewer`)
        }
        out[field.key] = s
      }

      result.push(out)
    } catch (err) {
      if (strict) throw err
      // In non-strict mode, log and skip this item
      console.error(`Skipping invalid item in "${key}":`, err instanceof Error ? err.message : String(err))
    }
  }

  return result
}

function readList<T>(key: ListKey, data: Record<string, unknown> | undefined, fallback: T[]): T[] {
  const value = data?.[key]
  if (!Array.isArray(value)) return fallback
  try {
    // Use non-strict mode to drop invalid items individually rather than failing the entire list
    return sanitizeList(key, value, false) as unknown as T[]
  } catch (err) {
    // If the entire array is malformed (not an array), use fallback.
    console.error(`Failed to read list "${key}":`, err)
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
