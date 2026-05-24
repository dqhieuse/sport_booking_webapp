import { apiClient } from '@/lib/apiClient';
import type { ApiSuccessResponse } from '@/types/api';

import type {
  AuthUserResponse,
  EmailVerificationResponse,
  RegisterRequest,
  ResendVerificationRequest,
} from '../types';

export async function registerLocalAccount(
  request: RegisterRequest,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<AuthUserResponse>> {
  return apiClient.post<AuthUserResponse, RegisterRequest>('/auth/register', request, { signal });
}

export async function verifyEmail(
  token: string,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<EmailVerificationResponse>> {
  return apiClient.get<EmailVerificationResponse>('/auth/verify-email', {
    params: { token },
    signal,
  });
}

export async function resendVerificationEmail(
  request: ResendVerificationRequest,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<void>> {
  return apiClient.post<void, ResendVerificationRequest>('/auth/resend-verification', request, { signal });
}
