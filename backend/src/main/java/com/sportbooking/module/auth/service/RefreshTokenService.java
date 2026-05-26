package com.sportbooking.module.auth.service;

import com.sportbooking.common.exception.ForbiddenException;
import com.sportbooking.common.exception.UnauthorizedException;
import com.sportbooking.config.AuthProperties;
import com.sportbooking.module.auth.dto.AuthenticationResult;
import com.sportbooking.module.auth.dto.LoginResponse;
import com.sportbooking.module.auth.dto.LoginUserResponse;
import com.sportbooking.module.auth.entity.RefreshToken;
import com.sportbooking.module.auth.repository.RefreshTokenRepository;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.entity.UserStatus;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final String INVALID_REFRESH_TOKEN_MESSAGE = "Refresh token is invalid or expired";

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtAccessTokenService jwtAccessTokenService;
    private final AuthProperties authProperties;

    @Transactional(readOnly = true)
    public LoginResponse restoreSession(String rawRefreshToken) {
        RefreshToken currentToken = findRefreshTokenWithoutLock(rawRefreshToken);
        User user = currentToken.getUser();
        LocalDateTime now = LocalDateTime.now();

        if (currentToken.getRevokedAt() != null || !currentToken.getExpiresAt().isAfter(now)) {
            throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
        }

        validateRefreshUser(user, now);

        String accessToken = jwtAccessTokenService.generateToken(user);
        return new LoginResponse(
                accessToken,
                authProperties.getAccessTokenTtl().toSeconds(),
                LoginUserResponse.from(user)
        );
    }

    @Transactional(noRollbackFor = {UnauthorizedException.class, ForbiddenException.class})
    public AuthenticationResult refresh(String rawRefreshToken) {
        RefreshToken currentToken = findRefreshToken(rawRefreshToken);
        User user = currentToken.getUser();
        LocalDateTime now = LocalDateTime.now();

        if (currentToken.getRevokedAt() != null) {
            revokeAllActiveTokens(user, now);
            throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
        }
        if (!currentToken.getExpiresAt().isAfter(now)) {
            revokeToken(currentToken, now);
            throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
        }

        validateRefreshUser(user, now);
        revokeToken(currentToken, now);

        String accessToken = jwtAccessTokenService.generateToken(user);
        String refreshToken = issueRefreshToken(user);

        return new AuthenticationResult(
                accessToken,
                refreshToken,
                authProperties.getAccessTokenTtl().toSeconds(),
                LoginUserResponse.from(user)
        );
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }

        String tokenHash = hashToken(rawRefreshToken.trim());
        refreshTokenRepository.findByTokenHash(tokenHash)
                .ifPresent(refreshToken -> revokeToken(refreshToken, LocalDateTime.now()));
    }

    public String issueRefreshToken(User user) {
        String token = generateSecureToken();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(hashToken(token));
        refreshToken.setExpiresAt(LocalDateTime.now().plus(authProperties.getRefreshTokenTtl()));
        refreshTokenRepository.save(refreshToken);

        return token;
    }

    private RefreshToken findRefreshToken(String rawToken) {
        return findRefreshToken(rawToken, true);
    }

    private RefreshToken findRefreshTokenWithoutLock(String rawToken) {
        return findRefreshToken(rawToken, false);
    }

    private RefreshToken findRefreshToken(String rawToken, boolean lockForUpdate) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE);
        }

        String tokenHash = hashToken(rawToken.trim());
        var refreshToken = lockForUpdate
                ? refreshTokenRepository.findByTokenHash(tokenHash)
                : refreshTokenRepository.findByTokenHashWithoutLock(tokenHash);

        return refreshToken
                .orElseThrow(() -> new UnauthorizedException(INVALID_REFRESH_TOKEN_MESSAGE));
    }

    private void validateRefreshUser(User user, LocalDateTime now) {
        if (user.getStatus() == UserStatus.INACTIVE) {
            revokeAllActiveTokens(user, now);
            throw new ForbiddenException("Account is inactive");
        }
        if (!user.isEmailVerified() || user.getStatus() == UserStatus.PENDING_VERIFICATION) {
            revokeAllActiveTokens(user, now);
            throw new ForbiddenException("Please verify your email before continuing");
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            revokeAllActiveTokens(user, now);
            throw new ForbiddenException("Account is not allowed to continue");
        }
    }

    private void revokeToken(RefreshToken refreshToken, LocalDateTime now) {
        if (refreshToken.getRevokedAt() == null) {
            refreshToken.setRevokedAt(now);
            refreshTokenRepository.save(refreshToken);
        }
    }

    private void revokeAllActiveTokens(User user, LocalDateTime now) {
        var activeTokens = refreshTokenRepository.findByUserAndRevokedAtIsNull(user);
        activeTokens.forEach(token -> token.setRevokedAt(now));
        refreshTokenRepository.saveAll(activeTokens);
    }

    private String generateSecureToken() {
        byte[] tokenBytes = new byte[32];
        SECURE_RANDOM.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 algorithm is not available", exception);
        }
    }
}
