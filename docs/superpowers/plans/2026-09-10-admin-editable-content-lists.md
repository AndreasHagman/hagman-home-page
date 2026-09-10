# Admin-editable content lists Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the signed-in admin add, edit and delete races, hikes and experiences directly on `/personal`, with the data stored in Firestore instead of hardcoded arrays.

**Architecture:** A single Firestore document `personal-content/lists` holds three arrays (`races`, `hikes`, `experiences`). Writes go through a new cookie-authenticated route `PATCH /api/admin/content`, mirroring the existing `/api/admin/slots`. Reads happen client-side in `PersonalImages`, which is already the page's only data loader; it merges Firestore against the arrays in `lib/` and passes each list down as a prop. One shared hook (`useEditableList`) and one shared form component (`ItemEditor`) drive editing in all three sections.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v3, Firebase JS SDK v12 (client reads), firebase-admin v13 (server writes), lucide-react icons.

**Spec:** `docs/superpowers/specs/2026-09-10-admin-editable-content-lists-design.md`

## Global Constraints

- **No test framework exists in this repo.** Do not add one. Every task's verification is `npx tsc --noEmit`, `npm run build`, and the manual browser checks written into that task.
- **Item ids are permanent.** Once assigned, an `id` is never regenerated or changed — renaming an item changes only `name`. Image slots are keyed on `id`.
- **Seeded ids must match today's name-slugs exactly**, including non-ASCII characters: `trolltunga`, `preikestolen`, `kjeragbolten`, `galdhøpiggen`, `bungee-jump`, `wind-tunnel`, `scuba-diving`. Getting one wrong orphans already-uploaded images.
- **All admin UI is gated on `isAdmin`.** With `isAdmin` false the rendered markup must be free of every pencil, trash, add button and form.
- **Styling tokens:** metadata text is `text-[10px]`/`text-[11px]` `font-mono`; colours come from the CSS variables `var(--text-muted)`, `var(--border)`, `var(--accent)`, `var(--bg-surface)`, `var(--foreground)` or their Tailwind aliases (`text-muted`, `border-border`, `bg-surface`, `text-accent`); buttons are `rounded-full`; transitions are `transition-colors duration-200`.
- **Copy is English**, matching the rest of the site (`Show all (n)`, `Show less`, `+ Add race`, `Could not save`, `Session expired — sign in again`).
- Commit after every task, with the message given in the task's final step.

---

## File Structure

**Created:**

| File | Responsibility |
|---|---|
| `lib/races.ts` | `Race` interface + the four seed races |
| `lib/content.ts` | List keys, `ContentLists` type, per-list field schemas, id generation, payload sanitising, fallback merging. Shared by the API route and the client. |
| `app/api/admin/content/route.ts` | `PATCH` handler: auth, validation, write to `personal-content/lists` |
| `hooks/useEditableList.ts` | Owns one list's optimistic state, saving and error state |
| `components/personal/ItemEditor.tsx` | Renders an add/edit form from a field schema |
| `components/personal/DeleteItemButton.tsx` | Trash icon that arms to `Sure?` before firing |

**Modified:**

| File | Change |
|---|---|
| `lib/hikes.ts` | Add `id` to the interface and every entry; drop the unused `image?` field |
| `lib/experiences.ts` | Add `id` to the interface and every entry |
| `lib/slots.ts` | `hike()` / `exp()` take an id instead of a name |
| `components/personal/PersonalImages.tsx` | Fetch `personal-content/lists`, merge fallbacks, key image maps by id, pass lists down |
| `components/personal/RacesSection.tsx` | Take races as a prop; sort, cap, distance field, inline editing |
| `components/personal/HikeSection.tsx` | Take hikes as a prop; editing state and add card |
| `components/personal/HikeCard.tsx` | id-based slot; edit/delete controls and inline editor |
| `components/personal/ExperiencesSection.tsx` | Take experiences as a prop; id-based slot; editing state, add card, card controls |
| `firestore.rules` | Add the `personal-content` block |
| `CLAUDE.md` | Document the new collection and the edit-via-admin workflow |

---

### Task 1: Stable ids and id-based image slots

Give every item a permanent `id`, and switch the image slot keys from name-derived slugs to those ids. Because the seeded ids are exactly the slugs in use today, this is a no-op for the rendered page and for every image already in Firestore. Nothing here is admin-visible yet.

**Files:**
- Create: `lib/races.ts`
- Modify: `lib/hikes.ts`, `lib/experiences.ts`, `lib/slots.ts`, `components/personal/HikeCard.tsx`, `components/personal/ExperiencesSection.tsx`, `components/personal/PersonalImages.tsx`, `components/personal/RacesSection.tsx`

**Interfaces:**
- Consumes: nothing (first task)
- Produces:
  - `lib/races.ts` → `interface Race { id: string; name: string; year: number; distance?: string; note?: string }` and `const races: Race[]`
  - `lib/hikes.ts` → `interface Hike { id: string; name: string; location: string; year: number; description: string }` and `const hikes: Hike[]`
  - `lib/experiences.ts` → `interface Experience { id: string; name: string; location: string; year: number; tag: string; description: string }` and `const experiences: Experience[]`
  - `lib/slots.ts` → `SLOTS.hike(id: string): string`, `SLOTS.exp(id: string): string`, unchanged `SLOTS.DOG`, `SLOTS.RACES`, `SLOTS.project(slug)`, and `toSlug(name: string): string`

---

- [ ] **Step 1: Create the races seed file**

Create `lib/races.ts` with exactly this content. The `races` array is lifted verbatim from the hardcoded array currently at the top of `components/personal/RacesSection.tsx`, with ids added and the `note: undefined` entries dropped (an absent optional field and an explicit `undefined` render identically, and Firestore rejects `undefined`).

```ts
export interface Race {
  id: string
  name: string
  year: number
  distance?: string
  note?: string
}

export const races: Race[] = [
  { id: 'tough-viking',        name: 'Tough Viking',        year: 2023 },
  { id: 'holmenkollstafetten', name: 'Holmenkollstafetten', year: 2024, note: 'with Storebrand' },
  { id: 'sentrumsløpet',       name: 'Sentrumsløpet',       year: 2025 },
  { id: 'nordmarkstravern',    name: 'Nordmarkstravern',    year: 2025 },
]
```

- [ ] **Step 2: Add ids to hikes**

Replace the whole of `lib/hikes.ts` with this. Note the `image?` field is gone — grep confirms nothing reads it; images come from Firestore. The id for Galdhøpiggen keeps its `ø`, because the existing Firestore key is `hike-galdhøpiggen`.

```ts
export interface Hike {
  id: string
  name: string
  location: string
  year: number
  description: string
}

export const hikes: Hike[] = [
  {
    id: 'trolltunga',
    name: 'Trolltunga',
    location: 'Vestland, Norway',
    year: 2021,
    description: 'One of the most dramatic hikes in Norway — a cliff jutting out 700 metres above Lake Ringedalsvatnet.',
  },
  {
    id: 'preikestolen',
    name: 'Preikestolen',
    location: 'Rogaland, Norway',
    year: 2020,
    description: 'The famous cliff rising 604 metres above Lysefjord. Stunning panoramic views and a rewarding trail.',
  },
  {
    id: 'kjeragbolten',
    name: 'Kjeragbolten',
    location: 'Rogaland, Norway',
    year: 2021,
    description: 'A boulder wedged in a crevice 984 metres above Lysefjord. One of the most iconic photo spots in Norway.',
  },
  {
    id: 'galdhøpiggen',
    name: 'Galdhøpiggen',
    location: 'Jotunheimen, Norway',
    year: 2021,
    description: 'The highest peak in Norway and Scandinavia at 2469 metres. A challenging but unforgettable summit.',
  },
]
```

- [ ] **Step 3: Add ids to experiences**

Replace the whole of `lib/experiences.ts` with this.

```ts
export interface Experience {
  id: string
  name: string
  location: string
  year: number
  description: string
  tag: string
}

export const experiences: Experience[] = [
  {
    id: 'bungee-jump',
    name: 'Bungee Jump',
    location: 'Rjukan, Telemark',
    year: 2023,
    tag: 'Extreme',
    description: 'A free fall from the Krossobanen bridge in the dramatic Rjukan valley — one of the highest commercial bungee jumps in Norway.',
  },
  {
    id: 'wind-tunnel',
    name: 'Wind Tunnel',
    location: 'Norway',
    year: 2022,
    tag: 'Extreme',
    description: 'Indoor skydiving in a vertical wind tunnel — an absolute blast, though getting your body to actually do what you want took some getting used to.',
  },
  {
    id: 'scuba-diving',
    name: 'Scuba Diving',
    location: 'Egypt',
    year: 2022,
    tag: 'Adventure',
    description: 'Guided tank dive along coral reefs in Egypt — weightless and quiet, with more colour and life underwater than I expected.',
  },
]
```

