package com.sportbooking.module.court.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sportbooking.common.api.PageResponse;
import com.sportbooking.common.exception.InvalidRequestException;
import com.sportbooking.common.exception.ResourceNotFoundException;
import com.sportbooking.module.booking.entity.BookingStatus;
import com.sportbooking.module.booking.repository.BookingTimeSlotRepository;
import com.sportbooking.module.court.dto.AvailableTimeSlotResponse;
import com.sportbooking.module.court.dto.AvailableTimeSlotStatus;
import com.sportbooking.module.court.dto.CourtAvailableSlotsResponse;
import com.sportbooking.module.court.dto.CourtDetailResponse;
import com.sportbooking.module.court.dto.CourtImageResponse;
import com.sportbooking.module.court.dto.CourtListResponse;
import com.sportbooking.module.court.dto.CourtSportResponse;
import com.sportbooking.module.court.dto.CourtVenueDetailResponse;
import com.sportbooking.module.court.dto.CourtVenueListResponse;
import com.sportbooking.module.court.entity.Court;
import com.sportbooking.module.court.entity.CourtStatus;
import com.sportbooking.module.court.entity.CourtTimeSlot;
import com.sportbooking.module.court.repository.CourtImageRepository;
import com.sportbooking.module.court.repository.CourtRepository;
import com.sportbooking.module.court.repository.CourtTimeSlotRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PublicCourtService {

    private final CourtRepository courtRepository;
    private final CourtImageRepository courtImageRepository;
    private final CourtTimeSlotRepository courtTimeSlotRepository;
    private final BookingTimeSlotRepository bookingTimeSlotRepository;

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
        Map<Long, String> primaryImageUrlByCourtId = loadPrimaryImageUrls(courtPage.getContent());
        List<CourtListResponse> items = courtPage.stream()
                .map(court -> toListResponse(court, primaryImageUrlByCourtId.get(court.getId())))
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

    @Transactional(readOnly = true)
    public CourtAvailableSlotsResponse getAvailableSlots(Long courtId, LocalDate bookingDate) {
        if (bookingDate.isBefore(LocalDate.now())) {
            throw new InvalidRequestException("Booking date must not be in the past");
        }
        if (bookingDate.isAfter(LocalDate.now().plusDays(13))) {
            throw new InvalidRequestException("Booking date must be within the next 14 days");
        }

        if (!courtRepository.existsByIdAndStatus(courtId, CourtStatus.ACTIVE)) {
            throw new ResourceNotFoundException("Court not found");
        }

        Set<Long> bookedTimeSlotIds = bookingTimeSlotRepository.findBookedTimeSlotIds(
                courtId,
                bookingDate,
                Set.of(BookingStatus.PENDING, BookingStatus.CONFIRMED)
        );
        List<AvailableTimeSlotResponse> items = courtTimeSlotRepository
                .findConfiguredSlots(courtId)
                .stream()
                .map(courtTimeSlot -> new AvailableTimeSlotResponse(
                        courtTimeSlot.getTimeSlot().getId(),
                        courtTimeSlot.getTimeSlot().getStartTime(),
                        courtTimeSlot.getTimeSlot().getEndTime(),
                        getAvailableTimeSlotStatus(
                                bookingDate,
                                courtTimeSlot,
                                bookedTimeSlotIds
                        )
                ))
                .toList();

        return new CourtAvailableSlotsResponse(courtId, bookingDate, items);
    }

    private AvailableTimeSlotStatus getAvailableTimeSlotStatus(
            LocalDate bookingDate,
            CourtTimeSlot courtTimeSlot,
            Set<Long> bookedTimeSlotIds
    ) {
        LocalTime startTime = courtTimeSlot.getTimeSlot().getStartTime();
        boolean isExpired = bookingDate.isEqual(LocalDate.now()) && !startTime.isAfter(LocalTime.now());
        if (isExpired) {
            return AvailableTimeSlotStatus.EXPIRED;
        }

        boolean isBooked = bookedTimeSlotIds.contains(courtTimeSlot.getTimeSlot().getId());
        return isBooked ? AvailableTimeSlotStatus.BOOKED : AvailableTimeSlotStatus.AVAILABLE;
    }

    private CourtListResponse toListResponse(Court court, String primaryImageUrl) {
        return new CourtListResponse(
                court.getId(),
                court.getName(),
                court.getPricePerHour(),
                court.getStatus(),
                new CourtSportResponse(court.getSport().getId(), court.getSport().getName()),
                new CourtVenueListResponse(court.getVenue().getId(), court.getVenue().getName(), court.getVenue().getAddress()),
                primaryImageUrl
        );
    }

    private Map<Long, String> loadPrimaryImageUrls(List<Court> courts) {
        if (courts.isEmpty()) {
            return Map.of();
        }

        List<Long> courtIds = courts.stream().map(Court::getId).toList();
        return courtImageRepository.findPrimaryImagesByCourtIdIn(courtIds).stream()
                .collect(Collectors.toMap(
                        CourtImageRepository.PrimaryImageView::getCourtId,
                        CourtImageRepository.PrimaryImageView::getImageUrl
                ));
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
