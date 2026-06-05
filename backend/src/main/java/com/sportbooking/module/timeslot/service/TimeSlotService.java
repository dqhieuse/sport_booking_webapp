package com.sportbooking.module.timeslot.service;

import com.sportbooking.common.exception.ForbiddenException;
import com.sportbooking.common.exception.UnauthorizedException;
import com.sportbooking.module.auth.service.JwtAccessTokenService;
import com.sportbooking.module.timeslot.dto.TimeSlotResponse;
import com.sportbooking.module.timeslot.entity.TimeSlot;
import com.sportbooking.module.timeslot.entity.TimeSlotStatus;
import com.sportbooking.module.timeslot.repository.TimeSlotRepository;
import com.sportbooking.module.user.entity.RoleName;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.entity.UserStatus;
import com.sportbooking.module.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TimeSlotService {

    private static final String BEARER_PREFIX = "Bearer ";

    private final TimeSlotRepository timeSlotRepository;
    private final UserRepository userRepository;
    private final JwtAccessTokenService jwtAccessTokenService;

    @Transactional(readOnly = true)
    public List<TimeSlotResponse> getTimeSlots(String authorizationHeader, TimeSlotStatus status) {
        User user = getCurrentVendorOrAdmin(authorizationHeader);
        List<TimeSlot> timeSlots = status == null
                ? timeSlotRepository.findAllByOrderByStartTimeAscEndTimeAsc()
                : timeSlotRepository.findByStatusOrderByStartTimeAscEndTimeAsc(status);

        return timeSlots.stream()
                .map(TimeSlotResponse::from)
                .toList();
    }

    private User getCurrentVendorOrAdmin(String authorizationHeader) {
        String accessToken = extractBearerToken(authorizationHeader);
        Jwt jwt = decodeToken(accessToken);
        Long userId = parseUserId(jwt.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Access token user does not exist"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException("Account is not active");
        }
        RoleName roleName = user.getRole().getName();
        if (roleName != RoleName.VENDOR && roleName != RoleName.ADMIN) {
            throw new ForbiddenException("Vendor or admin role is required");
        }

        return user;
    }

    private String extractBearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith(BEARER_PREFIX)) {
            throw new UnauthorizedException("Access token is required");
        }

        String accessToken = authorizationHeader.substring(BEARER_PREFIX.length()).trim();
        if (accessToken.isEmpty()) {
            throw new UnauthorizedException("Access token is required");
        }

        return accessToken;
    }

    private Jwt decodeToken(String accessToken) {
        try {
            return jwtAccessTokenService.decode(accessToken);
        } catch (JwtException exception) {
            throw new UnauthorizedException("Access token is invalid or expired");
        }
    }

    private Long parseUserId(String subject) {
        try {
            return Long.parseLong(subject);
        } catch (NumberFormatException exception) {
            throw new UnauthorizedException("Access token is invalid or expired");
        }
    }
}
