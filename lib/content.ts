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
 * Callers can detect a non-strict drop by comparing the result length to the input length.
 */
export function sanitizeList(key: ListKey, value: unknown, strict = true): Record<string, string | number>[] {
  if (!Array.isArray(value)) throw new Error(`"${key}" must be an array`)
  if (strict && value.length > MAX_LIST_LENGTH) {
    throw new Error(`"${key}" must have at most ${MAX_LIST_LENGTH} items`)
  }

  // Non-strict callers truncate rather than throw: a throw here would escape the
  // per-item try below and take the whole stored list with it, leaving the reader
  // with seed data it might then save over the real thing.
  const input = strict ? value : value.slice(0, MAX_LIST_LENGTH)

  const seen = new Set<string>()
  const result: Record<string, string | number>[] = []

  for (let i = 0; i < input.length; i++) {
    const raw = input[i]

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

interface ReadResult<T> {
  items: T[]
  degraded: boolean
}

function readList<T>(key: ListKey, data: Record<string, unknown> | undefined, fallback: T[]): ReadResult<T> {
  const value = data?.[key]
  // Nothing stored for this list: the seed is the intended content, not a loss.
  if (value === undefined || value === null) return { items: fallback, degraded: false }

  if (!Array.isArray(value)) {
    console.error(`Failed to read list "${key}": stored value is not an array`)
    return { items: fallback, degraded: true }
  }

  try {
    // Use non-strict mode to drop invalid items individually rather than failing the entire list
    const items = sanitizeList(key, value, false) as unknown as T[]
    return { items, degraded: items.length < value.length }
  } catch (err) {
    console.error(`Failed to read list "${key}":`, err)
    return { items: fallback, degraded: true }
  }
}

export interface MergedLists {
  lists: ContentLists
  /**
   * True when the stored document was read incompletely — items dropped as invalid,
   * a list truncated at MAX_LIST_LENGTH, or a stored value that is not an array.
   * What is missing here is still in Firestore, and every save writes a whole list,
   * so saving a degraded list would delete it for good.
   */
  degraded: boolean
}

/** Merge a `personal-content/lists` snapshot over the seed data, per list. */
export function mergeLists(data?: Record<string, unknown>): MergedLists {
  const races = readList<Race>('races', data, DEFAULT_LISTS.races)
  const hikes = readList<Hike>('hikes', data, DEFAULT_LISTS.hikes)
  const experiences = readList<Experience>('experiences', data, DEFAULT_LISTS.experiences)

  return {
    lists: { races: races.items, hikes: hikes.items, experiences: experiences.items },
    degraded: races.degraded || hikes.degraded || experiences.degraded,
  }
}
