export type VenueStatus = 'ACTIVE' | 'INACTIVE';

export type Venue = {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  openingTime: string;
  closingTime: string;
  status: VenueStatus;
  primaryImageUrl: string | null;
};
