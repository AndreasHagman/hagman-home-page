# hagman-home-page

Personal homepage for **Andreas Hagman** — a landing page + app hub + personal page built with **Next.js 15 (App Router)** and **Tailwind CSS v3**.

## Running the project

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Folder structure

```
app/
  layout.tsx             — Root layout: loads fonts, injects dark-mode init script
  page.tsx               — Landing page (hero, about, projects)
  globals.css            — CSS variables, keyframe animations, utility classes
  personal/page.tsx      — /personal page (async server component, checks admin cookie)
  admin/page.tsx         — Admin login form (client component)
  api/auth/login/        — POST: validates ADMIN_PASSWORD, sets httpOnly cookie

components/
  Navbar.tsx             — Fixed top nav, blur-glass on scroll, mobile hamburger, theme toggle
  Hero.tsx               — Full-height hero with staggered CSS animations
  About.tsx              — About section with scroll-fade
  Projects.tsx           — Project grid, reads from lib/projects.ts
  ProjectCard.tsx        — Individual card ('use client' — has hover handlers)
  Footer.tsx             — Copyright + GitHub/LinkedIn links
  ThemeToggle.tsx        — Sun/Moon button, writes to localStorage
  ScrollFade.tsx         — Wrapper using IntersectionObserver for fade-in on scroll

components/personal/
  PersonalHero.tsx       — Hero section for /personal
  HobbySection.tsx       — Hobby/interest tags
  ExperiencesSection.tsx — "Things I've done" cards; reads from lib/experiences.ts
  HikeSection.tsx        — Grid of hike cards; reads from lib/hikes.ts
  HikeCard.tsx           — Individual hike card with image carousel ('use client')
  DogSection.tsx         — Caia section with image carousel ('use client')
  PersonalImages.tsx     — Fetches all images/positions/heights from Firestore, renders sections
  AdminUploadButton.tsx  — Uploads to Firebase Storage; mode='replace'|'add'
  DraggableImage.tsx     — Image with drag-to-reposition when isRepositioning=true
  HeightControl.tsx      — − px + buttons; saves height to Firestore

hooks/
  useScrollFade.ts       — IntersectionObserver hook used by ScrollFade

lib/
  projects.ts            — Project data array (add new apps here)
  hikes.ts               — Hike data array (add new hikes here)
  experiences.ts         — Experiences data array (add new experiences here)
  firebase.ts            — Firebase app init (guards against re-init), exports db and storage
```

See [docs/design.md](docs/design.md) for design system details.

## Adding a project

Edit `lib/projects.ts`:

```ts
{
  name: 'My App',
  description: 'What it does',
  href: 'https://myapp.andreashagman.no',
  tag: 'Category',
  type: 'app', // or 'repo' for GitHub links
}
```

## Adding a hike

Edit `lib/hikes.ts`:

```ts
{
  name: 'Besseggen',
  location: 'Jotunheimen, Norway',
  year: 2024,
  description: 'A classic ridge walk between two lakes.',
}
```

## Adding an experience

Edit `lib/experiences.ts`:

```ts
{
  name: 'Skydiving',
  location: 'Østfold, Norway',
  year: 2024,
  tag: 'Extreme',
  description: 'First tandem jump from 4000 metres.',
}
```

## /personal page architecture

- `app/personal/page.tsx` — async server component; reads `admin_session` httpOnly cookie; passes `isAdmin` to `PersonalImages`
- `PersonalImages` — client component; fetches `personal-images/slots` from Firestore on mount; resolves images/positions/heights for every hike, experience, and Caia; renders all personal sections
- Admin controls (upload, drag-reposition, height) are only rendered when `isAdmin=true`

## Firestore schema

Single document: `personal-images/slots`

| Key pattern | Type | Description |
|---|---|---|
| `hike-{slug}` | `string[]` | Image URLs for a hike card |
| `hike-{slug}-positions` | `string[]` | Focal points as `"X% Y%"` per image |
| `hike-{slug}-height` | `number` | Card image height in px |
| `exp-{slug}` | `string[]` | Image URLs for an experience card |
| `exp-{slug}-positions` | `string[]` | Focal points |
| `exp-{slug}-height` | `number` | Card image height in px |
| `caia` | `string[]` | Caia image URLs |
| `caia-positions` | `string[]` | Focal points |
| `caia-height` | `number` | Image height in px |

Slugs are lowercase, spaces replaced with hyphens (e.g. `hike-trolltunga`, `exp-bungee-jump`).

## Dark mode

- Strategy: Tailwind `darkMode: 'class'` on `<html>`
- Persisted in `localStorage` under key `'theme'`
- Init script in `layout.tsx` sets the class before hydration (no flash)
- Toggle: `components/ThemeToggle.tsx`
