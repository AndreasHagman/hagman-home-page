export interface Project {
  name: string
  description: string
  href: string
  tag: string
  type?: 'app' | 'repo'
  note?: string
  slug?: string
  repoHref?: string
  techStack?: string[]
  longDescription?: string
  features?: string[]
}

export const projects: Project[] = [
  {
    name: 'Løpeapp',
    description: 'Track runs and analyze training data — built for family and friends. Features Strava integration, challenges, AI-powered data analysis, and a running advent calendar.',
    href: 'https://lopeapp.andreashagman.no',
    tag: 'Fitness',
    type: 'app',
    slug: 'lopeapp',
    techStack: ['Next.js', 'TypeScript', 'Firebase', 'Strava API', 'OpenAI'],
    longDescription: 'Løpeapp started as a way to share running stats with family and friends without everyone needing a Strava account. It has since grown into a fully featured training companion with challenges, leaderboards, and AI-driven insights into your training load and progression.',
    features: [
      'Strava integration — automatically syncs runs after every activity',
      'Group challenges with live leaderboards',
      'AI-powered training analysis and weekly summaries',
      'Running advent calendar — a new challenge every day in December',
      'Personal stats dashboard with pace, distance, and elevation trends',
    ],
  },
  {
    name: 'Quiz App',
    description: 'Interactive quiz game with multiple modes: multiple choice, drawing rounds, music guessing, and estimation challenges.',
    href: 'https://quiz.andreashagman.no',
    tag: 'Game',
    type: 'app',
    slug: 'quiz-app',
    techStack: ['Next.js', 'TypeScript', 'Firebase', 'Spotify API'],
    longDescription: 'Built for game nights with friends, the Quiz App supports multiple game modes in a single session — from classic multiple choice to drawing rounds where players guess what others have sketched, and music rounds powered by the Spotify API.',
    features: [
      'Multiple choice rounds with custom question sets',
      'Drawing rounds — players draw, others guess',
      'Music guessing powered by Spotify',
      'Estimation challenges — closest answer wins',
      'Real-time multiplayer via Firebase',
      'Host controls for pacing and skipping rounds',
    ],
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
