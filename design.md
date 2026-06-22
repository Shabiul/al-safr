# DESIGN.md — Cauvery Resorts Design System

The entire visual language is defined in `assets/css/design-v2.css` using CSS custom properties (`:root` tokens). The theme is described as **"Spiritual Premium — Saffron & Gold palette · Traditional & Devotional"**.

---

## Color Palette

### Brand / Primary

| Token | Hex | Usage |
|-------|-----|-------|
| `--saffron` | `#C9A84C` | Primary accent, section labels, borders |
| `--saffron-dark` | `#1A1F3A` | Dark navy — primary background for dark sections, headings |
| `--saffron-light` | `#3D4875` | Mid-navy — review avatars, secondary dark |
| `--gold` | `#C9A84C` | Same as `--saffron` (aliased) — gold elements |
| `--gold-light` | `#DFC06A` | Lighter gold — nav active state, logo text |
| `--gold-pale` | `rgba(201,168,76,.13)` | Subtle gold tint backgrounds |

### Surfaces / Background

| Token | Hex | Usage |
|-------|-----|-------|
| `--ivory` | `#F9F7F3` | Default page background |
| `--cream` | `#EDE8DC` | Alternate section background (`.section--cream`) |
| `--cream-dark` | `#E0D9C8` | Deeper cream for borders / hover states |
| `--white` | `#FFFFFF` | Cards, popups |

### Text

| Token | Hex / rgba | Usage |
|-------|-----------|-------|
| `--brown` | `#1A1A2E` | Primary text, headings |
| `--brown-mid` | `#3A3D5C` | Body paragraph text |
| `--brown-light` | `#6B6F8E` | Muted / secondary text, section subtitles |
| `--text-inv` | `rgba(255,255,255,.93)` | Text on dark backgrounds |
| `--text-inv-dim` | `rgba(255,255,255,.60)` | Dimmed text on dark backgrounds |

### Borders

| Token | Value | Usage |
|-------|-------|-------|
| `--border` | `#D4CDB8` | Card borders, dividers |
| `--border-gold` | `rgba(201,168,76,.35)` | Gold accent borders, navbar underline |

### Semantic / Contextual

| Purpose | Color | Notes |
|---------|-------|-------|
| Success / WhatsApp | `#25D366` | WhatsApp buttons, FAB |
| WhatsApp dark | `#128C7E` | WhatsApp hover / header |
| WhatsApp chat BG | `#e5ddd5` | Popup body background |
| WhatsApp chat header | `#075E54` | Popup header |
| Google Red | `#EA4335` | Google icon in reviews |
| Google Blue | `#4285F4` | Google "G" logo |
| Google Green | `#34A853` | Google "G" logo |
| Google Yellow | `#FBBC05` | Google "G" logo |
| Danger / Badge | `rgba(225,48,108,.45)` | Promotional badge shadow |

---

## Typography

### Font Families

| Token | Stack | Usage |
|-------|-------|-------|
| `--serif` | `'Playfair Display', Georgia, serif` | All headings (h1–h6), section titles, ornamental text |
| `--sans` | `'Inter', system-ui, -apple-system, sans-serif` | Body, buttons, labels, navbar, forms |

Both fonts are loaded from Google Fonts with weights:
- Playfair Display: 400, 600, 700, 400 italic
- Inter: 300, 400, 500, 600, 700

### Type Scale

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| `h1` | `clamp(2.4rem, 5.5vw, 4rem)` | 700 | Fluid — 38px → 64px |
| `h2` | `clamp(1.9rem, 4vw, 2.9rem)` | 700 | Fluid — 30px → 46px |
| `h3` | `clamp(1.35rem, 2.5vw, 1.8rem)` | 700 | Fluid — 22px → 29px |
| `h4` | `1.2rem` (19px) | 700 | |
| Body (`p`) | `1rem` (16px) | 400 | line-height 1.85 |
| Body global | `1rem` | 400 | line-height 1.78 |
| `.section-label` | `0.72rem` | 700 | Uppercase, letter-spacing 0.18em |
| `.section-subtitle` | `1.05rem` | 400 | Max-width 560px |
| `.btn` | `0.88rem` | 600 | letter-spacing 0.04em |
| `.btn-lg` | `0.95rem` | 600 | |
| `.btn-sm` | `0.80rem` | 600 | |
| Navbar links | `0.82rem` | 500 | |
| `.btn-prem` | `0.72rem` | 700 | Uppercase, letter-spacing 0.09em |

