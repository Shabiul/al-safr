# PROJECT.md — Cauvery Resorts Website

---

## Project Overview

**Project Name:** Cauvery Resorts Website  
**Live URL:** https://www.cauveryresorts.com/  
**Purpose:** Marketing and lead-generation website for a family-run pilgrim resort near Talacauvery and Bhagamandala, Coorg (Karnataka, India). All bookings are handled through WhatsApp and phone — there is no online payment or reservation system.

### Main Features
- Enquiry form that composes a pre-filled WhatsApp message and opens `wa.me` in a new tab
- Hero image slideshow (Swiper.js)
- Room catalogue with pricing
- Photo gallery with lightbox
- Google Reviews showcase
- FAQ accordion
- Interactive Google Maps embed
- WhatsApp floating chat bubble (popup)
- Mobile sticky CTA bar (Call / WhatsApp / Enquire)
- Splash screen on first visit (session-gated)
- Animated stat counters
- Page transition animation
- Cookie consent banner
- PWA support (manifest + offline page)
- Schema.org structured data (LodgingBusiness, HotelRoom, BreadcrumbList, WebPage)
- SEO landing pages for local search terms

### User Roles
| Role | Description |
|------|-------------|
| Visitor | Any person browsing the website. No login required. |
| Admin | Resort owner/staff — uses `backend/views/admin.html` (standalone admin panel, purpose unclear from code) |

### Technology Stack
| Layer | Technology |
|-------|-----------|
| Markup | HTML5 (static, no templating engine) |
| Styling | Custom CSS (`assets/css/design-v2.css`, ~3 700 lines) |
| Scripting | Vanilla JavaScript (inline per-page + `assets/js/main.js`) |
| Slider | Swiper.js v11 (CDN) |
| Icons | Font Awesome 6.5.0 (CDN) |
| Fonts | Google Fonts — Playfair Display, Inter |
| PWA | `manifest.json` + `offline.html` + `404.html` |
| Structured Data | Schema.org JSON-LD |
| Build tooling | Tailwind CSS v4 + `@tailwindcss/typography` installed via npm, but **not used in production** — all styles come from `design-v2.css` |

---

## Folder Structure

```
Cauvery Resort/
├── index.html                    # Homepage (main landing page)
├── aboutus.html                  # About Us / Our Story
├── accommodation.html            # Rooms & detailed tariff
├── restaurant.html               # Restaurant / menu page
├── activities.html               # Activities & experiences
├── gallery.html                  # Photo gallery (full)
├── tariff_booking.html           # Tariff table & booking guidance
├── enquiry.html                  # Dedicated enquiry / booking form page
├── contactus.html                # Contact details, map, directions
├── faq.html                      # Frequently Asked Questions
├── amenities.html                # Amenities list
├── aboutcoorg.html               # SEO: "About Coorg" content page
├── nearby-attractions.html       # SEO: nearby temples & attractions
├── blog.html                     # Travel tips / blog
├── family-stay-coorg.html        # SEO landing page — family stays
├── hotels-near-bhagamandala.html # SEO landing page — hotels near Bhagamandala
├── resorts-near-talacauvery.html # SEO landing page — resorts near Talacauvery
├── pure-veg-resort-coorg.html    # SEO landing page — vegetarian resorts Coorg
├── privacy-policy.html           # Privacy policy & terms
├── 404.html                      # Custom 404 error page
├── offline.html                  # PWA offline fallback page
├── manifest.json                 # PWA web app manifest
│
├── assets/
│   ├── css/
│   │   ├── design-v2.css         # Single monolithic design system (~3 700 lines)
│   │   ├── style.css             # Legacy/unused stylesheet
│   │   └── tailwind-input.css    # Tailwind entry file (not referenced in HTML)
│   ├── js/
│   │   └── main.js               # Shared JS (navbar toggle, scroll progress, AOS-like)
│   └── images/
│       ├── logo.png              # Resort logo
│       ├── Sunrise.webp          # Hero / OG image
│       ├── wholeview.webp        # Panoramic resort view
│       ├── Terrace view.webp     # Terrace / hills view
│       ├── Cloudy view.webp      # Misty view
│       ├── Night view.webp       # Night view
│       ├── Forest view.webp      # Forest surroundings
│       ├── Forest view 2.webp    # Alternate forest shot
│       ├── Forest view 3.webp    # Alternate forest shot
│       ├── Photoshoot scenery.webp
│       ├── Bonfire.webp          # Evening bonfire activity
│       ├── Bird watching.webp    # Activity photo
│       ├── Safari riding.webp    # Activity photo
│       ├── Resort2.webp          # Resort exterior
│       ├── Resort home view 2.webp
│       ├── resort4.webp          # Family room interior
│       ├── resort5.webp          # Couple room interior
│       ├── cauvery1.png          # Resort entrance
│       └── sdf.png               # Kitchen / food photo
│
├── backend/
│   └── views/
│       └── admin.html            # Standalone admin panel (minimal, purpose unclear)
│
├── node_modules/                 # npm packages (Tailwind, PostCSS deps)
├── package.json                  # npm manifest (Tailwind toolchain only)
└── llms.txt                      # AI/LLM summary file (linked from index.html <head>)
```

