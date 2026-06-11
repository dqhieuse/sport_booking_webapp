import { apiClient } from '@/lib/apiClient';
import type { ApiSuccessResponse, PageResponse } from '@/types/api';
import type {
  CreateBookingRequest,
  CreateBookingResponse,
  BookingDetailResponse,
  MyBookingResponse,
} from '../types';

export async function createBooking(
  data: CreateBookingRequest,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<CreateBookingResponse>> {
  return apiClient.post<CreateBookingResponse>('/bookings', data, { signal });
}

export async function getBookingDetail(
  id: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<BookingDetailResponse>> {
  return apiClient.get<BookingDetailResponse>(`/bookings/${id}`, { signal });
}

export async function getMyBookings(
  params: { status?: string; page?: number; size?: number } = {},
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<PageResponse<MyBookingResponse>>> {
  return apiClient.get<PageResponse<MyBookingResponse>>('/bookings/my', {
    params,
    signal,
  });
}

export async function cancelBooking(
  id: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<{ bookingId: number; bookingStatus: string; paymentStatus: string }>> {
  return apiClient.put(`/bookings/${id}/cancel`, null, { signal });
}
