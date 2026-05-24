package com.sportbooking.module.auth.service;

import com.sportbooking.common.exception.InvalidRequestException;
import com.sportbooking.module.auth.dto.EmailVerificationResponse;
import com.sportbooking.module.auth.entity.EmailVerificationToken;
import com.sportbooking.module.auth.repository.EmailVerificationTokenRepository;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.entity.UserStatus;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private final EmailVerificationTokenRepository emailVerificationTokenRepository;

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
}
