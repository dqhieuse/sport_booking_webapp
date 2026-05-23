package com.sportbooking.module.auth.repository;

import com.sportbooking.module.auth.entity.RefreshToken;
import com.sportbooking.module.user.entity.User;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findByUserAndRevokedAtIsNullAndExpiresAtAfter(User user, LocalDateTime now);
}
