# Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the single-app al-safr demo into an npm-workspaces monorepo with a customer site (`apps/web`), a new admin app skeleton (`apps/crm`), a shared Postgres database (`packages/db`), and shared types (`packages/shared`) — with independent credentials-based login for customers and staff.

**Architecture:** `apps/web` is a lift-and-shift of the current `src/` tree (flights + hotels untouched) plus new customer register/login pages backed by Auth.js v5 (JWT sessions, no OAuth adapter — credentials-only). `apps/crm` is a new, minimal Next.js app with staff login, a middleware-protected placeholder dashboard, and its own Auth.js v5 instance against a separate `StaffUser` table. Both apps import a shared Prisma client from `packages/db` (Postgres on Supabase) and shared TS types from `packages/shared`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Prisma 7.10.0, `@prisma/client` 7.10.0, `next-auth` 5.0.0-beta.32, `bcryptjs` for password hashing, `tsx` for running plain-script tests, npm workspaces (no Turborepo — YAGNI at this scale).

**Spec:** `docs/superpowers/specs/2026-09-16-foundation-design.md`

## Global Constraints

- Bus booking and payment gateway are out of scope — do not touch them.
- No admin functionality beyond a login page and one placeholder dashboard page in `apps/crm` — real admin screens are a later sub-project.
- No customer profile page, booking history, or static pages in `apps/web` this phase — later sub-project.
- Customer and staff sessions must never be interchangeable: separate Auth.js instances, separate user tables, separate `AUTH_SECRET` values.
- Passwords are always hashed with bcrypt before storage; never logged or returned in an API response.
- Every non-trivial function (credential verification, registration) ships with a small `tsx`-run assertion script — no test framework, matching the existing repo convention of a `demo()`-style check.

---

### Task 1: Convert repo to npm workspaces; move current app into `apps/web`

**Files:**
- Create: `package.json` (new root workspace manifest)
- Modify: `.gitignore`
- Move: `src/`, `public/`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `.env.local`, `next-env.d.ts`, `README.md`, the old `package.json` → all into `apps/web/`
- Modify: `apps/web/package.json` (rename package)

**Interfaces:**
- Produces: a working `apps/web` npm workspace, installable and runnable exactly as the app was before this task, at `npm run dev --workspace=apps/web`.

- [ ] **Step 1: Create the target directories**

```bash
mkdir -p apps/web packages/db packages/shared
```

- [ ] **Step 2: Move the existing app into `apps/web`**

```bash
git mv src apps/web/src
git mv public apps/web/public
git mv next.config.ts apps/web/next.config.ts
git mv tsconfig.json apps/web/tsconfig.json
git mv eslint.config.mjs apps/web/eslint.config.mjs
git mv postcss.config.mjs apps/web/postcss.config.mjs
git mv README.md apps/web/README.md
git mv package.json apps/web/package.json
git mv .env.local apps/web/.env.local
```

