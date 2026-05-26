package com.sportbooking.config;

import java.time.Duration;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.auth")
public class AuthProperties {

    private String jwtSecret = "local-dev-jwt-secret-change-before-production-32-bytes";

    private Duration accessTokenTtl = Duration.ofMinutes(15);

    private Duration refreshTokenTtl = Duration.ofDays(7);

    private Duration emailVerificationTokenTtl = Duration.ofHours(24);

    private String issuer = "sport-booking-backend";

    private String refreshTokenCookieName = "sportzone_refresh_token";

    private String refreshTokenCookiePath = "/api/auth";

    private boolean refreshTokenCookieSecure = false;

    private String refreshTokenCookieSameSite = "Lax";
}
