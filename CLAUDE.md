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
  api/admin/content/     — PATCH: saves content lists to personal-content/lists

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
  RacesSection.tsx       — Race list: newest first, capped at 5 for visitors
  ExperiencesSection.tsx — "Things I've done" cards; reads from lib/experiences.ts
  HikeSection.tsx        — Grid of hike cards; reads from lib/hikes.ts
  HikeCard.tsx           — Individual hike card with image carousel ('use client')
  DogSection.tsx         — Caia section with image carousel ('use client')
  PersonalImages.tsx     — Fetches all images/positions/heights from Firestore, renders sections
  ItemEditor.tsx         — Add/edit form rendered from a lib/content.ts field schema
  DeleteItemButton.tsx   — Trash button that arms to 'Sure?' before deleting
  ListError.tsx          — Error display for editable list save failures
  AdminUploadButton.tsx  — Uploads to Firebase Storage; mode='replace'|'add'
  DraggableImage.tsx     — Image with drag-to-reposition when isRepositioning=true
  HeightControl.tsx      — − px + buttons; saves height to Firestore

hooks/
  useScrollFade.ts       — IntersectionObserver hook used by ScrollFade
  useEditableList.ts     — Optimistic state + saving for one editable content list

lib/
  projects.ts            — Project data array (add new apps here)
  races.ts               — Race seed data (fallback only — see "Adding a race")
  hikes.ts               — Hike seed data (fallback only — see "Adding a race")
  experiences.ts         — Experience seed data (fallback only — see "Adding a race")
  content.ts             — List keys, field schemas, id generation, validation, fallback merge
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

## Adding a race, hike or experience

Don't edit code. Sign in at `/admin`, go to `/personal`, and use the
`+ Add race` / `+ Add hike` / `+ Add experience` buttons. Hover any item for
pencil (edit) and trash (delete) controls.

The arrays in `lib/races.ts`, `lib/hikes.ts` and `lib/experiences.ts` are seed
data only. They render when `personal-content/lists` has nothing for that list;
once a list has been saved from the admin UI, Firestore wins and editing the
file has no effect.

Every item has a permanent `id`, assigned at creation from its name. Renaming
an item never changes its `id`, which is why renaming does not orphan its
uploaded images.

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

Slot keys are derived from item `id` fields (e.g. `hike-trolltunga`, `exp-bungee-jump`).

### `personal-content/lists`

Single document holding the editable content lists.

| Key | Type | Item shape |
|---|---|---|
| `races` | array | `{ id, name, year, distance?, note? }` |
| `hikes` | array | `{ id, name, location, year, description }` |
| `experiences` | array | `{ id, name, location, year, tag, description }` |

Written only through `PATCH /api/admin/content`, which validates against the
field schemas in `lib/content.ts` and strips anything not in them. Image slots
join to these items by `id`: `hike-{id}`, `exp-{id}`.

## Dark mode

- Strategy: Tailwind `darkMode: 'class'` on `<html>`
- Persisted in `localStorage` under key `'theme'`
- Init script in `layout.tsx` sets the class before hydration (no flash)
- Toggle: `components/ThemeToggle.tsx`
