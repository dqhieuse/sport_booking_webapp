package com.sportbooking.module.auth.service;

import com.sportbooking.config.AuthProperties;
import com.sportbooking.module.user.entity.RoleName;
import com.sportbooking.module.user.entity.User;
import java.time.Instant;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;

@Service
public class JwtAccessTokenService {

    private static final String ROLE_CLAIM = "role";
    private static final String EMAIL_CLAIM = "email";
    private static final String FULL_NAME_CLAIM = "fullName";

    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;
    private final AuthProperties authProperties;

    public JwtAccessTokenService(
            JwtEncoder jwtEncoder,
            JwtDecoder jwtDecoder,
            AuthProperties authProperties
    ) {
        this.jwtEncoder = jwtEncoder;
        this.jwtDecoder = jwtDecoder;
        this.authProperties = authProperties;
    }

    public String generateToken(User user) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(authProperties.getAccessTokenTtl());
        RoleName roleName = user.getRole().getName();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(authProperties.getIssuer())
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .subject(user.getId().toString())
                .claim(EMAIL_CLAIM, user.getEmail())
                .claim(FULL_NAME_CLAIM, user.getFullName())
                .claim(ROLE_CLAIM, roleName.name())
                .build();
        JwsHeader jwsHeader = JwsHeader.with(MacAlgorithm.HS256).build();

        return jwtEncoder.encode(JwtEncoderParameters.from(jwsHeader, claims)).getTokenValue();
    }

    public Jwt decode(String token) {
        return jwtDecoder.decode(token);
    }

    public Authentication toAuthentication(String token) {
        Jwt jwt = decode(token);
        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + jwt.getClaimAsString(ROLE_CLAIM))
        );

        return UsernamePasswordAuthenticationToken.authenticated(jwt, token, authorities);
    }
}
