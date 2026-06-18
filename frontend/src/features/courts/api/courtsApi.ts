import { apiClient } from '@/lib/apiClient';
import type { ApiSuccessResponse, PageResponse } from '@/types/api';

import type { Court, CourtAvailableSlots, CourtDetail, CourtImage } from '../types';

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
  return apiClient.getCached<PageResponse<Court>>(
    '/courts',
    { params, signal },
    { ttlMs: 30_000 },
  );
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

export async function getCourtAvailableSlots(
  id: number,
  date: string,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<CourtAvailableSlots>> {
  return apiClient.get<CourtAvailableSlots>(`/courts/${id}/available-slots`, {
    params: { date },
    signal,
  });
}
