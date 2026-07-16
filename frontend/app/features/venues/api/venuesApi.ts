import { apiClient } from "~/lib/apiClient";
import type { PageResponse } from "~/types/api";
import type { Venue } from "~/features/venues/types";

export type VenueListParams = {
  keyword?: string | null;
  status?: string | null;
  page?: number;
  size?: number;
};

export const venuesApi = {
  getVenues(params: VenueListParams = {}) {
    return apiClient.get<PageResponse<Venue> | Venue[]>(
      `/venues${buildQueryString(params)}`,
      {
        auth: false,
      },
    );
  },
  getVenue(id: string | number) {
    return apiClient.get<Venue>(`/venues/${id}`, {
      auth: false,
    });
  },
};

function buildQueryString(params: VenueListParams) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}
