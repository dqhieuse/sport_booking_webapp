package com.sportbooking.module.court.dto;

import java.time.LocalTime;

public record AvailableTimeSlotResponse(
        Long id,
        LocalTime startTime,
        LocalTime endTime,
        AvailableTimeSlotStatus status
) {
}
