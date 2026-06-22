# USER_FLOWS.md — Cauvery Resorts User Journeys

---

## Actors

| Actor | Description |
|-------|-------------|
| **Visitor** | Anyone browsing the website (pilgrim, family, group organizer, monk, tourist) |
| **Owner/Staff** | Resort owner or staff who receives WhatsApp messages and calls |
| **WhatsApp** | External service — the message delivery channel for all enquiries |
| **Google** | External service — maps embed, reviews link |

---

## Flow 1: First-Time Homepage Visit

```
Visitor arrives at cauveryresorts.com
            ↓
  Splash Screen displayed (2.2s)
  "ॐ Cauvery Resorts · Coorg · Since 2008"
  Loading bar animates
            ↓
  [Splash fades out after 2.2s]
  sessionStorage.splashSeen = '1'
            ↓
  Hero section visible
  Full-screen image slideshow starts (fade, 5.5s interval)
            ↓
  After 4s: WhatsApp popup auto-opens
  "Hello! 👋 Looking to book a stay near Talacauvery?"
  [Only if sessionStorage.waPopupShown not set]
  sessionStorage.waPopupShown = '1'
            ↓
  Visitor reads content OR dismisses popup
  via ✕ button or click-outside
            ↓
  Scroll progress bar animates with page scroll
  Stats bar animates when it enters viewport
            ↓
  Cookie banner appears after 3s (if not previously accepted)
            ↓
  Visitor accepts cookies → localStorage.cookieAccepted = '1'
```

**Business rules:**
- Splash shown once per browser session only
- WhatsApp popup auto-opens once per session only
- Cookie banner appears once per device only (localStorage-gated)

---

## Flow 2: Enquiry via Homepage Form

```
Visitor scrolls to "Check Availability & Enquire" section
            ↓
  Fills in:
  • Name (required)
  • Phone number (required)
  • Check-In date (min: today)
  • Check-Out date (min: check-in date)
  • Number of Guests (select dropdown)
  • Room Type (select dropdown)
            ↓
  Clicks "Send Enquiry on WhatsApp"
            ↓
  JS validates: name and phone must be non-empty
  If invalid → alert("Please enter your name and phone number.")
  Flow ends here
            ↓
  [If valid]
  JS composes WhatsApp message:
  "Hello, I would like to enquire about a stay at Cauvery Resorts, Coorg.
   *Name:* Ramesh Kumar
   *Phone:* +91 98765 43210
   *Check-In:* 2026-07-15
   *Check-Out:* 2026-07-17
   *Guests:* 3 – 5
   *Room Type:* AC Room
   Please confirm availability. Thank you!"
            ↓
  Browser opens wa.me/919449485133?text=<encoded message>
  in a new tab
            ↓
  [WhatsApp / WhatsApp Web opens]
  Visitor sends pre-filled message to resort
            ↓
  Owner receives WhatsApp message
  Owner replies with availability and pricing
            ↓
  Visitor confirms booking verbally / via WhatsApp
  No online payment — payment at check-in (Cash/UPI)
```

**Actors:** Visitor → WhatsApp → Owner  
**Input data:** name, phone, checkin, checkout, guests, roomType  
**Business rules:**
- No server-side validation
- No confirmation email
- No booking ID generated
- No advance payment required

**Success:** WhatsApp opens with pre-filled message  
**Failure:** Missing name/phone → alert, form stays open

---

## Flow 3: Enquiry via Dedicated Enquiry Page

**Identical to Flow 2** but reached via `enquiry.html`.

```
Visitor clicks "Enquire Now" pill in navbar
  OR "Start Your Enquiry" button on homepage
  OR "Check Availability" link in pricing strip
            ↓
  Page transition animation (dark overlay, 380ms)
            ↓
  enquiry.html loads
  Page hero with resort photos (crossfade)
            ↓
  Full-page enquiry form
  Same fields as homepage form
            ↓
  [Same submission flow as Flow 2]
```

---

