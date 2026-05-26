package com.sportbooking.module.auth.service;

import com.sportbooking.common.exception.ForbiddenException;
import com.sportbooking.common.exception.UnauthorizedException;
import com.sportbooking.config.AuthProperties;
import com.sportbooking.module.auth.dto.AuthenticationResult;
import com.sportbooking.module.auth.dto.LoginRequest;
import com.sportbooking.module.auth.dto.LoginUserResponse;
import com.sportbooking.module.user.entity.AuthProvider;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.entity.UserStatus;
import com.sportbooking.module.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthLoginService {

    private final UserRepository userRepository;
    private final JwtAccessTokenService jwtAccessTokenService;
    private final RefreshTokenService refreshTokenService;
    private final PasswordEncoder passwordEncoder;
    private final AuthProperties authProperties;

    @Transactional
    public AuthenticationResult login(LoginRequest request) {
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
        String refreshToken = refreshTokenService.issueRefreshToken(user);

        return new AuthenticationResult(
                accessToken,
                refreshToken,
                authProperties.getAccessTokenTtl().toSeconds(),
                LoginUserResponse.from(user)
        );
    }
}
