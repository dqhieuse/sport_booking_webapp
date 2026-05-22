import { apiClient } from '../../../lib/apiClient';

import type { ApiSuccessResponse } from '@/types/api';

export type BackendHealth = {
  status: string;
  service: string;
  timestamp: string;
};

export async function getBackendHealth(): Promise<ApiSuccessResponse<BackendHealth>> {
  return apiClient.get<BackendHealth>('/health');
}
