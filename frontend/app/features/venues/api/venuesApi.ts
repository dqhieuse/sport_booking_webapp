import { apiClient } from "~/lib/apiClient";
import type { PageResponse } from "~/types/api";
import type { Venue } from "~/features/venues/types";

export const venuesApi = {
  getVenues() {
    return apiClient.get<PageResponse<Venue> | Venue[]>("/venues", {
      auth: false,
    });
  },
  getVenue(id: string | number) {
    return apiClient.get<Venue>(`/venues/${id}`, { auth: false });
  },
};