### Heading Style Rules
- All headings use Playfair Display with `letter-spacing: -0.02em`
- Color defaults to `var(--saffron-dark)` (`#1A1F3A`)
- `em` children inside `.section-title` turn gold: `color: var(--gold)`
- `h1` inside hero uses `color: #fff` (overridden)

---

## Spacing System

### Section Vertical Padding
```css
--section-py: clamp(4.5rem, 9vw, 7.5rem);   /* 72px → 120px fluid */
```

### Column Gap (grid)
```css
--col-gap: clamp(1.5rem, 3vw, 2.5rem);       /* 24px → 40px fluid */
```

### Container
```css
max-width: 1200px;
padding: 0 clamp(1rem, 4vw, 2rem);           /* 16px → 32px side padding */
```

### Common Margins / Gaps (used frequently inline)
| Context | Value |
|---------|-------|
| Section heading bottom margin | `2.5rem` (40px) |
| Paragraph gap | `1rem` / `1.5rem` |
| Button gap | `0.55rem` |
| Navbar height | `68px` |
| FAB gap | `0.55rem` (after update) |
| Review card gap | `1.5rem` |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--r-sm` | `6px` | Small UI elements (tags, nav links) |
| `--r-md` | `14px` | Cards, inputs, mobile CTA buttons |
| `--r-lg` | `22px` | Room cards, popup, review cards, sections |
| `--r-xl` | `32px` | Large image blocks |
| `--r-pill` | `100px` | Buttons, FABs, badges |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--sh-xs` | `0 1px 4px rgba(26,31,58,.06)` | Subtle card lift |
| `--sh-sm` | `0 4px 18px rgba(26,31,58,.09)` | Hoverable elements |
| `--sh-md` | `0 12px 42px rgba(26,31,58,.13)` | Room cards, images |
| `--sh-lg` | `0 28px 80px rgba(26,31,58,.17)` | Modals, lightbox images |
| `--sh-gold` | `0 8px 32px rgba(201,168,76,.28)` | Gold CTA buttons |

### Component-Specific Shadows
| Component | Shadow |
|-----------|--------|
| `.fab-wa` | `0 4px 24px rgba(37,211,102,.4)` (green glow) |
| `.fab-call` | `0 4px 18px rgba(26,31,58,.35), 0 0 0 3px rgba(201,168,76,.45)` |
| `.wa-popup` | `0 20px 60px rgba(0,0,0,.2)` |
| `.btn-primary` hover | `0 14px 40px rgba(201,168,76,.4)` |
| Navbar | `var(--sh-md)` when `.scrolled` |

---

## Responsive Breakpoints

| Name | Max-Width | Behaviour |
|------|-----------|-----------|
| Small phones | `480px` | Single column grids, smaller font on sticky bar, footer stacks |
| Mobile | `640px` | Hero trust pills hidden, pricing strip wraps 2-col |
| Tablet / Mobile | `768px` | Navbar collapses to hamburger, mobile CTA bar shows, desktop sticky bar hidden |
| Premium nav hide | `700px` | `.nav-prem-wrap` (Enquire Now pill) disappears |
| Landscape mobile | `900px` + landscape | Hero height 100svh, reduced padding |
| Desktop | `> 768px` | Full navbar, FABs visible, 3-column grids |

### Navbar Breakpoint Detail (`768px`)
- `display: flex` on `.navbar__links` collapses to `display: none`
- `navbar__toggle` (hamburger) switches to `display: flex`
- Mobile overlay menu slides in from right
- Height stays `68px` but inner layout changes

---

## Animations

### Transitions (global tokens)
```css
--ease:   cubic-bezier(.4,0,.2,1);   /* Material ease */
--t-fast: .2s var(--ease);
--t-med:  .35s var(--ease);
--t-slow: .55s var(--ease);
```

