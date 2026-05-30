package com.sportbooking.module.court.dto;

import com.sportbooking.module.court.entity.CourtStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VendorCourtListResponse(
        Long id,
        String name,
        BigDecimal pricePerHour,
        CourtStatus status,
        CourtSportResponse sport,
        VendorCourtVenueResponse venue,
        String primaryImageUrl,
        long activeTimeSlotCount,
        LocalDateTime createdAt
) {
}
