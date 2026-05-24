package com.sportbooking.module.auth.dto;

import com.sportbooking.module.user.entity.RoleName;
import com.sportbooking.module.user.entity.User;

public record LoginUserResponse(
        Long id,
        String fullName,
        String email,
        String avatarUrl,
        RoleName role,
        boolean emailVerified
) {

    public static LoginUserResponse from(User user) {
        return new LoginUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getRole().getName(),
                user.isEmailVerified()
        );
    }
}