## Flow 4: WhatsApp Chat via Floating Button

```
Visitor sees "Start a Chat" green FAB (bottom-right)
  with pulse ring animation
            ↓
  Clicks button
            ↓
  WhatsApp chat popup slides in above FAB
  Shows: avatar, "Cauvery Resorts", "Typically replies within minutes"
  Greeting bubble: "Hello! 👋 Looking to book a stay near Talacauvery?..."
            ↓
  Visitor clicks "Start Chat" button in popup footer
            ↓
  Browser opens wa.me/919449485133?text=Hi%2C+I+saw+your+website+...
  in a new tab
            ↓
  Visitor types their own custom message to resort
            ↓
  Owner replies on WhatsApp
```

**Alternative (close without chatting):**
```
Visitor clicks ✕ in popup header
  OR clicks anywhere outside the popup
            ↓
  Popup closes, returns to browsing
```

**Toggle behaviour:**
- Clicking FAB again while popup is open → closes popup
- Clicking FAB while popup is closed → opens popup

---

## Flow 5: Direct Phone Call

```
Visitor clicks:
  • Call FAB (gold square button, bottom-right)
  OR "Call Now" button in mobile CTA bar
  OR phone numbers in footer
  OR "Call Directly" button in enquiry form
            ↓
  tel:+919449485133 link triggers native phone dialer
            ↓
  Visitor calls +91-944-9485133 or +91-996-4785133
            ↓
  Owner answers and handles booking verbally
```

**Actors:** Visitor → Phone system → Owner  
**Business rules:** No tracking, no call recording.

---

## Flow 6: Returning Visitor Navigation

```
Visitor arrives at any page
            ↓
  No splash screen (sessionStorage.splashSeen exists)
  No auto-popup (sessionStorage.waPopupShown exists)
  No cookie banner (localStorage.cookieAccepted exists)
            ↓
  Navbar immediately visible (sticky at top)
            ↓
  Visitor clicks a nav link (e.g. "Rooms")
            ↓
  Page transition: dark overlay enters (380ms)
  window.location.href = "accommodation.html"
            ↓
  New page loads — scroll reset to top
```

**State transitions:** 
- Current page → overlay animation → destination page
- Active nav link updates to match current page

---

## Flow 7: Browse Rooms & Tariff

```
Visitor clicks "Rooms" in navbar
  OR "View Rooms" in hero
  OR "View All Rooms & Tariff" on homepage
            ↓
  accommodation.html loads
            ↓
  Page hero: resort photos crossfade
            ↓
  Visitor browses room cards:
  • Standard Non-AC — ₹1,500/night (up to 3)
  • Deluxe AC — ₹2,500/night (up to 3)
  • Cosy Couple Room (up to 2)
  • Large Family Room (up to 10)
  • Pilgrim Dormitory — ₹400/person (up to 50)
            ↓
  Visitor clicks "Enquire Now" / "Book This Room"
            ↓
  [Leads to Flow 2 or Flow 4]
```

**Business rules:**
- Prices are displayed without taxes (GST invoices available)
- All prices are hardcoded in HTML (no live pricing API)
- Availability is never shown — always requires contacting the resort

---

## Flow 8: Gallery Browsing + Lightbox

```
Visitor navigates to gallery.html
  OR sees gallery preview on homepage
            ↓
  Gallery grid renders (CSS grid, lazy-loaded images)
            ↓
  Visitor clicks on a photo
            ↓
  Lightbox overlay opens (dark, z-index: 9000)
  Full-size image shown
            ↓
  Visitor navigates:
  • Arrow buttons (left/right)
  • Keyboard arrows (← →)
            ↓
  Visitor closes:
  • ✕ button
  • Click outside image
  • Escape key
            ↓
  Returns to gallery grid
```

**Input data:** Image index  
**State transitions:** Gallery → lightbox open → navigate → lightbox closed → gallery

---

## Flow 9: FAQ Self-Service

