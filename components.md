# COMPONENTS.md — Cauvery Resorts Component Catalogue

All components are currently implemented as raw HTML + CSS class combinations. This document describes every reusable pattern so it can be rebuilt as React/Next.js components.

---

## Component Hierarchy Tree

```
RootLayout
├── SplashScreen (index.html only, session-gated)
├── ScrollProgressBar
├── PageTransition
├── Navbar
│   ├── NavLogo
│   ├── HamburgerToggle
│   └── NavLinks
│       └── EnquireNowPill (hidden on mobile)
│
├── [Page Content]           ← slot / children
│   └── (see individual page components below)
│
├── Footer
│   ├── FooterBrand
│   ├── FooterLinkColumn (×4)
│   └── FooterContact
│
├── MobileCTABar             (mobile ≤768px)
├── FloatingButtons
│   ├── WhatsAppFAB          (opens popup)
│   └── CallFAB
├── WhatsAppChatPopup
└── CookieBanner
```

---

## Shared / Layout Components

---

## Navbar

**Purpose:** Site-wide top navigation. Sticky, frosted glass, collapses to hamburger on mobile.

**Props (Next.js):**
```ts
interface NavbarProps {
  activeHref: string;  // e.g. "/accommodation"
}
```

**State:** `isOpen: boolean` (mobile menu open/closed), `isScrolled: boolean`

**Events:**
- `toggle` — hamburger click opens/closes mobile menu
- `scroll` — adds `.scrolled` class (deeper opacity) when `scrollY > 0`

**Styling:**
- `position: sticky; top: 0; z-index: 1000`
- `background: rgba(26,31,58,.96); backdrop-filter: blur(20px)`
- `.scrolled` → `background: rgba(15,18,40,.98); box-shadow: var(--sh-md)`
- Height: `68px`

**Children:** `NavLogo`, `HamburgerToggle`, `NavLinks`

**Variants:** None (single variant, behavior changes via JS class)

**Notes:**
- The `active` class on nav links is hardcoded per page. In Next.js use `usePathname()`.
- `.nav-prem-wrap` (Enquire Now pill) is a `<li>` item injected inside `<ul>` and hidden via CSS on `≤700px`.

---

## NavLogo

**Purpose:** Resort logo + text fallback. Shows PNG; if image errors, shows text.

**Props:**
```ts
interface NavLogoProps {
  href: string;  // "/"
}
```

**Styling:** `.navbar__logo` — flex row, `gap: .65rem`. Logo image `height: 46px`.

**Variant:** Text fallback uses `.navbar__logo-text` with serif font for resort name and tiny caps sub-label.

---

## Footer

**Purpose:** Site-wide footer with brand info, 4 link columns, contact details, copyright.

**Props:**
```ts
interface FooterProps {
  year: number;
}
```

**Children:**
- `FooterBrand` — logo text, tagline, WhatsApp + Google social links
- `FooterLinkColumn` ×4 — Quick Links, Information, Nearby, Contact Us
- `FooterBottom` — copyright, privacy link

**Styling:** `.footer` dark navy background, `--sh-md` shadow, 5-column grid collapsing to 2 then 1 on mobile.

---

## MobileCTABar

**Purpose:** Fixed bottom bar on mobile with 3 quick-action buttons.

**Props:**
```ts
interface MobileCTABarProps {
  phone: string;
  whatsappUrl: string;
  enquiryHref: string;
}
```

**Styling:**
- `position: fixed; bottom: 0; z-index: 1000`
- `display: none` on desktop, `display: flex` on `≤768px`
- 3 equal flex children: Call (navy), WhatsApp (green), Enquire (ivory/outline)

---

## FloatingButtons

**Purpose:** Fixed bottom-right FAB cluster — WhatsApp popup trigger and direct call.

**State:** Managed externally by `WhatsAppChatPopup`.

**Children:**
- `WhatsAppFAB` — green pill button, pulse ring animation, opens chat popup
- `CallFAB` — gold square-rounded button, `href="tel:…"`

**Styling:** `.fab-wrap` — `position: fixed; bottom: clamp(4.5rem,10vw,5.5rem); right: 1.25rem; z-index: 850`

---

## WhatsAppFAB

**Purpose:** The "Start a Chat" floating button. Triggers `WhatsAppChatPopup`.

**Props:**
```ts
interface WhatsAppFABProps {
  onClick: () => void;
  isOpen: boolean;
}
```

