package com.sportbooking.module.booking.dto;

import com.sportbooking.module.payment.entity.PaymentMethod;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public record VendorCreateBookingRequest(
        @NotBlank(message = "Customer name is required")
        @Size(max = 100, message = "Customer name must not exceed 100 characters")
        String customerName,

        @Size(max = 20, message = "Customer phone must not exceed 20 characters")
        String customerPhone,

        @Size(max = 150, message = "Customer identifier must not exceed 150 characters")
        String customerIdentifier,

        @NotNull(message = "Court ID is required")
        Long courtId,

        @NotEmpty(message = "At least one time slot is required")
        @Size(max = 3, message = "A booking can contain at most 3 time slots")
        List<@NotNull(message = "Time slot ID must not be null") Long> timeSlotIds,

        @NotNull(message = "Booking date is required")
        @FutureOrPresent(message = "Booking date must not be in the past")
        LocalDate bookingDate,

        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,

        @Size(max = 500, message = "Note must not exceed 500 characters")
        String note
) {
}
