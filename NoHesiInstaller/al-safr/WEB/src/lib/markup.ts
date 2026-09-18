import { db } from '@/lib/db';

export type MarkupService = 'flights' | 'hotels' | 'cabs';

// Returns a multiplier (e.g. 1.12 for a 12% markup) to apply to the live
// supplier price before showing it to customers. Defaults to 1 (no markup)
// if the CRM hasn't set one for this service yet.
export async function getMarkupMultiplier(service: MarkupService): Promise<number> {
  try {
    const { data } = await db.from('MarkupSetting').select('percentage').eq('service', service).maybeSingle();
    return 1 + (data?.percentage ?? 0) / 100;
  } catch {
    return 1;
  }
}
