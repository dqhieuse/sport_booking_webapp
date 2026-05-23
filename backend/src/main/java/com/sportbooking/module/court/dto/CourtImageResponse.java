package com.sportbooking.module.court.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.sportbooking.module.court.entity.CourtImage;

public record CourtImageResponse(
        Long id,
        String imageUrl,
        @JsonProperty("isPrimary")
        boolean primary,
        Integer sortOrder
) {

    public static CourtImageResponse from(CourtImage image) {
        return new CourtImageResponse(
                image.getId(),
                image.getImageUrl(),
                image.isPrimary(),
                image.getSortOrder()
        );
    }
}
