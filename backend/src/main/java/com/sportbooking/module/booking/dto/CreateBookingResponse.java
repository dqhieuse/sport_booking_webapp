package com.sportbooking.module.booking.dto;

import com.sportbooking.module.booking.entity.BookingStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record CreateBookingResponse(
        Long id,
        Long courtId,
        String courtName,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime,
        int durationMinutes,
        BigDecimal totalPrice,
        BookingStatus status,
        List<CreatedBookingSlotResponse> slots,
        BookingPaymentResponse payment
) {
}
