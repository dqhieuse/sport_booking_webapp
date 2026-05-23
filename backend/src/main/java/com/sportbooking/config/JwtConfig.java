package com.sportbooking.config;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

@Configuration
@EnableConfigurationProperties(AuthProperties.class)
public class JwtConfig {

    @Bean
    public JwtEncoder jwtEncoder(AuthProperties authProperties) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(jwtSecretKey(authProperties)));
    }

    @Bean
    public JwtDecoder jwtDecoder(AuthProperties authProperties) {
        return NimbusJwtDecoder.withSecretKey(jwtSecretKey(authProperties))
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    private SecretKey jwtSecretKey(AuthProperties authProperties) {
        byte[] secretBytes = authProperties.getJwtSecret().getBytes(StandardCharsets.UTF_8);
        return new SecretKeySpec(secretBytes, "HmacSHA256");
    }
}
