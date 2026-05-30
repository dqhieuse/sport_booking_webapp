package com.sportbooking.module.court.dto;

import java.time.LocalTime;

public record VendorCourtTimeSlotResponse(
        Long id,
        LocalTime startTime,
        LocalTime endTime
) {
}
