# Design System Foundation — Elevated Ticket Motif

## Context

The al-safr site (flight/hotel/tour booking) currently uses a cream/off-white
canvas (`#f4f3ec`) with near-black ink text (`#1c1817`) and a boarding-pass
motif (`arch-frame`, `orange-pill-glow` utilities in `globals.css`). A prior
pass moved the accent color from orange to near-black across the whole site.

This is sub-project 1 of a whole-site redesign: establish a new design
system (palette, typography, core components) and prove it out on the
homepage. Sub-project 2 (rollout to all remaining pages) is a separate spec
that follows once this foundation is approved and built.

**Scope of this spec**: design tokens (`globals.css` `@theme` block) +
core shared components (buttons, cards, inputs, nav) + homepage
application. Does not cover booking flow pages, content pages
(about/contact/gallery/policies), or auth pages — those are sub-project 2.

## Constraints

- Keep the boarding-pass/ticket visual motif (arches, pill shapes, card
  layout patterns) — evolve, don't replace.
- Keep the al-safr logo and wordmark treatment as-is.
- Existing component structure (`soft-border`, `soft-shadow`, `arch-frame`
  utilities) should be reused/extended, not rewritten from scratch, so
  sub-project 2's rollout isn't a full rewrite of every page.

## Design

### Color tokens

Replace the `@theme` block in `globals.css`:

| Token | Value | Use |
|---|---|---|
| `--color-canvas` | `#FFFBEB` | page background |
| `--color-canvas-muted` | `#F3EDDA` | section backgrounds, subtle fills |
| `--color-ink` | `#1c1817` (kept) | body text |
| `--color-ink-muted` | `#57524e` (kept) | secondary text |
| `--color-primary` | `#78716C` | secondary buttons, borders, icons |
| `--color-primary-hover` | `#5f5955` | primary/secondary hover state |
| `--color-accent` | `#D97706` | CTAs, price badges, "lowest fare" tags, active states |
| `--color-accent-hover` | `#B45309` | accent hover state |
| `--color-border` | `#EEEDED` | dividers, card outlines |
| `--color-destructive` | `#DC2626` | errors only |

Existing alias tokens (`--color-cream`, `--color-ticket-orange`, `--color-ink`,
`--color-navy-900`) are re-pointed to the new values so components that
already reference them by name pick up the new palette without individual
edits. `--color-ticket-orange` becomes an alias for `--color-accent` (amber)
instead of stone — this is the one alias whose *meaning* changes, since the
accent is genuinely amber again.

Amber (`--color-accent`) is used sparingly: primary CTA buttons, price/fare
badges, selected-state indicators, "lowest price" callouts. It is never a
background fill for large areas — that would undo the "controlled accent"
intent and fight with the cream canvas.

### Typography

- Display/headings: **Calistoga** (serif)
- Body/UI: **Inter** (sans) — replaces the current `Cera Pro`/`Outfit`/`Plus
  Jakarta Sans` stack; Inter is metrically close enough that existing spacing
  doesn't need re-tuning
- Numeric data (prices, flight times, dates): Inter with `font-variant-numeric:
  tabular-nums`

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=Calistoga&family=Inter:wght@300;400;500;600;700&display=swap
```

Update `--font-sans` to lead with `Inter`, add a new `--font-display: 'Calistoga'`
token for headings (`h1`–`h3`, hero copy, section titles).

### Component styling

- **Dashed dividers**: `border-top: 1px dashed var(--color-border)` (or
  equivalent Tailwind utility) between a card's summary and price sections —
  mimics a boarding-pass tear line. Applied to flight/hotel result cards and
  booking summary cards only.
- **Perforation notches**: small circular cutouts at the divider's edges
  using a radial-gradient mask (`mask-image: radial-gradient(circle 6px at
  0 50%, transparent 6px, black 6px), radial-gradient(circle 6px at 100% 50%,
  transparent 6px, black 6px)` composited with the card background), applied
  only where a dashed divider meets the card edge. Reserved for primary
  result/booking cards — not every card — to avoid visual noise.
- **Arch frame**: keep the existing `.arch-frame` utility for hero imagery
  and modal headers.
- **Shadows**: warm-toned, `rgba(28,24,23,0.08)` base, used on hover/active
  states — replaces `orange-pill-glow`'s current shadow color with the same
  warm-black tint but lower default opacity (buttons/cards are calmer at
  rest, lift on interaction).
- **Buttons**: primary = `--color-accent` fill, white text; secondary =
  `--color-primary` outline, ink text. Both keep the current pill/rounded
  shape language (no shape change).

### Application (homepage)

Apply the above tokens/components to `LandingHome.tsx` and the flight/hotel/
tour search widgets it renders, plus shared nav/footer. This is the proof
point for the rest of the site.

## Testing

- Visual check in browser at 375px, 768px, 1024px, 1440px (per
  ui-ux-pro-max checklist already referenced).
- Contrast check: ink-on-cream and white-on-accent both meet 4.5:1.
- No regression to existing interactive behavior (search widgets, popovers,
  fare calendar) — this is a styling-only pass, no logic changes.

## Out of scope (deferred to sub-project 2)

- Booking flow pages (flight/hotel/tour results, checkout)
- Content pages (about, contact, gallery, tour-packages, policies)
- Auth pages (login, register)
- Dark mode (not requested; current site has none)
