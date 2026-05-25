package com.sportbooking.module.auth.dto;

public record AuthenticationResult(
        String accessToken,
        String refreshToken,
        long expiresIn,
        LoginUserResponse user
) {

    public LoginResponse toResponse() {
        return new LoginResponse(accessToken, expiresIn, user);
    }
}