- [ ] **Step 4: Make the slot helpers take ids**

Replace `lib/slots.ts` with this. `toSlug` stays exported — `lib/content.ts` uses it in Task 2 to generate ids for newly added items.

```ts
export function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export const SLOTS = {
  DOG: 'caia',
  RACES: 'races',
  hike: (id: string) => `hike-${id}`,
  exp: (id: string) => `exp-${id}`,
  project: (slug: string) => `project-${slug}`,
} as const
```

- [ ] **Step 5: Point HikeCard at the id**

In `components/personal/HikeCard.tsx`, change line 16:

```tsx
  const slot = SLOTS.hike(hike.id)
```

- [ ] **Step 6: Point ExperienceCard at the id**

In `components/personal/ExperiencesSection.tsx`, the inner `ExperienceCard` currently receives spread `Experience` fields and derives its slot from `name`. Give it an `id` prop and use that.

Change the component signature (lines 15–23) to:

```tsx
function ExperienceCard({
  id, name, location, year, description, tag,
  resolvedImages = [], positions = [], initialHeight, isAdmin,
}: {
  id: string; name: string; location: string; year: number; description: string
  tag: string; resolvedImages?: string[]; positions?: string[]
  initialHeight?: number; isAdmin?: boolean
}) {
  const slot = SLOTS.exp(id)
```

The `{...exp}` spread in the `.map` already passes `id` through, so no change is needed there yet.

- [ ] **Step 7: Key the image maps by id in PersonalImages**

In `components/personal/PersonalImages.tsx`, the two seed loops currently derive a slug from the name and key their maps by name. Switch both to the id.

Replace the hikes loop (lines 55–63) with:

```tsx
      for (const hike of hikes) {
        const imgs = toArray(data[`hike-${hike.id}`])
        if (imgs.length) hImgs[hike.id] = imgs
        const pos = toArray(data[`hike-${hike.id}-positions`])
        if (pos.length) hPos[hike.id] = pos
        const h = toNumber(data[`hike-${hike.id}-height`])
        if (h) hH[hike.id] = h
      }
```

Replace the experiences loop (lines 71–79) with:

```tsx
      for (const exp of experiences) {
        const imgs = toArray(data[`exp-${exp.id}`])
        if (imgs.length) eImgs[exp.id] = imgs
        const pos = toArray(data[`exp-${exp.id}-positions`])
        if (pos.length) ePos[exp.id] = pos
        const h = toNumber(data[`exp-${exp.id}-height`])
        if (h) eH[exp.id] = h
      }
```

Delete the now-unused `toSlug` function (lines 17–19).

- [ ] **Step 8: Update the map lookups in the sections**

In `components/personal/HikeSection.tsx`, the `.map` reads the maps by `hike.name`. Replace lines 30–40 with:

```tsx
          {hikes.map((hike, i) => (
            <ScrollFade key={hike.id} delay={i * 80}>
              <HikeCard
                hike={hike}
                resolvedImages={hikeImages[hike.id]}
                positions={hikePositions[hike.id]}
                initialHeight={hikeHeights[hike.id]}
                isAdmin={isAdmin}
              />
            </ScrollFade>
          ))}
```

In `components/personal/ExperiencesSection.tsx`, replace the `.map` (lines 70–80) with:

```tsx
          {experiences.map((exp, i) => (
            <ScrollFade key={exp.id} delay={i * 80}>
              <ExperienceCard
                {...exp}
                resolvedImages={experienceImages[exp.id]}
                positions={experiencePositions[exp.id]}
                initialHeight={experienceHeights[exp.id]}
                isAdmin={isAdmin}
              />
            </ScrollFade>
          ))}
```

- [ ] **Step 9: Move the races array out of the component**

In `components/personal/RacesSection.tsx`, delete the local `races` array (lines 7–12) and import the seed instead. Add to the imports at the top:

```tsx
import { races } from '@/lib/races'
```

Then change the `.map` key from `race.name` to `race.id` (line 56):

```tsx
              {races.map((race) => (
                <div key={race.id} className="flex items-baseline gap-3">
```

- [ ] **Step 10: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no output (success).

Run: `npm run build`
Expected: `✓ Compiled successfully`, no type or lint errors.

- [ ] **Step 11: Verify in the browser**

Run: `npm run dev`, open http://localhost:3000/personal

Expected: the page is pixel-identical to before this task. Critically, **every hike, experience and Caia image that was there before is still there** — if any card has fallen back to "No photo yet", an id does not match its Firestore key. Compare against the keys in the `personal-images/slots` document in the Firebase console before continuing.

- [ ] **Step 12: Commit**

```bash
git add lib/races.ts lib/hikes.ts lib/experiences.ts lib/slots.ts components/personal/
git commit -m "refactor: give personal content items stable ids

Image slots are now keyed on a permanent per-item id rather than a slug
derived from the display name, so renaming an item will not orphan its
images. Seeded ids match the existing slugs exactly, so no image data
moves."
```

---

### Task 2: Content module and the write API

Add the shared content module — field schemas, id generation, payload sanitising, fallback merging — and the authenticated route that writes lists to Firestore. Nothing consumes them yet; this task delivers a working, testable endpoint.

**Files:**
- Create: `lib/content.ts`, `app/api/admin/content/route.ts`
- Modify: `firestore.rules`

**Interfaces:**
- Consumes: `Race`, `Hike`, `Experience` and the seed arrays from Task 1; `toSlug` from `lib/slots.ts`
- Produces:
  - `LIST_KEYS: readonly ['races', 'hikes', 'experiences']`
  - `type ListKey = 'races' | 'hikes' | 'experiences'`
  - `type FieldType = 'text' | 'number' | 'textarea'`
  - `interface FieldSpec { key: string; label: string; type: FieldType; required?: boolean }`
  - `FIELDS: Record<ListKey, FieldSpec[]>`
  - `interface ContentLists { races: Race[]; hikes: Hike[]; experiences: Experience[] }`
  - `DEFAULT_LISTS: ContentLists`
  - `makeId(name: string, existingIds: string[]): string`
  - `sanitizeList(key: ListKey, value: unknown): Record<string, string | number>[]` — throws `Error` with a human-readable message on invalid input
  - `mergeLists(data?: Record<string, unknown>): ContentLists`
  - `PATCH /api/admin/content` accepting `{ races?: [], hikes?: [], experiences?: [] }`

---

- [ ] **Step 1: Create the content module**

Create `lib/content.ts` with exactly this content.

`FIELDS` is the single source of truth for what a list item may contain: `ItemEditor` renders forms from it, and `sanitizeList` validates against it, so the two can never drift.