### Hover Effects
| Component | Effect |
|-----------|--------|
| `.btn-primary:hover` | `translateY(-2px)` + stronger gold shadow |
| `.btn-outline:hover` | Fill with `--saffron`, lift |
| `.btn-gold:hover` | `translateY(-2px)` + shadow |
| `.fab-wa:hover` | `translateY(-3px) scale(1.03)` + stronger green glow |
| `.fab-call:hover` | `translateY(-3px) scale(1.06)` + stronger gold ring |
| `.room-card:hover` | `translateY(-8px)` + shadow lift |
| `.gallery-item:hover .gallery-item__overlay` | opacity 1 (reveal expand icon) |
| `.review-card:hover` | `translateY(-4px)` |
| `.temple-card:hover` | `translateY(-6px)` |
| Navbar links | Color → `--gold-light` |

### Keyframe Animations

| Name | Effect | Used On |
|------|--------|---------|
| `fabPulse` | Expanding ring fades out over 2.2s | `.fab-wa::before` pulse ring |
| `kenBurns` | Slow zoom-in (scale 1 → 1.08) over 12s | Hero swiper slides |
| `splashBar` | Width 0% → 100% over 1.8s | Splash screen loading bar |
| `scrollProg` | Width tied to scroll position | Scroll progress bar |
| Stat counters | JS-driven number increment over 1.8s | Stats bar on scroll |

### Page Transition
- `.page-transition` div covers the viewport with `--saffron-dark` background
- Triggered on internal link clicks: fades in (`.enter` class), then `location.href` changes
- Duration: 380ms

### Splash Screen
- Full-screen dark overlay on first visit only (session storage gated)
- Shows resort name, OM symbol, tagline, animated progress bar
- Dismissed after 2.2s with 650ms fade-out

### Scroll Progress Bar
- Fixed at top of viewport
- `scaleX()` tied to scroll position via JS in `main.js`

### WhatsApp Popup
- Hidden: `transform: translateY(20px) scale(.95); opacity: 0; visibility: hidden`
- Open: `transform: translateY(0) scale(1); opacity: 1; visibility: visible`
- Transition: `all .35s var(--ease)`

---

## Layout Patterns

### Grid Utilities
```css
.grid-2  /* 2 equal columns, aligned center */
.grid-3  /* 3 equal columns */
.grid-4  /* 4 equal columns */
```
All use `gap: var(--col-gap)`. Collapse to single column on `≤768px`.

### Cards
**Room Card** (`.room-card`)
- White background, `--r-lg` radius, `--sh-sm` shadow
- Image area with badge overlay (top-right)
- Body with title, feature tags (pill style), CTA button
- Hover: lifts `8px`

**Day Card** (`.day-card`)
- Dark background (`var(--saffron-dark)`), gold icon, white text
- `.day-card--featured` gets gold gradient border

**Review Card** (`.review-card`)
- White card, letter-avatar (colored circle), star display, text body
- Google logo watermark

**Temple Card** (`.temple-card`)
- Full-bleed background image, dark overlay
- Distance badge (top-right), icon, title, description

**Pilgrim Banner** (`.pilgrim-banner`)
- Full-width dark gradient card with highlight spans in gold

### Forms
**Enquiry Form** (`.enquiry-form`)
- CSS grid, 2 columns on desktop, 1 on mobile
- Labeled inputs with icon prefix
- Validation: required fields, date min logic via JS
- Submission → WhatsApp (no server)

### Modals
**Lightbox** (`.lightbox-overlay`)
- `position: fixed; inset: 0; background: rgba(0,0,0,.92)`
- Navigation arrows, close button, keyboard support (← → Esc)
- Activated by clicking gallery items

**WhatsApp Chat Popup** (`.wa-popup`)
- `position: fixed; bottom: calc(...); right: 1.25rem`
- Mimics WhatsApp UI: dark teal header, chat bubble on patterned background
- Triggered by FAB "Start a Chat" button

### Navigation
**Sticky Navbar**
- `position: sticky; top: 0; z-index: 1000`
- Frosted glass: `background: rgba(26,31,58,.96); backdrop-filter: blur(20px)`
- Adds `.scrolled` class via JS for deeper opacity + shadow

