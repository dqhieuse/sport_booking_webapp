package com.sportbooking.module.booking.dto;

import java.math.BigDecimal;

public record BookingDetailCourtResponse(
        Long id,
        String name,
        BigDecimal pricePerHour
) {
}