`next-env.d.ts` and `package-lock.json` are gitignored/regenerated — move the env file too, but delete rather than move the lockfile and type-decl file (they'll be regenerated):

```bash
mv next-env.d.ts apps/web/next-env.d.ts 2>/dev/null || true
rm -f package-lock.json
```

- [ ] **Step 3: Rename the moved package**

Edit `apps/web/package.json` — change the `"name"` field from `"al-safr"` to `"@al-safr/web"`. Leave every other field (scripts, dependencies) exactly as-is.

- [ ] **Step 4: Create the root workspace manifest**

Create `package.json`:

```json
{
  "name": "al-safr-monorepo",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "devDependencies": {
    "tsx": "^4.23.13"
  }
}
```

- [ ] **Step 5: Unanchor the gitignore patterns that must now match inside `apps/*` and `packages/*`**

In `.gitignore`, change:
```
/node_modules
```
to:
```
node_modules
```

Change:
```
/.next/
/out/
```
to:
```
.next/
out/
```

Change:
```
/build
```
to:
```
build
```

Leave every other line unchanged (`.env*`, `*.tsbuildinfo`, `next-env.d.ts` already have no leading slash, so they already match at any depth).

- [ ] **Step 6: Install and verify the app still runs**

```bash
npm install
npm run dev --workspace=apps/web
```

In a second terminal (or after backgrounding), confirm it serves:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
```

Expected: `200` (or whatever port Next.js falls back to if 3000 is taken — check the terminal output for the actual port). Stop the dev server once confirmed.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Restructure into npm workspaces; move app into apps/web"
```

---

### Task 2: `packages/shared` — shared TypeScript types

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/index.ts`

**Interfaces:**
- Produces: `Customer`, `StaffUser`, `StaffRole` types, importable as `import type { Customer, StaffUser, StaffRole } from '@al-safr/shared'`.

- [ ] **Step 1: Create the package manifest**

Create `packages/shared/package.json`:

```json
{
  "name": "@al-safr/shared",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
```

- [ ] **Step 2: Create the package's tsconfig**

Create `packages/shared/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Write the shared types**

Create `packages/shared/src/index.ts`:

```ts
export type StaffRole = 'SUPER_ADMIN' | 'STAFF';

export interface Customer {
  id: string;
  email: string;
  name: string;
}

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
}
```

- [ ] **Step 4: Verify it type-checks**

```bash
npx tsc --noEmit -p packages/shared/tsconfig.json
```

Expected: no output, exit code 0.

- [ ] **Step 5: Register the new workspace and commit**

```bash
npm install
git add packages/shared package-lock.json
git commit -m "Add @al-safr/shared package with Customer/StaffUser types"
```

---

### Task 3: `packages/db` — Prisma schema, client, and seed check

**Files:**
- Create: `packages/db/package.json`
- Create: `packages/db/tsconfig.json`
- Create: `packages/db/prisma/schema.prisma`
- Create: `packages/db/src/index.ts`
- Create: `packages/db/src/seed.ts`
- Create: `packages/db/.env` (not committed — gitignored by the existing `.env*` pattern)

**Interfaces:**
- Consumes: `DATABASE_URL` env var (Supabase Postgres connection string).
- Produces: `import { prisma } from '@al-safr/db'` — a shared `PrismaClient` instance; and the Prisma-generated `Customer`, `StaffUser`, `StaffRole` runtime types (re-exported from `@prisma/client`).

- [ ] **Step 1: Create the package manifest**

Create `packages/db/package.json`:

```json
{
  "name": "@al-safr/db",
  "version": "0.1.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts",
  "scripts": {
    "generate": "prisma generate",
    "migrate": "prisma migrate dev",
    "seed": "tsx src/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "7.10.0",
    "bcryptjs": "^3.0.3"
  },
  "devDependencies": {
    "prisma": "7.10.0",
    "tsx": "^4.23.13",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create the package's tsconfig**

Create `packages/db/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Write the Prisma schema**

Create `packages/db/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Customer {
  id             String   @id @default(cuid())
  email          String   @unique
  hashedPassword String
  name           String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

enum StaffRole {
  SUPER_ADMIN
  STAFF
}

model StaffUser {
  id             String    @id @default(cuid())
  email          String    @unique
  hashedPassword String
  name           String
  role           StaffRole @default(STAFF)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

- [ ] **Step 4: Install dependencies**

```bash
npm install
```

- [ ] **Step 5: Get a Supabase Postgres connection string and set it locally**

In the Supabase dashboard: Project Settings → Database → Connection string → copy the "URI" value (use the pooled "Transaction" connection string for the app, not the direct connection). Create `packages/db/.env`:

```
DATABASE_URL="paste-your-supabase-connection-string-here"
```

This file is gitignored by the existing `.env*` pattern — confirm with `git status` that it does not appear as untracked-to-be-added.

- [ ] **Step 6: Generate the Prisma client and run the first migration**

```bash
npm run generate --workspace=packages/db
npm run migrate --workspace=packages/db -- --name init
```

Expected: Prisma reports the migration applied and the client generated, with no errors. If `DATABASE_URL` is wrong or the Supabase project is paused, this step fails loudly — fix the connection string before continuing.

- [ ] **Step 7: Write the shared Prisma client export**

Create `packages/db/src/index.ts`:

```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';
```

- [ ] **Step 8: Write the seed + assertion script**

Create `packages/db/src/seed.ts`:

```ts
import bcrypt from 'bcryptjs';
import { prisma } from './index';

async function demo() {
  const customerPassword = await bcrypt.hash('customer-demo-pass', 10);
  const customer = await prisma.customer.upsert({
    where: { email: 'demo.customer@al-safr.test' },
    update: {},
    create: {
      email: 'demo.customer@al-safr.test',
      hashedPassword: customerPassword,
      name: 'Demo Customer',
    },
  });

  const staffPassword = await bcrypt.hash('staff-demo-pass', 10);
  const staff = await prisma.staffUser.upsert({
    where: { email: 'demo.staff@al-safr.test' },
    update: {},
    create: {
      email: 'demo.staff@al-safr.test',
      hashedPassword: staffPassword,
      name: 'Demo Staff',
      role: 'SUPER_ADMIN',
    },
  });

  const fetchedCustomer = await prisma.customer.findUniqueOrThrow({ where: { email: customer.email } });
  const fetchedStaff = await prisma.staffUser.findUniqueOrThrow({ where: { email: staff.email } });

  if (fetchedCustomer.email !== customer.email) {
    throw new Error('FAIL: customer not fetchable by email');
  }
  if (fetchedStaff.email !== staff.email) {
    throw new Error('FAIL: staff not fetchable by email');
  }

  const wrongPasswordMatches = await bcrypt.compare('totally-wrong-password', fetchedStaff.hashedPassword);
  if (wrongPasswordMatches) {
    throw new Error('FAIL: wrong password matched staff hash');
  }

  console.log('demo() passed: customer + staff seeded, fetched, and password check verified.');
}

demo()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 9: Run the seed script and verify it passes**

```bash
npm run seed --workspace=packages/db
```

Expected output ends with: `demo() passed: customer + staff seeded, fetched, and password check verified.`

- [ ] **Step 10: Commit**

```bash
git add packages/db package-lock.json
git commit -m "Add @al-safr/db package: Prisma schema, client, and seed check"
```

(`.env` inside `packages/db` is gitignored and must not appear in this commit — verify with `git status` before committing.)

---

### Task 4: `apps/web` — customer registration and login

**Files:**
- Create: `apps/web/src/lib/registerCustomer.ts`
- Create: `apps/web/src/lib/registerCustomer.test.ts`
- Create: `apps/web/src/lib/verifyCustomerCredentials.ts`
- Create: `apps/web/src/lib/verifyCustomerCredentials.test.ts`
- Create: `apps/web/src/auth.ts`
- Create: `apps/web/src/app/api/auth/[...nextauth]/route.ts`
- Create: `apps/web/src/app/api/auth/register/route.ts`
- Create: `apps/web/src/app/providers.tsx`
- Modify: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/login/page.tsx`
- Create: `apps/web/src/app/register/page.tsx`
- Modify: `apps/web/next.config.ts`
- Modify: `apps/web/package.json`
- Modify: `apps/web/.env.local`

**Interfaces:**
- Consumes: `prisma` from `@al-safr/db` (Task 3).
- Produces: `registerCustomer(email, password, name)`, `verifyCustomerCredentials(email, password)` — both used by the routes below, and available for later phases (e.g. profile pages) to import.

- [ ] **Step 1: Add dependencies**

Edit `apps/web/package.json` — add to `"dependencies"`:

```json
"@al-safr/db": "*",
"@al-safr/shared": "*",
"bcryptjs": "^3.0.3",
"next-auth": "5.0.0-beta.32"
```

Add to `"devDependencies"`:

```json
"@types/bcryptjs": "^3.0.0",
"tsx": "^4.23.13"
```

Then run:

```bash
npm install
```

- [ ] **Step 2: Enable transpilation of the workspace packages**

Edit `apps/web/next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@al-safr/db", "@al-safr/shared"],
};

export default nextConfig;
```

- [ ] **Step 3: Write the failing test for credential verification**

Create `apps/web/src/lib/verifyCustomerCredentials.test.ts`:

```ts
import bcrypt from 'bcryptjs';
import { prisma } from '@al-safr/db';
import { verifyCustomerCredentials } from './verifyCustomerCredentials';

async function run() {
  const email = 'verify-test@al-safr.test';
  const password = 'correct-horse-battery-staple';
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.customer.deleteMany({ where: { email } });
  await prisma.customer.create({ data: { email, hashedPassword, name: 'Verify Test' } });

  const matched = await verifyCustomerCredentials(email, password);
  if (!matched || matched.email !== email) {
    throw new Error('FAIL: correct password did not verify');
  }

  const rejected = await verifyCustomerCredentials(email, 'wrong-password');
  if (rejected !== null) {
    throw new Error('FAIL: wrong password verified');
  }

  const unknownUser = await verifyCustomerCredentials('nobody@al-safr.test', password);
  if (unknownUser !== null) {
    throw new Error('FAIL: unknown email verified');
  }

  await prisma.customer.deleteMany({ where: { email } });
  console.log('verifyCustomerCredentials.test passed.');
}

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 4: Run it to confirm it fails**

```bash
npx tsx apps/web/src/lib/verifyCustomerCredentials.test.ts
```

Expected: fails to run because `./verifyCustomerCredentials` does not exist yet (module not found).

- [ ] **Step 5: Implement `verifyCustomerCredentials`**

Create `apps/web/src/lib/verifyCustomerCredentials.ts`:

```ts
import bcrypt from 'bcryptjs';
import { prisma } from '@al-safr/db';
import type { Customer } from '@al-safr/shared';

export async function verifyCustomerCredentials(
  email: string,
  password: string
): Promise<Customer | null> {
  const customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer) return null;

  const isValid = await bcrypt.compare(password, customer.hashedPassword);
  if (!isValid) return null;

  return { id: customer.id, email: customer.email, name: customer.name };
}
```

- [ ] **Step 6: Run the test again and verify it passes**

```bash
npx tsx apps/web/src/lib/verifyCustomerCredentials.test.ts
```

Expected output ends with: `verifyCustomerCredentials.test passed.`

- [ ] **Step 7: Write the failing test for registration**

Create `apps/web/src/lib/registerCustomer.test.ts`:

```ts
import { prisma } from '@al-safr/db';
import { registerCustomer, EmailAlreadyRegisteredError } from './registerCustomer';

async function run() {
  const email = 'register-test@al-safr.test';
  await prisma.customer.deleteMany({ where: { email } });

  const created = await registerCustomer(email, 'a-strong-password', 'Register Test');
  if (created.email !== email) {
    throw new Error('FAIL: registered customer has wrong email');
  }

  let threw = false;
  try {
    await registerCustomer(email, 'a-different-password', 'Register Test');
  } catch (err) {
    threw = err instanceof EmailAlreadyRegisteredError;
  }
  if (!threw) {
    throw new Error('FAIL: registering a duplicate email did not throw EmailAlreadyRegisteredError');
  }

  await prisma.customer.deleteMany({ where: { email } });
  console.log('registerCustomer.test passed.');
}

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 8: Run it to confirm it fails**

```bash
npx tsx apps/web/src/lib/registerCustomer.test.ts
```

Expected: fails because `./registerCustomer` does not exist yet.

- [ ] **Step 9: Implement `registerCustomer`**

Create `apps/web/src/lib/registerCustomer.ts`:

```ts
import bcrypt from 'bcryptjs';
import { prisma } from '@al-safr/db';
import type { Customer } from '@al-safr/shared';

export class EmailAlreadyRegisteredError extends Error {}

export async function registerCustomer(
  email: string,
  password: string,
  name: string
): Promise<Customer> {
  const existing = await prisma.customer.findUnique({ where: { email } });
  if (existing) {
    throw new EmailAlreadyRegisteredError(`An account with ${email} already exists`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const customer = await prisma.customer.create({ data: { email, hashedPassword, name } });

  return { id: customer.id, email: customer.email, name: customer.name };
}
```

- [ ] **Step 10: Run the test again and verify it passes**

```bash
npx tsx apps/web/src/lib/registerCustomer.test.ts
```

Expected output ends with: `registerCustomer.test passed.`

- [ ] **Step 11: Set an auth secret**

Append to `apps/web/.env.local`:

```
AUTH_SECRET=replace-with-output-of-npx-auth-secret
```

Generate a real value and replace the placeholder text:

```bash
cd apps/web && npx auth secret
```

This command writes the generated secret directly into `.env.local` — confirm it replaced the placeholder line, then `cd` back to the repo root.

Also append the same `DATABASE_URL` used in `packages/db/.env` to `apps/web/.env.local`, since the Next.js process (not just the Prisma CLI) needs it at runtime:

```
DATABASE_URL="the-same-supabase-connection-string-from-packages/db/.env"
```

- [ ] **Step 12: Write the NextAuth config**

Create `apps/web/src/auth.ts`:

```ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { verifyCustomerCredentials } from '@/lib/verifyCustomerCredentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;
        return verifyCustomerCredentials(email, password);
      },
    }),
  ],
});
```

- [ ] **Step 13: Wire the NextAuth route handler**

Create `apps/web/src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

