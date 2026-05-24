package com.sportbooking.module.auth.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sportbooking.common.exception.DuplicateResourceException;
import com.sportbooking.common.exception.ResourceNotFoundException;
import com.sportbooking.module.auth.dto.AuthUserResponse;
import com.sportbooking.module.auth.dto.RegisterRequest;
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

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final EmailVerificationService emailVerificationService;
    private final PasswordEncoder passwordEncoder;

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
        emailVerificationService.createAndSendVerificationToken(savedUser);

        return AuthUserResponse.from(savedUser);
    }
}
