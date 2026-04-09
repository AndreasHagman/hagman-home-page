# hagman-home-page

Personal homepage for Andreas Hagman — a landing page, app hub, and personal "about me" page built with Next.js 15 and Tailwind CSS.

## Features

- **Landing page** (`/`) — hero, about, and project cards linking to live apps
- **Personal page** (`/personal`) — hobbies, experiences ("Things I've done"), hiking trips, and dog (Caia) section with image management
- **Dark/light mode** — persisted in localStorage, no flash on load
- **Admin image management** — password-protected, upload photos directly from mobile, drag to reposition, adjust card height
- **Image carousel** — multiple images per card, swipe on mobile, arrows on desktop
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

| Variable | Description |
|---|---|
| `ADMIN_PASSWORD` | Password for the admin login at `/admin` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

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
  name: 'Besseggen',
  location: 'Jotunheimen, Norway',
  year: 2024,
  description: 'A classic ridge walk between two lakes.',
}
```

Then upload a photo from the admin panel at `/admin`.

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

## Admin image management

1. Go to `/admin` and log in with your password
2. Navigate to `/personal` — admin controls appear on each card:
   - **Add photo / Replace** — upload a new image (opens gallery)
   - **+** — add an extra image to the carousel
   - **Move** — drag the image to set the focal point (saved automatically)
   - **− px +** — adjust the card image height in 16 px steps

Images are stored in Firebase Storage under `personal/{slot}` (e.g. `personal/hike-trolltunga`). URLs, positions, and heights are stored in Firestore at `personal-images/slots`.

### Firestore slot naming

| Card | Image slot | Example |
|---|---|---|
| Hike | `hike-{slug}` | `hike-trolltunga` |
| Experience | `exp-{slug}` | `exp-bungee-jump` |
| Dog | `caia` | `caia` |

Per-slot metadata keys: `{slot}-positions` (array of `"X% Y%"` strings), `{slot}-height` (number in px).

## Deploying Firebase rules

```bash
firebase use hagman-webpage
firebase deploy --only firestore:rules,storage
```
