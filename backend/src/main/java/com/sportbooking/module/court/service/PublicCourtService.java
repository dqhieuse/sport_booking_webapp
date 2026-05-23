package com.sportbooking.module.court.service;

import com.sportbooking.common.api.PageResponse;
import com.sportbooking.common.exception.ResourceNotFoundException;
import com.sportbooking.module.court.dto.CourtDetailResponse;
import com.sportbooking.module.court.dto.CourtImageResponse;
import com.sportbooking.module.court.dto.CourtListResponse;
import com.sportbooking.module.court.dto.CourtSportResponse;
import com.sportbooking.module.court.dto.CourtVenueDetailResponse;
import com.sportbooking.module.court.dto.CourtVenueListResponse;
import com.sportbooking.module.court.entity.Court;
import com.sportbooking.module.court.entity.CourtStatus;
import com.sportbooking.module.court.repository.CourtImageRepository;
import com.sportbooking.module.court.repository.CourtRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PublicCourtService {

    private final CourtRepository courtRepository;
    private final CourtImageRepository courtImageRepository;

    @Transactional(readOnly = true)
    public PageResponse<CourtListResponse> getActiveCourts(
            Long sportId,
            Long venueId,
            String keyword,
            Pageable pageable
    ) {
        String normalizedKeyword = normalizeKeyword(keyword);
        var courtPage = normalizedKeyword == null
                ? courtRepository.findPublicCourts(CourtStatus.ACTIVE, sportId, venueId, pageable)
                : courtRepository.searchPublicCourts(
                        CourtStatus.ACTIVE,
                        sportId,
                        venueId,
                        toLikePattern(normalizedKeyword),
                        pageable
                );
        List<CourtListResponse> items = courtPage.stream()
                .map(this::toListResponse)
                .toList();

        return PageResponse.from(courtPage, items);
    }

    @Transactional(readOnly = true)
    public CourtDetailResponse getActiveCourtById(Long id) {
        Court court = courtRepository.findByIdAndStatus(id, CourtStatus.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Court not found"));

        return toDetailResponse(court);
    }

    @Transactional(readOnly = true)
    public List<CourtImageResponse> getActiveCourtImages(Long courtId) {
        if (!courtRepository.existsByIdAndStatus(courtId, CourtStatus.ACTIVE)) {
            throw new ResourceNotFoundException("Court not found");
        }

        return courtImageRepository.findByCourtIdOrderBySortOrderAsc(courtId)
                .stream()
                .map(CourtImageResponse::from)
                .toList();
    }

    private CourtListResponse toListResponse(Court court) {
        return new CourtListResponse(
                court.getId(),
                court.getName(),
                court.getPricePerHour(),
                court.getStatus(),
                new CourtSportResponse(court.getSport().getId(), court.getSport().getName()),
                new CourtVenueListResponse(court.getVenue().getId(), court.getVenue().getName(), court.getVenue().getAddress()),
                getPrimaryImageUrl(court.getId())
        );
    }

    private CourtDetailResponse toDetailResponse(Court court) {
        return new CourtDetailResponse(
                court.getId(),
                court.getName(),
                court.getDescription(),
                court.getPricePerHour(),
                court.getStatus(),
                new CourtSportResponse(court.getSport().getId(), court.getSport().getName()),
                new CourtVenueDetailResponse(
                        court.getVenue().getId(),
                        court.getVenue().getName(),
                        court.getVenue().getAddress(),
                        court.getVenue().getOpeningTime(),
                        court.getVenue().getClosingTime()
                ),
                getPrimaryImageUrl(court.getId())
        );
    }

    private String getPrimaryImageUrl(Long courtId) {
        return courtImageRepository.findByCourtIdAndPrimaryTrue(courtId)
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
