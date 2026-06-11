package com.sportbooking.module.booking.dto;

import java.math.BigDecimal;
import java.time.LocalTime;

public record CreatedBookingSlotResponse(
        Long id,
        Long timeSlotId,
        LocalTime startTime,
        LocalTime endTime,
        BigDecimal slotPrice
) {
}
