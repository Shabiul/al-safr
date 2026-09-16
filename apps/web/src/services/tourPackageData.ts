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
}