**Styling:** `.fab.fab-wa` — green gradient pill, `height: 52px`, `border-radius: 100px`

**Animation:** `::before` pulse ring — `fabPulse` keyframes, `2.2s infinite`

**Variants:** Button (current) vs link-to-WhatsApp (old, replaced)

---

## CallFAB

**Purpose:** Direct phone call floating button.

**Props:**
```ts
interface CallFABProps {
  phone: string;
}
```

**Styling:** `.fab.fab-call` — gold/saffron gradient, `width: 52px; height: 52px; border-radius: 18px`

---

## WhatsAppChatPopup

**Purpose:** Mock WhatsApp chat bubble that appears above the FABs. Previews a greeting and links to actual WhatsApp.

**Props:**
```ts
interface WhatsAppChatPopupProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappUrl: string;
}
```

**State:** `isOpen` (lifted to parent `FloatingButtons`)

**Events:**
- FAB button click → open
- Close button (×) → close
- Click outside → close
- Auto-open after 4s on first session visit (session storage gate)

**Styling:**
- `.wa-popup` — `position: fixed; bottom: calc(…); right: 1.25rem; z-index: 9000; width: 300px`
- Hidden: `opacity:0; visibility:hidden; transform: translateY(20px) scale(.95)`
- Open (`.open`): `opacity:1; visibility:visible; transform: none`
- Header: WhatsApp dark teal (`#075E54`), avatar circle (green `#25D366`)
- Body: Chat bubble on `#e5ddd5` background (WhatsApp chat color)
- Footer: "Start Chat" green pill link

**Mobile:** `width: calc(100vw - 2rem); right: 1rem` on `≤480px`

---

## CookieBanner

**Purpose:** One-time cookie consent banner.

**State:** Shown if `localStorage.cookieAccepted` is not set. Dismissed after 3s delay.

**Events:** Accept button → sets localStorage, hides banner.

**Styling:** `.cookieBanner` — fixed center-bottom, pill shape, dark background, gold Accept button.

---

## SplashScreen

**Purpose:** Full-screen branded loading overlay. Shows once per session.

**State:** Session storage gated — not shown if `splashSeen` key exists.

**Timing:** Visible for 2.2s, then fades out over 650ms.

**Styling:** `position:fixed; inset:0; z-index:9999; background: var(--saffron-dark)`

**Children:** OM symbol (unicode), resort name, tagline, animated progress bar

**Reusable:** No (index.html only in current implementation, could apply to any page)

---

## ScrollProgressBar

**Purpose:** Thin horizontal bar at top of page indicating scroll depth.

**Styling:** `.scroll-progress` — `position:fixed; top:0; left:0; height:3px; z-index:9999; background: var(--gold); transform-origin: left; width:0 → 100%` via JS `scaleX`.

---

## PageTransition

**Purpose:** Full-screen dark overlay triggered between page navigations.

**Events:** Internal link click → overlay enters, then page navigates.

**Timing:** 380ms enter animation, then `location.href` fires.

---

---

## Page-Specific Components

---

## HeroSwiper

**Purpose:** Full-screen image slideshow as homepage hero.

**Props:**
```ts
interface HeroSwiperProps {
  slides: Array<{ image: string; alt: string }>;
}
```

**Dependencies:** Swiper.js v11

**Configuration:**
```js
{ effect:'fade', loop:true, autoplay:{delay:5500,disableOnInteraction:false}, speed:1400 }
```

**Children (overlay content):**
- `.hero__eyebrow` — small italic tagline
- `h1.hero__title` — with `<em>` for gold italic text
- `p.hero__desc`
- `.hero__actions` — CTA button group (WhatsApp, View Rooms, Call)
- `.hero__scroll` — animated scroll indicator
- `.hero__trust-float` — floating trust pills (hidden on mobile)

**Styling:** `.hero` — `min-height: 100svh`, dark gradient overlay, `z-index` layering for content above slides.

**Animation:** Ken Burns — `scale(1) → scale(1.08)` over 12s on slides.

---

## HeroTrustPill

**Purpose:** Small badge-like pills floating bottom-right of hero ("4.2★ Google Rating", "Since 2008", "Pure Vegetarian").

**Props:**
```ts
interface HeroTrustPillProps {
  icon: string;      // FA class
  text: string;
}
```

**Styling:** `.hero__trust-pill` — frosted glass, gold border, small font. Hidden on `≤640px` and `≤768px`.

---

## StatsBar

**Purpose:** Horizontal band of animated counters below hero.

