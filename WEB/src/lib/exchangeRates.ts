import { CURRENCIES, CurrencyCode, updateCurrenciesRates } from '@/services/flightData';

export interface ExchangeRatesResult {
  base: 'USD';
  rates: Record<CurrencyCode, number>;
  lastUpdated: string;
  source: 'live' | 'cache' | 'fallback';
}

export const DEFAULT_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  INR: 96.83,
  AED: 3.67,
  SAR: 3.75,
  EUR: 0.89,
  GBP: 0.76,
};

let cachedResult: { rates: Record<CurrencyCode, number>; lastUpdated: string; expiresAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour TTL to prevent excessive API polling

/**
 * Fetches real-time exchange rates against USD with automatic multi-provider fallback.
 * Providers:
 * 1. Open Exchange Rates mirror (open.er-api.com) - high availability, no key required
 * 2. ExchangeRate-API (api.exchangerate-api.com)
 * 3. Frankfurter (api.frankfurter.app) - European Central Bank data
 */
export async function getLiveExchangeRates(): Promise<ExchangeRatesResult> {
  const now = Date.now();
  if (cachedResult && cachedResult.expiresAt > now) {
    updateCurrenciesRates(cachedResult.rates);
    return {
      base: 'USD',
      rates: cachedResult.rates,
      lastUpdated: cachedResult.lastUpdated,
      source: 'cache',
    };
  }

  const providers = [
    async () => {
      const res = await fetch('https://open.er-api.com/v6/latest/USD', {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json?.rates;
    },
    async () => {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json?.rates;
    },
    async () => {
      const res = await fetch('https://api.frankfurter.app/latest?from=USD', {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return { USD: 1, ...json?.rates };
    },
  ];

  for (const provider of providers) {
    try {
      const rawRates = await provider();
      if (rawRates && typeof rawRates.INR === 'number' && rawRates.INR > 0) {
        const parsedRates: Record<CurrencyCode, number> = {
          USD: 1.0,
          INR: parseFloat(rawRates.INR.toFixed(4)),
          AED: parseFloat((rawRates.AED || 3.67).toFixed(4)),
          SAR: parseFloat((rawRates.SAR || 3.75).toFixed(4)),
          EUR: parseFloat((rawRates.EUR || 0.89).toFixed(4)),
          GBP: parseFloat((rawRates.GBP || 0.76).toFixed(4)),
        };

        const lastUpdated = new Date().toISOString();
        cachedResult = {
          rates: parsedRates,
          lastUpdated,
          expiresAt: now + CACHE_TTL_MS,
        };

        updateCurrenciesRates(parsedRates);

        return {
          base: 'USD',
          rates: parsedRates,
          lastUpdated,
          source: 'live',
        };
      }
    } catch {
      // Continue to next fallback provider
    }
  }

  // Graceful fallback to cached or calibrated defaults
  const fallbackRates = cachedResult?.rates || DEFAULT_RATES;
  updateCurrenciesRates(fallbackRates);
  return {
    base: 'USD',
    rates: fallbackRates,
    lastUpdated: cachedResult?.lastUpdated || new Date().toISOString(),
    source: 'fallback',
  };
}
