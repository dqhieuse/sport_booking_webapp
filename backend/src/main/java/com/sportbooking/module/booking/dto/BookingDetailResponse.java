package com.sportbooking.module.booking.dto;

import com.sportbooking.module.booking.entity.BookingStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public record BookingDetailResponse(
        Long id,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime,
        BigDecimal totalPrice,
        BookingStatus status,
        String note,
        List<CreatedBookingSlotResponse> slots,
        BookingDetailUserResponse user,
        BookingDetailCourtResponse court,
        BookingDetailVenueResponse venue,
        BookingDetailPaymentResponse payment,
        LocalDateTime createdAt
) {
}