---

## Pages

### 1. Homepage — `index.html`
**Purpose:** Primary landing page, converts visitors to WhatsApp enquiries.  
**Route:** `/` or `/index.html`

**Sections (top to bottom):**
1. Splash screen (first-visit only, session-gated)
2. Sticky navbar
3. Hero — full-screen Swiper slideshow with CTA buttons
4. Stats bar — animated counters (years, guests, rating, distance)
5. Enquiry form — name, phone, dates, guests, room type → WhatsApp
6. Welcome / About section — 2-column with feature list and owner quote
7. Who Stays With Us — pilgrim and group banners
8. Room cards — 3 room types preview with pricing strip
9. Built Around Pilgrims — 6 day-card features (dark section)
10. Pure Vegetarian Kitchen — 2-column with food photo
11. Amenities list
12. Nature break banner 1 (Forest view)
13. Gallery bento grid (8 photos, lightbox)
14. Booking is Simple — 3-step process
15. FAQ accordion (6 questions)
16. Nature break banner 2 (Terrace view)
17. Google Reviews — summary bar + Swiper carousel (6 reviews)
18. Nature break banner 3 (Photoshoot scenery)
19. Sacred Places Nearby — 4 temple cards
20. How to Reach — Google Maps iframe + route list
21. Footer
22. Mobile sticky CTA bar
23. Floating buttons (WhatsApp chat popup + Call)
24. Cookie banner
25. WhatsApp chat popup

**API Calls:** None. Form submission opens `wa.me/919449485133?text=…` in a new tab.

**Navigation:** → accommodation, restaurant, gallery, enquiry, contactus, faq, aboutus, tariff_booking, activities, nearby-attractions pages.

---

### 2. Accommodation — `accommodation.html`
**Purpose:** Detailed room catalogue with photos, features, and pricing for each room type.  
**Route:** `/accommodation.html`

**Sections:** Page hero, room cards (all types with full details), pricing table, call-to-action.

**Data:** Schema.org `ItemList` of `HotelRoom` objects with prices (₹1 500 Non-AC, ₹2 500 AC, ₹400/person dormitory).

---

### 3. Restaurant — `restaurant.html`
**Purpose:** Describe the pure vegetarian kitchen and meals offered.  
**Route:** `/restaurant.html`

**Content:** Meal types (breakfast/lunch/dinner), sattvic policy, prasad packing, group meal advance booking.

---

### 4. Activities — `activities.html`
**Purpose:** List activities available at or near the resort.  
**Route:** `/activities.html`

**Content:** Bonfire, bird watching, nature walks, Brahmagiri trek, river bathing, nearby temple visits.

---

### 5. Gallery — `gallery.html`
**Purpose:** Full photo gallery with category filter and lightbox.  
**Route:** `/gallery.html`

**Components:** CSS grid gallery, custom inline lightbox.

---

### 6. Tariff & Booking — `tariff_booking.html`
**Purpose:** Transparent pricing table and booking process explanation.  
**Route:** `/tariff_booking.html`

**Content:** Room rates, meal charges, day bathing rate, group pricing guidance, 3-step booking flow.

---

### 7. Enquiry — `enquiry.html`
**Purpose:** Dedicated full-page enquiry/booking form (mirrors the homepage inline form).  
**Route:** `/enquiry.html`

