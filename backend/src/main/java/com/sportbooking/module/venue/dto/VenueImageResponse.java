package com.sportbooking.module.venue.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sportbooking.module.venue.entity.VenueImage;

public record VenueImageResponse(
        Long id,
        String imageUrl,
        @JsonProperty("isPrimary")
        boolean primary,
        Integer sortOrder
) {

    public static VenueImageResponse from(VenueImage image) {
        return new VenueImageResponse(
                image.getId(),
                image.getImageUrl(),
                image.isPrimary(),
                image.getSortOrder()
        );
    }
}
