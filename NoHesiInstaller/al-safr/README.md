# Al-Safr

- `WEB` — customer-facing site (flights, hotels, tour packages, cabs)
- `CRM` — internal admin panel

Each is a fully standalone Next.js app with its own `package.json`, its own copy of the Prisma schema/client, and its own `node_modules`. They share the same Postgres database (same `DATABASE_URL` in both), but their database code is duplicated rather than shared — keep the two `prisma/schema.prisma` files in sync by hand when the schema changes.

## Local development

```bash
cd WEB && npm install
cd ../CRM && npm install
```

Each app needs its own `.env.local`:

```env
DATABASE_URL="postgresql://..."   # same value in both WEB and CRM
AUTH_SECRET=...                    # a different random value per app — generate with:
                                    # node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
RAPIDAPI_KEY=...                   # WEB only — comma-separated keys for rotation (flights/hotels/cabs)
```

Then, from inside whichever app's directory:

```bash
npm run db:migrate   # applies the Prisma schema to the database
npm run seed         # seeds a demo customer + staff user + sample tour packages
npm run dev          # WEB: http://localhost:3000, CRM: http://localhost:3100
```
