export function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export const SLOTS = {
  DOG: 'caia',
  RACES: 'races',
  hike: (name: string) => `hike-${toSlug(name)}`,
  exp: (name: string) => `exp-${toSlug(name)}`,
} as const
