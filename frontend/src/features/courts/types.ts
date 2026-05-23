export type CourtStatus = 'ACTIVE' | 'INACTIVE';

export type CourtSport = {
  id: number;
  name: string;
};

export type CourtVenue = {
  id: number;
  name: string;
  address: string;
};

export type CourtVenueDetail = {
  id: number;
  name: string;
  address: string;
  openingTime: string | null;
  closingTime: string | null;
};

export type Court = {
  id: number;
  name: string;
  pricePerHour: number;
  status: CourtStatus;
  sport: CourtSport;
  venue: CourtVenue;
  primaryImageUrl: string | null;
};

export type CourtDetail = {
  id: number;
  name: string;
  description: string | null;
  pricePerHour: number;
  status: CourtStatus;
  sport: CourtSport;
  venue: CourtVenueDetail;
  primaryImageUrl: string | null;
};

export type CourtImage = {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
};
