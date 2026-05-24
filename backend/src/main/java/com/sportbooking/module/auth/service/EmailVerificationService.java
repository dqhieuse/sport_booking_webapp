package com.sportbooking.module.auth.service;

import com.sportbooking.common.exception.InvalidRequestException;
import com.sportbooking.config.AuthProperties;
import com.sportbooking.module.auth.dto.EmailVerificationResponse;
import com.sportbooking.module.auth.dto.ResendVerificationRequest;
import com.sportbooking.module.auth.entity.EmailVerificationToken;
import com.sportbooking.module.auth.repository.EmailVerificationTokenRepository;
import com.sportbooking.module.auth.service.email.EmailVerificationMailService;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.entity.UserStatus;
import com.sportbooking.module.user.repository.UserRepository;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final UserRepository userRepository;
    private final EmailVerificationMailService emailVerificationMailService;
    private final AuthProperties authProperties;

    @Transactional
    public EmailVerificationResponse verifyEmail(String token) {
        String normalizedToken = token == null ? "" : token.trim();
        if (normalizedToken.isBlank()) {
            throw new InvalidRequestException("Verification token is required");
        }

        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(normalizedToken)
                .orElseThrow(() -> new InvalidRequestException("Verification token is invalid"));

        if (verificationToken.getUsedAt() != null) {
            throw new InvalidRequestException("Verification token has already been used");
        }

        LocalDateTime now = LocalDateTime.now();
        if (!verificationToken.getExpiresAt().isAfter(now)) {
            throw new InvalidRequestException("Verification token has expired");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        user.setStatus(UserStatus.ACTIVE);
        verificationToken.setUsedAt(now);

        return EmailVerificationResponse.from(user);
    }

    @Transactional
    public void resendVerificationEmail(ResendVerificationRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail).orElse(null);

        if (user == null || user.isEmailVerified() || user.getStatus() != UserStatus.PENDING_VERIFICATION) {
            return;
        }
        emailVerificationTokenRepository.deleteByUserAndUsedAtIsNull(user);
        createAndSendVerificationToken(user);
    }

    public EmailVerificationToken createAndSendVerificationToken(User user) {
        EmailVerificationToken verificationToken = createVerificationToken(user);
        EmailVerificationToken savedToken = emailVerificationTokenRepository.save(verificationToken);
        emailVerificationMailService.sendVerificationEmail(user, savedToken.getToken());
        return savedToken;
    }

    private EmailVerificationToken createVerificationToken(User user) {
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setUser(user);
        verificationToken.setToken(generateSecureToken());
        verificationToken.setExpiresAt(LocalDateTime.now().plus(authProperties.getEmailVerificationTokenTtl()));
        return verificationToken;
    }

    private String generateSecureToken() {
        byte[] tokenBytes = new byte[32];
        SECURE_RANDOM.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }
}
