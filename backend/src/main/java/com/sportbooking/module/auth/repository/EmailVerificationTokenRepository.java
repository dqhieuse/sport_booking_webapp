package com.sportbooking.module.auth.repository;

import com.sportbooking.module.auth.entity.EmailVerificationToken;
import com.sportbooking.module.user.entity.User;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {

    Optional<EmailVerificationToken> findByToken(String token);

    List<EmailVerificationToken> findByUserAndUsedAtIsNullAndExpiresAtAfter(User user, LocalDateTime now);
}
