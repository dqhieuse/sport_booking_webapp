package com.sportbooking.module.booking.dto;

import com.sportbooking.module.payment.entity.PaymentMethod;
import com.sportbooking.module.payment.entity.PaymentStatus;

public record VendorBookingPaymentResponse(
        PaymentMethod method,
        PaymentStatus status
) {
}