**Props:**
```ts
interface StatsBarProps {
  stats: Array<{ count: number; suffix: string; decimals?: number; label: string }>;
}
```

**State:** `animated: boolean` — triggered once by IntersectionObserver when bar enters viewport.

**Animation:** JS counter increments from 0 to `count` over 1.8s at 16ms step.

**Styling:** `.stats-bar` — dark navy background, golden dividers, flex row.

---

## EnquiryForm

**Purpose:** Booking/enquiry form. On submit, composes a WhatsApp message and opens `wa.me`.

**Props:**
```ts
interface EnquiryFormProps {
  whatsappNumber: string;  // "919449485133"
}
```

**State:** Form field values, validation errors.

**Fields:**
- Name (text, required)
- Phone (tel, required)
- Check-In (date, min = today)
- Check-Out (date, min = check-in date)
- Guests (select: 6 options)
- Room Type (select: 6 options)

**Events:**
- `checkin.change` → sets `checkout.min = checkin.value`
- `submit` → validates, builds WhatsApp message string, opens `wa.me` link

**Submission behaviour (no server):**
```
wa.me/919449485133?text=Hello%2C+I+would+like+to+enquire...
```

**Styling:** `.enquiry-form` — CSS grid (2-col desktop, 1-col mobile), labeled inputs with icon prefix, submit row spans full width.

**Parent Pages:** `index.html`, `enquiry.html`

---

## RoomCard

**Purpose:** Preview card for a room type.

**Props:**
```ts
interface RoomCardProps {
  image: string;
  alt: string;
  badge: string;            // e.g. "Rooms 1 & 2"
  badgeColor?: string;      // inline CSS color
  title: string;
  tags: Array<{ icon: string; label: string }>;
  detailHref: string;       // link to accommodation.html
}
```

**Events:** Button click → navigate to accommodation.html

**Styling:** `.room-card` — white, `--r-lg`, `--sh-sm`, hover `translateY(-8px)`. Image area `aspect-ratio:4/3`. Badge top-right with `position:absolute`.

**Variants:** Standard (dark badge), saffron badge (`background:var(--saffron)`), mid-navy badge.

---

## PricingStrip

**Purpose:** Horizontal price summary row showing all room types and rates.

**Props:**
```ts
interface PricingStripProps {
  items: Array<{ label: string; price: string; unit: string }>;
  enquiryHref: string;
}
```

**Styling:** `.pricing-strip` — cream background, flex row, `--r-lg`, gold borders. Last item is CTA button. On `≤640px`: 2-column grid.

---

## DayCard

**Purpose:** Feature highlight card for pilgrim-specific services (day bathing, parking, etc.).

**Props:**
```ts
interface DayCardProps {
  icon: string;        // FA class
  title: string;
  description: string;
  price: string;       // e.g. "₹100 / person" or "Free of Charge"
  featured?: boolean;
}
```

**Styling:** `.day-card` — dark navy, gold icon circle. `.day-card--featured` gets gold gradient border via pseudo-element.

**Parent:** "Built Around Pilgrims" section — 6-item grid.

---

## NatureBreakBanner

**Purpose:** Full-bleed image with quote overlay. Used as visual separator between content sections.

**Props:**
```ts
interface NatureBreakBannerProps {
  image: string;
  label: string;          // e.g. "Coorg · Western Ghats"
  quote: string;
  attribution: string;
  overlayStyle?: string;  // inline gradient override
}
```

**Styling:** `.nature-break` — `height: clamp(280px,45vw,420px)`, full-bleed background-image, dark overlay, centered text.

---

## GalleryBento

**Purpose:** Bento-style asymmetric gallery grid on homepage (8 items). Clicking opens lightbox.

**Props:**
```ts
interface GalleryBentoProps {
  items: Array<{ src: string; alt: string; span?: 'span-2'; tall?: boolean }>;
}
```

**State:** `lightboxIndex: number | null`

**Events:** Item click → open lightbox at index.

**Styling:** `.gallery-bento` — CSS grid, `span-2` class doubles column span, `tall` doubles row span.

**Reusable:** Yes — also used in `gallery.html` in a different layout (`.gallery-full`, 3-col uniform grid).

---

## Lightbox

**Purpose:** Full-screen image viewer with previous/next navigation and keyboard support.

**Props:**
```ts
interface LightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}
```

**State:** `currentIndex`, `isOpen`

