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
]
