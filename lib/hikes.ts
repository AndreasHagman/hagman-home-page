export interface Hike {
  name: string
  location: string
  year: number
  description: string
  image?: string // filename in /public/images/personal/
}

export const hikes: Hike[] = [
  {
    name: 'Besseggen',
    location: 'Jotunheimen, Norway',
    year: 2023,
    description: 'Classic ridge hike between the bright-green Gjende and the deep-blue Bessvatnet. One of the most iconic hikes in Norway.',
  },
  {
    name: 'Preikestolen',
    location: 'Rogaland, Norway',
    year: 2022,
    description: 'The famous cliff rising 604 metres above Lysefjord. Stunning panoramic views and a rewarding trail.',
  },
  {
    name: 'Galdhøpiggen',
    location: 'Jotunheimen, Norway',
    year: 2021,
    description: 'The highest peak in Norway and Scandinavia at 2469 metres. A challenging but unforgettable summit.',
  },
]
