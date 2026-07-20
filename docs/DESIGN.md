# CineDrip — Design System

Enterprise-grade dark UI for a movie recommendation platform. The system is built on
Tailwind CSS v3 with a custom OKLCH-based color scale for perceptually-uniform,
accessible contrast.

## Color tokens (OKLCH)

OKLCH is used for the core brand ramp so lightness steps are visually even and
contrast ratios stay predictable. Hex fallbacks are kept for the Tailwind config.

| Token        | OKLCH                       | Hex (fallback) | Usage |
|--------------|-----------------------------|----------------|-------|
| `base`       | oklch(0.17 0.01 300)        | `#0a0a0f`      | App background |
| `surface`    | oklch(0.22 0.012 300)       | `#16161f`      | Cards, panels |
| `surface-2`  | oklch(0.27 0.012 300)       | `#211f2d`      | Elevated rows |
| `brand-500`  | oklch(0.55 0.22 300)        | `#a855f7`      | Primary (purple) |
| `brand-600`  | oklch(0.50 0.22 300)        | `#9333ea`      | Gradient start |
| `accent-500` | oklch(0.70 0.19 350)        | `#ec4899`      | Gradient end (pink) |
| `text-strong`| oklch(0.98 0 0)             | `#ffffff`      | Headings |
| `text-muted` | oklch(0.70 0.01 300)        | `#9ca3af`      | Secondary text |
| `border`     | oklch(1 0 0 / 0.10)         | `rgba(255,255,255,0.10)` | Hairlines |

Gradient used for primary actions & branding: `from-brand-600 to-accent-500`.

## Typography

- System UI stack; no external font dependency.
- Scale: `text-xs` (12) labels, `text-sm` (14) body, `text-base` (16) headings,
  `text-xl` (20) page titles, `text-6xl` (60) hero.
- Weight: `font-semibold` for emphasis, `font-extrabold` for brand.

## Spacing & radius

- Radii: `rounded-xl` (12px) controls, `rounded-2xl` (16px) cards, `rounded-full` pills.
- Grid: mobile-first 2-col movie grid; desktop sidebar `ml-[78px]`.
- Touch targets: min 44px; nav items `py-3`.

## Components

- `Loader` — full-screen spinner + "finding your drip…".
- `ScoreRing` — match score badge; green ≥80, purple ≥60, gray below.
- `MovieCard` — poster, title, year, language, genre pills, save action.
- `NavBar` / `Sidebar` — primary navigation; `Sidebar` expands on hover, hides
  admin tab from non-admins via `useAuth().isAdmin`.
- `Row` — horizontal scroll shelf with prev/next controls.

## Accessibility

- Semantic `<nav>`, `<table>`, `<button>`; `alt` text on posters.
- `:focus-visible` outline inherited from Tailwind base; interactive elements have
  visible hover/active states.
- Color contrast: `text-muted` on `base` meets WCAG AA for large text; primary text
  is pure white on dark surfaces.

## Motion

- Subtle `hover:scale-[1.03]` on cards, `transition-all duration-300` on sidebar.
- Glow blobs (`opacity-10 blur-3xl`) for ambient depth without distraction.

## Layout hardening (design finish)

- Fixed bottom `NavBar` (mobile) / hover `Sidebar` (desktop) with `z-50`.
- Content uses `pb-12` / `ml-[78px]` so it never hides under chrome.
- Toaster styled to match surfaces (`#16161f` bg, white border).

## Finish pass (verified polish)

Applied a UI-friction removal pass across all pages/components:

- **Design-token consistency:** replaced hardcoded `bg-[#0a0a0f]`/`bg-[#16161f]` with the
  `base`/`surface` tokens defined above, eliminating drift between the documented system
  and the rendered UI.
- **Accessibility:** added a global `:focus-visible` purple ring and
  `prefers-reduced-motion` handling in `index.css`.
- **Dead UI removed:** Explore's genre pills were non-interactive `<span>`s (looked like
  filters, did nothing). Converted to functional `<button>` filters that query TMDB by genre
  and show an active gradient state.
- **Error states:** `MovieDetail` previously rendered `null` silently on load failure; now
  shows a visible "couldn't load this movie" state with a back action.
- **Tokenized:** `Login`, `Register`, `Profile`, `Watchlist`, `Admin`, `Onboarding`,
  `MovieCard`, `Loader`, `NavBar` all use `base`/`surface`/`brand`/`accent` tokens.

Verified by `npm run lint && npm run build` (green) and a rebuilt, serving frontend image.
