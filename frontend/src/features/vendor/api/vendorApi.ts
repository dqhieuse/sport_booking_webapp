import { apiClient, invalidateApiCache } from '@/lib/apiClient';
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
  return apiClient.getCached<PageResponse<VendorVenue>>('/vendor/venues', { params, signal });
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
  const response = await apiClient.post<VendorVenueDetail, VendorVenueRequest>('/vendor/venues', data);
  invalidateApiCache('/vendor/venues');
  return response;
}

export async function updateVendorVenue(
  id: number,
  data: VendorVenueRequest,
): Promise<ApiSuccessResponse<VendorVenueDetail>> {
  const response = await apiClient.put<VendorVenueDetail, VendorVenueRequest>(`/vendor/venues/${id}`, data);
  invalidateApiCache('/vendor/venues');
  return response;
}

export async function deactivateVendorVenue(id: number): Promise<ApiSuccessResponse<VendorVenueDetail>> {
  const response = await apiClient.delete<VendorVenueDetail>(`/vendor/venues/${id}`);
  invalidateApiCache('/vendor/venues');
  invalidateApiCache('/vendor/courts');
  return response;
}

export async function uploadVendorVenueImage(
  id: number,
  file: File,
  options: { sortOrder?: number; isPrimary?: boolean } = {},
): Promise<ApiSuccessResponse<VendorManagedImage>> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.postForm<VendorManagedImage>(`/vendor/venues/${id}/images`, formData, {
    params: {
      sortOrder: options.sortOrder,
      isPrimary: options.isPrimary ?? false,
    },
  });
  invalidateApiCache('/vendor/venues');
  return response;
}

export async function deleteVendorVenueImage(id: number, imageId: number): Promise<ApiSuccessResponse<void>> {
  const response = await apiClient.delete<void>(`/vendor/venues/${id}/images/${imageId}`);
  invalidateApiCache('/vendor/venues');
  return response;
}

export async function setPrimaryVendorVenueImage(
  id: number,
  imageId: number,
): Promise<ApiSuccessResponse<VendorManagedImage>> {
  const response = await apiClient.put<VendorManagedImage>(`/vendor/venues/${id}/images/${imageId}/primary`);
  invalidateApiCache('/vendor/venues');
  return response;
}

export async function getVendorCourts(
  params: VendorCourtListParams = {},
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<PageResponse<VendorCourt>>> {
  return apiClient.getCached<PageResponse<VendorCourt>>('/vendor/courts', { params, signal });
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
  const response = await apiClient.post<VendorCourtDetail, VendorCourtRequest>('/vendor/courts', data);
  invalidateApiCache('/vendor/courts');
  invalidateApiCache('/vendor/venues');
  return response;
}

export async function updateVendorCourt(
  id: number,
  data: VendorCourtRequest,
): Promise<ApiSuccessResponse<VendorCourtDetail>> {
  const response = await apiClient.put<VendorCourtDetail, VendorCourtRequest>(`/vendor/courts/${id}`, data);
  invalidateApiCache('/vendor/courts');
  invalidateApiCache('/vendor/venues');
  return response;
}

export async function deactivateVendorCourt(id: number): Promise<ApiSuccessResponse<VendorCourtDetail>> {
  const response = await apiClient.delete<VendorCourtDetail>(`/vendor/courts/${id}`);
  invalidateApiCache('/vendor/courts');
  return response;
}

export async function uploadVendorCourtImage(
  id: number,
  file: File,
  options: { sortOrder?: number; isPrimary?: boolean } = {},
): Promise<ApiSuccessResponse<VendorManagedImage>> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.postForm<VendorManagedImage>(`/vendor/courts/${id}/images`, formData, {
    params: {
      sortOrder: options.sortOrder,
      isPrimary: options.isPrimary ?? false,
    },
  });
  invalidateApiCache('/vendor/courts');
  return response;
}

export async function deleteVendorCourtImage(id: number, imageId: number): Promise<ApiSuccessResponse<void>> {
  const response = await apiClient.delete<void>(`/vendor/courts/${id}/images/${imageId}`);
  invalidateApiCache('/vendor/courts');
  return response;
}

export async function setPrimaryVendorCourtImage(
  id: number,
  imageId: number,
): Promise<ApiSuccessResponse<VendorManagedImage>> {
  const response = await apiClient.put<VendorManagedImage>(`/vendor/courts/${id}/images/${imageId}/primary`);
  invalidateApiCache('/vendor/courts');
  return response;
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
  const response = await apiClient.put<VendorCourtTimeSlot[], { timeSlotIds: number[] }>(`/vendor/courts/${id}/time-slots`, {
    timeSlotIds,
  });
  invalidateApiCache('/vendor/courts');
  return response;
}
