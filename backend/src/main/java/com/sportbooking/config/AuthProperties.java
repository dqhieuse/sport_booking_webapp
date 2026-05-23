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

    private Duration emailVerificationTokenTtl = Duration.ofHours(24);

    private String issuer = "sport-booking-backend";
}
