// Comma-separated RAPIDAPI_KEY env var. On 429/403 (quota exhausted) we
// retry the same request with the next key before giving up.
const KEYS = (process.env.RAPIDAPI_KEY || '').split(',').map((k) => k.trim()).filter(Boolean);

export function hasRapidApiKey(): boolean {
  return KEYS.length > 0;
}

export async function rapidApiFetch(url: string, host: string, init: RequestInit = {}): Promise<Response> {
  let lastRes: Response | null = null;
  for (const key of KEYS) {
    const res = await fetch(url, {
      ...init,
      headers: { ...init.headers, 'x-rapidapi-key': key, 'x-rapidapi-host': host },
    });
    if (res.status !== 429 && res.status !== 403) return res;
    lastRes = res;
  }
  if (!lastRes) throw new Error('RAPIDAPI_KEY not configured');
  return lastRes;
}
