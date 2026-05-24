package com.sportbooking.module.auth.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.sportbooking.module.user.entity.Role;
import com.sportbooking.module.user.entity.RoleName;
import com.sportbooking.module.user.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class JwtAccessTokenServiceTest {

    @Autowired
    private JwtAccessTokenService jwtAccessTokenService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void generateTokenIncludesUserIdentityAndRoleClaims() {
        User user = createUser();

        String token = jwtAccessTokenService.generateToken(user);
        Jwt jwt = jwtAccessTokenService.decode(token);

        assertThat(jwt.getSubject()).isEqualTo("10");
        assertThat(jwt.getClaimAsString("email")).isEqualTo("user@sportbooking.local");
        assertThat(jwt.getClaimAsString("fullName")).isEqualTo("Demo User");
        assertThat(jwt.getClaimAsString("role")).isEqualTo("USER");
        assertThat(jwt.getExpiresAt()).isAfter(jwt.getIssuedAt());
    }

    @Test
    void toAuthenticationReturnsSpringSecurityAuthenticationWithRoleAuthority() {
        String token = jwtAccessTokenService.generateToken(createUser());

        var authentication = jwtAccessTokenService.toAuthentication(token);

        assertThat(authentication.isAuthenticated()).isTrue();
        assertThat(authentication.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_USER");
    }

    @Test
    void passwordEncoderUsesDelegatingPasswordFormat() {
        String encodedPassword = passwordEncoder.encode("secret");

        assertThat(encodedPassword).startsWith("{");
        assertThat(passwordEncoder.matches("secret", encodedPassword)).isTrue();
    }

    private User createUser() {
        Role role = new Role(RoleName.USER);

        User user = new User();
        user.setId(10L);
        user.setFullName("Demo User");
        user.setEmail("user@sportbooking.local");
        user.setRole(role);

        return user;
    }
}
