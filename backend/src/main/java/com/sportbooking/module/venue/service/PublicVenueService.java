package com.sportbooking.module.venue.service;

import com.sportbooking.common.api.PageResponse;
import com.sportbooking.common.exception.ResourceNotFoundException;
import com.sportbooking.module.venue.dto.VenueDetailResponse;
import com.sportbooking.module.venue.dto.VenueListResponse;
import com.sportbooking.module.venue.dto.VenueVendorResponse;
import com.sportbooking.module.venue.entity.Venue;
import com.sportbooking.module.venue.entity.VenueStatus;
import com.sportbooking.module.venue.repository.VenueImageRepository;
import com.sportbooking.module.venue.repository.VenueRepository;
import java.util.List;
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
        List<VenueListResponse> items = venuePage.stream()
                .map(this::toListResponse)
                .toList();

        return PageResponse.from(venuePage, items);
    }

    @Transactional(readOnly = true)
    public VenueDetailResponse getActiveVenueById(Long id) {
        Venue venue = venueRepository.findByIdAndStatus(id, VenueStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Venue not found"));

        return toDetailResponse(venue);
    }

    private VenueListResponse toListResponse(Venue venue) {
        return new VenueListResponse(
                venue.getId(),
                venue.getName(),
                venue.getAddress(),
                venue.getPhone(),
                venue.getOpeningTime(),
                venue.getClosingTime(),
                venue.getStatus(),
                getPrimaryImageUrl(venue.getId())
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
