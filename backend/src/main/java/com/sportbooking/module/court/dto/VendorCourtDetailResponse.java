package com.sportbooking.module.court.dto;

import com.sportbooking.module.court.entity.CourtStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record VendorCourtDetailResponse(
        Long id,
        String name,
        String description,
        BigDecimal pricePerHour,
        CourtStatus status,
        CourtSportResponse sport,
        VendorCourtVenueResponse venue,
        String primaryImageUrl,
        List<VendorCourtTimeSlotResponse> activeTimeSlots,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
