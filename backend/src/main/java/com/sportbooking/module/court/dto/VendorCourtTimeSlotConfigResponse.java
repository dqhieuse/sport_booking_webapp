package com.sportbooking.module.court.dto;

import com.sportbooking.module.timeslot.entity.TimeSlotStatus;
import java.time.LocalTime;

public record VendorCourtTimeSlotConfigResponse(
        Long timeSlotId,
        LocalTime startTime,
        LocalTime endTime,
        TimeSlotStatus status
) {
}
