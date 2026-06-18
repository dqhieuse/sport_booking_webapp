package com.sportbooking.module.auth.repository;

import com.sportbooking.module.auth.entity.RefreshToken;
import com.sportbooking.module.user.entity.User;
import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"user", "user.role"})
    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @EntityGraph(attributePaths = {"user", "user.role"})
    @Query("select refreshToken from RefreshToken refreshToken where refreshToken.tokenHash = :tokenHash")
    Optional<RefreshToken> findByTokenHashWithoutLock(String tokenHash);

    List<RefreshToken> findByUserAndRevokedAtIsNullAndExpiresAtAfter(User user, LocalDateTime now);

    List<RefreshToken> findByUserAndRevokedAtIsNull(User user);
}
