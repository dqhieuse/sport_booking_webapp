package com.sportbooking.module.auth.dto;

public record LoginResponse(
        String accessToken,
        long expiresIn,
        LoginUserResponse user
) {
}
