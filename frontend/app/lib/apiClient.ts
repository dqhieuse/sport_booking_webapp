import { appEnv } from "~/config/env";
import { ApiError } from "~/lib/apiError";
import { authTokenStore } from "~/lib/authTokenStore";
import type { ApiResponse } from "~/types/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
  refreshOnUnauthorized?: boolean;
};

let refreshAccessTokenPromise: Promise<string | null> | null = null;

async function refreshAccessToken() {
  if (!refreshAccessTokenPromise) {
    refreshAccessTokenPromise = (async () => {
      const response = await fetch(`${appEnv.apiBaseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      const body = await response.json().catch(() => undefined);

      if (!response.ok || !body?.data?.accessToken) {
        authTokenStore.clearAccessToken();
        return null;
      }

      authTokenStore.setAccessToken(body.data.accessToken);
      return body.data.accessToken as string;
    })().finally(() => {
      refreshAccessTokenPromise = null;
    });
  }

  return refreshAccessTokenPromise;
}

async function request<T>(path: string, options: RequestOptions = {}) {
  return requestInternal<T>(path, options, false);
}

async function requestInternal<T>(
  path: string,
  options: RequestOptions = {},
  hasRetried: boolean,
) {
  const headers = new Headers(options.headers);
  const token = options.auth === false ? null : authTokenStore.getAccessToken();

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${appEnv.apiBaseUrl}${path}`, {
    ...options,
    headers,
    credentials: "include",
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const body = await response.json().catch(() => undefined);

  if (!response.ok) {
    const shouldRefresh =
      response.status === 401 &&
      options.auth !== false &&
      options.refreshOnUnauthorized !== false &&
      !hasRetried;

    if (shouldRefresh) {
      const nextToken = await refreshAccessToken();

      if (nextToken) {
        return requestInternal<T>(path, options, true);
      }
    }

    throw new ApiError(response.status, body);
  }

  return body as ApiResponse<T>;
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "GET" });
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "POST", body });
  },
  put<T>(path: string, body?: unknown, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "PUT", body });
  },
  delete<T>(path: string, options?: RequestOptions) {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};
