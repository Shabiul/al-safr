import { prisma } from '@/lib/db';

export type MarkupService = 'flights' | 'hotels' | 'cabs';

// Returns a multiplier (e.g. 1.12 for a 12% markup) to apply to the live
// supplier price before showing it to customers. Defaults to 1 (no markup)
// if the CRM hasn't set one for this service yet.
export async function getMarkupMultiplier(service: MarkupService): Promise<number> {
  try {
    const setting = await prisma.markupSetting.findUnique({ where: { service } });
    return 1 + (setting?.percentage ?? 0) / 100;
  } catch {
    return 1;
  }
}
