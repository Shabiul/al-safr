import { db } from '@/lib/db';

// Comma-separated RAPIDAPI_KEY env var. On 429/403 (quota exhausted) we
// retry the same request with the next key before giving up.
const KEYS = (process.env.RAPIDAPI_KEY || '').split(',').map((k) => k.trim()).filter(Boolean);

export function hasRapidApiKey(): boolean {
  return KEYS.length > 0;
}

function keyLabel(key: string, index: number): string {
  return `key-${index + 1} (…${key.slice(-4)})`;
}

// Remembers which key last worked so the next call starts there instead of
// always retrying key 0 first. Without this, once key 0's quota is
// exhausted, EVERY request re-tries and re-logs it as dead before falling
// through — flooding the ApiKeyEvent table (and the CRM's API Health view,
// which only shows the most recent 100 rows) with duplicate events for the
// same known-bad key, burying any signal about other keys failing later.
// Resets to 0 on a cold start, which is fine — it's an optimization, not a
// correctness guarantee; all keys are still tried in order from the cursor.
let cursor = 0;

export async function rapidApiFetch(url: string, host: string, init: RequestInit = {}): Promise<Response> {
  if (KEYS.length === 0) throw new Error('RAPIDAPI_KEY not configured');
  let lastRes: Response | null = null;
  for (let attempt = 0; attempt < KEYS.length; attempt++) {
    const i = (cursor + attempt) % KEYS.length;
    const res = await fetch(url, {
      ...init,
      headers: { ...init.headers, 'x-rapidapi-key': KEYS[i], 'x-rapidapi-host': host },
    });
    if (res.status !== 429 && res.status !== 403) {
      cursor = i;
      return res;
    }
    db.from('ApiKeyEvent').insert({ id: crypto.randomUUID(), service: host, keyLabel: keyLabel(KEYS[i], i) }).then(() => {}, () => {});
    cursor = (i + 1) % KEYS.length;
    lastRes = res;
  }
  return lastRes!;
}