**Form Fields:** Name, Phone, Check-In, Check-Out, Guests (select), Room Type (select).  
**Submission:** Composes WhatsApp message → opens `wa.me` link.

---

### 8. Contact Us — `contactus.html`
**Purpose:** All contact details, Google Maps embed, directions.  
**Route:** `/contactus.html`

**Content:** Phone numbers, email, address, Google Maps iframe, how-to-reach route list.

---

### 9. FAQ — `faq.html`
**Purpose:** Answers to common questions (check-in times, food, groups, parking, etc.).  
**Route:** `/faq.html`

**Component:** `<details>/<summary>` native HTML accordion.

---

### 10. Amenities — `amenities.html`
**Purpose:** Full amenities list.  
**Route:** `/amenities.html`

---

### 11. About Us — `aboutus.html`
**Purpose:** Resort history, family story, values.  
**Route:** `/aboutus.html`

---

### 12. About Coorg — `aboutcoorg.html`
**Purpose:** SEO content page about Coorg as a destination.  
**Route:** `/aboutcoorg.html`

---

### 13. Nearby Attractions — `nearby-attractions.html`
**Purpose:** Guide to temples, peaks, and natural attractions within driving distance.  
**Route:** `/nearby-attractions.html`

---

### 14. Blog — `blog.html`
**Purpose:** Travel tips and pilgrimage guides. Primarily SEO-driven.  
**Route:** `/blog.html`

---

### SEO Landing Pages (15–18)
Four thin content pages targeting specific search queries:
- `family-stay-coorg.html` — "family stay Coorg"
- `hotels-near-bhagamandala.html` — "hotels near Bhagamandala"
- `resorts-near-talacauvery.html` — "resorts near Talacauvery"
- `pure-veg-resort-coorg.html` — "pure vegetarian resort Coorg"

---

### 19. Privacy Policy — `privacy-policy.html`
**Purpose:** Legal page.  
**Route:** `/privacy-policy.html`

---

### 20–22. System Pages
- `404.html` — Custom not-found page
- `offline.html` — PWA offline fallback
- `backend/views/admin.html` — Admin UI (standalone, no server)

---

## Data Models

No database exists. All data is hard-coded in HTML. These are the inferred entities:

### Room
| Field | Example Value |
|-------|--------------|
| id | "rooms-1-2" |
| name | "Large Family Room" |
| maxOccupancy | 10 |
| pricePerNight | 1500 (INR) |
| priceCurrency | "INR" |
| amenities | ["Hot Water", "WiFi", "Attached Bathroom", "AC"] |
| images | ["resort4.webp"] |
| badge | "Rooms 1 & 2" |
| roomNumbers | [1, 2] |

**Room Types:**
- Standard Non-AC Room — ₹1,500/night, up to 3
- Deluxe AC Room — ₹2,500/night, up to 3
- Cosy Couple Room — up to 2
- Large Family Room — up to 10
- Pilgrim Dormitory — ₹400/person, up to 50
- Pilgrim / Group Hall — up to 50

### Booking Enquiry (ephemeral — sent to WhatsApp)
| Field | Type |
|-------|------|
| name | string (required) |
| phone | string (required) |
| checkIn | date |
| checkOut | date |
| guests | enum ("1-2", "3-5", "6-10", "11-25", "26-50", "50+") |
| roomType | enum ("Any Room", "AC Room", "Non-AC Room", "Family Room", "Group Hall", "Day Bathing") |

### Review (hard-coded)
| Field | Type |
|-------|------|
| reviewerName | string |
| avatar | string (initial letter + color) |
| stars | number (1–5) |
| text | string |
| date | string ("5 months ago") |
| source | "Google" |
| subRatings | {rooms, service, location} |

### Nearby Attraction
| Field | Type |
|-------|------|
| name | string |
| distance | string ("2 km", "500 m") |
| description | string |
| image | string (path to webp) |
| icon | FontAwesome class |

### Resort (singleton)
| Field | Value |
|-------|-------|
| name | Cauvery Resorts / Cauvery Yatrika Dhama |
| phone | +91-944-9485133, +91-996-4785133 |
| email | cauveryresorts@gmail.com |
| coordinates | 12.385989, 75.5120069 |
| founded | 2008 |
| totalRooms | 30 |
| googleRating | 4.2 / 120 reviews |
| checkIn | 12:00 |
| checkOut | 11:00 |

