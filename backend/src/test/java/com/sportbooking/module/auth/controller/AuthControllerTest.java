package com.sportbooking.module.auth.controller;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.sportbooking.module.auth.entity.EmailVerificationToken;
import com.sportbooking.module.auth.repository.EmailVerificationTokenRepository;
import com.sportbooking.module.auth.repository.RefreshTokenRepository;
import com.sportbooking.module.user.entity.UserStatus;
import com.sportbooking.module.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.servlet.http.Cookie;
import java.time.LocalDateTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    private static final String REFRESH_TOKEN_COOKIE_NAME = "sportzone_refresh_token";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void registerCreatesPendingLocalAccountAndVerificationToken() throws Exception {
        String email = "new-user-" + UUID.randomUUID() + "@sportbooking.local";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "New User",
                                  "email": "%s",
                                  "phone": "0900000099",
                                  "password": "Password@123"
                                }
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Register successfully. Please verify your email.")))
                .andExpect(jsonPath("$.data.fullName", is("New User")))
                .andExpect(jsonPath("$.data.email", is(email)))
                .andExpect(jsonPath("$.data.phone", is("0900000099")))
                .andExpect(jsonPath("$.data.role", is("USER")))
                .andExpect(jsonPath("$.data.status", is("PENDING_VERIFICATION")))
                .andExpect(jsonPath("$.data.emailVerified", is(false)));

        var savedUser = userRepository.findByEmail(email).orElseThrow();
        var tokens = emailVerificationTokenRepository.findByUserAndUsedAtIsNullAndExpiresAtAfter(
                savedUser,
                java.time.LocalDateTime.now()
        );

        org.assertj.core.api.Assertions.assertThat(savedUser.getPassword()).startsWith("{bcrypt}");
        org.assertj.core.api.Assertions.assertThat(tokens).hasSize(1);
    }

    @Test
    void registerReturnsConflictWhenEmailAlreadyExists() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Existing User",
                                  "email": "user@sportbooking.local",
                                  "phone": "0900000098",
                                  "password": "Password@123"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Email already exists")));
    }

    @Test
    void registerReturnsConflictWhenPhoneAlreadyExists() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Existing Phone User",
                                  "email": "phone-conflict-%s@sportbooking.local",
                                  "phone": "0900000003",
                                  "password": "Password@123"
                                }
                                """.formatted(UUID.randomUUID())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Phone number already exists")));
    }

    @Test
    void registerReturnsBadRequestWhenInputIsInvalid() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "",
                                  "email": "invalid-email",
                                  "phone": "abc",
                                  "password": "123"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Validation failed")))
                .andExpect(jsonPath("$.errors", hasSize(greaterThanOrEqualTo(3))));
    }

    @Test
    void loginReturnsTokensWhenEmailAndPasswordAreValid() throws Exception {
        String email = "login-email-user-" + UUID.randomUUID() + "@sportbooking.local";
        registerAndVerifyUser(email, "0900000106");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "identifier": "%s",
                                  "password": "Password@123"
                                }
                                """.formatted(email.toUpperCase())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Login successfully")))
                .andExpect(jsonPath("$.data.accessToken").exists())
                .andExpect(jsonPath("$.data.refreshToken").doesNotExist())
                .andExpect(jsonPath("$.data.expiresIn", is(900)))
                .andExpect(jsonPath("$.data.user.email", is(email)))
                .andExpect(jsonPath("$.data.user.role", is("USER")))
                .andExpect(jsonPath("$.data.user.emailVerified", is(true)));

        var savedUser = userRepository.findByEmail(email).orElseThrow();
        var refreshTokens = refreshTokenRepository.findByUserAndRevokedAtIsNullAndExpiresAtAfter(
                savedUser,
                LocalDateTime.now()
        );

        org.assertj.core.api.Assertions.assertThat(refreshTokens).hasSize(1);
    }

    @Test
    void loginReturnsTokensWhenPhoneAndPasswordAreValid() throws Exception {
        String email = "login-phone-user-" + UUID.randomUUID() + "@sportbooking.local";
        String phone = "0900000107";
        registerAndVerifyUser(email, phone);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "identifier": "%s",
                                  "password": "Password@123"
                                }
                                """.formatted(phone)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Login successfully")))
                .andExpect(jsonPath("$.data.accessToken").exists())
                .andExpect(jsonPath("$.data.refreshToken").doesNotExist())
                .andExpect(jsonPath("$.data.user.email", is(email)));
    }

    @Test
    void loginReturnsUnauthorizedWhenCredentialsAreInvalid() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "identifier": "missing-login-user@sportbooking.local",
                                  "password": "WrongPassword@123"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Invalid email/phone or password")));
    }

    @Test
    void loginReturnsForbiddenWhenEmailIsNotVerified() throws Exception {
        String email = "pending-login-user-" + UUID.randomUUID() + "@sportbooking.local";
        registerUser(email, "0900000108");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "identifier": "%s",
                                  "password": "Password@123"
                                }
                                """.formatted(email)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Please verify your email before logging in")));
    }

    @Test
    void loginReturnsForbiddenWhenAccountIsInactive() throws Exception {
        String email = "inactive-login-user-" + UUID.randomUUID() + "@sportbooking.local";
        registerAndVerifyUser(email, "0900000109");
        var savedUser = userRepository.findByEmail(email).orElseThrow();
        savedUser.setStatus(UserStatus.INACTIVE);
        userRepository.save(savedUser);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "identifier": "%s",
                                  "password": "Password@123"
                                }
                                """.formatted(email)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Account is inactive")));
    }

    @Test
    void loginReturnsBadRequestWhenInputIsInvalid() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "identifier": "",
                                  "password": ""
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Validation failed")))
                .andExpect(jsonPath("$.errors", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    void refreshRotatesRefreshTokenAndRejectsReuseOfOldToken() throws Exception {
        String email = "refresh-user-" + UUID.randomUUID() + "@sportbooking.local";
        registerAndVerifyUser(email, "0900000110");
        String oldRefreshToken = loginAndReturnRefreshToken(email);

        var refreshResult = mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie(REFRESH_TOKEN_COOKIE_NAME, oldRefreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Token refreshed successfully")))
                .andExpect(jsonPath("$.data.accessToken").exists())
                .andExpect(jsonPath("$.data.refreshToken").doesNotExist())
                .andExpect(jsonPath("$.data.expiresIn", is(900)))
                .andExpect(jsonPath("$.data.user.email", is(email)))
                .andReturn();
        String newRefreshToken = refreshResult.getResponse().getCookie(REFRESH_TOKEN_COOKIE_NAME).getValue();

        org.assertj.core.api.Assertions.assertThat(newRefreshToken).isNotEqualTo(oldRefreshToken);

        var savedUser = userRepository.findByEmail(email).orElseThrow();
        org.assertj.core.api.Assertions.assertThat(refreshTokenRepository.findByUserAndRevokedAtIsNull(savedUser))
                .hasSize(1);

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie(REFRESH_TOKEN_COOKIE_NAME, oldRefreshToken)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Refresh token is invalid or expired")));

        entityManager.clear();
        org.assertj.core.api.Assertions.assertThat(refreshTokenRepository.findByUserAndRevokedAtIsNull(savedUser))
                .isEmpty();
    }

    @Test
    void restoreSessionReturnsAccessTokenWithoutRotatingRefreshToken() throws Exception {
        String email = "restore-session-user-" + UUID.randomUUID() + "@sportbooking.local";
        registerAndVerifyUser(email, "0900000114");
        String refreshToken = loginAndReturnRefreshToken(email);
        var savedUser = userRepository.findByEmail(email).orElseThrow();

        mockMvc.perform(post("/api/auth/session")
                        .cookie(new Cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Session restored successfully")))
                .andExpect(jsonPath("$.data.accessToken").exists())
                .andExpect(jsonPath("$.data.refreshToken").doesNotExist())
                .andExpect(jsonPath("$.data.user.email", is(email)))
                .andExpect(result -> org.assertj.core.api.Assertions.assertThat(
                        result.getResponse().getCookie(REFRESH_TOKEN_COOKIE_NAME)
                ).isNull());

        entityManager.clear();
        org.assertj.core.api.Assertions.assertThat(refreshTokenRepository.findByUserAndRevokedAtIsNull(savedUser))
                .hasSize(1);
    }

    @Test
    void refreshReturnsUnauthorizedWhenTokenIsUnknown() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie(REFRESH_TOKEN_COOKIE_NAME, "unknown-refresh-token")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Refresh token is invalid or expired")));
    }

    @Test
    void refreshReturnsUnauthorizedWhenTokenIsExpired() throws Exception {
        String email = "expired-refresh-user-" + UUID.randomUUID() + "@sportbooking.local";
        registerAndVerifyUser(email, "0900000111");
        String refreshToken = loginAndReturnRefreshToken(email);
        var savedUser = userRepository.findByEmail(email).orElseThrow();
        var storedToken = refreshTokenRepository.findByUserAndRevokedAtIsNull(savedUser).getFirst();
        storedToken.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        refreshTokenRepository.save(storedToken);

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Refresh token is invalid or expired")));

        entityManager.clear();
        org.assertj.core.api.Assertions.assertThat(refreshTokenRepository.findByUserAndRevokedAtIsNull(savedUser))
                .isEmpty();
    }

    @Test
    void refreshReturnsForbiddenAndRevokesTokensWhenAccountIsInactive() throws Exception {
        String email = "inactive-refresh-user-" + UUID.randomUUID() + "@sportbooking.local";
        registerAndVerifyUser(email, "0900000112");
        String refreshToken = loginAndReturnRefreshToken(email);
        var savedUser = userRepository.findByEmail(email).orElseThrow();
        savedUser.setStatus(UserStatus.INACTIVE);
        userRepository.save(savedUser);

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Account is inactive")));

        entityManager.clear();
        org.assertj.core.api.Assertions.assertThat(refreshTokenRepository.findByUserAndRevokedAtIsNull(savedUser))
                .isEmpty();
    }

    @Test
    void refreshReturnsUnauthorizedWhenCookieIsMissing() throws Exception {
        mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Refresh token is invalid or expired")));
    }

    @Test
    void logoutRevokesCurrentRefreshTokenOnly() throws Exception {
        String email = "logout-user-" + UUID.randomUUID() + "@sportbooking.local";
        registerAndVerifyUser(email, "0900000113");
        String firstRefreshToken = loginAndReturnRefreshToken(email);
        String secondRefreshToken = loginAndReturnRefreshToken(email);
        var savedUser = userRepository.findByEmail(email).orElseThrow();

        mockMvc.perform(post("/api/auth/logout")
                        .cookie(new Cookie(REFRESH_TOKEN_COOKIE_NAME, firstRefreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Logged out successfully")))
                .andExpect(jsonPath("$.data", nullValue()));

        entityManager.clear();
        org.assertj.core.api.Assertions.assertThat(refreshTokenRepository.findByUserAndRevokedAtIsNull(savedUser))
                .hasSize(1);

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie(REFRESH_TOKEN_COOKIE_NAME, secondRefreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Token refreshed successfully")));

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie(REFRESH_TOKEN_COOKIE_NAME, firstRefreshToken)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Refresh token is invalid or expired")));
    }

    @Test
    void logoutReturnsSuccessWhenRefreshTokenIsUnknown() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                        .cookie(new Cookie(REFRESH_TOKEN_COOKIE_NAME, "unknown-refresh-token")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Logged out successfully")))
                .andExpect(jsonPath("$.data", nullValue()));
    }

    @Test
    void logoutReturnsSuccessWhenRefreshCookieIsMissing() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Logged out successfully")))
                .andExpect(jsonPath("$.data", nullValue()));
    }

    @Test
    void verifyEmailActivatesAccountWhenTokenIsValid() throws Exception {
        String email = "verify-user-" + UUID.randomUUID() + "@sportbooking.local";
        registerUser(email, "0900000101");
        var savedUser = userRepository.findByEmail(email).orElseThrow();
        String token = emailVerificationTokenRepository.findByUserAndUsedAtIsNullAndExpiresAtAfter(
                        savedUser,
                        LocalDateTime.now()
                )
                .getFirst()
                .getToken();

        mockMvc.perform(get("/api/auth/verify-email").param("token", token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("Email verified successfully")))
                .andExpect(jsonPath("$.data.emailVerified", is(true)))
                .andExpect(jsonPath("$.data.status", is("ACTIVE")));

        var verifiedUser = userRepository.findByEmail(email).orElseThrow();
        var usedToken = emailVerificationTokenRepository.findByToken(token).orElseThrow();

        org.assertj.core.api.Assertions.assertThat(verifiedUser.isEmailVerified()).isTrue();
        org.assertj.core.api.Assertions.assertThat(verifiedUser.getStatus()).isEqualTo(UserStatus.ACTIVE);
        org.assertj.core.api.Assertions.assertThat(usedToken.getUsedAt()).isNotNull();
    }

    @Test
    void verifyEmailReturnsBadRequestWhenTokenDoesNotExist() throws Exception {
        mockMvc.perform(get("/api/auth/verify-email").param("token", "missing-token"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Verification token is invalid")));
    }

    @Test
    void verifyEmailReturnsBadRequestWhenTokenIsMissing() throws Exception {
        mockMvc.perform(get("/api/auth/verify-email"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Verification token is required")));
    }

    @Test
    void verifyEmailReturnsBadRequestWhenTokenWasUsed() throws Exception {
        String email = "used-token-user-" + UUID.randomUUID() + "@sportbooking.local";
        registerUser(email, "0900000102");
        var savedUser = userRepository.findByEmail(email).orElseThrow();
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByUserAndUsedAtIsNullAndExpiresAtAfter(
                        savedUser,
                        LocalDateTime.now()
                )
                .getFirst();
        verificationToken.setUsedAt(LocalDateTime.now());
        emailVerificationTokenRepository.save(verificationToken);

        mockMvc.perform(get("/api/auth/verify-email").param("token", verificationToken.getToken()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Verification token has already been used")));
    }

    @Test
    void verifyEmailReturnsBadRequestWhenTokenExpired() throws Exception {
        String email = "expired-token-user-" + UUID.randomUUID() + "@sportbooking.local";
        registerUser(email, "0900000103");
        var savedUser = userRepository.findByEmail(email).orElseThrow();
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByUserAndUsedAtIsNullAndExpiresAtAfter(
                        savedUser,
                        LocalDateTime.now()
                )
                .getFirst();
        verificationToken.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        emailVerificationTokenRepository.save(verificationToken);

        mockMvc.perform(get("/api/auth/verify-email").param("token", verificationToken.getToken()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Verification token has expired")));
    }

    @Test
    void resendVerificationCreatesNewTokenAndRemovesPreviousOpenToken() throws Exception {
        String email = "resend-user-" + UUID.randomUUID() + "@sportbooking.local";
        registerUser(email, "0900000104");
        var savedUser = userRepository.findByEmail(email).orElseThrow();
        String oldToken = emailVerificationTokenRepository.findByUserAndUsedAtIsNullAndExpiresAtAfter(
                        savedUser,
                        LocalDateTime.now()
                )
                .getFirst()
                .getToken();

        mockMvc.perform(post("/api/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s"
                                }
                                """.formatted(email.toUpperCase())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("If this email is registered and pending verification, a verification email has been sent.")))
                .andExpect(jsonPath("$.data", nullValue()));

        var activeTokens = emailVerificationTokenRepository.findByUserAndUsedAtIsNullAndExpiresAtAfter(
                savedUser,
                LocalDateTime.now()
        );

        org.assertj.core.api.Assertions.assertThat(activeTokens).hasSize(1);
        org.assertj.core.api.Assertions.assertThat(activeTokens.getFirst().getToken()).isNotEqualTo(oldToken);
        org.assertj.core.api.Assertions.assertThat(emailVerificationTokenRepository.findByToken(oldToken)).isEmpty();
    }

    @Test
    void resendVerificationReturnsNeutralSuccessWhenEmailAlreadyVerified() throws Exception {
        String email = "verified-resend-user-" + UUID.randomUUID() + "@sportbooking.local";
        registerUser(email, "0900000105");
        var savedUser = userRepository.findByEmail(email).orElseThrow();
        String token = emailVerificationTokenRepository.findByUserAndUsedAtIsNullAndExpiresAtAfter(
                        savedUser,
                        LocalDateTime.now()
                )
                .getFirst()
                .getToken();
        mockMvc.perform(get("/api/auth/verify-email").param("token", token))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s"
                                }
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("If this email is registered and pending verification, a verification email has been sent.")))
                .andExpect(jsonPath("$.data", nullValue()));
    }

    @Test
    void resendVerificationReturnsNeutralSuccessWhenAccountDoesNotExist() throws Exception {
        mockMvc.perform(post("/api/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "missing-%s@sportbooking.local"
                                }
                                """.formatted(UUID.randomUUID())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", is("If this email is registered and pending verification, a verification email has been sent.")))
                .andExpect(jsonPath("$.data", nullValue()));
    }

    @Test
    void resendVerificationReturnsBadRequestWhenInputIsInvalid() throws Exception {
        mockMvc.perform(post("/api/auth/resend-verification")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "invalid-email"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Validation failed")))
                .andExpect(jsonPath("$.errors", hasSize(greaterThanOrEqualTo(1))));
    }

    private void registerUser(String email, String phone) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Verify User",
                                  "email": "%s",
                                  "phone": "%s",
                                  "password": "Password@123"
                                }
                                """.formatted(email, phone)))
                .andExpect(status().isCreated());
    }

    private void registerAndVerifyUser(String email, String phone) throws Exception {
        registerUser(email, phone);
        var savedUser = userRepository.findByEmail(email).orElseThrow();
        String token = emailVerificationTokenRepository.findByUserAndUsedAtIsNullAndExpiresAtAfter(
                        savedUser,
                        LocalDateTime.now()
                )
                .getFirst()
                .getToken();

        mockMvc.perform(get("/api/auth/verify-email").param("token", token))
                .andExpect(status().isOk());
    }

    private String loginAndReturnRefreshToken(String identifier) throws Exception {
        var loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "identifier": "%s",
                                  "password": "Password@123"
                                }
                                """.formatted(identifier)))
                .andExpect(status().isOk())
                .andReturn();

        return loginResult.getResponse().getCookie(REFRESH_TOKEN_COOKIE_NAME).getValue();
    }
}
