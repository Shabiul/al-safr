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
  // theme is a real editorial tag staff assign (Adventure, Beach, Cultural,
  // ...) so the "Package Theme" filter has genuine data behind it instead
  // of an invented category. hotelCategory is the star rating of the
  // accommodation actually included in the package. freeCancellation is a
  // real operational flag, not a marketing default.
  theme?: string | null;
  hotelCategory?: number | null;
  freeCancellation?: boolean;
}
