import { apiClient } from '@/lib/apiClient';
import type { ApiSuccessResponse, PageResponse } from '@/types/api';

import type { Venue, VenueDetail, VenueImage } from '../types';

export type PublicVenueListParams = {
  keyword?: string;
  page?: number;
  size?: number;
};

export async function getPublicVenues(
  params: PublicVenueListParams = {},
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<PageResponse<Venue>>> {
  return apiClient.getCached<PageResponse<Venue>>(
    '/venues',
    { params, signal },
    { ttlMs: 60_000 },
  );
}

export async function getPublicVenueById(
  id: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<VenueDetail>> {
  return apiClient.get<VenueDetail>(`/venues/${id}`, { signal });
}

export async function getPublicVenueImages(
  id: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<VenueImage[]>> {
  return apiClient.get<VenueImage[]>(`/venues/${id}/images`, { signal });
}