**Events:**
- Close button / overlay click / `Escape` → close
- Left arrow / `ArrowLeft` → previous image
- Right arrow / `ArrowRight` → next image

**Styling:** `position:fixed; inset:0; background:rgba(0,0,0,.92); z-index:9000`

**Note:** Two separate lightbox implementations exist — `index.html` uses one, `gallery.html` has its own inline version.

---

## FaqAccordion

**Purpose:** Expandable FAQ list using native `<details>/<summary>` HTML.

**Props:**
```ts
interface FaqAccordionProps {
  items: Array<{ number: string; question: string; answer: string }>;
}
```

**Styling:** `.faq-home-item` details/summary — custom gold marker, padding, border. Summary styled with flex row and `.faq-num` prefix.

**Reusable:** Yes — used on homepage (6 items) and `faq.html` (full list).

---

## ReviewsSection

**Purpose:** Google Reviews showcase: summary bar + Swiper carousel of review cards.

**Props:**
```ts
interface ReviewsSectionProps {
  overallRating: number;
  totalReviews: number;
  distribution: Record<'5'|'4'|'3'|'2'|'1', number>;  // percentage
  reviews: Review[];
  googleMapsUrl: string;
}
```

**Children:**
- `ReviewsSummary` — score, star bars, Google logo + "Leave a Review" link
- `ReviewsSwiper` — Swiper carousel of `ReviewCard` components

**Swiper config:**
```js
{ slidesPerView:1, loop:true, autoplay:{delay:4000},
  pagination:{ el:'.reviews-pagination', clickable:true },
  breakpoints:{ 640:{slidesPerView:2}, 1024:{slidesPerView:3} } }
```

---

## ReviewCard

**Purpose:** Single Google review card.

**Props:**
```ts
interface ReviewCardProps {
  reviewerName: string;
  avatarColor: string;    // CSS color for initial circle
  date: string;
  stars: number;          // 1-5
  text: string;
  subRatings?: { rooms?: number; service?: number; location?: number };
}
```

**Styling:** `.review-card` — white, `--r-lg`, `--sh-sm`, hover lift. Letter-avatar circle top-left.

---

## TempleCard

**Purpose:** Card for a nearby sacred place/attraction.

**Props:**
```ts
interface TempleCardProps {
  image: string;
  distance: string;
  icon: string;         // FA class
  title: string;
  description: string;
  featured?: boolean;   // larger visual emphasis
}
```

**Styling:** `.temple-card` — full-bleed background image with dark gradient overlay, distance badge top-right. `.temple-card--featured` has stronger gold border.

---

## HowToBook

**Purpose:** 3-step visual booking process guide.

**Props:**
```ts
interface HowToBookProps {
  steps: Array<{ number: string; icon: string; title: string; description: string }>;
  enquiryHref: string;
  whatsappUrl: string;
}
```

**Styling:** `.htb-steps` — flex row with `.htb-step__arrow` separators. Collapses to column on mobile.

---

## HowToReach

**Purpose:** Google Maps embed + route list showing distances from key cities/airports.

**Props:**
```ts
interface HowToReachProps {
  mapEmbedUrl: string;
  routes: Array<{ icon: string; name: string; via: string; distance: string }>;
}
```

**Styling:** `.reach-grid` — 2-column (map left, routes right). `.reach-route` items are flex rows with icon, info, distance badge.

---

## PilgrimBanner

**Purpose:** Wide promotional banner card targeting a specific guest segment (pilgrims, groups).

**Props:**
```ts
interface PilgrimBannerProps {
  title: string;
  description: ReactNode;   // contains <span class="highlight"> elements
  ctaText: string;
  ctaHref: string;
  backgroundStyle?: string; // inline CSS gradient override
}
```

**Styling:** `.pilgrim-banner` — dark indigo gradient, white text, gold CTA button, `--r-xl` radius. `.highlight` span → `var(--gold-light)` color.

---

## AmenitiesList

**Purpose:** Simple unordered list of amenities.

**Props:**
```ts
interface AmenitiesListProps {
  items: string[];
}
```

**Styling:** `.amenities-plain` — clean list with `::before` gold checkmark pseudo-element.

---

## OwnerNote

**Purpose:** Styled pull-quote with avatar representing the resort owner's voice.

**Props:**
```ts
interface OwnerNoteProps {
  quote: string;
  attribution: string;
}
```

**Styling:** `.owner-note` — flex row, avatar circle (icon), italic quote in a bordered card.

---

## SectionLabel

