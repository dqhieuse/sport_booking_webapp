package com.sportbooking.module.court.service;

import com.sportbooking.common.api.PageResponse;
import com.sportbooking.common.exception.ForbiddenException;
import com.sportbooking.common.exception.InvalidRequestException;
import com.sportbooking.common.exception.ResourceNotFoundException;
import com.sportbooking.common.exception.UnauthorizedException;
import com.sportbooking.module.auth.service.JwtAccessTokenService;
import com.sportbooking.module.court.dto.CourtSportResponse;
import com.sportbooking.module.court.dto.VendorCourtDetailResponse;
import com.sportbooking.module.court.dto.VendorCourtListResponse;
import com.sportbooking.module.court.dto.VendorCourtRequest;
import com.sportbooking.module.court.dto.VendorCourtTimeSlotResponse;
import com.sportbooking.module.court.dto.VendorCourtVenueResponse;
import com.sportbooking.module.court.entity.Court;
import com.sportbooking.module.court.entity.CourtStatus;
import com.sportbooking.module.court.entity.CourtTimeSlot;
import com.sportbooking.module.court.repository.CourtImageRepository;
import com.sportbooking.module.court.repository.CourtRepository;
import com.sportbooking.module.court.repository.CourtTimeSlotRepository;
import com.sportbooking.module.sport.entity.Sport;
import com.sportbooking.module.sport.entity.SportStatus;
import com.sportbooking.module.sport.repository.SportRepository;
import com.sportbooking.module.timeslot.entity.TimeSlot;
import com.sportbooking.module.timeslot.entity.TimeSlotStatus;
import com.sportbooking.module.timeslot.repository.TimeSlotRepository;
import com.sportbooking.module.user.entity.RoleName;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.entity.UserStatus;
import com.sportbooking.module.user.repository.UserRepository;
import com.sportbooking.module.venue.entity.Venue;
import com.sportbooking.module.venue.entity.VenueStatus;
import com.sportbooking.module.venue.repository.VenueRepository;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VendorCourtService {

    private static final String BEARER_PREFIX = "Bearer ";

    private final CourtRepository courtRepository;
    private final CourtImageRepository courtImageRepository;
    private final CourtTimeSlotRepository courtTimeSlotRepository;
    private final SportRepository sportRepository;
    private final VenueRepository venueRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final UserRepository userRepository;
    private final JwtAccessTokenService jwtAccessTokenService;

    @Transactional(readOnly = true)
    public PageResponse<VendorCourtListResponse> getOwnCourts(
            String authorizationHeader,
            Long venueId,
            Long sportId,
            CourtStatus status,
            Pageable pageable
    ) {
        User vendor = getCurrentVendor(authorizationHeader);
        var courtPage = courtRepository.findVendorCourts(
                vendor.getId(),
                venueId,
                sportId,
                status,
                pageable
        );
        List<VendorCourtListResponse> items = courtPage.stream()
                .map(this::toListResponse)
                .toList();

        return PageResponse.from(courtPage, items);
    }

    @Transactional(readOnly = true)
    public VendorCourtDetailResponse getOwnCourtById(String authorizationHeader, Long courtId) {
        User vendor = getCurrentVendor(authorizationHeader);
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Court not found"));
        if (!court.getVenue().getVendor().getId().equals(vendor.getId())) {
            throw new ForbiddenException("You cannot view another vendor's court");
        }

        return toVendorDetailResponse(court);
    }

    @Transactional
    public VendorCourtDetailResponse createCourt(String authorizationHeader, VendorCourtRequest request) {
        User vendor = getCurrentVendor(authorizationHeader);
        Venue venue = getOwnedActiveVenue(request.venueId(), vendor);
        Sport sport = getActiveSport(request.sportId());

        Court court = new Court();
        court.setStatus(CourtStatus.ACTIVE);
        applyRequest(court, request, sport, venue);
        Court savedCourt = courtRepository.save(court);
        syncTimeSlots(savedCourt, request.timeSlotIds());

        return toVendorDetailResponse(savedCourt);
    }

    @Transactional
    public VendorCourtDetailResponse updateCourt(Long courtId, String authorizationHeader, VendorCourtRequest request) {
        User vendor = getCurrentVendor(authorizationHeader);
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Court not found"));
        if (!court.getVenue().getVendor().getId().equals(vendor.getId())) {
            throw new ForbiddenException("You cannot update another vendor's court");
        }

        Venue venue = getOwnedActiveVenue(request.venueId(), vendor);
        Sport sport = getActiveSport(request.sportId());
        applyRequest(court, request, sport, venue);
        syncTimeSlots(court, request.timeSlotIds());

        return toVendorDetailResponse(courtRepository.save(court));
    }

    private void applyRequest(Court court, VendorCourtRequest request, Sport sport, Venue venue) {
        court.setName(request.name().trim());
        court.setSport(sport);
        court.setVenue(venue);
        court.setPricePerHour(request.pricePerHour());
        court.setDescription(normalizeNullableText(request.description()));
    }

    private Venue getOwnedActiveVenue(Long venueId, User vendor) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
        if (!venue.getVendor().getId().equals(vendor.getId())) {
            throw new ForbiddenException("You cannot manage courts under another vendor's venue");
        }
        if (venue.getStatus() != VenueStatus.ACTIVE) {
            throw new InvalidRequestException("Venue must be active");
        }

        return venue;
    }

    private Sport getActiveSport(Long sportId) {
        return sportRepository.findByIdAndStatus(sportId, SportStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Sport not found"));
    }

    private void syncTimeSlots(Court court, List<Long> timeSlotIds) {
        if (timeSlotIds == null) {
            return;
        }

        Set<Long> requestedIds = new LinkedHashSet<>(timeSlotIds);
        List<CourtTimeSlot> existingSlots = courtTimeSlotRepository.findByCourtId(court.getId());
        existingSlots.forEach(courtTimeSlot -> {
            TimeSlotStatus status = requestedIds.contains(courtTimeSlot.getTimeSlot().getId())
                    ? TimeSlotStatus.ACTIVE
                    : TimeSlotStatus.INACTIVE;
            courtTimeSlot.setStatus(status);
        });

        Set<Long> existingIds = existingSlots.stream()
                .map(courtTimeSlot -> courtTimeSlot.getTimeSlot().getId())
                .collect(Collectors.toSet());
        List<CourtTimeSlot> newSlots = requestedIds.stream()
                .filter(timeSlotId -> !existingIds.contains(timeSlotId))
                .map(timeSlotId -> createCourtTimeSlot(court, timeSlotId))
                .toList();

        courtTimeSlotRepository.saveAll(existingSlots);
        courtTimeSlotRepository.saveAll(newSlots);
    }

    private CourtTimeSlot createCourtTimeSlot(Court court, Long timeSlotId) {
        TimeSlot timeSlot = timeSlotRepository.findById(timeSlotId)
                .orElseThrow(() -> new ResourceNotFoundException("Time slot not found"));
        if (timeSlot.getStatus() != TimeSlotStatus.ACTIVE) {
            throw new InvalidRequestException("Time slot must be active");
        }

        CourtTimeSlot courtTimeSlot = new CourtTimeSlot();
        courtTimeSlot.setCourt(court);
        courtTimeSlot.setTimeSlot(timeSlot);
        courtTimeSlot.setStatus(TimeSlotStatus.ACTIVE);
        return courtTimeSlot;
    }

    private VendorCourtDetailResponse toVendorDetailResponse(Court court) {
        List<VendorCourtTimeSlotResponse> activeTimeSlots = courtTimeSlotRepository.findByCourtId(court.getId()).stream()
                .filter(cts -> cts.getStatus() == TimeSlotStatus.ACTIVE)
                .map(cts -> new VendorCourtTimeSlotResponse(
                        cts.getTimeSlot().getId(),
                        cts.getTimeSlot().getStartTime(),
                        cts.getTimeSlot().getEndTime()
                ))
                .toList();

        return new VendorCourtDetailResponse(
                court.getId(),
                court.getName(),
                court.getDescription(),
                court.getPricePerHour(),
                court.getStatus(),
                new CourtSportResponse(court.getSport().getId(), court.getSport().getName()),
                new VendorCourtVenueResponse(court.getVenue().getId(), court.getVenue().getName()),
                getPrimaryImageUrl(court.getId()),
                activeTimeSlots,
                court.getCreatedAt(),
                court.getUpdatedAt()
        );
    }

    private VendorCourtListResponse toListResponse(Court court) {
        return new VendorCourtListResponse(
                court.getId(),
                court.getName(),
                court.getPricePerHour(),
                court.getStatus(),
                new CourtSportResponse(court.getSport().getId(), court.getSport().getName()),
                new VendorCourtVenueResponse(court.getVenue().getId(), court.getVenue().getName()),
                getPrimaryImageUrl(court.getId()),
                courtTimeSlotRepository.countByCourtIdAndStatus(court.getId(), TimeSlotStatus.ACTIVE),
                court.getCreatedAt()
        );
    }

    private String getPrimaryImageUrl(Long courtId) {
        return courtImageRepository.findByCourtIdAndPrimaryTrue(courtId)
                .map(image -> image.getImageUrl())
                .orElse(null);
    }

    private User getCurrentVendor(String authorizationHeader) {
        String accessToken = extractBearerToken(authorizationHeader);
        Jwt jwt = decodeToken(accessToken);
        Long userId = parseUserId(jwt.getSubject());
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("Access token user does not exist"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ForbiddenException("Account is not active");
        }
        if (user.getRole().getName() != RoleName.VENDOR) {
            throw new ForbiddenException("Vendor role is required");
        }

        return user;
    }

    private String normalizeNullableText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
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
