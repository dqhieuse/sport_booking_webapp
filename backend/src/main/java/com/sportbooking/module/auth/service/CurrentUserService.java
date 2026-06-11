package com.sportbooking.module.auth.service;

import com.sportbooking.common.exception.ForbiddenException;
import com.sportbooking.common.exception.UnauthorizedException;
import com.sportbooking.module.user.entity.RoleName;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.entity.UserStatus;
import com.sportbooking.module.user.repository.UserRepository;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtAccessTokenService jwtAccessTokenService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public User requireCurrentUser(String authorizationHeader) {
        String accessToken = extractBearerToken(authorizationHeader);
        Jwt jwt = decodeToken(accessToken);
        Long userId = parseUserId(jwt.getSubject());

        return userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Access token user does not exist"));
    }

    @Transactional(readOnly = true)
    public User requireActiveVendor(String authorizationHeader) {
        return requireActiveUserWithAnyRole(
                authorizationHeader,
                "Vendor role is required",
                RoleName.VENDOR
        );
    }

    @Transactional(readOnly = true)
    public User requireActiveCustomer(String authorizationHeader) {
        return requireActiveUserWithAnyRole(
                authorizationHeader,
                "User role is required",
                RoleName.USER
        );
    }

    @Transactional(readOnly = true)
    public User requireActiveVendorOrAdmin(String authorizationHeader) {
        return requireActiveUserWithAnyRole(
                authorizationHeader,
                "Vendor or admin role is required",
                RoleName.VENDOR,
                RoleName.ADMIN
        );
    }

    private User requireActiveUserWithAnyRole(
            String authorizationHeader,
            String forbiddenRoleMessage,
            RoleName... allowedRoles
    ) {
        User user = requireCurrentUser(authorizationHeader);
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException("Account is not active");
        }

        Set<RoleName> allowedRoleSet = Set.of(allowedRoles);
        if (!allowedRoleSet.contains(user.getRole().getName())) {
            throw new ForbiddenException(forbiddenRoleMessage);
        }

        return user;
    }

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith(BEARER_PREFIX)) {
            throw new UnauthorizedException("Access token is required");
        }

        String accessToken = authorizationHeader.substring(BEARER_PREFIX.length()).trim();
        if (accessToken.isEmpty()) {
            throw new UnauthorizedException("Access token is required");
        }

        return accessToken;
    }

    private Jwt decodeToken(String accessToken) {
        try {
            return jwtAccessTokenService.decode(accessToken);
        } catch (JwtException exception) {
            throw new UnauthorizedException("Access token is invalid or expired");
        }
    }

    private Long parseUserId(String subject) {
        try {
            return Long.parseLong(subject);
        } catch (NumberFormatException exception) {
            throw new UnauthorizedException("Access token is invalid or expired");
        }
    }
}