```ts
import { toSlug } from './slots'
import { races as defaultRaces, type Race } from './races'
import { hikes as defaultHikes, type Hike } from './hikes'
import { experiences as defaultExperiences, type Experience } from './experiences'

export const LIST_KEYS = ['races', 'hikes', 'experiences'] as const
export type ListKey = (typeof LIST_KEYS)[number]

export type FieldType = 'text' | 'number' | 'textarea'

export interface FieldSpec {
  key: string
  label: string
  type: FieldType
  required?: boolean
}

/** The only fields a list item may have, besides its id. */
export const FIELDS: Record<ListKey, FieldSpec[]> = {
  races: [
    { key: 'name',     label: 'Race',     type: 'text',   required: true },
    { key: 'year',     label: 'Year',     type: 'number', required: true },
    { key: 'distance', label: 'Distance', type: 'text' },
    { key: 'note',     label: 'Note',     type: 'text' },
  ],
  hikes: [
    { key: 'name',        label: 'Name',        type: 'text',     required: true },
    { key: 'location',    label: 'Location',    type: 'text',     required: true },
    { key: 'year',        label: 'Year',        type: 'number',   required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
  ],
  experiences: [
    { key: 'name',        label: 'Name',        type: 'text',     required: true },
    { key: 'tag',         label: 'Tag',         type: 'text',     required: true },
    { key: 'location',    label: 'Location',    type: 'text',     required: true },
    { key: 'year',        label: 'Year',        type: 'number',   required: true },
    { key: 'description', label: 'Description', type: 'textarea', required: true },
  ],
}

export interface ContentLists {
  races: Race[]
  hikes: Hike[]
  experiences: Experience[]
}

/** Seed data, used per-list whenever Firestore has nothing usable for that list. */
export const DEFAULT_LISTS: ContentLists = {
  races: defaultRaces,
  hikes: defaultHikes,
  experiences: defaultExperiences,
}

/** Derive a permanent id from a name, suffixing on collision within the same list. */
export function makeId(name: string, existingIds: string[]): string {
  const base = toSlug(name.trim()) || 'item'
  if (!existingIds.includes(base)) return base
  let n = 2
  while (existingIds.includes(`${base}-${n}`)) n++
  return `${base}-${n}`
}

/**
 * Validate an incoming list and strip it to the schema in FIELDS.
 * Throws with a human-readable message describing the first problem found.
 */
export function sanitizeList(key: ListKey, value: unknown): Record<string, string | number>[] {
  if (!Array.isArray(value)) throw new Error(`"${key}" must be an array`)

  const seen = new Set<string>()

  return value.map((raw, i) => {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      throw new Error(`${key}[${i}] must be an object`)
    }
    const item = raw as Record<string, unknown>

    const id = typeof item.id === 'string' ? item.id.trim() : ''
    if (!id) throw new Error(`${key}[${i}] is missing "id"`)
    if (seen.has(id)) throw new Error(`${key} has a duplicate id: "${id}"`)
    seen.add(id)

    const out: Record<string, string | number> = { id }

    for (const field of FIELDS[key]) {
      const fieldValue = item[field.key]

      if (field.type === 'number') {
        const n = typeof fieldValue === 'number' ? fieldValue : Number(fieldValue)
        if (!Number.isFinite(n)) {
          if (field.required) throw new Error(`${key}[${i}].${field.key} must be a number`)
          continue
        }
        out[field.key] = n
        continue
      }

      const s = typeof fieldValue === 'string' ? fieldValue.trim() : ''
      if (!s) {
        if (field.required) throw new Error(`${key}[${i}].${field.key} is required`)
        continue
      }
      out[field.key] = s
    }

    return out
  })
}

function readList<T>(key: ListKey, data: Record<string, unknown> | undefined, fallback: T[]): T[] {
  const value = data?.[key]
  if (!Array.isArray(value)) return fallback
  try {
    return sanitizeList(key, value) as unknown as T[]
  } catch {
    // A malformed list in Firestore must never blank the page.
    return fallback
  }
}

/** Merge a `personal-content/lists` snapshot over the seed data, per list. */
export function mergeLists(data?: Record<string, unknown>): ContentLists {
  return {
    races: readList<Race>('races', data, DEFAULT_LISTS.races),
    hikes: readList<Hike>('hikes', data, DEFAULT_LISTS.hikes),
    experiences: readList<Experience>('experiences', data, DEFAULT_LISTS.experiences),
  }
}
```

- [ ] **Step 2: Create the write route**

Create `app/api/admin/content/route.ts` with exactly this content. The auth block is copied from `app/api/admin/slots/route.ts` so the two behave identically.

```ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { LIST_KEYS, sanitizeList, type ListKey } from '@/lib/content'

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('admin_session')?.value

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await adminAuth.verifySessionCookie(sessionCookie, true)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Body must be JSON' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: 'Body must be an object' }, { status: 400 })
  }

  const input = body as Record<string, unknown>
  const keys = Object.keys(input)

  if (keys.length === 0) {
    return NextResponse.json({ error: 'Body is empty' }, { status: 400 })
  }

  const unknownKeys = keys.filter((k) => !LIST_KEYS.includes(k as ListKey))
  if (unknownKeys.length > 0) {
    return NextResponse.json({ error: `Unknown key(s): ${unknownKeys.join(', ')}` }, { status: 400 })
  }

  const payload: Record<string, unknown> = {}
  try {
    for (const key of keys as ListKey[]) {
      payload[key] = sanitizeList(key, input[key])
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid payload' },
      { status: 400 },
    )
  }

  await adminDb.collection('personal-content').doc('lists').set(payload, { merge: true })
  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Allow public reads of the new collection**

Replace `firestore.rules` with this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /personal-images/{document=**} {
      allow read: if true;
      allow write: if false; // All writes go through /api/admin/slots (Firebase Admin SDK)
    }
    match /personal-content/{document=**} {
      allow read: if true;
      allow write: if false; // All writes go through /api/admin/content (Firebase Admin SDK)
    }
  }
}
```

Deploy them: `npx firebase deploy --only firestore:rules`
Expected: `+  Deploy complete!`

If the Firebase CLI is not authenticated, paste the rules into the Firebase console under Firestore Database → Rules → Publish instead. **The rules must be live before Task 3**, or the client read will be denied.

- [ ] **Step 4: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no output.

Run: `npm run build`
Expected: `✓ Compiled successfully`, and the route list includes `ƒ /api/admin/content`.

- [ ] **Step 5: Verify the endpoint rejects bad requests**

With `npm run dev` running:

```bash
curl -i -X PATCH http://localhost:3000/api/admin/content \
  -H 'Content-Type: application/json' -d '{"races":[]}'
```
Expected: `HTTP/1.1 401` and `{"error":"Unauthorized"}`.

Now sign in at http://localhost:3000/admin in a browser, open DevTools → Application → Cookies, and copy the `admin_session` value into `$COOKIE` below.

```bash
COOKIE='paste-the-admin_session-value-here'

# Unknown top-level key → 400
curl -s -X PATCH http://localhost:3000/api/admin/content \
  -H 'Content-Type: application/json' -H "Cookie: admin_session=$COOKIE" \
  -d '{"projects":[]}'
```
Expected: `{"error":"Unknown key(s): projects"}`

```bash
# Missing required field → 400
curl -s -X PATCH http://localhost:3000/api/admin/content \
  -H 'Content-Type: application/json' -H "Cookie: admin_session=$COOKIE" \
  -d '{"races":[{"id":"x","year":2025}]}'
```
Expected: `{"error":"races[0].name is required"}`

```bash
# Duplicate id → 400
curl -s -X PATCH http://localhost:3000/api/admin/content \
  -H 'Content-Type: application/json' -H "Cookie: admin_session=$COOKIE" \
  -d '{"races":[{"id":"x","name":"A","year":2025},{"id":"x","name":"B","year":2024}]}'
```
Expected: `{"error":"races has a duplicate id: \"x\""}`

```bash
# Valid, with an unknown item property that must be stripped
curl -s -X PATCH http://localhost:3000/api/admin/content \
  -H 'Content-Type: application/json' -H "Cookie: admin_session=$COOKIE" \
  -d '{"races":[{"id":"test-race","name":"Test Race","year":2025,"sneaky":"drop me"}]}'
```
Expected: `{"success":true}`. In the Firebase console, `personal-content/lists` now exists with `races: [{ id: "test-race", name: "Test Race", year: 2025 }]` — and no `sneaky` field.

- [ ] **Step 6: Delete the test document**

In the Firebase console, delete the `personal-content/lists` document. Task 3 needs to start from a missing document to verify the fallback path.

- [ ] **Step 7: Commit**

```bash
git add lib/content.ts app/api/admin/content/route.ts firestore.rules
git commit -m "feat: add authenticated write API for personal content lists

New personal-content/lists document, written through PATCH
/api/admin/content with the same session-cookie check as the image
slots route. lib/content.ts holds the field schemas that both the
validator and (later) the editor UI read from."
```

---

### Task 3: Read lists from Firestore

Make `PersonalImages` fetch `personal-content/lists` alongside the image slots, merge it over the seed arrays, and pass each list down. The three sections stop importing from `lib/`. After this task the content is data-driven, though still read-only.

**Files:**
- Modify: `components/personal/PersonalImages.tsx`, `components/personal/RacesSection.tsx`, `components/personal/HikeSection.tsx`, `components/personal/ExperiencesSection.tsx`

**Interfaces:**
- Consumes: `mergeLists`, `DEFAULT_LISTS`, `ContentLists` from Task 2; the id-keyed image maps from Task 1
- Produces:
  - `RacesSection` prop `races: Race[]` (required, first prop)
  - `HikeSection` prop `hikes: Hike[]` (required, first prop)
  - `ExperiencesSection` prop `experiences: Experience[]` (required, first prop)
  - The three sections' image props are renamed to `images`, `positions`, `heights` for hikes and experiences

