import { apiClient } from "~/lib/apiClient";
import type { Court } from "~/features/courts/types";
import type { PageResponse } from "~/types/api";

type CourtApiResponse = {
  id: number;
  name: string;
  description?: string;
  pricePerHour?: number;
  status?: string;
  sport?: {
    id: number;
    name: string;
  };
  venue?: {
    id: number;
    name: string;
    address?: string;
    openingTime?: string;
    closingTime?: string;
  };
  primaryImageUrl?: string;
};

export type CourtListParams = {
  sportId?: string | number | null;
  venueId?: string | number | null;
  keyword?: string | null;
  status?: string | null;
  page?: number;
  size?: number;
};

export const courtsApi = {
  async getCourts(params: CourtListParams = {}) {
    const response = await apiClient.get<PageResponse<CourtApiResponse> | CourtApiResponse[]>(
      `/courts${buildQueryString(params)}`,
      {
        auth: false,
      },
    );

    return {
      ...response,
      data: normalizeCourtPageData(response.data),
    };
  },
  async getCourt(id: string | number) {
    const response = await apiClient.get<CourtApiResponse>(`/courts/${id}`, {
      auth: false,
    });

    return {
      ...response,
      data: normalizeCourt(response.data),
    };
  },
};

function buildQueryString(params: CourtListParams) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

function normalizeCourtPageData(data: PageResponse<CourtApiResponse> | CourtApiResponse[]) {
  if (Array.isArray(data)) {
    return data.map(normalizeCourt);
  }

  return {
    ...data,
    items: data.items.map(normalizeCourt),
  };
}

function normalizeCourt(court: CourtApiResponse): Court {
  return {
    id: court.id,
    name: court.name,
    description: court.description,
    sportId: court.sport?.id,
    sportName: court.sport?.name,
    venueId: court.venue?.id,
    venueName: court.venue?.name,
    venueAddress: court.venue?.address,
    venueOpeningTime: court.venue?.openingTime,
    venueClosingTime: court.venue?.closingTime,
    pricePerHour: court.pricePerHour,
    primaryImageUrl: court.primaryImageUrl,
    status: court.status,
  };
}
