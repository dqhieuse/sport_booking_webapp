import { apiClient } from '@/lib/apiClient';
import type { ApiSuccessResponse } from '@/types/api';

import type { Sport } from '../types';

export async function getPublicSports(signal?: AbortSignal): Promise<ApiSuccessResponse<Sport[]>> {
  return apiClient.get<Sport[]>('/sports', { signal });
}