---

- [ ] **Step 1: Rewrite PersonalImages**

Replace the whole of `components/personal/PersonalImages.tsx` with this. The per-family loops collapse into one `collect` helper, and the two Firestore reads run in parallel.

```tsx
'use client'

import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import HikeSection from './HikeSection'
import DogSection from './DogSection'
import ExperiencesSection from './ExperiencesSection'
import RacesSection from './RacesSection'
import { DEFAULT_LISTS, mergeLists, type ContentLists } from '@/lib/content'

interface PersonalImagesProps {
  isAdmin: boolean
}

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[]
  if (typeof value === 'string' && value) return [value]
  return []
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number') return value
  return undefined
}

/** Pull the images, focal points and heights for one family of slots, keyed by item id. */
function collect(data: Record<string, unknown>, prefix: string, ids: string[]) {
  const images: Record<string, string[]> = {}
  const positions: Record<string, string[]> = {}
  const heights: Record<string, number> = {}

  for (const id of ids) {
    const imgs = toArray(data[`${prefix}-${id}`])
    if (imgs.length) images[id] = imgs
    const pos = toArray(data[`${prefix}-${id}-positions`])
    if (pos.length) positions[id] = pos
    const h = toNumber(data[`${prefix}-${id}-height`])
    if (h) heights[id] = h
  }

  return { images, positions, heights }
}

export default function PersonalImages({ isAdmin }: PersonalImagesProps) {
  const [lists, setLists] = useState<ContentLists>(DEFAULT_LISTS)
  const [slots, setSlots] = useState<Record<string, unknown>>({})

  useEffect(() => {
    async function load() {
      const [slotSnap, listSnap] = await Promise.all([
        getDoc(doc(db, 'personal-images', 'slots')),
        getDoc(doc(db, 'personal-content', 'lists')),
      ])
      if (slotSnap.exists()) setSlots(slotSnap.data() as Record<string, unknown>)
      setLists(mergeLists(listSnap.exists() ? (listSnap.data() as Record<string, unknown>) : undefined))
    }
    load().catch(console.error)
  }, [])

  const hike = collect(slots, 'hike', lists.hikes.map((h) => h.id))
  const exp = collect(slots, 'exp', lists.experiences.map((e) => e.id))

  return (
    <>
      {isAdmin && (
        <div className="fixed top-16 right-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-mono" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--bg-surface) 90%, transparent)', backdropFilter: 'blur(8px)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          admin
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' })
              window.location.reload()
            }}
            className="ml-1 opacity-50 hover:opacity-100 transition-opacity duration-200"
            aria-label="Log out"
          >
            ×
          </button>
        </div>
      )}
      <ExperiencesSection
        experiences={lists.experiences}
        isAdmin={isAdmin}
        images={exp.images}
        positions={exp.positions}
        heights={exp.heights}
      />
      <RacesSection
        races={lists.races}
        isAdmin={isAdmin}
        resolvedImages={toArray(slots['races'])}
        positions={toArray(slots['races-positions'])}
        initialHeight={toNumber(slots['races-height'])}
      />
      <HikeSection
        hikes={lists.hikes}
        isAdmin={isAdmin}
        images={hike.images}
        positions={hike.positions}
        heights={hike.heights}
      />
      <DogSection
        isAdmin={isAdmin}
        resolvedImages={toArray(slots['caia'])}
        positions={toArray(slots['caia-positions'])}
        initialHeight={toNumber(slots['caia-height'])}
      />
    </>
  )
}
```

- [ ] **Step 2: Take races as a prop**

In `components/personal/RacesSection.tsx`, remove the `import { races } from '@/lib/races'` line added in Task 1 and replace it with a type import, then add the prop. The props interface (lines 14–21 area) becomes:

```tsx
import type { Race } from '@/lib/races'

interface RacesSectionProps {
  races: Race[]
  isAdmin?: boolean
  resolvedImages?: string[]
  positions?: string[]
  initialHeight?: number
}

export default function RacesSection({ races, isAdmin, resolvedImages = [], positions = [], initialHeight }: RacesSectionProps) {
```

Everything below is unchanged — the `.map` already reads the `races` identifier, which now resolves to the prop.

- [ ] **Step 3: Take hikes as a prop**

Replace the top of `components/personal/HikeSection.tsx` (lines 1–12) with:

```tsx
import HikeCard from './HikeCard'
import ScrollFade from '@/components/ScrollFade'
import type { Hike } from '@/lib/hikes'

interface HikeSectionProps {
  hikes: Hike[]
  isAdmin?: boolean
  images?: Record<string, string[]>
  positions?: Record<string, string[]>
  heights?: Record<string, number>
}

export default function HikeSection({ hikes, isAdmin, images = {}, positions = {}, heights = {} }: HikeSectionProps) {
```

Then update the `.map` body to the renamed props:

```tsx
          {hikes.map((hike, i) => (
            <ScrollFade key={hike.id} delay={i * 80}>
              <HikeCard
                hike={hike}
                resolvedImages={images[hike.id]}
                positions={positions[hike.id]}
                initialHeight={heights[hike.id]}
                isAdmin={isAdmin}
              />
            </ScrollFade>
          ))}
```

- [ ] **Step 4: Take experiences as a prop**

In `components/personal/ExperiencesSection.tsx`, remove `import { experiences } from '@/lib/experiences'` and replace the props interface (lines 8–13) with:

```tsx
import type { Experience } from '@/lib/experiences'

interface ExperiencesSectionProps {
  experiences: Experience[]
  isAdmin?: boolean
  images?: Record<string, string[]>
  positions?: Record<string, string[]>
  heights?: Record<string, number>
}
```

Change the exported component signature (line 56) to:

```tsx
export default function ExperiencesSection({ experiences, isAdmin, images = {}, positions = {}, heights = {} }: ExperiencesSectionProps) {
```

The inner `ExperienceCard` takes a prop also called `positions`, so the `.map` must read from the outer maps explicitly:

```tsx
          {experiences.map((exp, i) => (
            <ScrollFade key={exp.id} delay={i * 80}>
              <ExperienceCard
                {...exp}
                resolvedImages={images[exp.id]}
                positions={positions[exp.id]}
                initialHeight={heights[exp.id]}
                isAdmin={isAdmin}
              />
            </ScrollFade>
          ))}
```

- [ ] **Step 5: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no output.

Run: `npm run build`
Expected: `✓ Compiled successfully`.

- [ ] **Step 6: Verify the fallback path**

With `personal-content/lists` still deleted (Task 2 Step 6) and `npm run dev` running, open http://localhost:3000/personal.

Expected: identical to before — 4 races, 4 hikes, 3 experiences, all images present. The browser console shows no Firestore permission errors. If you see `Missing or insufficient permissions`, the rules from Task 2 Step 3 are not live.

- [ ] **Step 7: Verify the Firestore path**

In the Firebase console, create the document `personal-content/lists` with a single field `races` of type array, containing one map: `id` (string) `test-race`, `name` (string) `Test Race`, `year` (number) `2025`.

Reload `/personal`.

Expected: the Races list now shows only `Test Race 2025`. Hikes and experiences are untouched, still coming from the seed arrays — proving the merge is per-list.

Now delete the `personal-content/lists` document again and reload. Expected: the four original races are back.

- [ ] **Step 8: Commit**

```bash
git add components/personal/
git commit -m "feat: read personal content lists from Firestore

PersonalImages now fetches personal-content/lists in parallel with the
image slots and merges it over the seed arrays per list, so a missing
or malformed list falls back to lib/ rather than blanking the section.
The three sections take their list as a prop."
```

---

### Task 4: Shared editing primitives

Add the three pieces every editable section needs: the state/save hook, the schema-driven form, and the arming delete button. Nothing renders them yet — the gate here is that they typecheck, build, and expose the exact interfaces Tasks 5–7 depend on.

**Files:**
- Create: `hooks/useEditableList.ts`, `components/personal/ItemEditor.tsx`, `components/personal/DeleteItemButton.tsx`