---

## Third-Party Dependencies

| Dependency | Source | Used For |
|------------|--------|----------|
| **Swiper.js v11** | CDN (jsdelivr) | Hero image slideshow, Google Reviews carousel |
| **Font Awesome 6.5.0** | CDN (cdnjs) | All icons (phone, WhatsApp, bed, star, etc.) |
| **Google Fonts** | CDN | Playfair Display (headings), Inter (body) |
| **Google Maps Embed API** | iframe embed | Location map on homepage and contact page |
| **WhatsApp Click-to-Chat** | `wa.me` protocol | All booking and contact CTAs |
| **Tailwind CSS v4** | npm (local) | Installed but **not used** in production pages |
| **@tailwindcss/typography** | npm (local) | Installed but **not used** |
| **AOS (Animate On Scroll)** | Not loaded | `data-aos` attributes appear on elements but AOS library is **never loaded** — animations silently do nothing |

---

## Current Problems

### 1. Duplicate HTML across all pages
The navbar (≈15 lines), footer (≈60 lines), floating buttons, mobile CTA bar, and cookie banner are copy-pasted into every one of ~20 HTML files. Changing the phone number or adding a nav item requires editing every file by hand.

### 2. Monolithic CSS file
`design-v2.css` is ~3 700 lines long with no modular separation. Several selectors appear twice at different line numbers (`.fab-wa` at lines 1368 and 2994, `#stickyBar` at 1335 and 3073, `.hero__trust-float` at 2792 and 3451). The later rule silently overrides the earlier one.

### 3. AOS library never loaded
Every section has `data-aos="fade-up"` attributes but the AOS library script is never imported. Scroll animations are completely non-functional.

### 4. Hardcoded phone number (×10+ places)
`+919449485133` appears as a raw string in href attributes, WhatsApp links, and JSON-LD across all pages. Changing the number requires a global find-and-replace across every file.

### 5. Inline styles throughout HTML
Hundreds of `style="…"` attributes set colors, margins, border-radius, and layout. Example: `style="background:linear-gradient(140deg,#2D3258,#1A1F3A);"` hardcoded on a section element. This makes visual changes inconsistent and untraceable.

### 6. No shared JS module
JavaScript is written inline at the bottom of each page separately. Common behaviour (navbar scroll, page transition, cookie banner, WhatsApp popup toggle) is copy-pasted with slight variations per page.

### 7. Tailwind installed but unused
The `node_modules` directory (~150+ files) adds bulk to the project for zero production benefit. `tailwind-input.css` exists but its output is never used.

### 8. Tight coupling of content and structure
All content (room prices, review text, attraction descriptions) is embedded directly in HTML with no separation of data from presentation.

### 9. Inline `<script>` blocks inside `<body>`
The WhatsApp popup toggle script, stat counter, Swiper init, lightbox, and cookie logic all live as `<script>` blocks scattered within the HTML body, making maintenance difficult.

### 10. No image optimisation pipeline
Images are delivered as `.webp` files manually but there is no responsive `srcset`, no lazy-loading fallback, and no automated optimisation step.

### 11. `backend/views/admin.html` — unclear purpose
This file exists but has no server, no API, and no authentication — it appears to be an abandoned or placeholder admin UI.

---

## Next.js Architecture Recommendation

### Suggested Structure

