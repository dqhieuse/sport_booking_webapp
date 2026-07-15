import { apiClient } from "~/lib/apiClient";
import type { Sport } from "~/features/sports/types";

export const sportsApi = {
  getSports() {
    return apiClient.get<Sport[]>("/sports", { auth: false });
  },
  getSport(id: string | number) {
    return apiClient.get<Sport>(`/sports/${id}`, { auth: false });
  },
};