**Interfaces:**
- Consumes: `ListKey`, `FieldSpec`, `makeId` from Task 2; `PATCH /api/admin/content` from Task 2
- Produces:
  - `interface EditableListError { itemId: string | null; message: string }`
  - `useEditableList<T extends { id: string }>(listKey: ListKey, initial: T[])` returning `{ items: T[]; error: EditableListError | null; addItem(values: Record<string, string | number>): Promise<void>; updateItem(id: string, values: Record<string, string | number>): Promise<void>; removeItem(id: string): Promise<void> }`
  - `ItemEditor` props: `{ fields: FieldSpec[]; initial?: object; submitLabel: string; onSubmit: (values: Record<string, string | number>) => void; onCancel: () => void }`
  - `DeleteItemButton` props: `{ onConfirm: () => void; label: string }`

---

- [ ] **Step 1: Create the list hook**

Create `hooks/useEditableList.ts` with exactly this content.

Saving is optimistic: local state changes immediately, the request runs behind it, and a failure restores the previous array and records an error against the item that caused it (`itemId: null` means the error belongs to an add, which has no row yet).

The `useEffect` re-syncs when the parent finishes its Firestore fetch. It depends on the `initial` array's identity, so the caller **must** hold the list in state rather than constructing it inline each render — `PersonalImages` does.

```ts
'use client'

import { useEffect, useState } from 'react'
import { makeId, type ListKey } from '@/lib/content'

export interface EditableListError {
  itemId: string | null
  message: string
}

const SAVE_FAILED = 'Could not save'
const SESSION_EXPIRED = 'Session expired — sign in again'

export function useEditableList<T extends { id: string }>(listKey: ListKey, initial: T[]) {
  const [items, setItems] = useState<T[]>(initial)
  const [error, setError] = useState<EditableListError | null>(null)

  useEffect(() => {
    setItems(initial)
  }, [initial])

  async function save(next: T[], itemId: string | null) {
    const previous = items
    setItems(next)
    setError(null)

    try {
      const res = await fetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [listKey]: next }),
      })
      if (!res.ok) {
        setItems(previous)
        setError({ itemId, message: res.status === 401 ? SESSION_EXPIRED : SAVE_FAILED })
      }
    } catch {
      setItems(previous)
      setError({ itemId, message: SAVE_FAILED })
    }
  }

  async function addItem(values: Record<string, string | number>) {
    const name = typeof values.name === 'string' ? values.name : ''
    const id = makeId(name, items.map((item) => item.id))
    await save([...items, { ...values, id } as unknown as T], null)
  }

  async function updateItem(id: string, values: Record<string, string | number>) {
    await save(
      items.map((item) => (item.id === id ? ({ ...values, id } as unknown as T) : item)),
      id,
    )
  }

  async function removeItem(id: string) {
    await save(items.filter((item) => item.id !== id), id)
  }

  return { items, error, addItem, updateItem, removeItem }
}
```

- [ ] **Step 2: Create the form component**

Create `components/personal/ItemEditor.tsx` with exactly this content.

Every field is held as a string while editing — that is what an `<input>` gives you — and converted on submit, so number fields land in Firestore as numbers.

`initial` is typed `object`, not `Record<string, unknown>`, on purpose: `Race`, `Hike` and `Experience` are declared as interfaces, and TypeScript does not give interfaces an implicit index signature, so `initial={hike}` would not compile against a `Record` type. Widening to `object` and narrowing once inside keeps the call sites cast-free.

```tsx
'use client'

import { useState } from 'react'
import type { FieldSpec } from '@/lib/content'

interface ItemEditorProps {
  fields: FieldSpec[]
  initial?: object
  submitLabel: string
  onSubmit: (values: Record<string, string | number>) => void
  onCancel: () => void
}

const labelClass = 'text-[10px] font-mono text-muted tracking-[0.15em] uppercase'
const inputClass =
  'w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted focus:outline-none focus:border-accent transition-colors duration-200'

export default function ItemEditor({ fields, initial, submitLabel, onSubmit, onCancel }: ItemEditorProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const seed = (initial ?? {}) as Record<string, unknown>
    return Object.fromEntries(
      fields.map((field) => [field.key, seed[field.key] === undefined ? '' : String(seed[field.key])]),
    )
  })

  const incomplete = fields.some((field) => field.required && !values[field.key].trim())

  function set(key: string, value: string) {
    setValues((current) => ({ ...current, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (incomplete) return

    const out: Record<string, string | number> = {}
    for (const field of fields) {
      const raw = values[field.key].trim()
      if (!raw) continue
      out[field.key] = field.type === 'number' ? Number(raw) : raw
    }
    onSubmit(out)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full p-4 rounded-xl bg-surface border border-border flex flex-col gap-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label
            key={field.key}
            className={`flex flex-col gap-1.5 ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}
          >
            <span className={labelClass}>
              {field.label}
              {!field.required && <span className="opacity-50"> (optional)</span>}
            </span>
            {field.type === 'textarea' ? (
              <textarea
                value={values[field.key]}
                onChange={(e) => set(field.key, e.target.value)}
                rows={3}
                className={`${inputClass} resize-y leading-relaxed`}
              />
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                inputMode={field.type === 'number' ? 'numeric' : undefined}
                value={values[field.key]}
                onChange={(e) => set(field.key, e.target.value)}
                className={inputClass}
              />
            )}
          </label>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={incomplete}
          className="px-4 py-1.5 rounded-full bg-accent text-background text-[11px] font-mono tracking-[0.1em] uppercase transition-opacity duration-200 hover:opacity-90 disabled:opacity-40"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-1.5 rounded-full border border-border text-muted text-[11px] font-mono tracking-[0.1em] uppercase hover:text-foreground transition-colors duration-200"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
```

- [ ] **Step 3: Create the delete button**

Create `components/personal/DeleteItemButton.tsx` with exactly this content. The first click arms it; a second click within four seconds deletes; otherwise it disarms itself.

```tsx
'use client'

import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'

interface DeleteItemButtonProps {
  onConfirm: () => void
  label: string
}

const ARM_TIMEOUT_MS = 4000

export default function DeleteItemButton({ onConfirm, label }: DeleteItemButtonProps) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const timer = setTimeout(() => setArmed(false), ARM_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [armed])

  if (armed) {
    return (
      <button
        type="button"
        onClick={() => { setArmed(false); onConfirm() }}
        className="px-2 h-6 rounded-full border text-[10px] font-mono border-red-400 text-red-400 transition-colors duration-200"
        aria-label={`Confirm: ${label}`}
      >
        Sure?
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setArmed(true)}
      className="w-6 h-6 rounded-full border flex items-center justify-center transition-colors duration-200 hover:border-red-400 hover:text-red-400"
      style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
      aria-label={label}
    >
      <Trash2 size={11} />
    </button>
  )
}
```

- [ ] **Step 4: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no output.

Run: `npm run build`
Expected: `✓ Compiled successfully`. Unused-export warnings are not expected — these are all exported modules — but unused *imports* would fail lint, so check the output is clean.

- [ ] **Step 5: Commit**

```bash
git add hooks/useEditableList.ts components/personal/ItemEditor.tsx components/personal/DeleteItemButton.tsx
git commit -m "feat: add shared primitives for editing content lists

useEditableList owns optimistic state and saving for one list;
ItemEditor renders a form from a FIELDS schema; DeleteItemButton
arms before firing. Not wired into any section yet."
```

---

### Task 5: Races — sorting, cap, and inline editing

Rewrite the races section: newest first, a `distance` line, at most five visible to the public with a `Show all (n)` toggle, and full add/edit/delete for the admin.

**Files:**
- Modify: `components/personal/RacesSection.tsx`

**Interfaces:**
- Consumes: `useEditableList`, `ItemEditor`, `DeleteItemButton` from Task 4; `FIELDS` from Task 2; `Race` from Task 1; the `races` prop from Task 3
- Produces: no new exports

---

- [ ] **Step 1: Rewrite the section**

Replace the whole of `components/personal/RacesSection.tsx` with this.

Note `isCapped` is false whenever `isAdmin` is true — the admin always sees the full list, so editing never happens against hidden rows.

```tsx
'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import ScrollFade from '@/components/ScrollFade'
import ImageCarousel from './ImageCarousel'
import ItemEditor from './ItemEditor'
import DeleteItemButton from './DeleteItemButton'
import { useEditableList } from '@/hooks/useEditableList'
import { FIELDS } from '@/lib/content'
import { SLOTS } from '@/lib/slots'
import type { Race } from '@/lib/races'

const VISIBLE_LIMIT = 5

