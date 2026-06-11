package com.sportbooking.module.booking.dto;

import com.sportbooking.module.booking.entity.BookingStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record MyBookingResponse(
        Long id,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime,
        BigDecimal totalPrice,
        BookingStatus status,
        MyBookingCourtResponse court,
        MyBookingVenueResponse venue,
        MyBookingPaymentResponse payment
) {
}
