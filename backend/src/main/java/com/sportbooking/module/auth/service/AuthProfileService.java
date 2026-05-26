package com.sportbooking.module.auth.service;

import com.sportbooking.common.exception.UnauthorizedException;
import com.sportbooking.module.auth.dto.CurrentUserResponse;
import com.sportbooking.module.auth.service.storage.AvatarStorageService;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AuthProfileService {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtAccessTokenService jwtAccessTokenService;
    private final UserRepository userRepository;
    private final AvatarStorageService avatarStorageService;

    @Transactional(readOnly = true)
    public CurrentUserResponse getCurrentUser(String authorizationHeader) {
        String accessToken = extractBearerToken(authorizationHeader);
        Jwt jwt = decodeToken(accessToken);
        Long userId = parseUserId(jwt.getSubject());

        return userRepository.findById(userId)
                .map(CurrentUserResponse::from)
                .orElseThrow(() -> new UnauthorizedException("Access token user does not exist"));
    }

    @Transactional
    public CurrentUserResponse uploadCurrentUserAvatar(String authorizationHeader, MultipartFile file) {
        String accessToken = extractBearerToken(authorizationHeader);
        Jwt jwt = decodeToken(accessToken);
        Long userId = parseUserId(jwt.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Access token user does not exist"));

        String oldAvatarUrl = user.getAvatarUrl();
        String newAvatarUrl = avatarStorageService.storeAvatar(file);

        try {
            user.setAvatarUrl(newAvatarUrl);
            User savedUser = userRepository.saveAndFlush(user);
            avatarStorageService.deleteAvatarIfManaged(oldAvatarUrl);
            return CurrentUserResponse.from(savedUser);
        } catch (RuntimeException exception) {
            avatarStorageService.deleteAvatarIfManaged(newAvatarUrl);
            throw exception;
        }
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