```
Visitor navigates to faq.html
  OR sees "Common Questions" on homepage
            ↓
  Page shows accordion list of questions
            ↓
  Visitor clicks a question header (<summary>)
            ↓
  <details> expands — answer revealed
  (Native HTML behaviour, no JS required)
            ↓
  Visitor clicks same header again → collapses
  Visitor clicks different header → that expands
  (Multiple can be open simultaneously — native behaviour)
            ↓
  If question not answered → "WhatsApp Us" CTA at bottom
  [Leads to Flow 4]
```

---

## Flow 10: Navigate to Contact & Get Directions

```
Visitor clicks "Contact" in navbar
  OR "Contact Us" button on homepage
            ↓
  contactus.html loads
            ↓
  Visitor sees:
  • Phone numbers (click → call)
  • Email address (click → mail client)
  • Physical address
  • Google Maps iframe (interactive)
  • How-to-reach routes with distances
            ↓
  Visitor clicks phone → Flow 5
  Visitor clicks WhatsApp → Flow 4
  Visitor clicks "Get Directions" in map iframe
            ↓
  Google Maps opens in new tab
  Shows route to coordinates 12.385989, 75.5120069
```

---

## Flow 11: Explore Nearby Attractions / Sacred Places

```
Visitor clicks "Nearby" in footer
  OR "Nearby Attractions" link
  OR temple cards on homepage
            ↓
  nearby-attractions.html loads
            ↓
  Cards for:
  • Talacauvery (2 km)
  • Bhagamandala (500 m)
  • Omkareshwara Temple (2 km)
  • Brahmagiri Peak (8 km)
  • + more
            ↓
  Visitor decides to visit → books stay first
  [Leads to Flow 2, 4, or 5]
```

---

## Flow 12: Mobile Visitor Journey

```
Visitor opens cauveryresorts.com on mobile
            ↓
  Mobile-specific layout:
  • Hamburger menu replaces full navbar
  • body has padding-bottom: 70px (CTA bar space)
  • Mobile CTA bar fixed at bottom:
    [Call Now] [WhatsApp] [Enquire]
            ↓
  Visitor taps "WhatsApp" in bottom bar
            ↓
  wa.me link opens in WhatsApp app directly
            ↓
  OR taps "Enquire" → enquiry.html
  OR taps "Call Now" → phone dialer
```

**Key differences from desktop:**
- FABs still visible (bottom-right) above CTA bar
- Hero trust pills hidden (`display:none` at `≤640px`)
- 3-column room grids collapse to 1 column
- Desktop sticky bar (`#stickyBar`) hidden; mobile CTA bar shown instead

---

## Flow 13: Group / Trust Organizer Journey

```
Group organizer (planning trip for 50–500 people) finds site
  via Google search "resort near Talacauvery for groups"
            ↓
  Lands on resorts-near-talacauvery.html or index.html
            ↓
  Reads "Who Stays With Us" → group pilgrim banner
  "Bulk room bookings for 50–500+ guests"
  "GST invoicing · Meal arrangements · Bus parking"
            ↓
  Clicks "Contact for Group Rates"
            ↓
  contactus.html
            ↓
  Calls resort directly (preferred for large groups)
  OR WhatsApps with group size and dates
            ↓
  Owner negotiates group rate verbally
  Sends quote via WhatsApp
            ↓
  Organizer confirms, owner arranges rooms and meals
  GST invoice provided on arrival or in advance
```

**Business rules:**
- Group rate negotiation happens off-platform
- No group booking form — phone/WhatsApp only
- GST invoices required by religious trusts and organizations

---

## Flow 14: Day Bathing Visitor (No Room)

```
Pilgrim arrives at Bhagamandala for rituals
Wants to bathe but not stay overnight
            ↓
  Finds cauveryresorts.com
  Sees "Day Bathing — ₹100/person"
            ↓
  No booking required — walk-in service
  Pilgrim arrives at resort
            ↓
  Uses 1 of 12 clean bathrooms
  Pays ₹100 at reception
  Departs
```

