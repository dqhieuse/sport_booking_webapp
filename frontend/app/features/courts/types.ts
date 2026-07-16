export type Court = {
  id: number;
  name: string;
  description?: string;
  sportId?: number;
  sportName?: string;
  venueId?: number;
  venueName?: string;
  venueAddress?: string;
  venueOpeningTime?: string;
  venueClosingTime?: string;
  pricePerHour?: number;
  primaryImageUrl?: string;
  status?: string;
};
