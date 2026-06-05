package com.sportbooking.module.court.service;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.sportbooking.common.api.PageResponse;
import com.sportbooking.common.exception.ForbiddenException;
import com.sportbooking.common.exception.InvalidRequestException;
import com.sportbooking.common.exception.ResourceNotFoundException;
import com.sportbooking.common.storage.ImageStorageOptions;
import com.sportbooking.common.storage.ImageStorageService;
import com.sportbooking.config.StorageProperties;
import com.sportbooking.module.auth.service.CurrentUserService;
import com.sportbooking.module.court.dto.CourtImageResponse;
import com.sportbooking.module.court.dto.CourtSportResponse;
import com.sportbooking.module.court.dto.VendorCourtDetailResponse;
import com.sportbooking.module.court.dto.VendorCourtListResponse;
import com.sportbooking.module.court.dto.VendorCourtRequest;
import com.sportbooking.module.court.dto.VendorCourtTimeSlotConfigResponse;
import com.sportbooking.module.court.dto.VendorCourtTimeSlotResponse;
import com.sportbooking.module.court.dto.VendorCourtVenueResponse;
import com.sportbooking.module.court.entity.Court;
import com.sportbooking.module.court.entity.CourtImage;
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
import com.sportbooking.module.user.entity.User;
import com.sportbooking.module.venue.entity.Venue;
import com.sportbooking.module.venue.entity.VenueStatus;
import com.sportbooking.module.venue.repository.VenueRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VendorCourtService {

    private static final String COURT_IMAGE_DIRECTORY = "courts";
    private static final String COURT_IMAGE_URL_PREFIX = "/uploads/courts/";

    private final CourtRepository courtRepository;
    private final CourtImageRepository courtImageRepository;
    private final CourtTimeSlotRepository courtTimeSlotRepository;
    private final SportRepository sportRepository;
    private final VenueRepository venueRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final CurrentUserService currentUserService;
    private final ImageStorageService imageStorageService;
    private final StorageProperties storageProperties;

    @Transactional(readOnly = true)
    public PageResponse<VendorCourtListResponse> getOwnCourts(
            String authorizationHeader,
            Long venueId,
            Long sportId,
            CourtStatus status,
            Pageable pageable
    ) {
        User vendor = currentUserService.requireActiveVendor(authorizationHeader);
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
        User vendor = currentUserService.requireActiveVendor(authorizationHeader);
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Court not found"));
        if (!court.getVenue().getVendor().getId().equals(vendor.getId())) {
            throw new ForbiddenException("You cannot view another vendor's court");
        }

        return toVendorDetailResponse(court);
    }

    @Transactional(readOnly = true)
    public List<VendorCourtTimeSlotConfigResponse> getOwnCourtTimeSlots(Long courtId, String authorizationHeader) {
        User vendor = currentUserService.requireActiveVendor(authorizationHeader);
        Court court = getOwnedCourt(courtId, vendor, "You cannot view another vendor's court time slots");
        Map<Long, TimeSlotStatus> courtSlotStatusByTimeSlotId = courtTimeSlotRepository.findByCourtId(court.getId())
                .stream()
                .collect(Collectors.toMap(
                        courtTimeSlot -> courtTimeSlot.getTimeSlot().getId(),
                        CourtTimeSlot::getStatus
                ));

        return timeSlotRepository.findByStatusOrderByStartTimeAscEndTimeAsc(TimeSlotStatus.ACTIVE)
                .stream()
                .map(timeSlot -> new VendorCourtTimeSlotConfigResponse(
                        timeSlot.getId(),
                        timeSlot.getStartTime(),
                        timeSlot.getEndTime(),
                        courtSlotStatusByTimeSlotId.getOrDefault(timeSlot.getId(), TimeSlotStatus.INACTIVE)
                ))
                .toList();
    }

    @Transactional
    public VendorCourtDetailResponse createCourt(String authorizationHeader, VendorCourtRequest request) {
        User vendor = currentUserService.requireActiveVendor(authorizationHeader);
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
    public CourtImageResponse uploadCourtImage(
            Long courtId,
            String authorizationHeader,
            MultipartFile file,
            Integer requestedSortOrder,
            boolean requestedPrimary
    ) {
        User vendor = currentUserService.requireActiveVendor(authorizationHeader);
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Court not found"));
        if (!court.getVenue().getVendor().getId().equals(vendor.getId())) {
            throw new ForbiddenException("You cannot upload images for another vendor's court");
        }

        long currentImageCount = courtImageRepository.countByCourtId(courtId);
        if (currentImageCount >= storageProperties.getCourtImage().getMaxImages()) {
            throw new InvalidRequestException("Court can have at most "
                    + storageProperties.getCourtImage().getMaxImages() + " images");
        }

        int sortOrder = resolveImageSortOrder(courtId, requestedSortOrder);
        String imageUrl = imageStorageService.store(file, courtImageStorageOptions());

        try {
            shiftCourtImagesFromSortOrder(courtId, sortOrder);
            boolean primary = requestedPrimary || currentImageCount == 0;
            if (primary) {
                unsetPrimaryCourtImages(courtId);
                courtImageRepository.flush();
            }

            CourtImage image = new CourtImage();
            image.setCourt(court);
            image.setImageUrl(imageUrl);
            image.setSortOrder(sortOrder);
            image.setPrimary(primary);

            return CourtImageResponse.from(courtImageRepository.saveAndFlush(image));
        } catch (RuntimeException exception) {
            imageStorageService.deleteIfManaged(imageUrl, courtImageStorageOptions());
            throw exception;
        }
    }

    @Transactional
    public void deleteCourtImage(Long courtId, Long imageId, String authorizationHeader) {
        User vendor = currentUserService.requireActiveVendor(authorizationHeader);
        Court court = getOwnedCourt(courtId, vendor, "You cannot delete images for another vendor's court");
        CourtImage image = getCourtImageForCourt(court.getId(), imageId);

        String imageUrl = image.getImageUrl();
        int deletedSortOrder = image.getSortOrder();
        boolean deletedPrimary = image.isPrimary();

        courtImageRepository.delete(image);
        courtImageRepository.flush();
        shiftCourtImagesAfterDelete(court.getId(), deletedSortOrder);

        if (deletedPrimary) {
            courtImageRepository.findByCourtIdOrderBySortOrderAsc(court.getId())
                    .stream()
                    .findFirst()
                    .ifPresent(nextPrimaryImage -> nextPrimaryImage.setPrimary(true));
        }

        imageStorageService.deleteIfManaged(imageUrl, courtImageStorageOptions());
    }

    @Transactional
    public CourtImageResponse setPrimaryCourtImage(Long courtId, Long imageId, String authorizationHeader) {
        User vendor = currentUserService.requireActiveVendor(authorizationHeader);
        Court court = getOwnedCourt(courtId, vendor, "You cannot update images for another vendor's court");
        CourtImage image = getCourtImageForCourt(court.getId(), imageId);

        if (image.isPrimary()) {
            return CourtImageResponse.from(image);
        }

        unsetPrimaryCourtImages(court.getId());
        courtImageRepository.flush();
        image.setPrimary(true);

        return CourtImageResponse.from(courtImageRepository.saveAndFlush(image));
    }

    @Transactional
    public VendorCourtDetailResponse updateCourt(Long courtId, String authorizationHeader, VendorCourtRequest request) {
        User vendor = currentUserService.requireActiveVendor(authorizationHeader);
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

    @Transactional
    public VendorCourtDetailResponse deactivateCourt(Long courtId, String authorizationHeader) {
        User vendor = currentUserService.requireActiveVendor(authorizationHeader);
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Court not found"));
        if (!court.getVenue().getVendor().getId().equals(vendor.getId())) {
            throw new ForbiddenException("You cannot deactivate another vendor's court");
        }

        court.setStatus(CourtStatus.INACTIVE);
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

    private Court getOwnedCourt(Long courtId, User vendor, String forbiddenMessage) {
        Court court = courtRepository.findById(courtId)
                .orElseThrow(() -> new ResourceNotFoundException("Court not found"));
        if (!court.getVenue().getVendor().getId().equals(vendor.getId())) {
            throw new ForbiddenException(forbiddenMessage);
        }

        return court;
    }

    private CourtImage getCourtImageForCourt(Long courtId, Long imageId) {
        CourtImage image = courtImageRepository.findById(imageId)
                .orElseThrow(() -> new ResourceNotFoundException("Court image not found"));
        if (!image.getCourt().getId().equals(courtId)) {
            throw new ResourceNotFoundException("Court image not found");
        }

        return image;
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

    private int resolveImageSortOrder(Long courtId, Integer requestedSortOrder) {
        if (requestedSortOrder != null && requestedSortOrder <= 0) {
            throw new InvalidRequestException("Sort order must be greater than 0");
        }

        int endSortOrder = courtImageRepository.findMaxSortOrderByCourtId(courtId) + 1;
        if (requestedSortOrder == null || requestedSortOrder > endSortOrder) {
            return endSortOrder;
        }

        return requestedSortOrder;
    }

    private void shiftCourtImagesFromSortOrder(Long courtId, int sortOrder) {
        List<CourtImage> imagesToShift = courtImageRepository
                .findByCourtIdAndSortOrderGreaterThanEqualOrderBySortOrderDesc(courtId, sortOrder);
        for (CourtImage image : imagesToShift) {
            image.setSortOrder(image.getSortOrder() + 1);
            courtImageRepository.saveAndFlush(image);
        }
    }

    private void shiftCourtImagesAfterDelete(Long courtId, int deletedSortOrder) {
        List<CourtImage> imagesToShift = courtImageRepository
                .findByCourtIdAndSortOrderGreaterThanOrderBySortOrderAsc(courtId, deletedSortOrder);
        for (CourtImage image : imagesToShift) {
            image.setSortOrder(image.getSortOrder() - 1);
        }
    }

    private void unsetPrimaryCourtImages(Long courtId) {
        courtImageRepository.findByCourtIdOrderBySortOrderAsc(courtId)
                .forEach(image -> image.setPrimary(false));
    }

    private ImageStorageOptions courtImageStorageOptions() {
        return new ImageStorageOptions(
                COURT_IMAGE_DIRECTORY,
                COURT_IMAGE_URL_PREFIX,
                storageProperties.getCourtImage().getMaxFileSize(),
                storageProperties.getCourtImage().getAllowedContentTypes(),
                "Court image is required",
                "Court image must be JPEG, PNG, or WebP",
                "Court image must be at most 5MB",
                "Could not store court image"
        );
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

    private String normalizeNullableText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }

}
