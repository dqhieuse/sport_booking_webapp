import { apiClient } from '@/lib/apiClient';
import type { ApiSuccessResponse } from '@/types/api';

import type {
  AuthUserResponse,
  CurrentUserResponse,
  EmailVerificationResponse,
  LoginRequest,
  LoginResponse,
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

export async function loginLocalAccount(
  request: LoginRequest,
  signal?: AbortSignal,
): Promise<ApiSuccessResponse<LoginResponse>> {
  return apiClient.post<LoginResponse, LoginRequest>('/auth/login', request, { signal });
}

export async function restoreAuthSession(signal?: AbortSignal): Promise<ApiSuccessResponse<LoginResponse>> {
  return apiClient.post<LoginResponse>('/auth/session', undefined, { signal });
}

export async function refreshAuthSession(signal?: AbortSignal): Promise<ApiSuccessResponse<LoginResponse>> {
  return apiClient.post<LoginResponse>('/auth/refresh', undefined, { signal });
}

export async function logoutAccount(signal?: AbortSignal): Promise<ApiSuccessResponse<void>> {
  return apiClient.post<void>('/auth/logout', undefined, { signal });
}

export async function getCurrentUser(signal?: AbortSignal): Promise<ApiSuccessResponse<CurrentUserResponse>> {
  return apiClient.get<CurrentUserResponse>('/auth/me', { signal });
}