**Mobile Hamburger Menu**
- Three spans animate into × (cross) on open
- `.navbar__links` switches from `display:none` to `display:flex; flex-direction:column`

### Section Variants
```css
.section--cream    /* ivory/cream background */
.section--dark     /* --saffron-dark background, white text */
.section--gold     /* dark navy + gold gradient */
.section--center   /* text-align: center */
```

### Nature Break Banner
Full-bleed image with dark overlay (`rgba(26,31,58,.55)`) and centered quote text. Used 3× on homepage as visual breathing room.

---

## Icons

All icons use **Font Awesome 6.5.0** free tier.

| Semantic Use | FA Class |
|-------------|----------|
| WhatsApp | `fab fa-whatsapp` |
| Phone | `fa fa-phone` |
| Email | `fa fa-envelope` |
| Map pin | `fa fa-map-marker-alt` |
| Star | `fa fa-star`, `fa fa-star-half-alt` |
| Bed / Room | `fa fa-bed` |
| Users / Group | `fa fa-users`, `fa fa-user-friends` |
| Calendar | `fa fa-calendar`, `fa fa-calendar-check` |
| Vegetarian | `fa fa-leaf` |
| Restaurant | `fa fa-utensils` |
| Bus / Parking | `fa fa-bus` |
| Invoice | `fa fa-file-invoice` |
| Arrow | `fa fa-arrow-right` |
| Check | `fa fa-check-circle` |
| Plane (travel) | `fa fa-paper-plane`, `fa fa-plane` |
| Train | `fa fa-train` |
| Mountain | `fa fa-mountain` |
| Temple | `fa fa-place-of-worship`, `fa fa-om` |
| River | `fa fa-water` |
| Hot water | `fa fa-hot-tub` |
| WiFi | `fa fa-wifi` |
| Shower | `fa fa-shower` |
| Clock | `fa fa-clock` |
| Google | `fab fa-google` |
| Question | `fa fa-circle-question` |
| Gallery | `fa fa-images`, `fa fa-expand` |
| Chevrons | `fa fa-chevron-down`, `fa fa-chevron-left`, `fa fa-chevron-right` |
| User | `fa fa-user` |
| City | `fa fa-city` |

**OM symbol:** Rendered as Unicode `ॐ` in HTML (not FontAwesome).

---

## Theme Rules

These rules define the design language and must be followed when rebuilding.

### 1. Spiritual Devotional Tone
The brand is not a luxury resort — it is a devotional, family-run pilgrimage retreat. Design decisions must feel sacred and warm, not flashy or commercial. Gold and deep navy (saffron-dark) are the primary expressive colors.

### 2. Gold is reserved for highlights
`--gold` / `--gold-light` is used for: active nav states, section labels, italic text inside headings, CTA button backgrounds, ornamental dividers. It should not be overused.

### 3. Serif for emotion, Sans for function
- Playfair Display: all headings, the resort name, decorative "em" text
- Inter: body copy, buttons, nav, forms, tags, prices

### 4. Dark navy sections break monotony
Sections alternate between ivory, cream, and dark (`.section--dark` / `.section--gold`). Dark sections use white text. Never use `--brown` text on dark backgrounds.

### 5. Ornamental dividers signal transitions
The OM divider (`.divider-om`) and food icon divider (`.divider-img-divider`) separate heading from content within sections. They use a horizontal gold gradient line with a centered motif.

### 6. WhatsApp green is the conversion color
Every primary conversion action (enquiry, booking, contact) uses either WhatsApp green (`#25D366`) or the gold CTA button. These are the two highest-priority visual elements on any page.

### 7. Fluid sizing everywhere
Use `clamp()` for font sizes and spacing rather than media-query overrides. The type scale and section padding are already fluid.

### 8. Cards always have a `transform: translateY` hover lift
Every card-type component lifts on hover. The magnitude varies (4px → 8px) based on card prominence.

### 9. Fixed elements z-index hierarchy
```
Splash screen:   z-index 9999
WhatsApp popup:  z-index 9000
Lightbox:        z-index 9000
Cookie banner:   z-index 9000
Navbar:          z-index 1000
Mobile CTA bar:  z-index 1000
FAB buttons:     z-index 850
```
