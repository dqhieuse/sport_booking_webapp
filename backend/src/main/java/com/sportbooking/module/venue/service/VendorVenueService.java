package com.sportbooking.module.venue.service;

import com.sportbooking.common.api.PageResponse;
import com.sportbooking.common.exception.ForbiddenException;
import com.sportbooking.common.exception.InvalidRequestException;
import com.sportbooking.common.exception.ResourceNotFoundException;
import com.sportbooking.common.exception.UnauthorizedException;
import com.sportbooking.common.storage.ImageStorageOptions;
import com.sportbooking.common.storage.ImageStorageService;
import com.sportbooking.config.StorageProperties;
import com.sportbooking.module.auth.service.JwtAccessTokenService;
import com.sportbooking.module.court.entity.CourtStatus;
import com.sportbooking.module.court.repository.CourtRepository;
import com.sportbooking.module.user.entity.RoleName;
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.user.entity.UserStatus;
import com.sportbooking.module.user.repository.UserRepository;
import com.sportbooking.module.venue.dto.VendorVenueRequest;
import com.sportbooking.module.venue.dto.VendorVenueListResponse;
import com.sportbooking.module.venue.dto.VenueDetailResponse;
import com.sportbooking.module.venue.dto.VenueImageResponse;
import com.sportbooking.module.venue.dto.VenueVendorResponse;
import com.sportbooking.module.venue.entity.Venue;
import com.sportbooking.module.venue.entity.VenueImage;
import com.sportbooking.module.venue.entity.VenueStatus;
import com.sportbooking.module.venue.repository.VenueImageRepository;
import com.sportbooking.module.venue.repository.VenueRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class VendorVenueService {

    private static final String BEARER_PREFIX = "Bearer ";
    private static final String VENUE_IMAGE_DIRECTORY = "venues";
    private static final String VENUE_IMAGE_URL_PREFIX = "/uploads/venues/";

    private final VenueRepository venueRepository;
    private final VenueImageRepository venueImageRepository;
    private final CourtRepository courtRepository;
    private final UserRepository userRepository;
    private final JwtAccessTokenService jwtAccessTokenService;
    private final ImageStorageService imageStorageService;
    private final StorageProperties storageProperties;

    @Transactional(readOnly = true)
    public PageResponse<VendorVenueListResponse> getOwnVenues(
            String authorizationHeader,
            VenueStatus status,
            Pageable pageable
    ) {
        User vendor = getCurrentVendor(authorizationHeader);
        var venuePage = status == null
                ? venueRepository.findByVendorId(vendor.getId(), pageable)
                : venueRepository.findByVendorIdAndStatus(vendor.getId(), status, pageable);
        List<VendorVenueListResponse> items = venuePage.stream()
                .map(this::toListResponse)
                .toList();

        return PageResponse.from(venuePage, items);
    }

    @Transactional(readOnly = true)
    public VenueDetailResponse getOwnVenueById(String authorizationHeader, Long venueId) {
        User vendor = getCurrentVendor(authorizationHeader);
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
        if (!venue.getVendor().getId().equals(vendor.getId())) {
            throw new ForbiddenException("You cannot view another vendor's venue");
        }

        return toDetailResponse(venue);
    }

    @Transactional
    public VenueDetailResponse createVenue(String authorizationHeader, VendorVenueRequest request) {
        User vendor = getCurrentVendor(authorizationHeader);
        validateBusinessHours(request);

        Venue venue = new Venue();
        venue.setVendor(vendor);
        venue.setStatus(VenueStatus.ACTIVE);
        applyRequest(venue, request);

        return toDetailResponse(venueRepository.save(venue));
    }

    @Transactional
    public VenueImageResponse uploadVenueImage(
            Long venueId,
            String authorizationHeader,
            MultipartFile file,
            Integer requestedSortOrder,
            boolean requestedPrimary
    ) {
        User vendor = getCurrentVendor(authorizationHeader);
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
        if (!venue.getVendor().getId().equals(vendor.getId())) {
            throw new ForbiddenException("You cannot upload images for another vendor's venue");
        }

        long currentImageCount = venueImageRepository.countByVenueId(venueId);
        if (currentImageCount >= storageProperties.getVenueImage().getMaxImages()) {
            throw new InvalidRequestException("Venue can have at most "
                    + storageProperties.getVenueImage().getMaxImages() + " images");
        }

        int sortOrder = resolveSortOrder(venueId, requestedSortOrder);
        String imageUrl = imageStorageService.store(file, venueImageStorageOptions());

        try {
            shiftImagesFromSortOrder(venueId, sortOrder);
            boolean primary = requestedPrimary || currentImageCount == 0;
            if (primary) {
                unsetPrimaryImages(venueId);
                venueImageRepository.flush();
            }

            VenueImage image = new VenueImage();
            image.setVenue(venue);
            image.setImageUrl(imageUrl);
            image.setSortOrder(sortOrder);
            image.setPrimary(primary);

            return VenueImageResponse.from(venueImageRepository.saveAndFlush(image));
        } catch (RuntimeException exception) {
            imageStorageService.deleteIfManaged(imageUrl, venueImageStorageOptions());
            throw exception;
        }
    }

    @Transactional
    public void deleteVenueImage(Long venueId, Long imageId, String authorizationHeader) {
        User vendor = getCurrentVendor(authorizationHeader);
        Venue venue = getOwnedVenue(venueId, vendor, "You cannot delete images for another vendor's venue");
        VenueImage image = getVenueImageForVenue(venue.getId(), imageId);

        String imageUrl = image.getImageUrl();
        int deletedSortOrder = image.getSortOrder();
        boolean deletedPrimary = image.isPrimary();

        venueImageRepository.delete(image);
        venueImageRepository.flush();
        shiftImagesAfterDelete(venue.getId(), deletedSortOrder);

        if (deletedPrimary) {
            venueImageRepository.findByVenueIdOrderBySortOrderAsc(venue.getId())
                    .stream()
                    .findFirst()
                    .ifPresent(nextPrimaryImage -> nextPrimaryImage.setPrimary(true));
        }

        imageStorageService.deleteIfManaged(imageUrl, venueImageStorageOptions());
    }

    @Transactional
    public VenueImageResponse setPrimaryVenueImage(Long venueId, Long imageId, String authorizationHeader) {
        User vendor = getCurrentVendor(authorizationHeader);
        Venue venue = getOwnedVenue(venueId, vendor, "You cannot update images for another vendor's venue");
        VenueImage image = getVenueImageForVenue(venue.getId(), imageId);

        if (image.isPrimary()) {
            return VenueImageResponse.from(image);
        }

        unsetPrimaryImages(venue.getId());
        venueImageRepository.flush();
        image.setPrimary(true);

        return VenueImageResponse.from(venueImageRepository.saveAndFlush(image));
    }

    @Transactional
    public VenueDetailResponse updateVenue(Long venueId, String authorizationHeader, VendorVenueRequest request) {
        User vendor = getCurrentVendor(authorizationHeader);
        validateBusinessHours(request);

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
        if (!venue.getVendor().getId().equals(vendor.getId())) {
            throw new ForbiddenException("You cannot update another vendor's venue");
        }
        applyRequest(venue, request);

        return toDetailResponse(venueRepository.save(venue));
    }

    @Transactional
    public VenueDetailResponse deactivateVenue(Long venueId, String authorizationHeader) {
        User vendor = getCurrentVendor(authorizationHeader);
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
        if (!venue.getVendor().getId().equals(vendor.getId())) {
            throw new ForbiddenException("You cannot deactivate another vendor's venue");
        }

        venue.setStatus(VenueStatus.INACTIVE);
        courtRepository.findByVenueIdAndStatus(venueId, CourtStatus.ACTIVE)
                .forEach(court -> court.setStatus(CourtStatus.INACTIVE));

        return toDetailResponse(venueRepository.save(venue));
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

    private Venue getOwnedVenue(Long venueId, User vendor, String forbiddenMessage) {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));
        if (!venue.getVendor().getId().equals(vendor.getId())) {
            throw new ForbiddenException(forbiddenMessage);
        }

        return venue;
    }

    private VenueImage getVenueImageForVenue(Long venueId, Long imageId) {
        VenueImage image = venueImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Venue image not found"));
        if (!image.getVenue().getId().equals(venueId)) {
            throw new ResourceNotFoundException("Venue image not found");
        }

        return image;
    }

    private int resolveSortOrder(Long venueId, Integer requestedSortOrder) {
        if (requestedSortOrder != null && requestedSortOrder <= 0) {
            throw new InvalidRequestException("Sort order must be greater than 0");
        }

        int endSortOrder = venueImageRepository.findMaxSortOrderByVenueId(venueId) + 1;
        if (requestedSortOrder == null || requestedSortOrder > endSortOrder) {
            return endSortOrder;
        }

        return requestedSortOrder;
    }

    private void shiftImagesFromSortOrder(Long venueId, int sortOrder) {
        List<VenueImage> imagesToShift = venueImageRepository
                .findByVenueIdAndSortOrderGreaterThanEqualOrderBySortOrderDesc(venueId, sortOrder);
        for (VenueImage image : imagesToShift) {
            image.setSortOrder(image.getSortOrder() + 1);
            venueImageRepository.saveAndFlush(image);
        }
    }

    private void shiftImagesAfterDelete(Long venueId, int deletedSortOrder) {
        List<VenueImage> imagesToShift = venueImageRepository
                .findByVenueIdAndSortOrderGreaterThanOrderBySortOrderAsc(venueId, deletedSortOrder);
        for (VenueImage image : imagesToShift) {
            image.setSortOrder(image.getSortOrder() - 1);
        }
    }

    private void unsetPrimaryImages(Long venueId) {
        venueImageRepository.findByVenueIdOrderBySortOrderAsc(venueId)
                .forEach(image -> image.setPrimary(false));
    }

    private ImageStorageOptions venueImageStorageOptions() {
        return new ImageStorageOptions(
                VENUE_IMAGE_DIRECTORY,
                VENUE_IMAGE_URL_PREFIX,
                storageProperties.getVenueImage().getMaxFileSize(),
                storageProperties.getVenueImage().getAllowedContentTypes(),
                "Venue image is required",
                "Venue image must be JPEG, PNG, or WebP",
                "Venue image must be at most 5MB",
                "Could not store venue image"
        );
    }

    private void validateBusinessHours(VendorVenueRequest request) {
        if (!request.openingTime().isBefore(request.closingTime())) {
            throw new InvalidRequestException("Opening time must be before closing time");
        }
    }

    private void applyRequest(Venue venue, VendorVenueRequest request) {
        venue.setName(request.name().trim());
        venue.setAddress(request.address().trim());
        venue.setDescription(normalizeNullableText(request.description()));
        venue.setPhone(request.phone().trim());
        venue.setOpeningTime(request.openingTime());
        venue.setClosingTime(request.closingTime());
    }

    private VendorVenueListResponse toListResponse(Venue venue) {
        return new VendorVenueListResponse(
                venue.getId(),
                venue.getName(),
                venue.getAddress(),
                venue.getPhone(),
                venue.getOpeningTime(),
                venue.getClosingTime(),
                venue.getStatus(),
                getPrimaryImageUrl(venue.getId()),
                courtRepository.countByVenueId(venue.getId()),
                venue.getCreatedAt()
        );
    }

    private VenueDetailResponse toDetailResponse(Venue venue) {
        return new VenueDetailResponse(
                venue.getId(),
                venue.getName(),
                venue.getAddress(),
                venue.getDescription(),
                venue.getPhone(),
                venue.getOpeningTime(),
                venue.getClosingTime(),
                venue.getStatus(),
                getPrimaryImageUrl(venue.getId()),
                new VenueVendorResponse(venue.getVendor().getId(), venue.getVendor().getFullName())
        );
    }

    private String getPrimaryImageUrl(Long venueId) {
        return venueImageRepository.findByVenueIdAndPrimaryTrue(venueId)
                .map(image -> image.getImageUrl())
                .orElse(null);
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