- [ ] **Step 14: Wire the registration API route**

Create `apps/web/src/app/api/auth/register/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { registerCustomer, EmailAlreadyRegisteredError } from '@/lib/registerCustomer';

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'email, password and name are required' }, { status: 400 });
  }

  try {
    const customer = await registerCustomer(email, password, name);
    return NextResponse.json(customer);
  } catch (err) {
    if (err instanceof EmailAlreadyRegisteredError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
```

- [ ] **Step 15: Add the session provider**

Create `apps/web/src/app/providers.tsx`:

```tsx
'use client';

import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

- [ ] **Step 16: Wrap the app in the session provider**

Edit `apps/web/src/app/layout.tsx` — add the import and wrap `children`:

```tsx
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Al-Safr (السفر) | Flights, Live Tracking & Fares',
  description: 'Book flights with real live fares, track aircraft in real time, and follow fare trends — Al-Safr.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-brand-200 selection:text-brand-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 17: Build the register page**

Create `apps/web/src/app/register/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError('Account created — please log in.');
        router.push('/login');
        return;
      }
      router.push('/');
    } catch {
      setError('Network error — please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-sm mx-auto py-16 px-4">
      <h1 className="text-2xl font-semibold mb-6 text-slate-900">Create an account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          required
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
        />
        <input
          type="password"
          required
          minLength={8}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl py-2.5 font-semibold text-sm transition-colors"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 18: Build the login page**

Create `apps/web/src/app/login/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError('Invalid email or password');
        return;
      }
      router.push('/');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-sm mx-auto py-16 px-4">
      <h1 className="text-2xl font-semibold mb-6 text-slate-900">Log in</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="focus-ring w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl py-2.5 font-semibold text-sm transition-colors"
        >
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 19: Manual end-to-end check**

