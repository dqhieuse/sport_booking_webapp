import type { CourtStatus, CourtSport } from '@/features/courts/types';
import type { VenueStatus } from '@/features/venues/types';

export type VendorVenue = {
  id: number;
  name: string;
  address: string;
  phone: string;
  openingTime: string;
  closingTime: string;
  status: VenueStatus;
  primaryImageUrl: string | null;
  courtCount: number;
  createdAt: string;
};

export type VendorVenueDetail = {
  id: number;
  name: string;
  address: string;
  description: string | null;
  phone: string;
  openingTime: string;
  closingTime: string;
  status: VenueStatus;
  primaryImageUrl: string | null;
};

export type VendorVenueRequest = {
  name: string;
  address: string;
  description?: string | null;
  phone: string;
  openingTime: string;
  closingTime: string;
};

export type VendorCourtVenue = {
  id: number;
  name: string;
};

export type VendorCourt = {
  id: number;
  name: string;
  pricePerHour: number;
  status: CourtStatus;
  sport: CourtSport;
  venue: VendorCourtVenue;
  primaryImageUrl: string | null;
  activeTimeSlotCount: number;
  createdAt: string;
};

export type VendorCourtTimeSlot = {
  timeSlotId: number;
  startTime: string;
  endTime: string;
  status: 'ACTIVE' | 'INACTIVE';
};

export type VendorManagedImage = {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
};

export type VendorCourtDetail = {
  id: number;
  name: string;
  description: string | null;
  pricePerHour: number;
  status: CourtStatus;
  sport: CourtSport;
  venue: VendorCourtVenue;
  primaryImageUrl: string | null;
  activeTimeSlots: Array<{
    timeSlotId: number;
    startTime: string;
    endTime: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type VendorCourtRequest = {
  name: string;
  sportId: number;
  venueId: number;
  pricePerHour: number;
  description?: string | null;
  timeSlotIds?: number[];
};
