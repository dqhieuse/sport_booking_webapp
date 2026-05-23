package com.sportbooking.module.court.dto;

import com.sportbooking.module.court.entity.CourtStatus;
import java.math.BigDecimal;

public record CourtListResponse(
        Long id,
        String name,
        BigDecimal pricePerHour,
        CourtStatus status,
        CourtSportResponse sport,
        CourtVenueListResponse venue,
        String primaryImageUrl
) {
}
