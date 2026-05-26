import axios, { type AxiosRequestConfig } from 'axios';

import { appEnv } from '@/config/env';
import { authTokenStore } from '@/lib/authTokenStore';
import { ApiError, toApiError } from '@/lib/apiError';
import type { ApiResponse, ApiSuccessResponse } from '@/types/api';

const axiosClient = axios.create({
  baseURL: appEnv.apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = authTokenStore.getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

async function request<T>(config: AxiosRequestConfig): Promise<ApiSuccessResponse<T>> {
  try {
    const response = await axiosClient.request<ApiResponse<T>>(config);
    const payload = response.data;

    if (!payload.success) {
      throw new ApiError({
        message: payload.message,
        errors: payload.errors,
        status: response.status,
      });
    }

    return payload;
  } catch (error) {
    throw toApiError(error);
  }
}

export const apiClient = {
  get<T>(url: string, config?: AxiosRequestConfig) {
    return request<T>({ ...config, method: 'GET', url });
  },
  post<T, B = unknown>(url: string, data?: B, config?: AxiosRequestConfig) {
    return request<T>({ ...config, method: 'POST', url, data });
  },
  postForm<T>(url: string, data: FormData, config?: AxiosRequestConfig) {
    return request<T>({
      ...config,
      method: 'POST',
      url,
      data,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  put<T, B = unknown>(url: string, data?: B, config?: AxiosRequestConfig) {
    return request<T>({ ...config, method: 'PUT', url, data });
  },
  patch<T, B = unknown>(url: string, data?: B, config?: AxiosRequestConfig) {
    return request<T>({ ...config, method: 'PATCH', url, data });
  },
  delete<T>(url: string, config?: AxiosRequestConfig) {
    return request<T>({ ...config, method: 'DELETE', url });
  },
};

export { axiosClient };
