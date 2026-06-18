package com.sportbooking.module.venue.service;

import com.sportbooking.common.api.PageResponse;
import com.sportbooking.common.exception.ResourceNotFoundException;
import com.sportbooking.module.venue.dto.VenueDetailResponse;
import com.sportbooking.module.venue.dto.VenueImageResponse;
import com.sportbooking.module.venue.dto.VenueListResponse;
import com.sportbooking.module.venue.dto.VenueVendorResponse;
import com.sportbooking.module.venue.entity.Venue;
import com.sportbooking.module.venue.entity.VenueStatus;
import com.sportbooking.module.venue.repository.VenueImageRepository;
import com.sportbooking.module.venue.repository.VenueRepository;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicVenueService {

    private final VenueRepository venueRepository;
    private final VenueImageRepository venueImageRepository;

    @Transactional(readOnly = true)
    public PageResponse<VenueListResponse> getActiveVenues(String keyword, Pageable pageable) {
        String normalizedKeyword = normalizeKeyword(keyword);
        var venuePage = normalizedKeyword == null
                ? venueRepository.findPublicVenues(VenueStatus.ACTIVE, pageable)
                : venueRepository.searchPublicVenues(VenueStatus.ACTIVE, toLikePattern(normalizedKeyword), pageable);
        Map<Long, String> primaryImageUrlByVenueId = loadPrimaryImageUrls(venuePage.getContent());
        List<VenueListResponse> items = venuePage.stream()
                .map(venue -> toListResponse(venue, primaryImageUrlByVenueId.get(venue.getId())))
                .toList();

        return PageResponse.from(venuePage, items);
    }

    @Transactional(readOnly = true)
    public VenueDetailResponse getActiveVenueById(Long id) {
        Venue venue = venueRepository.findByIdAndStatus(id, VenueStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));

        return toDetailResponse(venue);
    }

    @Transactional(readOnly = true)
    public List<VenueImageResponse> getActiveVenueImages(Long venueId) {
        if (!venueRepository.existsByIdAndStatus(venueId, VenueStatus.ACTIVE)) {
            throw new ResourceNotFoundException("Venue not found");
        }

        return venueImageRepository.findByVenueIdOrderBySortOrderAsc(venueId)
                .stream()
                .map(VenueImageResponse::from)
                .toList();
    }

    private VenueListResponse toListResponse(Venue venue, String primaryImageUrl) {
        return new VenueListResponse(
                venue.getId(),
                venue.getName(),
                venue.getAddress(),
                venue.getPhone(),
                venue.getOpeningTime(),
                venue.getClosingTime(),
                venue.getStatus(),
                primaryImageUrl
        );
    }

    private Map<Long, String> loadPrimaryImageUrls(List<Venue> venues) {
        if (venues.isEmpty()) {
            return Map.of();
        }

        List<Long> venueIds = venues.stream().map(Venue::getId).toList();
        return venueImageRepository.findPrimaryImagesByVenueIdIn(venueIds).stream()
                .collect(Collectors.toMap(
                        VenueImageRepository.PrimaryImageView::getVenueId,
                        VenueImageRepository.PrimaryImageView::getImageUrl
                ));
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

    private String normalizeKeyword(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }

        return keyword.trim().toLowerCase();
    }

    private String toLikePattern(String keyword) {
        return "%" + keyword + "%";
    }
}
