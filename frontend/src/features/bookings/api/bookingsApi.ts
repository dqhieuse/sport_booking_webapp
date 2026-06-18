import { apiClient } from '@/lib/apiClient';
import type { ApiSuccessResponse, PageResponse } from '@/types/api';

import type {
  BookingCancellationResponse,
  BookingDetailResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  MyBookingResponse,
  BookingStatus,
  VendorBookingActionResponse,
  VendorBookingResponse,
  VendorCreateBookingRequest,
  VendorCustomerLookupResponse,
} from '../types';

export async function createBooking(data: CreateBookingRequest, signal?: AbortSignal) {
  return apiClient.post<CreateBookingResponse>('/bookings', data, { signal });
}

export async function createVendorBooking(data: VendorCreateBookingRequest, signal?: AbortSignal) {
  return apiClient.post<CreateBookingResponse>('/vendor/bookings', data, { signal });
}

export async function lookupVendorCustomer(identifier: string, signal?: AbortSignal) {
  return apiClient.get<VendorCustomerLookupResponse>('/vendor/bookings/customer-lookup', {
    params: { identifier },
    signal,
  });
}

export type MyBookingsParams = {
  page?: number;
  size?: number;
};

export async function getMyBookings(
  params?: MyBookingsParams,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<PageResponse<MyBookingResponse>>> {
  return apiClient.get<PageResponse<MyBookingResponse>>('/bookings/my', { params, signal });
}

export async function getBookingDetail(
  bookingId: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<BookingDetailResponse>> {
  return apiClient.get<BookingDetailResponse>(`/bookings/${bookingId}`, { signal });
}

export async function cancelBooking(
  bookingId: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<BookingCancellationResponse>> {
  return apiClient.put<BookingCancellationResponse>(`/bookings/${bookingId}/cancel`, undefined, { signal });
}

export type VendorBookingsParams = {
  status?: BookingStatus;
  courtId?: number;
  date?: string;
  sortBy?: 'createdAt' | 'bookingDate' | 'totalPrice';
  direction?: 'asc' | 'desc';
  page?: number;
  size?: number;
};

export async function getVendorBookings(
  params: VendorBookingsParams = {},
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<PageResponse<VendorBookingResponse>>> {
  return apiClient.get<PageResponse<VendorBookingResponse>>('/vendor/bookings', { params, signal });
}

export async function getVendorBookingDetail(
  bookingId: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<BookingDetailResponse>> {
  return apiClient.get<BookingDetailResponse>(`/bookings/${bookingId}`, { signal });
}

function updateVendorBooking(bookingId: number, action: string) {
  return apiClient.put<VendorBookingActionResponse>(
    `/vendor/bookings/${bookingId}/${action}`,
  );
}

export function confirmVendorBooking(bookingId: number) {
  return updateVendorBooking(bookingId, 'confirm');
}

export function rejectVendorBooking(bookingId: number) {
  return updateVendorBooking(bookingId, 'reject');
}

export function cancelVendorBooking(bookingId: number) {
  return updateVendorBooking(bookingId, 'cancel');
}

export function markVendorBookingCashPaid(bookingId: number) {
  return updateVendorBooking(bookingId, 'mark-cash-paid');
}
