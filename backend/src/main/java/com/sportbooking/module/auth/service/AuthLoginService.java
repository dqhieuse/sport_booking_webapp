package com.sportbooking.module.auth.service;

import com.sportbooking.common.exception.ForbiddenException;
import com.sportbooking.common.exception.UnauthorizedException;
import com.sportbooking.config.AuthProperties;
import com.sportbooking.module.auth.dto.LoginRequest;
import com.sportbooking.module.auth.dto.LoginResponse;
import com.sportbooking.module.auth.dto.LoginUserResponse;
import com.sportbooking.module.auth.entity.RefreshToken;
import com.sportbooking.module.auth.repository.RefreshTokenRepository;
import com.sportbooking.module.user.entity.AuthProvider;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.entity.UserStatus;
import com.sportbooking.module.user.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthLoginService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtAccessTokenService jwtAccessTokenService;
    private final PasswordEncoder passwordEncoder;
    private final AuthProperties authProperties;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String identifier = request.identifier().trim();
        String normalizedEmail = identifier.toLowerCase();

        User user = userRepository.findByEmailOrPhone(normalizedEmail, identifier)
                .orElseThrow(() -> new UnauthorizedException("Invalid email/phone or password"));

        if (user.getProvider() != AuthProvider.LOCAL || user.getPassword() == null) {
            throw new UnauthorizedException("Invalid email/phone or password");
        }
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new UnauthorizedException("Invalid email/phone or password");
        }
        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new ForbiddenException("Account is inactive");
        }
        if (!user.isEmailVerified() || user.getStatus() == UserStatus.PENDING_VERIFICATION) {
            throw new ForbiddenException("Please verify your email before logging in");
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException("Account is not allowed to login");
        }

        String accessToken = jwtAccessTokenService.generateToken(user);
        String refreshToken = generateSecureToken();
        saveRefreshToken(user, refreshToken);

        return new LoginResponse(
                accessToken,
                refreshToken,
                authProperties.getAccessTokenTtl().toSeconds(),
                LoginUserResponse.from(user)
        );
    }

    private void saveRefreshToken(User user, String token) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(hashToken(token));
        refreshToken.setExpiresAt(LocalDateTime.now().plus(authProperties.getRefreshTokenTtl()));
        refreshTokenRepository.save(refreshToken);
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
