package com.sportbooking.module.auth.service;

import com.sportbooking.common.exception.UnauthorizedException;
import com.sportbooking.module.auth.dto.CurrentUserResponse;
import com.sportbooking.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthProfileService {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtAccessTokenService jwtAccessTokenService;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser(String authorizationHeader) {
        String accessToken = extractBearerToken(authorizationHeader);
        Jwt jwt = decodeToken(accessToken);
        Long userId = parseUserId(jwt.getSubject());

        return userRepository.findById(userId)
                .map(CurrentUserResponse::from)
                .orElseThrow(() -> new UnauthorizedException("Access token user does not exist"));
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
