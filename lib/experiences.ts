export interface Experience {
  name: string
  location: string
  year: number
  description: string
  tag: string
}

export const experiences: Experience[] = [
  {
    name: 'Bungee Jump',
    location: 'Rjukan, Telemark',
    year: 2023,
    tag: 'Extreme',
    description: 'A free fall from the Krossobanen bridge in the dramatic Rjukan valley — one of the highest commercial bungee jumps in Norway.',
  },
  {
    name: 'Wind Tunnel',
    location: 'Norway',
    year: 2022,
    tag: 'Extreme',
    description: 'Indoor skydiving in a vertical wind tunnel — an absolute blast, though getting your body to actually do what you want took some getting used to.',
  },
  {
    name: 'Scuba Diving',
    location: 'Egypt',
    year: 2022,
    tag: 'Adventure',
    description: 'Guided tank dive along coral reefs in Egypt — weightless and quiet, with more colour and life underwater than I expected.',
  },
]