**Purpose:** Small uppercase eyebrow label above section headings. Has gold `— ` decorators before/after.

**Props:**
```ts
interface SectionLabelProps {
  children: string;
}
```

**Styling:** `.section-label` — `font-size: .72rem; letter-spacing: .18em; text-transform: uppercase; color: var(--saffron)`. `::before` and `::after` pseudo-elements add `— ` with opacity.

---

## DividerOm

**Purpose:** Ornamental divider with OM symbol (ॐ) flanked by gold gradient lines.

**Props:** None (content is always OM symbol).

**Styling:** `.divider-om` — flex row, `::before`/`::after` are gradient lines, `<span>` is the OM character in serif font.

**Variant:** `.divider-img-divider` with `.divider-food-icon` — same layout but uses a food icon circle instead of OM.

---

## Button

**Purpose:** Reusable CTA button. Multiple visual variants.

**Props:**
```ts
interface ButtonProps {
  variant: 'primary' | 'outline' | 'outline-light' | 'gold' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  icon?: string;       // FA class
  children: ReactNode;
}
```

**Variants:**
| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| `primary` | Gold gradient | `--saffron-dark` | None |
| `outline` | Transparent | `--saffron` | `--saffron` |
| `outline-light` | Transparent | white | `rgba(255,255,255,.6)` |
| `gold` | Gold gradient | `--brown` | None |
| `glass` | `rgba(255,255,255,.12)` | white | `rgba(255,255,255,.3)` |

**Sizes:**
- `sm`: `padding: .55rem 1.2rem; font-size: .8rem`
- `md` (default): `padding: .75rem 1.75rem; font-size: .88rem`
- `lg`: `padding: 1rem 2.5rem; font-size: .95rem`

---

## EnquireNowPill (NavPremButton)

**Purpose:** Special pill-style "Enquire Now" button in the navbar. Hidden on `≤700px`.

**Props:**
```ts
interface EnquireNowPillProps {
  href: string;
}
```

**Styling:** `.btn-prem.btn-prem-query` — dark background, gold text, icon circle right. Complex pill with separate label + icon segments.

---

## PageHero

**Purpose:** Shared hero banner for inner pages (not homepage). Multi-image with crossfade.

**Props:**
```ts
interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumbs: Array<{ label: string; href: string }>;
  images: string[];    // 1–4 images, CSS animation crossfades them
}
```

**Styling:** `.page-hero` — `height: clamp(280px,45vw,420px)`, stacked background images with CSS `animation: heroBgFade` cycling through them, dark overlay.

---

## WelcomeSection

**Purpose:** 2-column "About" block: image with badge + text content with feature list.

**Props:**
```ts
interface WelcomeSectionProps {
  image: string;
  badgeLabel: string;    // "Est."
  badgeValue: string;    // "Since 2008"
  title: ReactNode;
  paragraphs: string[];
  features: string[];
  ctaHref: string;
  ctaLabel: string;
  ownerNote?: { quote: string; attribution: string };
}
```

---

## WelcomeFeatureList

**Purpose:** Bulleted list of key selling points (used inside WelcomeSection and Restaurant section).

**Props:**
```ts
interface WelcomeFeatureListProps {
  items: string[];        // may contain <strong> inline
}
```

**Styling:** `.welcome-features` — custom list with gold `::before` marker (checkmark style), `--sans` font.

---

## Shared Component Summary

| Component | Shared Across Pages | Reusable |
|-----------|-------------------|----------|
| Navbar | All pages | Yes |
| Footer | All pages | Yes |
| MobileCTABar | All pages | Yes |
| FloatingButtons | All pages (index variation) | Yes |
| WhatsAppChatPopup | index.html currently | Yes |
| CookieBanner | All pages | Yes |
| SplashScreen | index.html | Conditional |
| ScrollProgressBar | All pages | Yes |
| PageTransition | All pages | Yes |
| Button | All pages | Yes |
| SectionLabel | All pages | Yes |
| DividerOm | Homepage, About | Yes |
| FaqAccordion | Homepage, faq.html | Yes |
| RoomCard | Homepage, accommodation | Yes |
| EnquiryForm | Homepage, enquiry.html | Yes |
| GalleryBento | Homepage | Partial |
| Lightbox | Homepage, gallery.html | Yes (2 implementations) |
| ReviewCard | Homepage | Yes |
| NatureBreakBanner | Homepage (×3) | Yes |
| PageHero | All inner pages | Yes |
