export type Venue = {
  id: number;
  name: string;
  address: string;
  description?: string;
  phone?: string;
  openingTime?: string;
  closingTime?: string;
  primaryImageUrl?: string;
  status?: string;
  vendor?: {
    id: number;
    fullName: string;
  };
};
