package com.sportbooking.module.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "Email or phone is required")
        @Size(max = 150, message = "Email or phone must be at most 150 characters")
        String identifier,

        @NotBlank(message = "Password is required")
        @Size(max = 100, message = "Password must be at most 100 characters")
        String password
) {
}
