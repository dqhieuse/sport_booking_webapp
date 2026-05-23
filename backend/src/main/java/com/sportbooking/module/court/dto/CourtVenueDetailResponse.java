package com.sportbooking.module.court.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalTime;

public record CourtVenueDetailResponse(
        Long id,
        String name,
        String address,
        @JsonFormat(pattern = "HH:mm")
        LocalTime openingTime,
        @JsonFormat(pattern = "HH:mm")
        LocalTime closingTime
) {
}
