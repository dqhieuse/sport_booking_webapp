import { apiClient } from '../../../lib/apiClient';

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
};

export type BackendHealth = {
  status: string;
  service: string;
  timestamp: string;
};

export async function getBackendHealth(): Promise<ApiResponse<BackendHealth>> {
  const response = await apiClient.get<ApiResponse<BackendHealth>>('/health');
  return response.data;
}