interface RacesSectionProps {
  races: Race[]
  isAdmin?: boolean
  resolvedImages?: string[]
  positions?: string[]
  initialHeight?: number
}

export default function RacesSection({
  races, isAdmin, resolvedImages = [], positions = [], initialHeight,
}: RacesSectionProps) {
  const { items, error, addItem, updateItem, removeItem } = useEditableList<Race>('races', races)
  const [expanded, setExpanded] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const sorted = [...items].sort((a, b) => b.year - a.year)
  const overLimit = sorted.length > VISIBLE_LIMIT
  const isCapped = !isAdmin && overLimit && !expanded
  const visible = isCapped ? sorted.slice(0, VISIBLE_LIMIT) : sorted

  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollFade>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block flex-shrink-0" aria-hidden="true" />
            <span className="text-xs font-mono text-muted tracking-[0.18em] uppercase">Races</span>
          </div>

          <p
            className="font-display text-2xl md:text-3xl text-foreground mb-8"
            style={{ fontVariationSettings: "'opsz' 32, 'wght' 400, 'SOFT' 20" }}
          >
            On the start line
          </p>

          <div className="flex flex-col sm:flex-row gap-8 items-start">
            {/* Photo */}
            <div className="relative w-full sm:w-64 flex-shrink-0 rounded-2xl overflow-hidden bg-surface border border-border">
              <ImageCarousel
                slot={SLOTS.RACES}
                resolvedImages={resolvedImages}
                positions={positions}
                initialHeight={initialHeight}
                defaultHeight={256}
                alt="Race photo"
                sizes="256px"
                isAdmin={isAdmin}
              />
            </div>

            {/* Race list */}
            <div className="flex flex-col gap-3 flex-1 min-w-0">
              {visible.map((race) => (
                <div key={race.id}>
                  {editingId === race.id ? (
                    <ItemEditor
                      fields={FIELDS.races}
                      initial={race}
                      submitLabel="Save"
                      onSubmit={(values) => { updateItem(race.id, values); setEditingId(null) }}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <div className="group flex items-baseline flex-wrap gap-x-3 gap-y-1">
                      <span
                        className="font-display text-lg text-foreground leading-tight"
                        style={{ fontVariationSettings: "'opsz' 20, 'wght' 500, 'SOFT' 15" }}
                      >
                        {race.name}
                      </span>
                      <span className="text-[11px] font-mono text-muted">{race.year}</span>
                      {race.distance && (
                        <span className="text-[11px] font-mono text-accent">{race.distance}</span>
                      )}
                      {race.note && (
                        <span className="text-[11px] font-mono text-muted opacity-60">{race.note}</span>
                      )}
                      {isAdmin && (
                        <span className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                          <button
                            type="button"
                            onClick={() => setEditingId(race.id)}
                            className="w-6 h-6 rounded-full border flex items-center justify-center transition-colors duration-200 hover:border-accent hover:text-accent"
                            style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
                            aria-label={`Edit ${race.name}`}
                          >
                            <Pencil size={11} />
                          </button>
                          <DeleteItemButton
                            onConfirm={() => removeItem(race.id)}
                            label={`Delete ${race.name}`}
                          />
                        </span>
                      )}
                    </div>
                  )}

                  {error?.itemId === race.id && (
                    <p className="mt-1 text-[11px] font-mono text-red-400">{error.message}</p>
                  )}
                </div>
              ))}

              {!isAdmin && overLimit && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="self-start mt-1 text-[11px] font-mono text-muted tracking-[0.15em] uppercase hover:text-accent transition-colors duration-200"
                >
                  {expanded ? 'Show less' : `Show all (${sorted.length})`}
                </button>
              )}

              {isAdmin && (
                isAdding ? (
                  <ItemEditor
                    fields={FIELDS.races}
                    submitLabel="Add race"
                    onSubmit={(values) => { addItem(values); setIsAdding(false) }}
                    onCancel={() => setIsAdding(false)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAdding(true)}
                    className="self-start mt-2 px-4 py-2 rounded-xl border border-dashed border-border text-[11px] font-mono text-muted tracking-[0.15em] uppercase hover:border-accent hover:text-accent transition-colors duration-200"
                  >
                    + Add race
                  </button>
                )
              )}

              {error?.itemId === null && (
                <p className="text-[11px] font-mono text-red-400">{error.message}</p>
              )}
            </div>
          </div>
        </ScrollFade>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no output.

Run: `npm run build`
Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Verify the public view**

With `npm run dev` running and **signed out**, open http://localhost:3000/personal.

Expected: four races, ordered 2025, 2025, 2024, 2023 (newest first — the reverse of the old order). No pencil, no trash, no add button, no `Show all` (only four races).

- [ ] **Step 4: Verify adding, editing and deleting**

Sign in at http://localhost:3000/admin, then go to `/personal`.

1. Click `+ Add race`. The form shows Race, Year, Distance (optional), Note (optional). `Add race` is disabled until Race and Year are filled.
2. Add `Oslo Maraton` / `2026` / `42 km`. It appears at the top of the list, with `42 km` in accent colour. Reload — it is still there. Check the Firebase console: `personal-content/lists` now has a `races` array of five items, the new one with `id: "oslo-maraton"`.
3. Hover a race row: pencil and trash fade in. Click the pencil, change the note, Save. The change persists across a reload.
4. Click the trash on the test race. It becomes `Sure?`. Wait five seconds — it reverts to the trash icon without deleting. Click it twice in a row — the race disappears and stays gone after a reload.

- [ ] **Step 5: Verify the cap**

Still signed in, add races until there are six or more. Expected: all of them stay visible while signed in.

Sign out (the `×` on the admin pill), reload `/personal`.

Expected: only the five newest show, followed by `Show all (6)`. Click it — all six show and the button reads `Show less`. Click again — back to five.

- [ ] **Step 6: Verify the error path**

Sign in again. Open DevTools → Application → Cookies and delete the `admin_session` cookie without reloading the page. Now edit a race and save.

Expected: the row briefly shows the new value, then reverts, and `Session expired — sign in again` appears in red mono text under the row.

- [ ] **Step 7: Clean up test data**

Delete any test races you added, leaving the four real ones. Sign back in if needed.

- [ ] **Step 8: Commit**

```bash
git add components/personal/RacesSection.tsx
git commit -m "feat: admin-editable race list with distance, sorting and cap

Races sort newest first, gain an optional distance field, and collapse
to five entries behind a Show all toggle for visitors. Signed-in admins
get inline add, edit and delete and always see the full list."
```

---

### Task 6: Hikes — inline editing

Give hike cards the same treatment: an edit panel inside the card, a delete button, and a dashed add card at the end of the grid.

**Files:**
- Modify: `components/personal/HikeCard.tsx`, `components/personal/HikeSection.tsx`

**Interfaces:**
- Consumes: `useEditableList`, `ItemEditor`, `DeleteItemButton` from Task 4; `FIELDS` from Task 2; the `hikes` prop from Task 3
- Produces: `HikeCard` gains optional props `isEditing?: boolean`, `onEdit?: () => void`, `onDelete?: () => void`, `onSubmit?: (values: Record<string, string | number>) => void`, `onCancel?: () => void`, `error?: string | null`

---

- [ ] **Step 1: Rewrite HikeCard**

Replace the whole of `components/personal/HikeCard.tsx` with this. The card owns its own editor rendering so the section stays a thin coordinator.

