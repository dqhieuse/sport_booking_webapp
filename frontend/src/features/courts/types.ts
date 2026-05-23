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

export type Court = {
  id: number;
  name: string;
  pricePerHour: number;
  status: CourtStatus;
  sport: CourtSport;
  venue: CourtVenue;
  primaryImageUrl: string | null;
};
