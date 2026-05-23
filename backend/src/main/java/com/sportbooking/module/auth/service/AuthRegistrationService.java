package com.sportbooking.module.auth.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sportbooking.common.exception.DuplicateResourceException;
import com.sportbooking.common.exception.ResourceNotFoundException;
import com.sportbooking.config.AuthProperties;
import com.sportbooking.module.auth.dto.AuthUserResponse;
import com.sportbooking.module.auth.dto.RegisterRequest;
import com.sportbooking.module.auth.entity.EmailVerificationToken;
import com.sportbooking.module.auth.repository.EmailVerificationTokenRepository;
import com.sportbooking.module.user.entity.AuthProvider;
import com.sportbooking.module.user.entity.Role;
import com.sportbooking.module.user.entity.RoleName;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.entity.UserStatus;
import com.sportbooking.module.user.repository.RoleRepository;
import com.sportbooking.module.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthRegistrationService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthProperties authProperties;

    @Transactional
    public AuthUserResponse register(RegisterRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new DuplicateResourceException("Email already exists");
        }

        String normalizedPhone = request.phone().trim();
        if (userRepository.existsByPhone(normalizedPhone)) {
            throw new DuplicateResourceException("Phone number already exists");
        }

        Role userRole = roleRepository.findByName(RoleName.USER)
                .orElseThrow(() -> new ResourceNotFoundException("Default USER role not found"));

        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(normalizedEmail);
        user.setPhone(normalizedPhone);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(userRole);
        user.setProvider(AuthProvider.LOCAL);
        user.setEmailVerified(false);
        user.setStatus(UserStatus.PENDING_VERIFICATION);

        User savedUser = userRepository.save(user);
        EmailVerificationToken verificationToken = createVerificationToken(savedUser);
        emailVerificationTokenRepository.save(verificationToken);

        return AuthUserResponse.from(savedUser);
    }

    private EmailVerificationToken createVerificationToken(User user) {
        EmailVerificationToken verificationToken = new EmailVerificationToken();
        verificationToken.setUser(user);
        verificationToken.setToken(generateSecureToken());
        verificationToken.setExpiresAt(LocalDateTime.now().plus(authProperties.getEmailVerificationTokenTtl()));
        return verificationToken;
    }

    private String generateSecureToken() {
        byte[] tokenBytes = new byte[32];
        SECURE_RANDOM.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }
}
