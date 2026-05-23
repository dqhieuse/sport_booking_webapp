package com.sportbooking.module.venue.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.sportbooking.module.venue.entity.VenueStatus;
import java.time.LocalTime;

public record VenueListResponse(
        Long id,
        String name,
        String address,
        String phone,
        @JsonFormat(pattern = "HH:mm")
        LocalTime openingTime,
        @JsonFormat(pattern = "HH:mm")
        LocalTime closingTime,
        VenueStatus status,
        String primaryImageUrl
) {
}
