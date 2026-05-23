package com.sportbooking.module.court.dto;

import com.sportbooking.module.court.entity.CourtStatus;
import java.math.BigDecimal;

public record CourtDetailResponse(
        Long id,
        String name,
        String description,
        BigDecimal pricePerHour,
        CourtStatus status,
        CourtSportResponse sport,
        CourtVenueDetailResponse venue,
        String primaryImageUrl
) {
}