**Business rules:**
- No advance booking
- No website form for this
- Revenue captured at reception

---

## Error Flows

### E1: Network Error / Offline
```
Visitor loads any page while offline
            ↓
  Service worker (if registered via manifest.json) intercepts
            ↓
  offline.html served
  "You appear to be offline. Please check your connection."
            ↓
  Visitor regains connection → refreshes → normal page loads
```

### E2: 404 Page Not Found
```
Visitor navigates to a URL that doesn't exist
            ↓
  Server / hosting platform serves 404.html
  Custom-styled 404 page
            ↓
  "Back to Home" button → index.html
```

### E3: Enquiry Form Validation Failure
```
Visitor submits form without name or phone
            ↓
  JavaScript: alert("Please enter your name and phone number.")
            ↓
  Form stays open, no navigation
  Visitor fills missing fields → resubmits
```

### E4: Logo Image Load Failure
```
logo.png fails to load (network error or missing file)
            ↓
  onerror handler fires:
  this.style.display = 'none'
  nextElementSibling.style.display = 'flex'
            ↓
  Text fallback shown:
  "Cauvery Resorts / COORG · SINCE 2008"
  (styled with Playfair Display and small caps)
```

### E5: WhatsApp Not Installed (Desktop)
```
Visitor clicks any wa.me link on desktop
  WhatsApp not installed
            ↓
  Browser opens WhatsApp Web (web.whatsapp.com)
  Visitor must scan QR code to authenticate
            ↓
  OR visitor uses "Use on this computer" option
```

### E6: Date Validation — Check-Out Before Check-In
```
Visitor selects check-out date before check-in date
            ↓
  JS sets co.min = ci.value on check-in change
  Browser's native date picker enforces minimum
            ↓
  Invalid dates cannot be submitted (browser prevents)
```

---

## Sequence Diagram: Enquiry Form → WhatsApp

```
Visitor                  Browser (JS)            WhatsApp
   |                         |                       |
   |--[Fill form fields]---->|                       |
   |                         |                       |
   |--[Click Submit]-------->|                       |
   |                         |                       |
   |                   [Validate name+phone]         |
   |                         |                       |
   |                   [Invalid?]                    |
   |<--[alert("...")]--------|                       |
   |                         |                       |
   |                   [Valid?]                      |
   |                   [Build message string]        |
   |                   [encodeURIComponent(msg)]     |
   |                   [window.open(wa.me/...)]      |
   |                         |                       |
   |                         |--[new tab opens]----->|
   |                         |                       |
   |<--[WhatsApp/Web opens]--|                       |
   |--[Send message]--------------------------------->|
   |                         |                       |
                                             Owner receives message
                                             Owner replies via WhatsApp
```

---

## State Transitions Summary

| State | Trigger | Next State |
|-------|---------|-----------|
| Page loading | DNS resolve + HTML parse | Splash visible |
| Splash visible | 2.2s timer | Splash fading |
| Splash fading | 650ms transition | Splash hidden, page interactive |
| Page interactive | User scroll | Stats animate (once, Intersection Observer) |
| Page interactive | 4s timer (first session) | WhatsApp popup open |
| WhatsApp popup open | Click FAB / ✕ / outside | WhatsApp popup closed |
| WhatsApp popup closed | Click FAB | WhatsApp popup open |
| Page interactive | 3s timer (first visit) | Cookie banner visible |
| Cookie banner visible | Accept click | Cookie banner hidden (localStorage set) |
| Gallery page | Image click | Lightbox open |
| Lightbox open | Arrow / keyboard | Next/prev image |
| Lightbox open | ✕ / overlay / Escape | Lightbox closed |
| Any page | Internal link click | Page transition enter |
| Page transition enter | 380ms | New page URL set |
| Navbar | scrollY > 0 | .scrolled class added |
| Navbar mobile | Hamburger click | Mobile menu open |
| Mobile menu open | Link click / outside | Mobile menu closed |
