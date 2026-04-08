# Design system

## Aesthetic

Warm Nordic minimalism — editorial, typographic, crafted feel.

## Fonts (loaded via `next/font/google`)

| Variable            | Font       | Usage                        |
|---------------------|------------|------------------------------|
| `--font-fraunces`   | Fraunces   | Headings, display (`font-display`) |
| `--font-dm-sans`    | DM Sans    | Body, UI (`font-sans`)       |

Fraunces is a variable font — use `font-variation-settings` for fine control:
- Hero name: `'opsz' 144, 'wght' 900, 'SOFT' 40`
- Section headings: `'opsz' 40, 'wght' 400, 'SOFT' 20`

## Color tokens (CSS variables → Tailwind classes)

| Token          | Tailwind class   | Light           | Dark            |
|----------------|------------------|-----------------|-----------------|
| `--bg`         | `bg-background`  | `#f6f1e8`       | `#0f0d0a`       |
| `--bg-surface` | `bg-surface`     | `#eee9df`       | `#1c1916`       |
| `--text`       | `text-foreground`| `#1a1714`       | `#f0eade`       |
| `--text-muted` | `text-muted`     | `#706558`       | `#857a6e`       |
| `--accent`     | `text-accent`    | `#bf5d28`       | `#e07540`       |
| `--border`     | `border-border`  | `#ddd5c9`       | `#2e2821`       |

## Key CSS utilities (defined in `globals.css`)

- `.hero-name` — variable font settings + tight line-height for the large hero title
- `.hero-animate > *` — staggered `heroFadeUp` animation on hero children (delays: 0.1s → 0.7s)
- `.hero-blob` — floating ambient glow blobs (`heroBlobFloat` keyframe)
- `.dot-grid-bg` — subtle dot grid pattern using `--border` color
- `.scroll-fade` / `.scroll-fade.is-visible` — IntersectionObserver-driven fade-in
- `.nav-blur` — backdrop blur + semi-transparent `--nav-bg` for sticky navbar
