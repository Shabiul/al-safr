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

Each app needs its own `.env.local` with `DATABASE_URL` (same Supabase connection string for both) and its own `AUTH_SECRET` (a random base64 string, e.g. via `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`). `packages/db` needs its own `.env` with the same `DATABASE_URL` for running Prisma CLI commands (`migrate`, `seed`) directly.
