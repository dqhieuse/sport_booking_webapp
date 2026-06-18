import axios, { type AxiosRequestConfig } from 'axios';

import { appEnv } from '@/config/env';
import { authTokenStore } from '@/lib/authTokenStore';
import { ApiError, toApiError } from '@/lib/apiError';
import type { ApiResponse, ApiSuccessResponse } from '@/types/api';

type CacheEntry = {
  expiresAt: number;
  value: ApiSuccessResponse<unknown>;
};

type CachedGetOptions = {
  ttlMs?: number;
  force?: boolean;
};

const DEFAULT_CACHE_TTL_MS = 60_000;
const getCache = new Map<string, CacheEntry>();
const pendingGets = new Map<string, Promise<ApiSuccessResponse<unknown>>>();

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

function normalizeParams(params: AxiosRequestConfig['params']) {
  if (!params || typeof params !== 'object') {
    return '';
  }

  return Object.entries(params as Record<string, unknown>)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}

function createGetCacheKey(url: string, config?: AxiosRequestConfig) {
  const query = normalizeParams(config?.params);
  return query ? `${url}?${query}` : url;
}

export function invalidateApiCache(urlPrefix?: string) {
  if (!urlPrefix) {
    getCache.clear();
    pendingGets.clear();
    return;
  }

  for (const key of getCache.keys()) {
    if (key.startsWith(urlPrefix)) {
      getCache.delete(key);
    }
  }
}

export const apiClient = {
  get<T>(url: string, config?: AxiosRequestConfig) {
    return request<T>({ ...config, method: 'GET', url });
  },
  getCached<T>(
    url: string,
    config?: AxiosRequestConfig,
    options: CachedGetOptions = {},
  ): Promise<ApiSuccessResponse<T>> {
    const cacheKey = createGetCacheKey(url, config);
    const cached = getCache.get(cacheKey);
    const now = Date.now();

    if (!options.force && cached && cached.expiresAt > now) {
      return Promise.resolve(cached.value as ApiSuccessResponse<T>);
    }

    if (!options.force) {
      const pending = pendingGets.get(cacheKey);
      if (pending) {
        return pending as Promise<ApiSuccessResponse<T>>;
      }
    }

    // A shared request must not be cancelled when only one consumer unmounts.
    const sharedConfig = { ...(config ?? {}) };
    delete sharedConfig.signal;
    const pendingRequest = request<T>({ ...sharedConfig, method: 'GET', url })
      .then((response) => {
        getCache.set(cacheKey, {
          expiresAt: Date.now() + (options.ttlMs ?? DEFAULT_CACHE_TTL_MS),
          value: response,
        });
        return response;
      })
      .finally(() => {
        pendingGets.delete(cacheKey);
      });

    pendingGets.set(cacheKey, pendingRequest as Promise<ApiSuccessResponse<unknown>>);
    return pendingRequest;
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
