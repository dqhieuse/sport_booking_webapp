export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';

export type PaymentMethod = 'VNPAY' | 'CASH_AT_COURT';

export type PaymentStatus =
  | 'PENDING'
  | 'UNPAID'
  | 'PAID'
  | 'FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

export interface CreateBookingRequest {
  courtId: number;
  timeSlotIds: number[];
  bookingDate: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  note?: string;
}

export interface CreatedBookingSlotResponse {
  id: number;
  timeSlotId: number;
  startTime: string;
  endTime: string;
  slotPrice: number;
}

export interface BookingPaymentResponse {
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  paymentUrl: string | null;
}

export interface CreateBookingResponse {
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
}

export interface BookingDetailResponse {
  id: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  note: string | null;
  slots: CreatedBookingSlotResponse[];
  user: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
  };
  court: {
    id: number;
    name: string;
    pricePerHour: number;
  };
  venue: {
    id: number;
    name: string;
    address: string;
  };
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    paidAt: string | null;
  };
  createdAt: string;
}

export interface MyBookingResponse {
  id: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
  court: {
    id: number;
    name: string;
    primaryImageUrl: string | null;
  };
  venue: {
    id: number;
    name: string;
    address: string;
  };
  payment: {
    method: PaymentMethod;
    status: PaymentStatus;
  };
}
