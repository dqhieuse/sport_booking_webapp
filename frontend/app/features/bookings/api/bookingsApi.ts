import { apiClient } from "~/lib/apiClient";
import type { Booking } from "~/features/bookings/types";
import type { PageResponse } from "~/types/api";

export const bookingsApi = {
  getMyBookings() {
    return apiClient.get<PageResponse<Booking> | Booking[]>("/bookings");
  },
  getBooking(id: string | number) {
    return apiClient.get<Booking>(`/bookings/${id}`);
  },
};