```bash
npm run dev --workspace=apps/web
```

In another terminal, register a new customer and confirm the duplicate-email path:

```bash
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"e2e-test@al-safr.test","password":"a-strong-password","name":"E2E Test"}'
```

Expected: JSON with `id`, `email`, `name` — no `hashedPassword` field.

```bash
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"e2e-test@al-safr.test","password":"a-strong-password","name":"E2E Test"}'
```

Expected: `{"error":"An account with e2e-test@al-safr.test already exists"}`. Stop the dev server once confirmed.

- [ ] **Step 20: Commit**

```bash
git add apps/web package-lock.json
git commit -m "Add customer registration and login (Auth.js credentials)"
```

(`apps/web/.env.local` is gitignored — verify with `git status` it is not part of this commit.)

---

### Task 5: `apps/crm` — admin app skeleton with staff login

**Files:**
- Create: `apps/crm/package.json`
- Create: `apps/crm/tsconfig.json`
- Create: `apps/crm/next.config.ts`
- Create: `apps/crm/postcss.config.mjs`
- Create: `apps/crm/eslint.config.mjs`
- Create: `apps/crm/next-env.d.ts`
- Create: `apps/crm/.env.local`
- Create: `apps/crm/src/lib/verifyStaffCredentials.ts`
- Create: `apps/crm/src/lib/verifyStaffCredentials.test.ts`
- Create: `apps/crm/src/auth.config.ts`
- Create: `apps/crm/src/auth.ts`
- Create: `apps/crm/src/middleware.ts`
- Create: `apps/crm/src/app/api/auth/[...nextauth]/route.ts`
- Create: `apps/crm/src/app/globals.css`
- Create: `apps/crm/src/app/layout.tsx`
- Create: `apps/crm/src/app/page.tsx`
- Create: `apps/crm/src/app/login/page.tsx`
- Create: `apps/crm/src/app/dashboard/page.tsx`

