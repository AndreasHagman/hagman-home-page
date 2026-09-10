export interface Race {
  id: string
  name: string
  year: number
  distance?: string
  note?: string
}

export const races: Race[] = [
  { id: 'tough-viking',        name: 'Tough Viking',        year: 2023 },
  { id: 'holmenkollstafetten', name: 'Holmenkollstafetten', year: 2024, note: 'with Storebrand' },
  { id: 'sentrumsløpet',       name: 'Sentrumsløpet',       year: 2025 },
  { id: 'nordmarkstravern',    name: 'Nordmarkstravern',    year: 2025 },
]
