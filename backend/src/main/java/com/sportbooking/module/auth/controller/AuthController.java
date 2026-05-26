package com.sportbooking.module.auth.controller;

import com.sportbooking.common.api.ApiResponse;
import com.sportbooking.config.AuthProperties;
import com.sportbooking.module.auth.dto.AuthenticationResult;
import com.sportbooking.module.auth.dto.AuthUserResponse;
import com.sportbooking.module.auth.dto.CurrentUserResponse;
import com.sportbooking.module.auth.dto.EmailVerificationResponse;
import com.sportbooking.module.auth.dto.LoginRequest;
import com.sportbooking.module.auth.dto.LoginResponse;
import com.sportbooking.module.auth.dto.RegisterRequest;
import com.sportbooking.module.auth.dto.ResendVerificationRequest;
import com.sportbooking.module.auth.service.AuthLoginService;
import com.sportbooking.module.auth.service.AuthProfileService;
import com.sportbooking.module.auth.service.AuthRegistrationService;
import com.sportbooking.module.auth.service.EmailVerificationService;
import com.sportbooking.module.auth.service.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthLoginService authLoginService;
    private final AuthProfileService authProfileService;
    private final AuthRegistrationService authRegistrationService;
    private final EmailVerificationService emailVerificationService;
    private final RefreshTokenService refreshTokenService;
    private final AuthProperties authProperties;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AuthUserResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthUserResponse response = authRegistrationService.register(request);
        return ApiResponse.success("Register successfully. Please verify your email.", response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthenticationResult result = authLoginService.login(request);
        return authenticationResponse("Login successfully", result);
    }

    @PostMapping("/session")
    public ApiResponse<LoginResponse> restoreSession(
            @CookieValue(name = "${app.auth.refresh-token-cookie-name}", required = false) String refreshToken
    ) {
        LoginResponse response = refreshTokenService.restoreSession(refreshToken);
        return ApiResponse.success("Session restored successfully", response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(
            @CookieValue(name = "${app.auth.refresh-token-cookie-name}", required = false) String refreshToken
    ) {
        AuthenticationResult result = refreshTokenService.refresh(refreshToken);
        return authenticationResponse("Token refreshed successfully", result);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = "${app.auth.refresh-token-cookie-name}", required = false) String refreshToken
    ) {
        refreshTokenService.logout(refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, expiredRefreshTokenCookie().toString())
                .body(ApiResponse.success("Logged out successfully", null));
    }

    @GetMapping("/me")
    public ApiResponse<CurrentUserResponse> getCurrentUser(
            @RequestHeader(name = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader
    ) {
        CurrentUserResponse response = authProfileService.getCurrentUser(authorizationHeader);
        return ApiResponse.success("Success", response);
    }

    @GetMapping("/verify-email")
    public ApiResponse<EmailVerificationResponse> verifyEmail(@RequestParam(required = false) String token) {
        EmailVerificationResponse response = emailVerificationService.verifyEmail(token);
        return ApiResponse.success("Email verified successfully", response);
    }

    @PostMapping("/resend-verification")
    public ApiResponse<Void> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        emailVerificationService.resendVerificationEmail(request);
        return ApiResponse.success(
                "If this email is registered and pending verification, a verification email has been sent.",
                null
        );
    }

    private ResponseEntity<ApiResponse<LoginResponse>> authenticationResponse(String message, AuthenticationResult result) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie(result.refreshToken()).toString())
                .body(ApiResponse.success(message, result.toResponse()));
    }

    private ResponseCookie refreshTokenCookie(String refreshToken) {
        return ResponseCookie.from(authProperties.getRefreshTokenCookieName(), refreshToken)
                .httpOnly(true)
                .secure(authProperties.isRefreshTokenCookieSecure())
                .sameSite(authProperties.getRefreshTokenCookieSameSite())
                .path(authProperties.getRefreshTokenCookiePath())
                .maxAge(authProperties.getRefreshTokenTtl())
                .build();
    }

    private ResponseCookie expiredRefreshTokenCookie() {
        return ResponseCookie.from(authProperties.getRefreshTokenCookieName(), "")
                .httpOnly(true)
                .secure(authProperties.isRefreshTokenCookieSecure())
                .sameSite(authProperties.getRefreshTokenCookieSameSite())
                .path(authProperties.getRefreshTokenCookiePath())
                .maxAge(0)
                .build();
    }
}
