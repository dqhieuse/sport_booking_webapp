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

export type VenueVendor = {
  id: number;
  fullName: string;
};

export type VenueDetail = Venue & {
  description: string | null;
  vendor: VenueVendor;
};

export type VenueImage = {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
};
