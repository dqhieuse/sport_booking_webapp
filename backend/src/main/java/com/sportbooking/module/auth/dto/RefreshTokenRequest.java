package com.sportbooking.module.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RefreshTokenRequest(
        @NotBlank(message = "Refresh token is required")
        @Size(max = 500, message = "Refresh token must be at most 500 characters")
        String refreshToken
) {
}
