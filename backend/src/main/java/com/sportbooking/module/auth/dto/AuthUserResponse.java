package com.sportbooking.module.auth.dto;

import com.sportbooking.module.user.entity.RoleName;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.entity.UserStatus;

public record AuthUserResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        RoleName role,
        UserStatus status,
        boolean emailVerified
) {

    public static AuthUserResponse from(User user) {
        return new AuthUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().getName(),
                user.getStatus(),
                user.isEmailVerified()
        );
    }
}
