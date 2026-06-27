import { apiClient } from "@/lib/api-client"
import type {
  ApiResponse,
  Court,
  CourtFilters,
  PageResponse,
  Sport,
  Venue,
} from "@/types/public-api"

function unwrap<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message || "Không thể tải dữ liệu")
  }

  return response.data
}

export async function getSports(signal?: AbortSignal) {
  const response = await apiClient.get<ApiResponse<Sport[]>>("/sports", { signal })
  return unwrap(response.data)
}

export async function getFeaturedVenues(signal?: AbortSignal) {
  const response = await apiClient.get<ApiResponse<PageResponse<Venue>>>("/venues", {
    params: { page: 0, size: 3 },
    signal,
  })
  return unwrap(response.data)
}

export async function getCourts(filters: CourtFilters = {}, signal?: AbortSignal) {
  const response = await apiClient.get<ApiResponse<PageResponse<Court>>>("/courts", {
    params: {
      keyword: filters.keyword || undefined,
      sportId: filters.sportId,
      page: filters.page ?? 0,
      size: filters.size ?? 6,
    },
    signal,
  })
  return unwrap(response.data)
}
