import { apiClient } from '@/lib/apiClient';
import type { ApiSuccessResponse, PageResponse } from '@/types/api';

import type { Venue } from '../types';

export type PublicVenueListParams = {
  keyword?: string;
  page?: number;
  size?: number;
};

export async function getPublicVenues(
  params: PublicVenueListParams = {},
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<PageResponse<Venue>>> {
  return apiClient.get<PageResponse<Venue>>('/venues', {
    params,
    signal,
  });
}
