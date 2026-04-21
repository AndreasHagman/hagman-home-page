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
    longDescription: 'Løpeapp started as a simple running advent calendar with a basic Strava integration. Since then it has grown into a fully featured training companion — with AI-generated personal training plans, AI-driven analysis of your training data, group challenges with live leaderboards, and more advanced annual statistics.',
    features: [
      'Strava integration — automatically syncs runs once a day for all users',
      'AI-powered training analysis',
      'AI-generated personal training plan tailored to your goals',
      'Group challenges with live leaderboards',
      'Running advent calendar — a new challenge every day in December',
      'Personal stats dashboard with average km per day, current streak, and total km run',
    ],
  },
  {
    name: 'Quiz App',
    description: 'Interactive quiz game with multiple modes: multiple choice, drawing rounds, music guessing, and estimation challenges.',
    href: 'https://quiz.andreashagman.no',
    tag: 'Game',
    type: 'app',
    slug: 'quiz-app',
    techStack: ['Next.js', 'TypeScript', 'Firebase'],
    longDescription: 'Built for game nights with friends, the Quiz App packs multiple round types into a single session — from classic multiple choice to live drawing rounds, music clips, and estimation challenges. Everything is designed with mobile in mind, so players can join and participate from their phones without friction.',
    features: [
      'Multiple choice — single correct answer',
      'Multiple choice — multiple correct answers',
      'Estimation rounds — closest answer wins',
      'Drawing rounds — players draw while the admin corrects live',
      'Music rounds — players hear a clip and guess based on the question',
      'Real-time multiplayer via Firebase',
      'Advanced admin panel with support for multiple sessions and multiple quizzes per session',
      'PIN-code protected sessions — multiple admins can host simultaneously',
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
  {
    name: 'Meet Caia',
    description: 'A dedicated webpage for my Nova Scotia Duck Tolling Retriever — photos, milestones, and adventures.',
    href: 'https://caia.andreashagman.no',
    tag: 'Personal',
    type: 'app',
  },
]
