export interface Hike {
  name: string
  location: string
  year: number
  description: string
  image?: string // filename in /public/images/personal/
}

export const hikes: Hike[] = [
  {
    name: 'Trolltunga',
    location: 'Vestland, Norway',
    year: 2023,
    description: 'One of the most dramatic hikes in Norway — a cliff jutting out 700 metres above Lake Ringedalsvatnet.',
  },
  {
    name: 'Preikestolen',
    location: 'Rogaland, Norway',
    year: 2022,
    description: 'The famous cliff rising 604 metres above Lysefjord. Stunning panoramic views and a rewarding trail.',
  },
  {
    name: 'Kjeragbolten',
    location: 'Rogaland, Norway',
    year: 2023,
    description: 'A boulder wedged in a crevice 984 metres above Lysefjord. One of the most iconic photo spots in Norway.',
  },
  {
    name: 'Galdhøpiggen',
    location: 'Jotunheimen, Norway',
    year: 2021,
    description: 'The highest peak in Norway and Scandinavia at 2469 metres. A challenging but unforgettable summit.',
  },
]