**Interfaces:**
- Consumes: `prisma` from `@al-safr/db` (Task 3).
- Produces: a staff-only app at a distinct dev port (3100), completely separate session/auth from `apps/web`.

- [ ] **Step 1: Create the package manifest**

Create `apps/crm/package.json`:

```json
{
  "name": "@al-safr/crm",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3100",
    "build": "next build",
    "start": "next start -p 3100",
    "lint": "eslint"
  },
  "dependencies": {
    "@al-safr/db": "*",
    "@al-safr/shared": "*",
    "bcryptjs": "^3.0.3",
    "next": "16.3.5",
    "next-auth": "5.0.0-beta.32",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/bcryptjs": "^3.0.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.3.5",
    "tailwindcss": "^4",
    "tsx": "^4.23.13",
    "typescript": "^5"
  }
}
```

- [ ] **Step 2: Create supporting config files**

Create `apps/crm/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

Create `apps/crm/next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@al-safr/db", "@al-safr/shared"],
};

export default nextConfig;
```

Create `apps/crm/postcss.config.mjs`:

```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

Create `apps/crm/eslint.config.mjs`:

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
```

Create `apps/crm/next-env.d.ts`:

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

- [ ] **Step 3: Install dependencies**

```bash
npm install
```

- [ ] **Step 4: Write the failing test for staff credential verification**

Create `apps/crm/src/lib/verifyStaffCredentials.test.ts`:

```ts
import bcrypt from 'bcryptjs';
import { prisma } from '@al-safr/db';
import { verifyStaffCredentials } from './verifyStaffCredentials';

