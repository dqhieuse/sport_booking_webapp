package com.sportbooking.module.court.dto;

import java.time.LocalDate;
import java.util.List;

public record CourtAvailableSlotsResponse(
        Long courtId,
        LocalDate bookingDate,
        List<AvailableTimeSlotResponse> items
) {
}