```
app/
├── layout.tsx                    # Root layout: Navbar, Footer, FAB, Popup, Cookie banner
├── page.tsx                      # Homepage
├── about/page.tsx                # About Us
├── accommodation/page.tsx        # Rooms catalogue
├── restaurant/page.tsx           # Restaurant
├── activities/page.tsx           # Activities
├── gallery/page.tsx              # Gallery
├── tariff/page.tsx               # Tariff & booking
├── enquiry/page.tsx              # Enquiry form
├── contact/page.tsx              # Contact
├── faq/page.tsx                  # FAQ
├── amenities/page.tsx            # Amenities
├── about-coorg/page.tsx          # About Coorg (SEO)
├── nearby-attractions/page.tsx   # Nearby attractions
├── blog/page.tsx                 # Blog index
├── blog/[slug]/page.tsx          # Individual blog post
├── resorts-near-talacauvery/page.tsx
├── hotels-near-bhagamandala/page.tsx
├── family-stay-coorg/page.tsx
├── pure-veg-resort-coorg/page.tsx
├── privacy-policy/page.tsx
└── not-found.tsx                 # 404 page

components/
├── layout/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── MobileCTABar.tsx
│   ├── FloatingButtons.tsx
│   ├── WhatsAppPopup.tsx
│   └── CookieBanner.tsx
├── ui/
│   ├── Button.tsx
│   ├── SectionLabel.tsx
│   ├── DividerOm.tsx
│   └── Lightbox.tsx
├── home/
│   ├── HeroSwiper.tsx
│   ├── StatsBar.tsx
│   ├── EnquiryForm.tsx
│   ├── RoomCardsGrid.tsx
│   ├── PricingStrip.tsx
│   ├── DayCards.tsx
│   ├── NatureBreak.tsx
│   ├── GalleryBento.tsx
│   ├── HowToBook.tsx
│   ├── FaqAccordion.tsx
│   ├── ReviewsSection.tsx
│   ├── TempleCards.tsx
│   └── HowToReach.tsx
├── rooms/
│   ├── RoomCard.tsx
│   └── RoomDetail.tsx
└── gallery/
    ├── GalleryGrid.tsx
    └── LightboxModal.tsx

lib/
├── constants.ts                  # Phone number, WhatsApp URL, address, coordinates
├── whatsapp.ts                   # buildWhatsAppUrl(enquiry: Enquiry): string
└── schema.ts                     # generateJsonLd functions

hooks/
├── useScrollProgress.ts
├── useIntersectionObserver.ts    # For stat counters
└── useLightbox.ts

services/
└── (none currently — future: booking API, CMS integration)

types/
├── room.ts                       # Room, RoomType
├── enquiry.ts                    # Enquiry
├── review.ts                     # Review
└── attraction.ts                 # NearbyAttraction

public/
├── images/                       # All .webp images
├── logo.png
├── manifest.json
├── offline.html
└── llms.txt
```

### Old File → New Location Mapping

| Old File | New Location |
|----------|-------------|
| `index.html` | `app/page.tsx` |
| `aboutus.html` | `app/about/page.tsx` |
| `accommodation.html` | `app/accommodation/page.tsx` |
| `restaurant.html` | `app/restaurant/page.tsx` |
| `activities.html` | `app/activities/page.tsx` |
| `gallery.html` | `app/gallery/page.tsx` |
| `tariff_booking.html` | `app/tariff/page.tsx` |
| `enquiry.html` | `app/enquiry/page.tsx` |
| `contactus.html` | `app/contact/page.tsx` |
| `faq.html` | `app/faq/page.tsx` |
| `amenities.html` | `app/amenities/page.tsx` |
| `aboutcoorg.html` | `app/about-coorg/page.tsx` |
| `nearby-attractions.html` | `app/nearby-attractions/page.tsx` |
| `blog.html` | `app/blog/page.tsx` |
| `*.html` (SEO pages) | `app/[slug]/page.tsx` (or dedicated routes) |
| `privacy-policy.html` | `app/privacy-policy/page.tsx` |
| `404.html` | `app/not-found.tsx` |
| `offline.html` | `public/offline.html` (service worker) |
| `assets/css/design-v2.css` | `app/globals.css` + CSS Modules per component |
| `assets/js/main.js` | Split into individual hooks and components |
| Navbar HTML (×20 files) | `components/layout/Navbar.tsx` (once) |
| Footer HTML (×20 files) | `components/layout/Footer.tsx` (once) |
| Phone number (×10 places) | `lib/constants.ts` → `PHONE_NUMBER` |
| WhatsApp links (×10 places) | `lib/whatsapp.ts` → `buildWhatsAppUrl()` |
| JSON-LD blocks | `lib/schema.ts` → `generateLodgingSchema()` etc. |
| Room data (in HTML) | `lib/data/rooms.ts` → typed array |
| Review data (in HTML) | `lib/data/reviews.ts` → typed array |
| Attraction data (in HTML) | `lib/data/attractions.ts` → typed array |
