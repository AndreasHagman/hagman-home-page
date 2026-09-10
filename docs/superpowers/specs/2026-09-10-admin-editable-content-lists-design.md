# Admin-editable content lists (races, hikes, experiences)

**Date:** 2026-09-10
**Status:** Approved

## Problem

The `/personal` page renders three content lists — races, hikes, experiences — from hardcoded
arrays in the codebase (`RacesSection.tsx`, `lib/hikes.ts`, `lib/experiences.ts`). Adding a race
after running one requires a code change and a deploy.

Images for these sections are already admin-editable through Firestore
(`personal-images/slots`) plus `PATCH /api/admin/slots`. The text content is not.

## Goal

Let the signed-in admin add, edit, delete and see the three lists directly on `/personal`,
without touching code. Reuse the existing auth and write pattern. Leave the public view
visually unchanged apart from the new race fields and the collapse behaviour.

## Non-goals

- No changes to how images are stored, uploaded or positioned.
- No new admin dashboard page. Editing happens inline on `/personal`.
- No per-item Firestore documents or queries. The lists are small (~15 items total).
- No automated test suite. This repo has none today; verification is manual (see Verification).

## Data model

New Firestore document: `personal-content/lists`.

```ts
{
  races: [
    { id: string, name: string, year: number, distance?: string, note?: string }
  ],
  hikes: [
    { id: string, name: string, location: string, year: number, description: string }
  ],
  experiences: [
    { id: string, name: string, location: string, year: number, tag: string, description: string }
  ],
}
```

Content lives in `personal-content/lists`; images stay in `personal-images/slots`. The two are
joined by item `id`.

### Stable ids

`id` is assigned once, at creation, and never changes — renaming an item changes only its
display name.

- Generated as `toSlug(name)`; on collision within the same list, append `-2`, `-3`, and so on.
- Existing items are seeded with their current name-slug as id: `trolltunga`, `preikestolen`,
  `kjeragbolten`, `galdhøpiggen`, `bungee-jump`, `wind-tunnel`, `scuba-diving`.

This is what preserves already-uploaded images. Slot keys become id-based:

| Before | After |
|---|---|
| `SLOTS.hike(hike.name)` → `hike-trolltunga` | `SLOTS.hike(hike.id)` → `hike-trolltunga` |
| `SLOTS.exp(exp.name)` → `exp-bungee-jump` | `SLOTS.exp(exp.id)` → `exp-bungee-jump` |

Because seeded ids equal the old slugs, every existing key resolves to the same document field.
No image migration is needed.

Races share a single image slot (`SLOTS.RACES`), so race ids serve only as React keys and as
edit/delete handles.

### Seed fallback

`lib/hikes.ts` and `lib/experiences.ts` keep their arrays, with an explicit `id` added to each
entry. A new `lib/races.ts` holds the four races currently hardcoded in `RacesSection.tsx`,
likewise with ids:

```ts
export interface Race {
  id: string
  name: string
  year: number
  distance?: string
  note?: string
}
```

These arrays are the fallback: used per-list when `personal-content/lists` is missing, or when
that document exists but lacks the relevant key. The first save of a given list writes the whole
array to Firestore, and Firestore takes over for that list from then on.

Consequence to accept: once a list has been saved to Firestore, editing the corresponding `lib/`
file no longer affects the site. The arrays are a starting point and a safety net, not a live
source.

## Write path

New route `app/api/admin/content/route.ts`, `PATCH`.

Auth is identical to `app/api/admin/slots/route.ts`: read the `admin_session` cookie, verify it
with `adminAuth.verifySessionCookie(cookie, true)`, return 401 on missing or invalid.

Body is one or more whole lists, e.g. `{ races: [...] }`. Whole-array writes only — no partial
item updates, so there is no merge conflict between concurrent edits of different items.

Validation, rejecting the request with 400 on failure:

- Only the keys `races`, `hikes`, `experiences` are accepted; any other key is rejected.
- Each value must be an array.
- Each item must have a non-empty string `id` and a non-empty string `name`.
- `year` is coerced to a number; a value that is not a finite number is rejected.
- Ids must be unique within their list.
- Unknown properties on an item are stripped, so only the fields in the schema above are written.

On success: `slotRef.set(body, { merge: true })` against `personal-content/lists`, returning
`{ success: true }`.

`firestore.rules` gains a block mirroring the existing one:

```
match /personal-content/{document=**} {
  allow read: if true;
  allow write: if false; // All writes go through /api/admin/content (Firebase Admin SDK)
}
```

## Read path

`PersonalImages` is already the page's single client-side data loader. Its mount effect gains a
second `getDoc`, fetched in parallel with the existing slots read:

