export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";

export type Booking = {
  id: number;
  code?: string;
  courtName: string;
  venueName: string;
  bookingDate: string;
  status: BookingStatus;
  totalAmount?: number;
};
