package com.sportbooking.module.booking.dto;

import com.sportbooking.module.payment.entity.PaymentMethod;
import com.sportbooking.module.payment.entity.PaymentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BookingDetailPaymentResponse(
        PaymentMethod method,
        PaymentStatus status,
        BigDecimal amount,
        LocalDateTime paidAt
) {
}
