package com.sportbooking.module.booking.dto;

public record BookingDetailUserResponse(
        Long id,
        String fullName,
        String email,
        String phone
) {
}
