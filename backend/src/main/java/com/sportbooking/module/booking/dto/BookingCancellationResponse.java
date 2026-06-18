package com.sportbooking.module.booking.dto;

import com.sportbooking.module.booking.entity.BookingStatus;
import com.sportbooking.module.payment.entity.PaymentStatus;

public record BookingCancellationResponse(
        Long bookingId,
        BookingStatus bookingStatus,
        PaymentStatus paymentStatus
) {
}