async function run() {
  const email = 'verify-staff-test@al-safr.test';
  const password = 'correct-horse-battery-staple';
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.staffUser.deleteMany({ where: { email } });
  await prisma.staffUser.create({
    data: { email, hashedPassword, name: 'Verify Staff Test', role: 'STAFF' },
  });

  const matched = await verifyStaffCredentials(email, password);
  if (!matched || matched.email !== email || matched.role !== 'STAFF') {
    throw new Error('FAIL: correct password did not verify with the right role');
  }

  const rejected = await verifyStaffCredentials(email, 'wrong-password');
  if (rejected !== null) {
    throw new Error('FAIL: wrong password verified');
  }

  await prisma.staffUser.deleteMany({ where: { email } });
  console.log('verifyStaffCredentials.test passed.');
}

run()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 5: Run it to confirm it fails**

```bash
npx tsx apps/crm/src/lib/verifyStaffCredentials.test.ts
```

Expected: fails because `./verifyStaffCredentials` does not exist yet.

- [ ] **Step 6: Implement `verifyStaffCredentials`**

Create `apps/crm/src/lib/verifyStaffCredentials.ts`:

```ts
import bcrypt from 'bcryptjs';
import { prisma } from '@al-safr/db';
import type { StaffUser } from '@al-safr/shared';

export async function verifyStaffCredentials(
  email: string,
  password: string
): Promise<StaffUser | null> {
  const staff = await prisma.staffUser.findUnique({ where: { email } });
  if (!staff) return null;

  const isValid = await bcrypt.compare(password, staff.hashedPassword);
  if (!isValid) return null;

  return { id: staff.id, email: staff.email, name: staff.name, role: staff.role };
}
```

