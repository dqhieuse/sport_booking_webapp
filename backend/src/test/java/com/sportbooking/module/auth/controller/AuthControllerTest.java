package com.sportbooking.module.auth.controller;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.sportbooking.module.auth.entity.EmailVerificationToken;
import com.sportbooking.module.auth.repository.EmailVerificationTokenRepository;
import com.sportbooking.module.user.entity.UserStatus;
import com.sportbooking.module.user.repository.UserRepository;
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

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

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
}
