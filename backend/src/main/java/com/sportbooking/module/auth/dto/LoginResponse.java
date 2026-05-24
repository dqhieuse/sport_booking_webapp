package com.sportbooking.module.auth.dto;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        long expiresIn,
        LoginUserResponse user
) {
}
