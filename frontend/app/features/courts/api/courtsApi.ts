import { apiClient } from "~/lib/apiClient";
import type { Court } from "~/features/courts/types";
import type { PageResponse } from "~/types/api";

export const courtsApi = {
  getCourts() {
    return apiClient.get<PageResponse<Court> | Court[]>("/courts", {
      auth: false,
    });
  },
  getCourt(id: string | number) {
    return apiClient.get<Court>(`/courts/${id}`, { auth: false });
  },
};
