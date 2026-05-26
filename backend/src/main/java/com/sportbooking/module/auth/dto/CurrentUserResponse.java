package com.sportbooking.module.auth.dto;

import com.sportbooking.module.user.entity.RoleName;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.entity.UserStatus;

public record CurrentUserResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String avatarUrl,
        RoleName role,
        UserStatus status,
        boolean emailVerified
) {

    public static CurrentUserResponse from(User user) {
        return new CurrentUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAvatarUrl(),
                user.getRole().getName(),
                user.getStatus(),
                user.isEmailVerified()
        );
    }
}
