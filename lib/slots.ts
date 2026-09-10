export function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export const SLOTS = {
  DOG: 'caia',
  RACES: 'races',
  hike: (id: string) => `hike-${id}`,
  exp: (id: string) => `exp-${id}`,
  project: (slug: string) => `project-${slug}`,
} as const