```tsx
'use client'

import { Pencil } from 'lucide-react'
import ImageCarousel from './ImageCarousel'
import ItemEditor from './ItemEditor'
import DeleteItemButton from './DeleteItemButton'
import { FIELDS } from '@/lib/content'
import { SLOTS } from '@/lib/slots'
import type { Hike } from '@/lib/hikes'

interface HikeCardProps {
  hike: Hike
  resolvedImages?: string[]
  positions?: string[]
  initialHeight?: number
  isAdmin?: boolean
  isEditing?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onSubmit?: (values: Record<string, string | number>) => void
  onCancel?: () => void
  error?: string | null
}

export default function HikeCard({
  hike, resolvedImages = [], positions = [], initialHeight, isAdmin,
  isEditing = false, onEdit, onDelete, onSubmit, onCancel, error,
}: HikeCardProps) {
  const slot = SLOTS.hike(hike.id)

  return (
    <div className="flex flex-col bg-surface border border-border rounded-2xl overflow-hidden h-full">
      <ImageCarousel
        slot={slot}
        resolvedImages={resolvedImages}
        positions={positions}
        initialHeight={initialHeight}
        defaultHeight={192}
        alt={hike.name}
        sizes="(max-width: 768px) 100vw, 33vw"
        isAdmin={isAdmin}
        className="border-b border-border"
      />

      {isEditing ? (
        <ItemEditor
          fields={FIELDS.hikes}
          initial={hike}
          submitLabel="Save"
          onSubmit={(values) => onSubmit?.(values)}
          onCancel={() => onCancel?.()}
        />
      ) : (
        <div className="group p-5 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3
              className="font-display text-lg text-foreground leading-tight"
              style={{ fontVariationSettings: "'opsz' 20, 'wght' 500, 'SOFT' 15" }}
            >
              {hike.name}
            </h3>
            <span className="flex-shrink-0 text-[11px] font-mono text-muted mt-0.5">{hike.year}</span>
          </div>
          <p className="text-xs font-mono text-accent mb-3">{hike.location}</p>
          <p className="text-muted text-sm leading-relaxed flex-1">{hike.description}</p>

          {isAdmin && (
            <div className="flex items-center gap-1.5 mt-4 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
              <button
                type="button"
                onClick={() => onEdit?.()}
                className="w-6 h-6 rounded-full border flex items-center justify-center transition-colors duration-200 hover:border-accent hover:text-accent"
                style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
                aria-label={`Edit ${hike.name}`}
              >
                <Pencil size={11} />
              </button>
              <DeleteItemButton onConfirm={() => onDelete?.()} label={`Delete ${hike.name}`} />
            </div>
          )}
        </div>
      )}

      {error && <p className="px-5 pb-4 text-[11px] font-mono text-red-400">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 2: Rewrite HikeSection**

Replace the whole of `components/personal/HikeSection.tsx` with this. It becomes a client component because it holds editing state.

```tsx
'use client'

import { useState } from 'react'
import HikeCard from './HikeCard'
import ItemEditor from './ItemEditor'
import ScrollFade from '@/components/ScrollFade'
import { useEditableList } from '@/hooks/useEditableList'
import { FIELDS } from '@/lib/content'
import type { Hike } from '@/lib/hikes'

interface HikeSectionProps {
  hikes: Hike[]
  isAdmin?: boolean
  images?: Record<string, string[]>
  positions?: Record<string, string[]>
  heights?: Record<string, number>
}

