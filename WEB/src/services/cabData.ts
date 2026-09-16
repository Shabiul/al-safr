// Booking.com's car rental supply only covers these countries (checked
// against the live API — it 422s on anything outside this list, notably
// excluding India, the US, and UAE).
export const CAR_RENTAL_COUNTRIES = [
  'it', 'de', 'nl', 'fr', 'es', 'ca', 'no', 'fi', 'sv', 'da', 'cs', 'hu', 'ro',
  'ja', 'pl', 'el', 'ru', 'tr', 'bg', 'ar', 'ko', 'he', 'lv', 'uk', 'id', 'ms',
  'th', 'et', 'hr', 'lt', 'sk', 'sr', 'sl', 'vi', 'tl',
] as const;

export interface CabLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface CabOption {
  id: string;
  name: string;
  subtitle: string;
  imageUrl: string | null;
  specs: string;
  transmission: string | null;
  supplierName: string;
  supplierRating: number | null;
  pickupLocationLabel: string;
  freeCancellation: boolean;
  priceUsd: number | null;
}
