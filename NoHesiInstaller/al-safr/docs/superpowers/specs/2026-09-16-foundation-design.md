# Foundation — Design Spec

Status: Approved for planning
Date: 2026-09-16
Sub-project: 1 of 9 (see project decomposition below)

## Context

Al-Safr's client requirement doc describes a full B2C travel booking
portal (flights, hotels, buses, own tour packages) plus a full admin
back-office (staff/RBAC, markup/commission, promo codes, GST invoicing,
reports). The current codebase is a single-page Next.js demo
(`src/app/page.tsx`) with two working modules — live flight search
(Google Flights via RapidAPI) and hotel search (Booking.com via
RapidAPI) — and nothing else: no database, no auth, no admin surface,
no persisted bookings.

Bus booking and the payment gateway are explicitly deferred (client
decision, 2026-09-16).

## Project decomposition

The full remaining scope is too large for one spec/plan cycle. It
decomposes into 9 sub-projects, each getting its own
spec → plan → build cycle, in dependency order:

1. **Foundation** (this spec) — database, auth, monorepo restructuring
2. Customer portal completion — profile, persisted booking history, static pages
3. Tour Package Management — admin CRUD + public listing/detail + enquiry flow
4. Admin Panel core — dashboard, booking management, customer records
5. Staff Management + Roles & Permissions
6. Markup & Commission management
7. Promo Code / Coupon management
8. GST / Tax Invoice module
9. Reports & Notifications

Everything from #2 onward depends on #1 existing. This spec covers #1 only.

## Goal

Stand up the infrastructure every later sub-project needs:
- A real database, shared by two apps
- Two separately-authenticated surfaces: the customer site and the admin app
- A repo structure that keeps them independently deployable but sharing one data model

## Non-goals (explicitly out of scope for this phase)

- Customer profile page, booking history, static pages (About/Contact/Terms/Privacy) — sub-project 2
- Turning today's demo flight/hotel bookings (React state only) into real DB records — sub-project 2
- Any real admin screens beyond a login page and a placeholder dashboard — sub-project 4
- Staff self-service signup — staff accounts are seeded/created manually in this phase
- Bus booking, payment gateway — deferred by client decision
- Granular role/permission model — this phase only needs enough to gate `/crm` to staff; full RBAC is sub-project 5

## Architecture

### Repo structure — monorepo, npm workspaces

```
al-safr/
├── apps/
│   ├── web/          # customer site — today's al-safr app content moves here unchanged
│   └── crm/          # new admin app — staff login + placeholder dashboard shell
├── packages/
│   ├── db/           # Prisma schema + generated client + migrations + seed script
│   └── shared/        # shared TS types (Customer, StaffUser) + zod schemas
├── package.json       # workspace root
```

`apps/web` is a lift-and-shift of the current `src/` tree — the
flight/hotel search components, the RapidAPI key-rotation helper
(`src/lib/rapidapi.ts`), and the existing API routes move as-is. This
phase does not modify their behavior, only their location.

`apps/crm` is new and intentionally thin: a `/login` page and one
protected placeholder page. No real admin functionality yet — that's
sub-project 4.

### Database

- Postgres, hosted on Supabase.
- Accessed via Prisma, defined once in `packages/db`, imported by both apps as a workspace dependency.
- Schema for this phase:
  - `Customer` — id, email (unique), hashedPassword, name, createdAt, updatedAt
  - `StaffUser` — id, email (unique), hashedPassword, name, role (`SUPER_ADMIN | STAFF`), createdAt, updatedAt
  - NextAuth's standard `Account` / `Session` / `VerificationToken` tables (via the Prisma adapter), scoped per app (see below)

### Auth

- Auth.js (NextAuth v5), credentials provider, Prisma adapter.
- Two independent NextAuth configurations against the same database:
  - `apps/web` authenticates against `Customer`. Pages: `/login`, `/register`.
  - `apps/crm` authenticates against `StaffUser`. Pages: `/login` only.
- A customer session is never valid in `/crm` and a staff session is never valid on the customer site — they're different NextAuth instances with different user tables, not a shared session with a role check.
- Passwords hashed with bcrypt before storage; never stored or logged in plaintext.

### Environment / config

- `DATABASE_URL` — Supabase Postgres connection string, shared by both apps.
- `AUTH_SECRET` — one per app (customer and staff sessions must not be interchangeable even if a secret leaked).
- Existing `RAPIDAPI_KEY` env var moves with `apps/web`, unchanged.

## Error handling

- Auth failures (bad credentials, duplicate email on register) return a user-facing message, not a raw error — matches the existing pattern in the flight/hotel routes (`{ error: string }` JSON shape) rather than throwing.
- DB connection failures at boot fail loudly in dev (Prisma throws on first query) — no silent fallback, since there's no meaningful degraded mode for a site whose only job right now is auth.

## Testing

- A `demo()` script in `packages/db` (run via `npm run seed` or similar) that:
  1. Seeds one `Customer` and one `StaffUser`
  2. Asserts both can be fetched back by email
  3. Asserts the `StaffUser` password does NOT match a wrong password when checked with bcrypt.compare
- This is the smallest check that would fail if the schema, migration, or password hashing broke — no test framework needed for this phase.

## Open questions

None — all decisions confirmed with the client during brainstorming (2026-09-16): Vercel hosting target, Supabase Postgres, self-hosted email/password auth, monorepo with `apps/web` + `apps/crm` + shared packages.
