# hagman-home-page

Personal homepage for Andreas Hagman — a landing page and app hub built with Next.js 15 and Tailwind CSS.

## Features

- **Landing page** — hero, about section, and project cards linking to live apps
- **Personal page** (`/personal`) — hobbies, hiking trips, and dog section with photo upload
- **Dark/light mode** — persisted in localStorage, no flash on load
- **Admin image upload** — password-protected, uploads photos directly to Firebase Storage from mobile
- **Scroll animations** — IntersectionObserver-based fade-ins

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [Tailwind CSS v3](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/) — Firestore + Storage for image management
- [Lucide React](https://lucide.dev/) — icons
- Fonts: [Fraunces](https://fonts.google.com/specimen/Fraunces) (display) + [DM Sans](https://fonts.google.com/specimen/DM+Sans) (body)

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in your values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See `.env.local.example` for all required variables:

| Variable | Description |
|---|---|
| `ADMIN_PASSWORD` | Password for the admin login at `/admin` |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase project config (from Firebase Console → Project settings) |

## Adding a project

Edit `lib/projects.ts`:

```ts
{
  name: 'My App',
  description: 'What it does',
  href: 'https://myapp.andreashagman.no',
  tag: 'Category',
  type: 'app', // or 'repo' for GitHub projects
}
```

## Adding a hike

Edit `lib/hikes.ts`:

```ts
{
  name: 'Trolltunga',
  location: 'Vestland, Norway',
  year: 2024,
  description: 'One of the most dramatic hikes in Norway.',
}
```

Then upload a photo from the admin panel at `/admin`.

## Admin image upload

1. Go to `/admin` and log in with your password
2. Navigate to `/personal` — upload buttons appear on each hike card and the dog section
3. Tap the button, choose a photo — it uploads to Firebase Storage and the page refreshes

## Deploying Firebase rules

```bash
firebase use hagman-webpage
firebase deploy --only firestore:rules,storage
```
