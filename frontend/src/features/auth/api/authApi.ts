import { apiClient } from '@/lib/apiClient';
import type { ApiSuccessResponse } from '@/types/api';

import type { AuthUserResponse, RegisterRequest } from '../types';

export async function registerLocalAccount(
  request: RegisterRequest,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AuthUserResponse>> {
  return apiClient.post<AuthUserResponse, RegisterRequest>('/auth/register', request, { signal });
}
