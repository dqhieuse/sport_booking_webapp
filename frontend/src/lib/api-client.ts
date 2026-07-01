import axios, { type InternalAxiosRequestConfig } from "axios"

import type { ApiResponse } from "@/types/public-api"

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

type RefreshResult = {
  accessToken: string
}

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api"
const nonRefreshableAuthPaths = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/session",
  "/auth/refresh",
  "/auth/logout",
  "/auth/verify-email",
  "/auth/resend-verification",
])

let accessToken: string | null = null
let refreshRequest: Promise<string> | null = null
let sessionExpiredHandler: (() => void) | null = null

export const apiClient = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
  },
  timeout: 10_000,
  withCredentials: true,
})

const refreshClient = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
  },
  timeout: 10_000,
  withCredentials: true,
})

export function setApiAccessToken(token: string | null) {
  accessToken = token
}

export function setApiSessionExpiredHandler(handler: (() => void) | null) {
  sessionExpiredHandler = handler
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) throw error

    const originalRequest = error.config as RetryableRequestConfig | undefined
    const requestPath = originalRequest?.url?.split("?", 1)[0]
    const shouldRefresh = error.response?.status === 401
      && originalRequest
      && !originalRequest._retry
      && requestPath
      && !nonRefreshableAuthPaths.has(requestPath)

    if (!shouldRefresh) throw error

    originalRequest._retry = true

    try {
      const newAccessToken = await refreshAccessToken()
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return apiClient.request(originalRequest)
    } catch (refreshError) {
      setApiAccessToken(null)
      sessionExpiredHandler?.()
      throw refreshError
    }
  },
)

function refreshAccessToken() {
  if (!refreshRequest) {
    refreshRequest = refreshClient
      .post<ApiResponse<RefreshResult>>("/auth/refresh")
      .then((response) => {
        if (!response.data.success || !response.data.data?.accessToken) {
          throw new Error(response.data.message || "Không thể làm mới phiên đăng nhập.")
        }

        setApiAccessToken(response.data.data.accessToken)
        return response.data.data.accessToken
      })
      .finally(() => {
        refreshRequest = null
      })
  }

  return refreshRequest
}
