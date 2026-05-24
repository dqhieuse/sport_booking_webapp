package com.sportbooking.module.auth.controller;

import com.sportbooking.common.api.ApiResponse;
import com.sportbooking.module.auth.dto.AuthUserResponse;
import com.sportbooking.module.auth.dto.EmailVerificationResponse;
import com.sportbooking.module.auth.dto.RegisterRequest;
import com.sportbooking.module.auth.service.AuthRegistrationService;
import com.sportbooking.module.auth.service.EmailVerificationService;
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

    private final AuthRegistrationService authRegistrationService;
    private final EmailVerificationService emailVerificationService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AuthUserResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthUserResponse response = authRegistrationService.register(request);
        return ApiResponse.success("Register successfully. Please verify your email.", response);
    }

    @GetMapping("/verify-email")
    public ApiResponse<EmailVerificationResponse> verifyEmail(@RequestParam(required = false) String token) {
        EmailVerificationResponse response = emailVerificationService.verifyEmail(token);
        return ApiResponse.success("Email verified successfully", response);
    }
}
