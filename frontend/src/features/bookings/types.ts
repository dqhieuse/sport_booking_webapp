export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED' | 'REFUND_FAILED';

export type PaymentMethod = 'VNPAY' | 'CASH_AT_COURT';

export type CreateBookingRequest = {
  courtId: number;
  timeSlotIds: number[];
  bookingDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  note?: string;
};

export type VendorCreateBookingRequest = {
  customerName: string;
  customerPhone?: string;
  customerIdentifier?: string;
  courtId: number;
  timeSlotIds: number[];
  bookingDate: string;
  paymentMethod: PaymentMethod;
  note?: string;
};

export type VendorCustomerLookupResponse = {
  found: boolean;
  userId: number | null;
  fullName: string | null;
  email: string | null;
  phone: string | null;
};

export type CreatedBookingSlotResponse = {
  id: number;
  timeSlotId: number;
  startTime: string;
  endTime: string;
  slotPrice: number;
};

export type BookingPaymentResponse = {
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  paymentUrl?: string; // Present if VNPAY
};

export type CreateBookingResponse = {
  id: number;
  courtId: number;
  courtName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalPrice: number;
  status: BookingStatus;
  slots: CreatedBookingSlotResponse[];
  payment: BookingPaymentResponse;
};

export type MyBookingCourtResponse = {
  id: number;
  name: string;
  primaryImageUrl: string | null;
};

export type MyBookingVenueResponse = {
  id: number;
  name: string;
  address: string;
};

export type MyBookingPaymentResponse = {
  method: PaymentMethod;
  status: PaymentStatus;
};

export type MyBookingResponse = {
  id: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  court: MyBookingCourtResponse;
  venue: MyBookingVenueResponse;
  payment: MyBookingPaymentResponse;
};

export type BookingDetailUserResponse = {
  id: number | null;
  fullName: string;
  email: string | null;
  phone: string | null;
};

export type BookingDetailCourtResponse = {
  id: number;
  name: string;
  pricePerHour: number;
};

export type BookingDetailVenueResponse = {
  id: number;
  name: string;
  address: string;
};

export type BookingDetailPaymentResponse = {
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  paidAt: string | null;
};

export type BookingDetailResponse = {
  id: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  note: string | null;
  slots: CreatedBookingSlotResponse[];
  user: BookingDetailUserResponse;
  court: BookingDetailCourtResponse;
  venue: BookingDetailVenueResponse;
  payment: BookingDetailPaymentResponse;
  createdAt: string;
};

export type BookingCancellationResponse = {
  bookingId: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
};