- [ ] **Step 7: Run the test again and verify it passes**

```bash
npx tsx apps/crm/src/lib/verifyStaffCredentials.test.ts
```

Expected output ends with: `verifyStaffCredentials.test passed.`

- [ ] **Step 8: Set env vars**

Create `apps/crm/.env.local`:

```
DATABASE_URL="the-same-supabase-connection-string-used-in-apps/web-and-packages/db"
AUTH_SECRET=replace-with-output-of-npx-auth-secret
```

Generate a real (different from `apps/web`'s) secret:

```bash
cd apps/crm && npx auth secret
```

Confirm it replaced the placeholder `AUTH_SECRET` line, then `cd` back to the repo root.

- [ ] **Step 9: Write the edge-safe auth config**

Create `apps/crm/src/auth.config.ts`:

```ts
import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: { signIn: '/login' },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname === '/login';
      if (isLoginPage) return true;
      return isLoggedIn;
    },
  },
};
```

This file must stay free of Node-only imports (no `bcryptjs`, no `@al-safr/db`) — it's loaded by the Edge-runtime middleware in Step 11.

- [ ] **Step 10: Write the full NextAuth config**

Create `apps/crm/src/auth.ts`:

```ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { verifyStaffCredentials } from '@/lib/verifyStaffCredentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user && 'role' in user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string | undefined;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;
        return verifyStaffCredentials(email, password);
      },
    }),
  ],
});
```

- [ ] **Step 11: Write the middleware that protects every page except `/login`**

Create `apps/crm/src/middleware.ts`:

```ts
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
```

- [ ] **Step 12: Wire the NextAuth route handler**

Create `apps/crm/src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

- [ ] **Step 13: Add global styles**

Create `apps/crm/src/app/globals.css`:

```css
@import "tailwindcss";

@theme {
  --color-brand-600: #4f46e5;
  --color-brand-700: #4338ca;
}
```

- [ ] **Step 14: Add the root layout**

Create `apps/crm/src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Al-Safr CRM',
  description: 'Internal admin panel for Al-Safr Tours N Travels staff.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 15: Add the root page**

Create `apps/crm/src/app/page.tsx`:

```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
```

- [ ] **Step 16: Add the login page**

Create `apps/crm/src/app/login/page.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError('Invalid email or password');
        return;
      }
      router.push('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-sm mx-auto py-16 px-4">
      <h1 className="text-2xl font-semibold mb-6 text-slate-900">Al-Safr CRM</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Staff email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
        />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl py-2.5 font-semibold text-sm transition-colors"
        >
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 17: Add the placeholder dashboard**

Create `apps/crm/src/app/dashboard/page.tsx`:

```tsx
import { auth, signOut } from '@/auth';

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="max-w-2xl mx-auto py-16 px-4 space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Welcome, {session?.user?.name}</h1>
      <p className="text-slate-600">
        Admin modules (bookings, staff, markup, promo codes, invoicing, reports) land in later phases.
      </p>
      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/login' });
        }}
      >
        <button type="submit" className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium">
          Log out
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 18: Seed a real staff account and manually verify the protected flow**

```bash
npm run seed --workspace=packages/db
npm run dev --workspace=apps/crm
```

