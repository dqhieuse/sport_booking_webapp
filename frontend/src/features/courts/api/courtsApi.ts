import { apiClient } from '@/lib/apiClient';
import type { ApiSuccessResponse, PageResponse } from '@/types/api';

import type { Court, CourtDetail, CourtImage } from '../types';

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

export async function getPublicCourtById(
  id: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<CourtDetail>> {
  return apiClient.get<CourtDetail>(`/courts/${id}`, { signal });
}

export async function getPublicCourtImages(
  id: number,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<CourtImage[]>> {
  return apiClient.get<CourtImage[]>(`/courts/${id}/images`, { signal });
}
