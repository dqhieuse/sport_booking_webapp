package com.sportbooking.module.auth.dto;

import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.entity.UserStatus;

public record EmailVerificationResponse(
        boolean emailVerified,
        UserStatus status
) {

    public static EmailVerificationResponse from(User user) {
        return new EmailVerificationResponse(user.isEmailVerified(), user.getStatus());
    }
}
