import { apiClient } from '@/lib/apiClient';
import type { ApiSuccessResponse, PageResponse } from '@/types/api';

import type { Court } from '../types';

export type PublicCourtListParams = {
  sportId?: number;
  venueId?: number;
  keyword?: string;
  page?: number;
  size?: number;
};

export async function getPublicCourts(
  params: PublicCourtListParams = {},
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<PageResponse<Court>>> {
  return apiClient.get<PageResponse<Court>>('/courts', {
    params,
    signal,
  });
}