Visit `http://localhost:3100/dashboard` in a browser while logged out — expect an automatic redirect to `/login`. Log in with the seeded staff account (`demo.staff@al-safr.test` / `staff-demo-pass`) — expect a redirect to `/dashboard` showing "Welcome, Demo Staff". Click "Log out" — expect a redirect back to `/login`. Stop the dev server once confirmed.

- [ ] **Step 19: Commit**

```bash
git add apps/crm package-lock.json
git commit -m "Add apps/crm: staff login, middleware-protected dashboard shell"
```

(`apps/crm/.env.local` is gitignored — verify with `git status` it is not part of this commit.)

---

### Task 6: Final cross-app smoke test

**Files:** none (verification only)

- [ ] **Step 1: Run both apps side by side**

```bash
npm run dev --workspace=apps/web
```

In a second terminal:

```bash
npm run dev --workspace=apps/crm
```

- [ ] **Step 2: Verify the customer site**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"final-check@al-safr.test","password":"a-strong-password","name":"Final Check"}'
```

Expected: `200`, then a JSON object with `id`, `email`, `name`.

- [ ] **Step 3: Verify the CRM app**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100/login
curl -s -o /dev/null -w "%{http_code}\n" -L http://localhost:3100/dashboard
```

Expected: `200` for `/login`. For `/dashboard` (unauthenticated, following the redirect with `-L`): `200` landing on the login page's HTML (confirms the middleware redirected rather than serving the dashboard).

- [ ] **Step 4: Verify database isolation**

```bash
npm run seed --workspace=packages/db
```

Expected: still passes — confirms both apps' schema changes (none were made — this is a regression check) haven't broken the shared schema.

- [ ] **Step 5: Stop both dev servers, confirm no repo checked-in secrets**

```bash
git status
```

Expected: no `.env`, `.env.local` files listed as tracked/staged anywhere in the tree.

- [ ] **Step 6: Update root README pointer**

Create a short root-level `README.md` (the original one now lives at `apps/web/README.md`):

```markdown
# Al-Safr Monorepo

- `apps/web` — customer-facing site (flights, hotels, and growing)
- `apps/crm` — internal admin panel
- `packages/db` — shared Prisma schema/client (Postgres on Supabase)
- `packages/shared` — shared TypeScript types

## Local development

```bash
npm install
npm run seed --workspace=packages/db   # seeds a demo customer + staff user
npm run dev --workspace=apps/web       # customer site, http://localhost:3000
npm run dev --workspace=apps/crm       # admin panel, http://localhost:3100
```

Each app needs its own `.env.local` with `DATABASE_URL` (same Supabase connection string for both) and its own `AUTH_SECRET` (generate with `npx auth secret` from inside each app's directory). `packages/db` needs its own `.env` with the same `DATABASE_URL` for running Prisma CLI commands (`migrate`, `seed`) directly.
```

- [ ] **Step 7: Commit**

```bash
git add README.md
git commit -m "Add monorepo root README"
```

## Self-review notes

- **Spec coverage:** repo restructuring ✓ (Task 1), Postgres on Supabase via Prisma ✓ (Task 3), Customer/StaffUser models ✓ (Task 3), two independent Auth.js instances ✓ (Tasks 4 & 5), `/login` + `/register` on web ✓ (Task 4), `/login` + placeholder dashboard on crm ✓ (Task 5), seed/assertion check ✓ (Task 3, extended per-feature in Tasks 4 & 5), bcrypt hashing throughout ✓, bus/payment/full-admin explicitly excluded ✓.
- **Deviation from spec, called out:** the spec listed "NextAuth's standard Account/Session/VerificationToken tables (via the Prisma adapter)" as part of the schema. Since this phase is credentials-only (no OAuth providers), those tables would be unused infrastructure — JWT sessions with a direct Prisma lookup in `authorize()` achieve the same two-independently-authenticated-surfaces goal without them. They can be added when/if an OAuth provider is introduced later.
