import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// Next.js loads .env.local itself before any app code runs, so this is a
// no-op there (dotenv never overwrites an already-set var). Scripts run
// directly via `tsx` (the *.test.ts files) have no such loader, so this is
// what actually supplies SUPABASE_URL/SUPABASE_SECRET_KEY for them.
config({ path: resolve(__dirname, '../../.env.local') });

// Server-only: the secret key bypasses row-level security, which is fine
// since every caller is already gated by our own session checks.
export const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
  auth: { persistSession: false },
});
