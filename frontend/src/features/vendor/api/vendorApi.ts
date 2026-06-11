import { apiClient } from '@/lib/apiClient';
import type { ApiSuccessResponse, PageResponse } from '@/types/api';

import type {
  VendorCourt,
  VendorCourtDetail,
  VendorCourtRequest,
  VendorCourtTimeSlot,
  VendorManagedImage,
  VendorVenue,
  VendorVenueDetail,
  VendorVenueRequest,
} from '../types';

export type VendorVenueListParams = {
  status?: 'ACTIVE' | 'INACTIVE';
  page?: number;
  size?: number;
};

export type VendorCourtListParams = {
  venueId?: number;
  sportId?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  page?: number;
  size?: number;
};

export async function getVendorVenues(
  params: VendorVenueListParams = {},
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<PageResponse<VendorVenue>>> {
  return apiClient.get<PageResponse<VendorVenue>>('/vendor/venues', { params, signal });
}

export async function getVendorVenueById(
  id: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<VendorVenueDetail>> {
  return apiClient.get<VendorVenueDetail>(`/vendor/venues/${id}`, { signal });
}

export async function createVendorVenue(
  data: VendorVenueRequest,
): Promise<ApiSuccessResponse<VendorVenueDetail>> {
  return apiClient.post<VendorVenueDetail, VendorVenueRequest>('/vendor/venues', data);
}

export async function updateVendorVenue(
  id: number,
  data: VendorVenueRequest,
): Promise<ApiSuccessResponse<VendorVenueDetail>> {
  return apiClient.put<VendorVenueDetail, VendorVenueRequest>(`/vendor/venues/${id}`, data);
}

export async function deactivateVendorVenue(id: number): Promise<ApiSuccessResponse<VendorVenueDetail>> {
  return apiClient.delete<VendorVenueDetail>(`/vendor/venues/${id}`);
}

export async function uploadVendorVenueImage(
  id: number,
  file: File,
  options: { sortOrder?: number; isPrimary?: boolean } = {},
): Promise<ApiSuccessResponse<VendorManagedImage>> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.postForm<VendorManagedImage>(`/vendor/venues/${id}/images`, formData, {
    params: {
      sortOrder: options.sortOrder,
      isPrimary: options.isPrimary ?? false,
    },
  });
}

export async function deleteVendorVenueImage(id: number, imageId: number): Promise<ApiSuccessResponse<void>> {
  return apiClient.delete<void>(`/vendor/venues/${id}/images/${imageId}`);
}

export async function setPrimaryVendorVenueImage(
  id: number,
  imageId: number,
): Promise<ApiSuccessResponse<VendorManagedImage>> {
  return apiClient.put<VendorManagedImage>(`/vendor/venues/${id}/images/${imageId}/primary`);
}

export async function getVendorCourts(
  params: VendorCourtListParams = {},
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<PageResponse<VendorCourt>>> {
  return apiClient.get<PageResponse<VendorCourt>>('/vendor/courts', { params, signal });
}

export async function getVendorCourtById(
  id: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<VendorCourtDetail>> {
  return apiClient.get<VendorCourtDetail>(`/vendor/courts/${id}`, { signal });
}

export async function createVendorCourt(
  data: VendorCourtRequest,
): Promise<ApiSuccessResponse<VendorCourtDetail>> {
  return apiClient.post<VendorCourtDetail, VendorCourtRequest>('/vendor/courts', data);
}

export async function updateVendorCourt(
  id: number,
  data: VendorCourtRequest,
): Promise<ApiSuccessResponse<VendorCourtDetail>> {
  return apiClient.put<VendorCourtDetail, VendorCourtRequest>(`/vendor/courts/${id}`, data);
}

export async function deactivateVendorCourt(id: number): Promise<ApiSuccessResponse<VendorCourtDetail>> {
  return apiClient.delete<VendorCourtDetail>(`/vendor/courts/${id}`);
}

export async function uploadVendorCourtImage(
  id: number,
  file: File,
  options: { sortOrder?: number; isPrimary?: boolean } = {},
): Promise<ApiSuccessResponse<VendorManagedImage>> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.postForm<VendorManagedImage>(`/vendor/courts/${id}/images`, formData, {
    params: {
      sortOrder: options.sortOrder,
      isPrimary: options.isPrimary ?? false,
    },
  });
}

export async function deleteVendorCourtImage(id: number, imageId: number): Promise<ApiSuccessResponse<void>> {
  return apiClient.delete<void>(`/vendor/courts/${id}/images/${imageId}`);
}

export async function setPrimaryVendorCourtImage(
  id: number,
  imageId: number,
): Promise<ApiSuccessResponse<VendorManagedImage>> {
  return apiClient.put<VendorManagedImage>(`/vendor/courts/${id}/images/${imageId}/primary`);
}

export async function getVendorCourtTimeSlots(
  id: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<VendorCourtTimeSlot[]>> {
  return apiClient.get<VendorCourtTimeSlot[]>(`/vendor/courts/${id}/time-slots`, { signal });
}

export async function updateVendorCourtTimeSlots(
  id: number,
  timeSlotIds: number[],
): Promise<ApiSuccessResponse<VendorCourtTimeSlot[]>> {
  return apiClient.put<VendorCourtTimeSlot[], { timeSlotIds: number[] }>(`/vendor/courts/${id}/time-slots`, {
    timeSlotIds,
  });
}
