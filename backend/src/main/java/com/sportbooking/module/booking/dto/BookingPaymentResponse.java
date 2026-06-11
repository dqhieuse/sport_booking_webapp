package com.sportbooking.module.booking.dto;

import com.sportbooking.module.payment.entity.PaymentMethod;
import com.sportbooking.module.payment.entity.PaymentStatus;
import java.math.BigDecimal;

public record BookingPaymentResponse(
        PaymentMethod method,
        PaymentStatus status,
        BigDecimal amount,
        String paymentUrl
) {
}
