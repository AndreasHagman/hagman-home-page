export interface Project {
  name: string
  description: string
  href: string
  tag: string
  type?: 'app' | 'repo'
  note?: string
}

export const projects: Project[] = [
  {
    name: 'Løpeapp',
    description: 'Track runs and analyze training data — built for family and friends. Features Strava integration and a running advent calendar.',
    href: 'https://lopeapp.andreashagman.no',
    tag: 'Fitness',
    type: 'app',
  },
  {
    name: 'Quiz App',
    description: 'Interactive quiz game with multiple modes: multiple choice, drawing rounds, music guessing, and estimation challenges.',
    href: 'https://quiz.andreashagman.no',
    tag: 'Game',
    type: 'app',
  },
  {
    name: 'MMM-NOKElectricityForecast',
    description: 'Displays the Norwegian electricity price forecast on your smart mirror',
    href: 'https://github.com/AndreasHagman/MMM-NOKElectricityForecast',
    tag: 'Module',
    type: 'repo',
    note: 'MagicMirror² module',
  },
]
