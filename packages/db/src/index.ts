import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

// Next.js loads .env.local itself before any app code runs, so this is a
// no-op there (dotenv never overwrites an already-set var). Scripts run
// directly via `tsx` (seed.ts, the *.test.ts files) have no such loader,
// so this is what actually supplies DATABASE_URL for them.
config({ path: resolve(__dirname, '../.env') });

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from '@prisma/client';
