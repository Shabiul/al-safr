export interface HotelOption {
  id: string;
  name: string;
  address: string;
  city: string;
  stars: number;
  reviewScore: number | null;
  reviewCount: number | null;
  priceUsd: number | null;
  photoUrl: string | null;
  distanceToCenterKm: number | null;
  bookingUrl: string;
}
