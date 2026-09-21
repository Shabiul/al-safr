export interface TourPackageItineraryDay {
  day: number;
  title: string;
  description: string;
}

export interface TourPackage {
  id: string;
  slug: string;
  name: string;
  destination: string;
  summary: string;
  description: string;
  durationDays: number;
  priceUsd: number;
  images: string[];
  inclusions: string[];
  exclusions: string[];
  itinerary: TourPackageItineraryDay[];
  // Real, staff-set fields (via the CRM) rather than fabricated review data:
  // featured is an editorial "we're calling this one out" flag, tourType is
  // how the trip is actually run, and originalPriceUsd only produces a
  // strike-through discount when a genuine former price is set.
  featured?: boolean;
  tourType?: string | null;
  originalPriceUsd?: number | null;
}