```ts
const [slotSnap, listSnap] = await Promise.all([
  getDoc(doc(db, 'personal-images', 'slots')),
  getDoc(doc(db, 'personal-content', 'lists')),
])
```

It merges each list against its `lib/` fallback, holds the three lists in state, and resolves
image slots against item ids rather than names.

`HikeSection` and `ExperiencesSection` stop importing from `lib/` and receive their list as a
prop. `RacesSection` loses its inline `races` array and receives one too. `PersonalImages`
becomes the only place the page reads data from.

Image maps passed to the sections are keyed by item id (currently by name).

## Editing UI

Two shared pieces, used by all three sections:

**`hooks/useEditableList.ts`** — owns one list. Holds optimistic local state, exposes
`items`, `addItem`, `updateItem`, `removeItem`, and a per-item error. Saving means `PATCH`ing
the whole array for that list key.

**`components/personal/ItemEditor.tsx`** — renders a form from a field schema, so each section
declares its fields rather than duplicating form code:

```ts
const RACE_FIELDS = [
  { key: 'name',     label: 'Race',     type: 'text',   required: true },
  { key: 'year',     label: 'Year',     type: 'number', required: true },
  { key: 'distance', label: 'Distance', type: 'text' },
  { key: 'note',     label: 'Note',     type: 'text' },
]
```

Field types needed: `text`, `number`, `textarea`.

Per-section presentation:

- **Races** — each row gets a pencil and a trash icon that fade in on hover, matching how the
  image controls behave. Clicking the pencil swaps the row for inline fields with Save/Cancel.
  Below the list, a dashed `+ Add race` button.
- **Hikes / Experiences** — same pattern, but the editor opens as a small panel inside the card,
  because `description` needs a textarea. `+ Add hike` / `+ Add experience` is a dashed card at
  the end of the grid.
- **Delete** — requires confirmation: the first click turns the button into `Sure?`, a second
  click within a few seconds deletes, clicking elsewhere cancels.

All of the above renders only when `isAdmin` is true. With `isAdmin` false the markup is
identical to today's, aside from the race distance field and the collapse behaviour below.

Styling follows the existing tokens: `font-mono` at 10–11px for metadata, `var(--text-muted)`,
`var(--border)`, `var(--accent)` for active state, `rounded-full` buttons, 200ms transitions.

## Race list ordering and cap

Races are sorted by `year` descending. Items sharing a year keep their relative array order,
which is insertion order.

Public view shows at most 5. When the list is longer, a button below it reads `Show all (9)` and
expands to the full list; once expanded it reads `Show less`. Pure client-side state, no
animation beyond the existing transition tokens.

When `isAdmin` is true the list is never collapsed — all races are always visible, so editing
never happens against a hidden list.

Hikes and experiences are not capped.

## Error handling

Writes are optimistic: local state updates immediately, the `PATCH` runs in the background.

- Request fails or returns a non-2xx: roll back the local state to its pre-edit value and show
  `Could not save` in small red mono text next to the affected row or card.
- `401`: show `Session expired — sign in again`, linking to `/admin`.

Reads that fail leave the fallback arrays in place, so the public page always renders content.

## Verification

Manual, on a dev server, since the repo has no test harness:

1. With `personal-content/lists` absent, `/personal` renders exactly today's content from the
   `lib/` fallbacks.
2. Signed in as admin: add, edit and delete one item in each of the three sections; reload and
   confirm each change persisted.
3. Rename `Trolltunga` to something else. Its uploaded images still display, and the Firestore
   key stays `hike-trolltunga`.
4. Add races until there are more than 5. Signed out, only 5 show with a working
   `Show all (n)` / `Show less` toggle. Signed in, all show.
5. Signed out, no pencil, trash, or add buttons appear anywhere.
6. `PATCH /api/admin/content` without a valid cookie returns 401; with an unknown top-level key
   returns 400.

## Files touched

New:

- `lib/races.ts`
- `app/api/admin/content/route.ts`
- `hooks/useEditableList.ts`
- `components/personal/ItemEditor.tsx`

Modified:

- `lib/hikes.ts`, `lib/experiences.ts` — add `id` to each entry and to the interfaces
- `lib/slots.ts` — `hike()` / `exp()` take an id
- `components/personal/PersonalImages.tsx` — fetch lists, merge fallbacks, key images by id
- `components/personal/RacesSection.tsx` — take races as a prop, sort, cap, admin editing
- `components/personal/HikeSection.tsx`, `HikeCard.tsx` — take hikes as a prop, admin editing
- `components/personal/ExperiencesSection.tsx` — take experiences as a prop, admin editing
- `firestore.rules` — add the `personal-content` block
- `CLAUDE.md` — document the new collection and the "edit via admin, not code" workflow