export default function HikeSection({
  hikes, isAdmin, images = {}, positions = {}, heights = {},
}: HikeSectionProps) {
  const { items, error, addItem, updateItem, removeItem } = useEditableList<Hike>('hikes', hikes)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollFade>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block flex-shrink-0" aria-hidden="true" />
            <span className="text-xs font-mono text-muted tracking-[0.18em] uppercase">Hikes &amp; Trips</span>
          </div>
          <p
            className="font-display text-2xl md:text-3xl text-foreground mb-10"
            style={{ fontVariationSettings: "'opsz' 32, 'wght' 400, 'SOFT' 20" }}
          >
            Places I&apos;ve been
          </p>
        </ScrollFade>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((hike, i) => (
            <ScrollFade key={hike.id} delay={i * 80}>
              <HikeCard
                hike={hike}
                resolvedImages={images[hike.id]}
                positions={positions[hike.id]}
                initialHeight={heights[hike.id]}
                isAdmin={isAdmin}
                isEditing={editingId === hike.id}
                onEdit={() => setEditingId(hike.id)}
                onDelete={() => removeItem(hike.id)}
                onSubmit={(values) => { updateItem(hike.id, values); setEditingId(null) }}
                onCancel={() => setEditingId(null)}
                error={error?.itemId === hike.id ? error.message : null}
              />
            </ScrollFade>
          ))}

          {isAdmin && !isAdding && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="min-h-[12rem] rounded-2xl border border-dashed border-border text-[11px] font-mono text-muted tracking-[0.15em] uppercase hover:border-accent hover:text-accent transition-colors duration-200"
            >
              + Add hike
            </button>
          )}
        </div>

        {isAdmin && isAdding && (
          <div className="mt-5">
            <ItemEditor
              fields={FIELDS.hikes}
              submitLabel="Add hike"
              onSubmit={(values) => { addItem(values); setIsAdding(false) }}
              onCancel={() => setIsAdding(false)}
            />
          </div>
        )}

        {error?.itemId === null && (
          <p className="mt-3 text-[11px] font-mono text-red-400">{error.message}</p>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no output.

Run: `npm run build`
Expected: `✓ Compiled successfully`.

- [ ] **Step 4: Verify signed out**

With `npm run dev` running and signed out, open http://localhost:3000/personal.

Expected: the hikes grid is unchanged from before — four cards, all images present, no add card, no pencil or trash on hover.

- [ ] **Step 5: Verify editing**

Sign in, return to `/personal`.

1. Hover a hike card — pencil and trash appear below the description.
2. Click the pencil on **Trolltunga** and change its name to `Trolltunga Ridge`, then Save. The heading updates. **The card's photos must still be showing** — the id stayed `trolltunga`, so the image slot is untouched. Reload to confirm.
3. Rename it back to `Trolltunga`.
4. Click `+ Add hike` (the dashed card at the end of the grid). The form appears below the grid with Name, Location, Year and a Description textarea. Add a test hike, confirm it appears as a new card with "No photo yet", and that `personal-content/lists` in the Firebase console now has a `hikes` array of five.
5. Upload a photo to the new card, then reload — the photo persists, proving new items get working image slots.
6. Delete the test hike with the trash → `Sure?` → confirm.

- [ ] **Step 6: Commit**

```bash
git add components/personal/HikeCard.tsx components/personal/HikeSection.tsx
git commit -m "feat: admin-editable hike cards

Hike cards get inline edit and delete for signed-in admins, plus a
dashed add card at the end of the grid. Renaming a hike keeps its
images, since the image slot is keyed on the item id."
```

---

### Task 7: Experiences — inline editing

The same for experiences: an edit panel inside the card, a delete button, and a dashed add row at the end of the list.

**Files:**
- Modify: `components/personal/ExperiencesSection.tsx`

**Interfaces:**
- Consumes: `useEditableList`, `ItemEditor`, `DeleteItemButton` from Task 4; `FIELDS` from Task 2; the `experiences` prop from Task 3
- Produces: no new exports

---

- [ ] **Step 1: Rewrite the section**

Replace the whole of `components/personal/ExperiencesSection.tsx` with this. The inner `ExperienceCard` now takes the whole `Experience` object rather than spread fields, which keeps its signature manageable now that it has editing props too.

```tsx
'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import ScrollFade from '@/components/ScrollFade'
import ImageCarousel from './ImageCarousel'
import ItemEditor from './ItemEditor'
import DeleteItemButton from './DeleteItemButton'
import { useEditableList } from '@/hooks/useEditableList'
import { FIELDS } from '@/lib/content'
import { SLOTS } from '@/lib/slots'
import type { Experience } from '@/lib/experiences'

interface ExperiencesSectionProps {
  experiences: Experience[]
  isAdmin?: boolean
  images?: Record<string, string[]>
  positions?: Record<string, string[]>
  heights?: Record<string, number>
}

interface ExperienceCardProps {
  experience: Experience
  resolvedImages?: string[]
  imagePositions?: string[]
  initialHeight?: number
  isAdmin?: boolean
  isEditing: boolean
  onEdit: () => void
  onDelete: () => void
  onSubmit: (values: Record<string, string | number>) => void
  onCancel: () => void
  error?: string | null
}

function ExperienceCard({
  experience, resolvedImages = [], imagePositions = [], initialHeight, isAdmin,
  isEditing, onEdit, onDelete, onSubmit, onCancel, error,
}: ExperienceCardProps) {
  const { id, name, location, year, description, tag } = experience

  return (
    <div className="flex flex-col sm:flex-row sm:items-stretch bg-surface border border-border rounded-2xl overflow-hidden">
      {/* Image */}
      <div className="relative w-full sm:w-40 flex-shrink-0 bg-surface border-b sm:border-b-0 sm:border-r border-border">
        <ImageCarousel
          slot={SLOTS.exp(id)}
          resolvedImages={resolvedImages}
          positions={imagePositions}
          initialHeight={initialHeight}
          defaultHeight={160}
          alt={name}
          sizes="(max-width: 640px) 100vw, 160px"
          isAdmin={isAdmin}
          compact
        />
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="flex-1 p-2">
          <ItemEditor
            fields={FIELDS.experiences}
            initial={experience}
            submitLabel="Save"
            onSubmit={onSubmit}
            onCancel={onCancel}
          />
        </div>
      ) : (
        <div className="group flex-1 p-5 flex flex-col gap-1.5">
          <span className="text-[10px] font-mono text-accent tracking-[0.15em] uppercase">{tag}</span>
          <div className="flex items-start justify-between gap-3">
            <h3
              className="font-display text-lg text-foreground leading-tight"
              style={{ fontVariationSettings: "'opsz' 20, 'wght' 500, 'SOFT' 15" }}
            >
              {name}
            </h3>
            <span className="flex-shrink-0 text-[11px] font-mono text-muted mt-0.5">{year}</span>
          </div>
          <p className="text-xs font-mono text-muted mb-1">{location}</p>
          <p className="text-muted text-sm leading-relaxed">{description}</p>

          {isAdmin && (
            <div className="flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
              <button
                type="button"
                onClick={onEdit}
                className="w-6 h-6 rounded-full border flex items-center justify-center transition-colors duration-200 hover:border-accent hover:text-accent"
                style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
                aria-label={`Edit ${name}`}
              >
                <Pencil size={11} />
              </button>
              <DeleteItemButton onConfirm={onDelete} label={`Delete ${name}`} />
            </div>
          )}

          {error && <p className="mt-2 text-[11px] font-mono text-red-400">{error}</p>}
        </div>
      )}
    </div>
  )
}

export default function ExperiencesSection({
  experiences, isAdmin, images = {}, positions = {}, heights = {},
}: ExperiencesSectionProps) {
  const { items, error, addItem, updateItem, removeItem } = useEditableList<Experience>('experiences', experiences)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  return (
    <section className="py-16 border-t border-border">
      <div className="max-w-5xl mx-auto px-6">
        <ScrollFade>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block flex-shrink-0" aria-hidden="true" />
            <span className="text-xs font-mono text-muted tracking-[0.18em] uppercase">Experiences</span>
          </div>
          <p
            className="font-display text-2xl md:text-3xl text-foreground mb-10"
            style={{ fontVariationSettings: "'opsz' 32, 'wght' 400, 'SOFT' 20" }}
          >
            Things I&apos;ve done
          </p>
        </ScrollFade>

        <div className="flex flex-col gap-4">
          {items.map((exp, i) => (
            <ScrollFade key={exp.id} delay={i * 80}>
              <ExperienceCard
                experience={exp}
                resolvedImages={images[exp.id]}
                imagePositions={positions[exp.id]}
                initialHeight={heights[exp.id]}
                isAdmin={isAdmin}
                isEditing={editingId === exp.id}
                onEdit={() => setEditingId(exp.id)}
                onDelete={() => removeItem(exp.id)}
                onSubmit={(values) => { updateItem(exp.id, values); setEditingId(null) }}
                onCancel={() => setEditingId(null)}
                error={error?.itemId === exp.id ? error.message : null}
              />
            </ScrollFade>
          ))}

          {isAdmin && (
            isAdding ? (
              <ItemEditor
                fields={FIELDS.experiences}
                submitLabel="Add experience"
                onSubmit={(values) => { addItem(values); setIsAdding(false) }}
                onCancel={() => setIsAdding(false)}
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="w-full py-4 rounded-2xl border border-dashed border-border text-[11px] font-mono text-muted tracking-[0.15em] uppercase hover:border-accent hover:text-accent transition-colors duration-200"
              >
                + Add experience
              </button>
            )
          )}

          {error?.itemId === null && (
            <p className="text-[11px] font-mono text-red-400">{error.message}</p>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Typecheck and build**

Run: `npx tsc --noEmit`
Expected: no output.

Run: `npm run build`
Expected: `✓ Compiled successfully`.

- [ ] **Step 3: Verify signed out**

With `npm run dev` running and signed out, open http://localhost:3000/personal.

Expected: three experience cards, unchanged, all images present, no add row, nothing on hover.

- [ ] **Step 4: Verify editing**

Sign in, return to `/personal`.

1. Hover a card — pencil and trash appear under the description.
2. Edit **Bungee Jump**: change the tag to `Adrenaline`, Save. The accent label above the heading updates, and the card's images are still there. Reload to confirm, then change it back to `Extreme`.
3. Click `+ Add experience`. Fill Name, Tag, Location, Year, Description. The new card appears at the end with "No photo yet", and the Firebase console shows an `experiences` array of four.
4. Delete the test experience via trash → `Sure?`.

- [ ] **Step 5: Commit**

```bash
git add components/personal/ExperiencesSection.tsx
git commit -m "feat: admin-editable experience cards

Experience cards get inline edit and delete for signed-in admins, plus
a dashed add row at the end of the list. ExperienceCard now takes the
whole Experience object rather than spread fields."
```

---

### Task 8: Documentation and end-to-end verification

Update `CLAUDE.md` so the next person (or agent) knows content is edited through the admin UI rather than in code, and run the spec's full verification list against the finished feature.

**Files:**
- Modify: `CLAUDE.md`

**Interfaces:**
- Consumes: everything from Tasks 1–7
- Produces: nothing

---

- [ ] **Step 1: Replace the three "Adding a…" sections in CLAUDE.md**

The sections `## Adding a project`, `## Adding a hike` and `## Adding an experience` currently tell the reader to edit `lib/*.ts`. That is now wrong for hikes and experiences, and incomplete for races.

Leave `## Adding a project` exactly as it is — projects are still code-only.

Replace the `## Adding a hike` and `## Adding an experience` sections with this single section:

```markdown
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
```

- [ ] **Step 2: Document the new Firestore document**

Immediately after the existing `## Firestore schema` table (the one for `personal-images/slots`), add:

```markdown
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
```

- [ ] **Step 3: Update the folder structure listing**

In the `## Folder structure` block, add these entries under the right headings:

Under `components/personal/`:

```
  ItemEditor.tsx         — Add/edit form rendered from a lib/content.ts field schema
  DeleteItemButton.tsx   — Trash button that arms to 'Sure?' before deleting
  RacesSection.tsx       — Race list: newest first, capped at 5 for visitors
```

Under `hooks/`:

```
  useEditableList.ts     — Optimistic state + saving for one editable content list
```

Under `lib/`:

```
  races.ts               — Race seed data (fallback only — see "Adding a race")
  content.ts             — List keys, field schemas, id generation, validation, fallback merge
```

Also update the three existing `lib/` lines so they no longer read as the place to add things:

```
  projects.ts            — Project data array (add new apps here)
  hikes.ts               — Hike seed data (fallback only — see "Adding a race")
  experiences.ts         — Experience seed data (fallback only — see "Adding a race")
```

- [ ] **Step 4: Run the spec's verification list**

Run `npm run build`, then `npm run dev`, and walk the whole list. Every item must pass:

1. **Fallback** — with `personal-content/lists` deleted in the Firebase console, `/personal` renders 4 races, 4 hikes, 3 experiences from the seed arrays.
2. **Round-trip** — signed in, add / edit / delete one item in each of the three sections; each change survives a reload.
3. **Rename keeps images** — rename Trolltunga, confirm its photos still render and the Firestore key is still `hike-trolltunga`. Rename it back.
4. **Cap** — with more than five races: signed out shows five plus a working `Show all (n)` / `Show less` toggle; signed in shows all.
5. **No admin leakage** — signed out, search the page (Ctrl+F / DevTools) for `Add race`, `Add hike`, `Add experience`. Zero matches. No pencil or trash renders on any hover.
6. **API guards** — `curl -i -X PATCH http://localhost:3000/api/admin/content -H 'Content-Type: application/json' -d '{"races":[]}'` returns 401. With a valid cookie, `-d '{"nope":[]}'` returns 400.

- [ ] **Step 5: Restore real data**

Remove every test item added during verification, so `personal-content/lists` holds only real content. Confirm `/personal` signed out looks right.

- [ ] **Step 6: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: describe the admin-editable content lists

Hikes, experiences and races are now edited through the admin UI, not
in lib/. Documents personal-content/lists and the id-based join to
image slots."
```

---

## Deployment note

`firestore.rules` must be deployed for the production site to read `personal-content`. If Task 2 Step 3 was done against a local emulator or skipped, run `npx firebase deploy --only firestore:rules` before the app deploy, or the live `/personal` will silently fall back to seed data for everyone.
