# hagman-home-page

Personal homepage for **Andreas Hagman** — a landing page + app hub built with **Next.js 15 (App Router)** and **Tailwind CSS v3**.

## Running the project

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Folder structure

```
app/
  layout.tsx       — Root layout: loads fonts, injects dark-mode init script
  page.tsx         — Assembles all sections (no logic here)
  globals.css      — CSS variables, keyframe animations, utility classes

components/
  Navbar.tsx       — Fixed top nav, blur-glass on scroll, theme toggle
  Hero.tsx         — Full-height hero with staggered CSS animations
  About.tsx        — About section with scroll-fade
  Projects.tsx     — Project grid, reads from lib/projects.ts
  ProjectCard.tsx  — Individual card ('use client' — has hover handlers)
  Footer.tsx       — Copyright + GitHub/LinkedIn links
  ThemeToggle.tsx  — Sun/Moon button, writes to localStorage
  ScrollFade.tsx   — Wrapper using IntersectionObserver for fade-in on scroll

hooks/
  useScrollFade.ts — IntersectionObserver hook used by ScrollFade

lib/
  projects.ts      — Project data array (add new apps here)
```

See [docs/design.md](docs/design.md) for design system details.

## Adding a project

Edit `lib/projects.ts` — add an entry to the `projects` array:

```ts
{
  name: 'My App',
  description: 'What it does',
  href: 'https://myapp.andreashagman.no',
  tag: 'Category',
}
```

## Dark mode

- Strategy: Tailwind `darkMode: 'class'` on `<html>`
- Persisted in `localStorage` under key `'theme'`
- Init script in `layout.tsx` sets the class before hydration (no flash)
- Toggle: `components/ThemeToggle.tsx`

## Social links

GitHub and LinkedIn `href` values in `components/Footer.tsx` are currently `"#"` — replace with real URLs.
