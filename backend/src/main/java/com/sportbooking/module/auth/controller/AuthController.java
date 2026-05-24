package com.sportbooking.module.auth.controller;

import com.sportbooking.common.api.ApiResponse;
import com.sportbooking.module.auth.dto.AuthUserResponse;
import com.sportbooking.module.auth.dto.EmailVerificationResponse;
import com.sportbooking.module.auth.dto.LoginRequest;
import com.sportbooking.module.auth.dto.LoginResponse;
import com.sportbooking.module.auth.dto.RefreshTokenRequest;
import com.sportbooking.module.auth.dto.RegisterRequest;
import com.sportbooking.module.auth.dto.ResendVerificationRequest;
import com.sportbooking.module.auth.service.AuthLoginService;
import com.sportbooking.module.auth.service.AuthRegistrationService;
import com.sportbooking.module.auth.service.EmailVerificationService;
import com.sportbooking.module.auth.service.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
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
    private final AuthRegistrationService authRegistrationService;
    private final EmailVerificationService emailVerificationService;
    private final RefreshTokenService refreshTokenService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AuthUserResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthUserResponse response = authRegistrationService.register(request);
        return ApiResponse.success("Register successfully. Please verify your email.", response);
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authLoginService.login(request);
        return ApiResponse.success("Login successfully", response);
    }

    @PostMapping("/refresh")
    public ApiResponse<LoginResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        LoginResponse response = refreshTokenService.refresh(request);
        return ApiResponse.success("Token refreshed successfully", response);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        refreshTokenService.logout(request);
        return ApiResponse.success("Logged out successfully", null);
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
}
